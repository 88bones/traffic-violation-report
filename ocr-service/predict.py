import tensorflow as tf
import numpy as np
import json
import cv2
import os

# ---------- setup ----------
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "debug_out")
os.makedirs(OUT_DIR, exist_ok=True)

model = tf.keras.models.load_model("models/nepali_plate_ocr.keras")
with open("models/class_names.json", "r", encoding="utf-8") as f:
    class_names = json.load(f)

print("Classes:", class_names)


# ---------- plate localization + deskew ----------
def locate_and_deskew_plate(img, debug_prefix=None):
    """Find the largest red blob in the image, deskew it to axis-aligned, return crop."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower1, upper1 = np.array([0, 70, 50]), np.array([10, 255, 255])
    lower2, upper2 = np.array([170, 70, 50]), np.array([180, 255, 255])
    mask = cv2.inRange(hsv, lower1, upper1) | cv2.inRange(hsv, lower2, upper2)

    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

    if debug_prefix:
        cv2.imwrite(f"{OUT_DIR}/{debug_prefix}_01_redmask.png", mask)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None, None

    largest = max(contours, key=cv2.contourArea)
    if cv2.contourArea(largest) < 500:
        return None, None

    rect = cv2.minAreaRect(largest)
    (cx, cy), (w, h), angle = rect

    if debug_prefix:
        vis = img.copy()
        box = cv2.boxPoints(rect).astype(int)
        cv2.drawContours(vis, [box], 0, (0, 255, 0), 3)
        cv2.imwrite(f"{OUT_DIR}/{debug_prefix}_02_detected_box.png", vis)

    # normalize angle so the longer side becomes width
    if w < h:
        angle += 90
        w, h = h, w

    H, W = img.shape[:2]
    diag = int(np.ceil(np.sqrt(H**2 + W**2)))
    pad_canvas = np.zeros((diag, diag, 3), dtype=img.dtype)
    off_x, off_y = (diag - W) // 2, (diag - H) // 2
    pad_canvas[off_y:off_y + H, off_x:off_x + W] = img
    cx2, cy2 = cx + off_x, cy + off_y

    M = cv2.getRotationMatrix2D((cx2, cy2), angle, 1.0)
    rotated = cv2.warpAffine(pad_canvas, M, (diag, diag))

    pad = 6
    x1, y1 = int(cx2 - w / 2) - pad, int(cy2 - h / 2) - pad
    x2, y2 = int(cx2 + w / 2) + pad, int(cy2 + h / 2) + pad
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(diag, x2), min(diag, y2)
    plate_crop = rotated[y1:y2, x1:x2]

    if debug_prefix:
        cv2.imwrite(f"{OUT_DIR}/{debug_prefix}_03_deskewed.png", plate_crop)

    return plate_crop, rect


# ---------- preprocessing ----------
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


def auto_threshold(gray):
    """Pick binary polarity so the FOREGROUND (text) is the minority of pixels."""
    _, t_normal = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    _, t_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    if np.sum(t_normal == 255) <= np.sum(t_inv == 255):
        return t_normal
    return t_inv


# ---------- character segmentation ----------
def segment_characters(plate_img, debug_prefix=None):
    gray, resized = preprocess_plate(plate_img)

    thresh = auto_threshold(gray)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    if debug_prefix:
        cv2.imwrite(f"{OUT_DIR}/{debug_prefix}_04_thresh.png", thresh)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    h_img, w_img = thresh.shape
    char_contours = []
    edge_margin = int(w_img * 0.02)  # reject blobs hugging the very edge (bolts, border trim)

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        aspect_ratio = h / w if w > 0 else 0
        solidity = cv2.contourArea(cnt) / (w * h) if w * h > 0 else 0

        touches_edge = (x <= edge_margin or (x + w) >= (w_img - edge_margin))
        near_circular = 0.75 < (w / h if h > 0 else 0) < 1.35 and solidity > 0.75  # bolt heads

        if (area > 300 and
            area < (h_img * w_img * 0.3) and
            aspect_ratio > 0.4 and
            w > w_img * 0.045 and     # drop hairline slivers 
            w < w_img * 0.4 and
            h > h_img * 0.15 and
            h < h_img * 0.9 and       # drop full-height strips 
            not (touches_edge and near_circular)):
            char_contours.append((x, y, w, h))

    # Sort by row then left to right
    char_contours = sorted(char_contours, key=lambda c: (c[1] // 60, c[0]))

    if debug_prefix:
        vis = resized.copy()
        for (x, y, w, h) in char_contours:
            cv2.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.imwrite(f"{OUT_DIR}/{debug_prefix}_05_char_boxes.png", vis)

    return char_contours, resized


# ---------- full pipeline ----------
def read_plate(image_path, debug_prefix=None, crop_top_frac=0.30):
    img = cv2.imread(image_path)
    if img is None:
        print(f"Could not read {image_path}")
        return ""

    plate, rect = locate_and_deskew_plate(img, debug_prefix=debug_prefix)
    if plate is None:
        print("No plate located, falling back to full image")
        plate = img

    h = plate.shape[0]
    plate_lower = plate[int(h * crop_top_frac):, :]

    if debug_prefix:
        cv2.imwrite(f"{OUT_DIR}/{debug_prefix}_03b_lower_crop.png", plate_lower)

    char_contours, resized = segment_characters(plate_lower, debug_prefix=debug_prefix)
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


# ---------- test ----------
if __name__ == "__main__":
  #image
    result = read_plate("/Users/88neat/Downloads/number_slanted.png", debug_prefix="test")
    print("Plate:", result)