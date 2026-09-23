import cv2
import threading
import time
import os
import numpy as np
from datetime import datetime
from flask import Flask, Response, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

model = YOLO("best.pt") 
CAMERA_URL = "http://192.168.4.1:81/stream" 

STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

latest_status = {
    "status": "Clear",
    "confidence": 0,
    "timestamp": datetime.now().isoformat()
}
status_lock = threading.Lock()

latest_frame = None
frame_lock = threading.Lock()

def scan_frame(frame):
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
        
    filepath = os.path.join(STATIC_DIR, "latest_capture.jpg")
    cv2.imwrite(filepath, annotated_frame)
    
    with status_lock:
        latest_status["status"] = current_status
        latest_status["confidence"] = current_conf
        latest_status["timestamp"] = datetime.now().isoformat()
    print("AI scan completed and saved to latest_capture.jpg")

def process_video():
    global latest_frame
    cap = cv2.VideoCapture(CAMERA_URL)
    last_scan_time = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame from camera. Reconnecting...")
            time.sleep(1)
            cap = cv2.VideoCapture(CAMERA_URL)
            continue
            
        ret_enc, buffer = cv2.imencode('.jpg', frame)
        if ret_enc:
            with frame_lock:
                latest_frame = buffer.tobytes()

        current_time = time.time()
        if current_time - last_scan_time >= 5:
            last_scan_time = current_time
            threading.Thread(target=scan_frame, args=(frame.copy(),)).start()


def generate_frames():
    while True:
        with frame_lock:
            frame = latest_frame
        
        if frame is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/status')
def api_status():
    with status_lock:
        return jsonify(latest_status)

@app.route('/api/latest_capture')
def api_latest_capture():
    return send_from_directory(STATIC_DIR, "latest_capture.jpg")

@app.route('/api/manual_scan', methods=['POST'])
def api_manual_scan():
    with frame_lock:
        frame_bytes = latest_frame
    if frame_bytes is not None:
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        scan_frame(frame)
    with status_lock:
        return jsonify(latest_status)

if __name__ == '__main__':
    print("Starting AgriRover AI Video Processor...")
    video_thread = threading.Thread(target=process_video, daemon=True)
    video_thread.start()
    
    print("Starting Flask API on port 5000...")
    app.run(host='0.0.0.0', port=5000, threaded=True)