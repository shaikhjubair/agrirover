import cv2
import numpy as np
import threading
import time
import os
import uuid
import requests
from datetime import datetime
from flask import Flask, Response, jsonify, send_file, make_response
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

model_disease = YOLO("best.pt")
try:
    model_pest = YOLO("pest.pt")
except Exception:
    print("Warning: pest.pt not found. Falling back to best.pt for pest detection.")
    model_pest = model_disease
try:
    model_weed = YOLO("weed.pt")
except Exception:
    print("Warning: weed.pt not found. Falling back to best.pt for weed detection.")
    model_weed = model_disease

CAMERA_URL = "http://192.168.4.1:81/stream"

STATIC_DIR = "static"
HEALTH_DIR = os.path.join(STATIC_DIR, "logs", "health")
os.makedirs(HEALTH_DIR, exist_ok=True)

CAPTURE_FILE = os.path.join(STATIC_DIR, "latest_capture.jpg")

latest_status = {
    "mode": "Clear",
    "ai_status": "Optimal",
    "target": "All Clear",
    "confidence": 100,
    "color": "emerald",
    "temperature": 0.0,
    "humidity": 0.0,
    "pump": "OFF",
    "rover": "Moving",
    "direction": "Forwarding",
    "motor_uptime_sec": 0,
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
            print("Camera stream offline. Ensure Macbook is connected to ESP32 WiFi network.")
            time.sleep(3)
            cap = cv2.VideoCapture(CAMERA_URL)
            continue
            
        with frame_lock:
            raw_frame = frame.copy()

def add_log(type_str, target_name, timestamp_str, image_url, conf, uptime, hum, temp, model_name="YOLOv8"):
    log_entry = {
        "id": str(uuid.uuid4()),
        "mode": type_str,
        "target": target_name,
        "confidence": conf,
        "timestamp": timestamp_str,
        "image": image_url,
        "motorUptimeSecs": uptime,
        "humidity": hum,
        "temperature": temp,
        "distance": round(uptime * 0.5, 1),
        "model": model_name
    }
    with logs_lock:
        event_logs.insert(0, log_entry)
        if len(event_logs) > 100:
            event_logs.pop()

def update_global_status(mode, status, target, conf, color):
    global latest_status
    with status_lock:
        latest_status["mode"] = mode
        latest_status["ai_status"] = status
        latest_status["target"] = target
        latest_status["confidence"] = conf
        latest_status["color"] = color
        latest_status["timestamp"] = datetime.now().isoformat()

def run_inference_on_frame(frame):
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp_file = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    with status_lock:
        hw_uptime = latest_status.get("motor_uptime_sec", 0)
        hw_hum = latest_status.get("humidity", 0.0)
        hw_temp = latest_status.get("temperature", 0.0)

    # Multi-Model Inference (Disease, Weed, Pest)
    res_dis = model_disease.predict(frame, conf=0.60, verbose=False)
    res_weed = model_weed.predict(frame, conf=0.60, verbose=False)
    res_pest = model_pest.predict(frame, conf=0.60, verbose=False)
    
    any_detected = False
    
    # 1. Check Disease
    if len(res_dis[0].boxes) > 0:
        box = max(res_dis[0].boxes, key=lambda b: b.conf[0].item())
        cls_name = model_disease.names[int(box.cls[0].item())]
        if cls_name != "Clear":
            conf = int(box.conf[0].item() * 100)
            plot_img = res_dis[0].plot()
            filename = f"hlth_disease_{timestamp_file}.jpg"
            filepath = os.path.join(HEALTH_DIR, filename)
            cv2.imwrite(filepath, plot_img)
            cv2.imwrite(CAPTURE_FILE, plot_img) # Update latest capture
            image_url = f"http://127.0.0.1:5000/static/logs/health/{filename}"
            add_log("Disease", cls_name, timestamp_str, image_url, conf, hw_uptime, hw_hum, hw_temp, "best.pt")
            update_global_status("Health", "Action Required", cls_name, conf, "amber")
            any_detected = True

    # 2. Check Weed
    if len(res_weed[0].boxes) > 0:
        box = max(res_weed[0].boxes, key=lambda b: b.conf[0].item())
        cls_name = model_weed.names[int(box.cls[0].item())]
        if cls_name != "Clear":
            conf = int(box.conf[0].item() * 100)
            plot_img = res_weed[0].plot()
            filename = f"hlth_weed_{timestamp_file}.jpg"
            filepath = os.path.join(HEALTH_DIR, filename)
            cv2.imwrite(filepath, plot_img)
            cv2.imwrite(CAPTURE_FILE, plot_img)
            image_url = f"http://127.0.0.1:5000/static/logs/health/{filename}"
            add_log("Weed", cls_name, timestamp_str, image_url, conf, hw_uptime, hw_hum, hw_temp, "weed.pt")
            update_global_status("Health", "Action Required", cls_name, conf, "amber")
            any_detected = True
            
    # 3. Check Pest (Insect)
    if len(res_pest[0].boxes) > 0:
        box = max(res_pest[0].boxes, key=lambda b: b.conf[0].item())
        cls_name = model_pest.names[int(box.cls[0].item())]
        if cls_name != "Clear":
            conf = int(box.conf[0].item() * 100)
            plot_img = res_pest[0].plot()
            filename = f"hlth_pest_{timestamp_file}.jpg"
            filepath = os.path.join(HEALTH_DIR, filename)
            cv2.imwrite(filepath, plot_img)
            cv2.imwrite(CAPTURE_FILE, plot_img)
            image_url = f"http://127.0.0.1:5000/static/logs/health/{filename}"
            add_log("Insect", cls_name, timestamp_str, image_url, conf, hw_uptime, hw_hum, hw_temp, "pest.pt")
            update_global_status("Health", "Action Required", cls_name, conf, "amber")
            any_detected = True
                
    # STEP C: Clear
    if not any_detected:
        plot_frame = res_dis[0].plot()
        cv2.imwrite(CAPTURE_FILE, plot_frame)
        update_global_status("Clear", "Optimal", "All Clear", 100, "emerald")

def ai_processing_thread():
    last_scan_time = time.time()
    while True:
        current_time = time.time()
        is_manual = manual_scan_event.is_set()
        
        if is_manual or (current_time - last_scan_time >= 5.0):
            if is_manual:
                manual_scan_event.clear()
                print("Manual scan triggered, capturing burst...")
            else:
                print("Auto scan triggered, capturing burst...")
                
            frames = []
            for _ in range(10):
                with frame_lock:
                    if raw_frame is not None:
                        frames.append(raw_frame.copy())
                time.sleep(0.05)
                
            if frames:
                best_frame = None
                max_var = -1
                for frame in frames:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
                    if variance > max_var:
                        max_var = variance
                        best_frame = frame
                        
                if best_frame is not None:
                    run_inference_on_frame(best_frame)
            
            last_scan_time = time.time()
                    
        with status_lock:
            latest_status["motor_uptime_sec"] += 1
            latest_status["temperature"] = 28.5
            latest_status["humidity"] = 65.0
            latest_status["rover"] = "Moving"
            latest_status["pump"] = "Standby"
            
        time.sleep(1.0)

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
        img = np.full((480, 640, 3), 50, dtype=np.uint8)
        text = "Waiting for AI Scan..."
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(text, font, 1.0, 2)[0]
        text_x = (img.shape[1] - text_size[0]) // 2
        text_y = (img.shape[0] + text_size[1]) // 2
        cv2.putText(img, text, (text_x, text_y), font, 1.0, (200, 200, 200), 2, cv2.LINE_AA)
        ret, buffer = cv2.imencode('.jpg', img)
        response = make_response(buffer.tobytes())
        response.headers['Content-Type'] = 'image/jpeg'
    else:
        response = make_response(send_file(CAPTURE_FILE, mimetype='image/jpeg'))
        
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/api/manual_scan', methods=['POST'])
def api_manual_scan():
    manual_scan_event.set()
    return jsonify({"status": "Scan initiated"})

@app.route('/api/reverse_motor', methods=['POST'])
def api_reverse_motor():
    return jsonify({"status": "Success", "message": "Motor direction toggled (Simulated)"})

if __name__ == '__main__':
    if os.path.exists(CAPTURE_FILE):
        os.remove(CAPTURE_FILE)
        print("Cleared stale capture image.")

    print("Starting Raw Camera Thread...")
    cam_thread = threading.Thread(target=camera_thread, daemon=True)
    cam_thread.start()
    
    print("Starting AI Processing Thread...")
    ai_thread = threading.Thread(target=ai_processing_thread, daemon=True)
    ai_thread.start()
    
    print("Starting Flask API on port 5000...")
    app.run(host='0.0.0.0', port=5000, threaded=True)