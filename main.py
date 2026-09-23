import cv2
import threading
import time
import os
import uuid
from datetime import datetime
from flask import Flask, Response, jsonify, send_file, make_response
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

model_general = YOLO("yolov8n.pt")
model_disease = YOLO("best.pt")
try:
    model_weed = YOLO("weed.pt")
except Exception:
    print("Warning: weed.pt not found. Falling back to best.pt for weed detection.")
    model_weed = model_disease

CAMERA_URL = "http://192.168.4.1:81/stream"

STATIC_DIR = "static"
SECURITY_DIR = os.path.join(STATIC_DIR, "logs", "security")
HEALTH_DIR = os.path.join(STATIC_DIR, "logs", "health")
os.makedirs(SECURITY_DIR, exist_ok=True)
os.makedirs(HEALTH_DIR, exist_ok=True)

CAPTURE_FILE = os.path.join(STATIC_DIR, "latest_capture.jpg")

SECURITY_CLASSES = ["person", "bird", "dog", "cow"]

latest_status = {
    "mode": "Clear",
    "status": "Optimal",
    "target": "All Clear",
    "confidence": 100,
    "color": "emerald",
    "timestamp": datetime.now().isoformat()
}
status_lock = threading.Lock()

event_logs = []
logs_lock = threading.Lock()

raw_frame = None
frame_lock = threading.Lock()
manual_scan_event = threading.Event()

def camera_thread():
    global raw_frame
    cap = cv2.VideoCapture(CAMERA_URL)
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame. Reconnecting...")
            time.sleep(1)
            cap = cv2.VideoCapture(CAMERA_URL)
            continue
            
        with frame_lock:
            raw_frame = frame.copy()

def add_log(mode_str, target_name, timestamp_str, image_url):
    log_entry = {
        "id": str(uuid.uuid4()),
        "mode": mode_str,
        "target": target_name,
        "timestamp": timestamp_str,
        "image_url": image_url
    }
    with logs_lock:
        event_logs.insert(0, log_entry)
        if len(event_logs) > 100:
            event_logs.pop()

def update_global_status(mode, status, target, conf, color):
    global latest_status
    with status_lock:
        latest_status["mode"] = mode
        latest_status["status"] = status
        latest_status["target"] = target
        latest_status["confidence"] = conf
        latest_status["color"] = color
        latest_status["timestamp"] = datetime.now().isoformat()

def run_inference_on_frame(frame):
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp_file = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # STEP A: Security
    res_gen = model_general.predict(frame, conf=0.50, verbose=False)
    sec_threat = None
    sec_conf = 0
    annotated_frame = None
    
    if len(res_gen[0].boxes) > 0:
        for box in res_gen[0].boxes:
            cls_name = model_general.names[int(box.cls[0].item())]
            if cls_name in SECURITY_CLASSES:
                conf = int(box.conf[0].item() * 100)
                if conf > sec_conf:
                    sec_threat = cls_name
                    sec_conf = conf
                    annotated_frame = res_gen[0].plot()
                    
    if sec_threat:
        filename = f"sec_{timestamp_file}.jpg"
        filepath = os.path.join(SECURITY_DIR, filename)
        cv2.imwrite(filepath, annotated_frame)
        cv2.imwrite(CAPTURE_FILE, annotated_frame)
        
        image_url = f"http://127.0.0.1:5000/static/logs/security/{filename}"
        add_log("Security", sec_threat.capitalize(), timestamp_str, image_url)
        update_global_status("Security", "Intruder Alert", sec_threat.capitalize(), sec_conf, "rose")
        return

    # STEP B: Health / Weeds
    res_dis = model_disease.predict(frame, conf=0.60, verbose=False)
    res_weed = model_weed.predict(frame, conf=0.60, verbose=False)
    
    best_health_threat = None
    best_health_conf = 0
    best_plot = None
    
    # Check disease
    if len(res_dis[0].boxes) > 0:
        box = max(res_dis[0].boxes, key=lambda b: b.conf[0].item())
        cls_name = model_disease.names[int(box.cls[0].item())]
        if cls_name != "Clear":
            best_health_threat = cls_name
            best_health_conf = int(box.conf[0].item() * 100)
            best_plot = res_dis[0].plot()

    # Check weed
    if len(res_weed[0].boxes) > 0:
        box = max(res_weed[0].boxes, key=lambda b: b.conf[0].item())
        cls_name = model_weed.names[int(box.cls[0].item())]
        if cls_name != "Clear":
            conf = int(box.conf[0].item() * 100)
            if conf > best_health_conf:
                best_health_threat = cls_name
                best_health_conf = conf
                best_plot = res_weed[0].plot()
                
    if best_health_threat:
        filename = f"hlth_{timestamp_file}.jpg"
        filepath = os.path.join(HEALTH_DIR, filename)
        cv2.imwrite(filepath, best_plot)
        cv2.imwrite(CAPTURE_FILE, best_plot)
        
        image_url = f"http://127.0.0.1:5000/static/logs/health/{filename}"
        add_log("Health", best_health_threat, timestamp_str, image_url)
        update_global_status("Health", "Action Required", best_health_threat, best_health_conf, "amber")
        return
        
    # STEP C: Clear
    plot_frame = res_dis[0].plot()
    cv2.imwrite(CAPTURE_FILE, plot_frame)
    update_global_status("Clear", "Optimal", "All Clear", 100, "emerald")

def ai_processing_thread():
    while True:
        is_manual = manual_scan_event.wait(5.0)
        if is_manual:
            manual_scan_event.clear()
            
        with frame_lock:
            frame_to_scan = raw_frame.copy() if raw_frame is not None else None
            
        if frame_to_scan is not None:
            run_inference_on_frame(frame_to_scan)

def generate_mjpeg():
    while True:
        with frame_lock:
            frame = raw_frame
            
        if frame is not None:
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_mjpeg(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/status')
def api_status():
    with status_lock:
        return jsonify(latest_status)

@app.route('/api/logs')
def api_logs():
    with logs_lock:
        return jsonify(event_logs)

@app.route('/api/latest_capture')
def api_latest_capture():
    if not os.path.exists(CAPTURE_FILE):
        return "Not found", 404
        
    response = make_response(send_file(CAPTURE_FILE, mimetype='image/jpeg'))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/api/manual_scan', methods=['POST'])
def api_manual_scan():
    manual_scan_event.set()
    return jsonify({"status": "Scan initiated"})

if __name__ == '__main__':
    print("Starting Raw Camera Thread...")
    cam_thread = threading.Thread(target=camera_thread, daemon=True)
    cam_thread.start()
    
    print("Starting AI Processing Thread...")
    ai_thread = threading.Thread(target=ai_processing_thread, daemon=True)
    ai_thread.start()
    
    print("Starting Flask API on port 5000...")
    app.run(host='0.0.0.0', port=5000, threaded=True)