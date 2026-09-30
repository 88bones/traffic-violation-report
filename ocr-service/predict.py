"""Nepali License Plate OCR Service.

Supports both:
1. Segmentation-Free CRNN (CNN + BiLSTM + CTC) when `models/nepali_plate_crnn.keras` is trained.
2. Segment-then-Classify CNN fallback using `models/nepali_plate_ocr.keras` when CRNN weights are not yet generated.
"""

import json
import os
import cv2
import numpy as np
import tensorflow as tf

from crnn_model import build_crnn_model, CTCDecoder

# Setup directory paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "debug_out")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(OUT_DIR, exist_ok=True)

CRNN_MODEL_PATH = os.path.join(MODEL_DIR, "nepali_plate_crnn.keras")
LEGACY_MODEL_PATH = os.path.join(MODEL_DIR, "nepali_plate_ocr.keras")
CLASSES_PATH = os.path.join(MODEL_DIR, "class_names.json")

# Load vocabulary
with open(CLASSES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

decoder = CTCDecoder(class_names)
num_classes = len(class_names)

# Model loading logic
crnn_model = None
legacy_cnn_model = None
active_mode = None

if os.path.exists(CRNN_MODEL_PATH):
    try:
        crnn_model = tf.keras.models.load_model(CRNN_MODEL_PATH, compile=False)
        active_mode = "CRNN"
        print(f"Loaded trained CRNN Model successfully from {CRNN_MODEL_PATH}")
    except Exception as e:
        print(f"Error loading CRNN model: {e}")

if crnn_model is None and os.path.exists(LEGACY_MODEL_PATH):
    try:
        legacy_cnn_model = tf.keras.models.load_model(LEGACY_MODEL_PATH)
        active_mode = "CNN_FALLBACK"
        print(
            f"Note: Using trained CNN character model ({LEGACY_MODEL_PATH}).\n"
            f"      To switch to CRNN, run 'python train.py' to train and generate 'nepali_plate_crnn.keras'."
        )
    except Exception as e:
        print(f"Error loading legacy CNN model: {e}")

if crnn_model is None and legacy_cnn_model is None:
    # Build un-trained CRNN architecture as stub
    crnn_model, _ = build_crnn_model(
        img_height=64, img_width=256, num_classes=num_classes
    )
    active_mode = "CRNN_UNTRAINED"
    print("Warning: No trained weights found on disk. CRNN initialized with random weights.")


def locate_and_deskew_plate(img, debug_prefix=None):
    """Find the largest red/embossed plate region, deskew to axis-aligned orientation, and return crop."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower1, upper1 = np.array([0, 70, 50]), np.array([10, 255, 255])
    lower2, upper2 = np.array([170, 70, 50]), np.array([180, 255, 255])
    mask = cv2.inRange(hsv, lower1, upper1) | cv2.inRange(hsv, lower2, upper2)

    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

    if debug_prefix:
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_01_redmask.png"), mask)

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
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_02_detected_box.png"), vis)

    # Normalize angle so the longer side becomes width
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
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_03_deskewed.png"), plate_crop)

    return plate_crop, rect


# ----------------------------------------------------------------------
# Segmentation-Free CRNN Inference Pipeline
# ----------------------------------------------------------------------
def preprocess_plate_for_crnn(plate_crop, target_size=(256, 64)):
    """Preprocess the whole plate crop directly for CRNN sequence recognition."""
    if len(plate_crop.shape) == 3:
        gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
    else:
        gray = plate_crop

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    resized = cv2.resize(gray, target_size)
    normalized = (resized.astype(np.float32) / 127.5) - 1.0
    tensor = np.expand_dims(normalized, axis=(0, -1))  # (1, 64, 256, 1)
    return tensor, resized


def _predict_crnn(plate_crop, debug_prefix=None):
    input_tensor, debug_resized = preprocess_plate_for_crnn(plate_crop)

    if debug_prefix:
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_04_crnn_input.png"), debug_resized)

    preds = crnn_model.predict(input_tensor, verbose=0)
    decoded_results = decoder.decode_greedy(preds)
    raw_text, confidence, _ = decoded_results[0]
    confidence_pct = confidence * 100.0

    print(f"[CRNN-CTC] Decoded: '{raw_text}' | Confidence: {confidence_pct:.1f}%")
    return raw_text


# ----------------------------------------------------------------------
# Segment-then-Classify Fallback Pipeline (using trained CNN)
# ----------------------------------------------------------------------
def preprocess_char(char_img):
    char_img = cv2.resize(char_img, (48, 48))
    char_img = cv2.cvtColor(char_img, cv2.COLOR_BGR2RGB)
    char_img = np.expand_dims(char_img, axis=0).astype(np.float32)
    return char_img


def preprocess_plate_legacy(img):
    img = cv2.resize(img, (400, 200))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    gray = cv2.fastNlMeansDenoising(gray, h=7)
    return gray, img


def auto_threshold(gray):
    _, t_normal = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    _, t_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    if np.sum(t_normal == 255) <= np.sum(t_inv == 255):
        return t_normal
    return t_inv


def segment_characters(plate_img, debug_prefix=None):
    gray, resized = preprocess_plate_legacy(plate_img)
    thresh = auto_threshold(gray)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    if debug_prefix:
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_04_thresh.png"), thresh)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h_img, w_img = thresh.shape
    char_contours = []
    edge_margin = int(w_img * 0.02)
    min_area = h_img * w_img * 0.005
    max_area = h_img * w_img * 0.25

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        aspect_ratio = h / w if w > 0 else 0
        solidity = cv2.contourArea(cnt) / (w * h) if w * h > 0 else 0

        touches_edge = (x <= edge_margin or (x + w) >= (w_img - edge_margin))
        near_circular = 0.75 < (w / h if h > 0 else 0) < 1.35 and solidity > 0.75

        if (
            area > min_area
            and area < max_area
            and 0.5 < aspect_ratio < 4.0
            and w_img * 0.04 < w < w_img * 0.35
            and h_img * 0.2 < h < h_img * 0.95
            and solidity > 0.3
            and not (touches_edge and near_circular)
        ):
            char_contours.append((x, y, w, h))

    row_threshold = h_img * 0.35
    char_contours = sorted(char_contours, key=lambda c: (int(c[1] // row_threshold), c[0]))

    if debug_prefix:
        vis = resized.copy()
        for (x, y, w, h) in char_contours:
            cv2.rectangle(vis, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_05_char_boxes.png"), vis)

    return char_contours, resized


def _predict_legacy_cnn(plate_roi, debug_prefix=None, min_confidence=50):
    char_contours, resized = segment_characters(plate_roi, debug_prefix=debug_prefix)
    print(f"[CNN-Classifier] Segmented {len(char_contours)} character candidates")

    plate_text = ""
    char_confidences = []

    for idx, (x, y, w, h) in enumerate(char_contours):
        pad = 4
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(resized.shape[1], x + w + pad)
        y2 = min(resized.shape[0], y + h + pad)

        char_img = resized[y1:y2, x1:x2]
        processed = preprocess_char(char_img)
        predictions = legacy_cnn_model.predict(processed, verbose=0)
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]) * 100)

        print(f"  Char {idx+1}: {predicted_class} ({confidence:.1f}%)")

        if confidence >= min_confidence:
            plate_text += predicted_class
            char_confidences.append(confidence)

    return plate_text


# ----------------------------------------------------------------------
# Main Public Interface
# ----------------------------------------------------------------------
def read_plate(image_path, debug_prefix=None, crop_top_frac=0.25, min_confidence=50):
    """Read license plate text from image.

    Uses CRNN when trained model weights exist; otherwise uses trained CNN character model.
    """
    img = cv2.imread(image_path)
    if img is None:
        print(f"Could not read {image_path}")
        return ""

    plate, _ = locate_and_deskew_plate(img, debug_prefix=debug_prefix)
    if plate is None:
        print("No plate located, using full image.")
        plate = img

    h = plate.shape[0]
    plate_roi = plate[int(h * crop_top_frac):, :] if (crop_top_frac > 0 and h > 50) else plate

    if debug_prefix:
        cv2.imwrite(os.path.join(OUT_DIR, f"{debug_prefix}_03b_roi.png"), plate_roi)

    if active_mode == "CRNN":
        return _predict_crnn(plate_roi, debug_prefix=debug_prefix)
    elif active_mode == "CNN_FALLBACK":
        return _predict_legacy_cnn(plate_roi, debug_prefix=debug_prefix, min_confidence=min_confidence)
    else:
        # Untrained CRNN fallback
        return _predict_crnn(plate_roi, debug_prefix=debug_prefix)


if __name__ == "__main__":
    test_img = os.path.join(BASE_DIR, "test.jpg")
    if os.path.exists(test_img):
        result = read_plate(test_img, debug_prefix="test")
        print("Plate result:", result)
