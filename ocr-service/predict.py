import tensorflow as tf
import numpy as np
import json
import cv2

# Load model and class names
model = tf.keras.models.load_model("models/nepali_plate_ocr.keras")
with open("models/class_names.json", "r", encoding="utf-8") as f:
    class_names = json.load(f)

print("Classes:", class_names)

def preprocess_char(char_img):
    char_img = cv2.resize(char_img, (48, 48))
    char_img = cv2.cvtColor(char_img, cv2.COLOR_BGR2RGB)
    char_img = np.expand_dims(char_img, axis=0).astype(np.float32)
    return char_img

def preprocess_plate(img):
    img = cv2.resize(img, (400, 200))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    gray = cv2.fastNlMeansDenoising(gray, h=10)
    return gray, img

def segment_characters(plate_img):
    gray, resized = preprocess_plate(plate_img)

    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    h_img, w_img = thresh.shape
    char_contours = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        aspect_ratio = h / w if w > 0 else 0

        if (area > 300 and
            area < (h_img * w_img * 0.3) and
            aspect_ratio > 0.4 and
            w < w_img * 0.4 and
            h > h_img * 0.15):
            char_contours.append((x, y, w, h))

    # Sort by row then left to right
    char_contours = sorted(char_contours, key=lambda c: (c[1] // 60, c[0]))
    return char_contours, resized

def read_plate(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return ""

    # Crop top 30% — skip province text
    h = img.shape[0]
    img = img[int(h * 0.3):, :]

    char_contours, resized = segment_characters(img)
    print(f"Found {len(char_contours)} characters")

    plate_text = ""
    for (x, y, w, h) in char_contours:
        pad = 4
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(resized.shape[1], x + w + pad)
        y2 = min(resized.shape[0], y + h + pad)

        char_img = resized[y1:y2, x1:x2]
        processed = preprocess_char(char_img)
        predictions = model.predict(processed, verbose=0)
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = np.max(predictions[0]) * 100

        print(f"  {predicted_class} ({confidence:.1f}%)")
        if confidence > 40:
            plate_text += predicted_class

    return plate_text

# Test
result = read_plate("C:/Users/user/Downloads/nepalinum.png")  # ← put a plate image here
print("Plate:", result)