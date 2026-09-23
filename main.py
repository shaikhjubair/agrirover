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
os.makedirs(STATIC_DIR, exist_ok=True)
CAPTURE_FILE = os.path.join(STATIC_DIR, "latest_capture.jpg")

# Global State
latest_status = {
    "status": "Clear",
    "confidence": 0,
    "timestamp": datetime.now().isoformat()
}
status_lock = threading.Lock()

current_raw_frame = None
frame_lock = threading.Lock()

# Event to interrupt the AI 5-second sleep for manual scans
manual_scan_event = threading.Event()

def camera_thread():
    """Continuously reads raw frames from the camera without running AI."""
    global current_raw_frame
    cap = cv2.VideoCapture(CAMERA_URL)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame. Reconnecting...")
            time.sleep(1)
            cap = cv2.VideoCapture(CAMERA_URL)
            continue
            
        with frame_lock:
            current_raw_frame = frame.copy()

def run_inference_on_frame(frame):
    """Runs YOLOv8 strictly once on the provided frame and updates global state."""
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
    
    with status_lock:
        latest_status["status"] = current_status
        latest_status["confidence"] = current_conf
        latest_status["timestamp"] = datetime.now().isoformat()
    
    print(f"AI scan completed: {current_status} ({current_conf}%)")

def ai_processing_thread():
    """Loops indefinitely, sleeping for 5s or until interrupted by manual scan."""
    while True:
        # Wait for 5 seconds OR until manual_scan_event is set
        is_manual = manual_scan_event.wait(5.0)
        
        # Clear the event if it was set
        if is_manual:
            manual_scan_event.clear()
            
        with frame_lock:
            frame_to_scan = current_raw_frame.copy() if current_raw_frame is not None else None
            
        if frame_to_scan is not None:
            run_inference_on_frame(frame_to_scan)

def generate_mjpeg():
    """Generator for the raw video feed."""
    while True:
        with frame_lock:
            frame = current_raw_frame
            
        if frame is not None:
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
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
    # Trigger the AI thread immediately
    manual_scan_event.set()
    
    # Wait a tiny bit for the AI thread to pick it up and process
    # Or just return success and let the frontend poll for the new timestamp
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