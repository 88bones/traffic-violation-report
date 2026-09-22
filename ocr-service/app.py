import os
import time
import uuid
import traceback

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import read_plate

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tmp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "heic"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No 'image' file field in request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Use jpg/jpeg/png/heic."}), 400

    # Optional parameters with defaults
    crop_top = float(request.form.get("crop_top_frac", 0.25))
    min_confidence = int(request.form.get("min_confidence", 55))
    debug = request.form.get("debug", "false").lower() == "true"

    ext = file.filename.rsplit(".", 1)[1].lower()
    temp_name = f"{uuid.uuid4().hex}.{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_name)
    file.save(temp_path)

    debug_prefix = temp_name.rsplit(".", 1)[0] if debug else None

    try:
        start = time.time()
        plate_text = read_plate(
            temp_path,
            debug_prefix=debug_prefix,
            crop_top_frac=crop_top,
            min_confidence=min_confidence
        )
        elapsed = time.time() - start

        return jsonify({
            "success": True,
            "plate_text": plate_text,
            "processing_time_sec": round(elapsed, 3),
            "params": {
                "crop_top_frac": crop_top,
                "min_confidence": min_confidence
            }
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=False)