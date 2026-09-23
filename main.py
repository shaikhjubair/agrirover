import cv2
import threading
import time
import os
import numpy as np
from datetime import datetime
from flask import Flask, Response, jsonify, send_file, make_response
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

model = YOLO("best.pt")
CAMERA_URL = "http://192.168.4.1:81/stream"

STATIC_DIR = "static"
HISTORY_DIR = os.path.join(STATIC_DIR, "scan_history")
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(HISTORY_DIR, exist_ok=True)

CAPTURE_FILE = os.path.join(STATIC_DIR, "latest_capture.jpg")

# Global State
latest_status = {
    "status": "Clear",
    "confidence": 0,
    "timestamp": datetime.now().isoformat()
}
status_lock = threading.Lock()

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

def run_inference_on_frame(frame):
    global latest_status
    results = model.predict(frame, conf=0.60, verbose=False)
    annotated_frame = results[0].plot()
    
    current_status = "Clear"
    current_conf = 0
    
    if len(results[0].boxes) > 0:
        boxes = results[0].boxes
        best_box = max(boxes, key=lambda b: b.conf[0].item())
        cls_id = int(best_box.cls[0].item())
        current_status = model.names[cls_id]
        current_conf = round(best_box.conf[0].item() * 100)
        
    cv2.imwrite(CAPTURE_FILE, annotated_frame)
    
    # Save to history if disease found
    if current_status != "Clear":
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        history_file = os.path.join(HISTORY_DIR, f"disease_{timestamp_str}.jpg")
        cv2.imwrite(history_file, annotated_frame)
        print(f"Saved history: {history_file}")
    
    with status_lock:
        latest_status["status"] = current_status
        latest_status["confidence"] = current_conf
        latest_status["timestamp"] = datetime.now().isoformat()
    
    print(f"AI scan completed: {current_status} ({current_conf}%)")

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