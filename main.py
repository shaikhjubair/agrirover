import cv2
from ultralytics import YOLO

# ১. আপনার ডাউনলোড করা এআই মডেলটি লোড করা হচ্ছে
model = YOLO("best.pt") 

# ২. ESP32-CAM এর ভিডিও স্ট্রিমিং ইউআরএল (এখানে আপনার ক্যামেরার আসল আইপি অ্যাড্রেসটি বসাবেন)
# যেমন: http://192.168.0.100:81/stream
CAMERA_URL = "http://192.168.4.1:81/stream" 

# ৩. ভিডিও স্ট্রিম কানেকশন চালু করা
cap = cv2.VideoCapture(CAMERA_URL)

print("AgriRover AI Vision Started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("ক্যামেরা থেকে ছবি আসছে না! আইপি অ্যাড্রেস ঠিক আছে কিনা চেক করুন।")
        break

    # ৪. YOLOv8 দিয়ে লাইভ ফ্রেম স্ক্যান করা (৬০% বা তার বেশি নিশ্চিত হলে বক্সে দেখাবে)
    results = model.predict(frame, conf=0.60) 

    # ৫. স্ক্যান করা ছবিতে চারকোনা বক্স (Bounding box) ও রোগের নাম আঁকা
    annotated_frame = results[0].plot()

    # ৬. স্ক্রিনে ভিডিওটি প্রদর্শন করা
    cv2.imshow("AgriRover - AI Disease Detection", annotated_frame)

    # কি-বোর্ডের 'q' বাটন চাপলে প্রোগ্রাম বন্ধ হবে
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# সব কিছু ক্লিয়ার করে বন্ধ করে দেওয়া
cap.release()
cv2.destroyAllWindows()