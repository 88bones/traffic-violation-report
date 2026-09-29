"""Synthetic Sequence Dataset Generator for Nepali License Plate CRNN Training.

Uses real character patches from `character_ocr/` and domain augmentations
to synthesize realistic full-plate sequence images with variable spacing,
touching characters, embossed lighting, motion blur, and low-light conditions.
"""

import glob
import os
import random
import cv2
import numpy as np
import tensorflow as tf

from augmentations import augment_plate_image


# Standard Nepali License Plate Components
ZONES_AND_PROVINCES = [
    "बा", "मे", "को", "लु", "ना", "भे", "से", "प्र", "डि"
]

VEHICLE_CATEGORIES = [
    "प", "च", "ख", "क", "ग", "ज", "झ", "य"
]

NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]


def tokenize_nepali_text(text, class_names):
    """Greedy tokenizer matching longest valid class token in text."""
    # Sort class names by descending length so "बा" is matched before "ब", "को" before "क", etc.
    sorted_classes = sorted(class_names, key=len, reverse=True)
    tokens = []
    i = 0
    n = len(text)
    while i < n:
        matched = False
        for c in sorted_classes:
            if text.startswith(c, i):
                tokens.append(c)
                i += len(c)
                matched = True
                break
        if not matched:
            i += 1  # Skip unknown character/space
    return tokens


class NepaliPlateDataGenerator(tf.keras.utils.Sequence):
    """Keras Sequence data generator yielding batches of augmented plate sequences."""

    def __init__(
        self,
        character_dir,
        class_names,
        batch_size=32,
        steps_per_epoch=100,
        img_height=64,
        img_width=256,
        max_label_len=16,
        is_training=True,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.character_dir = character_dir
        self.class_names = list(class_names)
        self.char_to_idx = {char: idx for idx, char in enumerate(self.class_names)}
        self.batch_size = batch_size
        self.steps_per_epoch = steps_per_epoch
        self.img_height = img_height
        self.img_width = img_width
        self.max_label_len = max_label_len
        self.is_training = is_training

        # Load all character image paths into memory map
        self.char_image_map = {}
        for char in self.class_names:
            char_folder = os.path.join(character_dir, char)
            if os.path.exists(char_folder):
                images = glob.glob(os.path.join(char_folder, "*.*"))
                if images:
                    self.char_image_map[char] = images

        available_chars = set(self.char_image_map.keys())
        print(f"Loaded character database with {len(available_chars)} classes.")

    def __len__(self):
        return self.steps_per_epoch

    def generate_random_plate_tokens(self):
        """Generate a structurally valid list of Nepali license plate tokens."""
        pattern_type = random.choice(["standard", "short", "digits_only", "full_provincial"])
        available_zones = [z for z in ZONES_AND_PROVINCES if z in self.char_image_map]
        available_cats = [c for c in VEHICLE_CATEGORIES if c in self.char_image_map]
        available_digits = [d for d in NEPALI_DIGITS if d in self.char_image_map]
        all_available = [c for c in self.class_names if c in self.char_image_map]

        if not available_zones:
            available_zones = all_available
        if not available_cats:
            available_cats = all_available
        if not available_digits:
            available_digits = all_available

        tokens = []

        if pattern_type == "standard":
            tokens = [
                random.choice(available_zones),
                random.choice(available_digits),
                random.choice(available_cats),
            ] + random.choices(available_digits, k=4)

        elif pattern_type == "full_provincial":
            prefix_choices = [p for p in ["प्र", "बा", "को", "लु"] if p in self.char_image_map]
            prefix = random.choice(prefix_choices) if prefix_choices else random.choice(all_available)
            tokens = [
                prefix,
                random.choice(available_digits),
                random.choice(available_digits),
                random.choice(available_digits),
                random.choice(available_cats),
            ] + random.choices(available_digits, k=4)

        elif pattern_type == "short":
            tokens = [
                random.choice(available_zones),
                random.choice(available_cats),
            ] + random.choices(available_digits, k=4)

        else:
            length = random.randint(4, 7)
            tokens = random.choices(all_available, k=length)

        # Ensure all tokens exist in char_image_map
        tokens = [t for t in tokens if t in self.char_image_map]
        if len(tokens) < 3:
            tokens = [random.choice(all_available) for _ in range(5)]

        return tokens

    def render_plate_image(self, tokens):
        """Composite character crops into a synthetic license plate image."""
        char_crops = []
        for token in tokens:
            img_path = random.choice(self.char_image_map[token])
            char_img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if char_img is None:
                char_img = np.ones((48, 48), dtype=np.uint8) * 200
            else:
                char_img = cv2.resize(char_img, (48, 48))
            char_crops.append(char_img)

        # Base canvas (simulate embossed license plate background)
        bg_brightness = random.randint(20, 60) if random.random() < 0.3 else random.randint(180, 240)
        canvas_h = 64
        # Calculate total width with variable kerning
        kerning_range = (-4, 8) if self.is_training else (2, 6)
        spacings = [random.randint(kerning_range[0], kerning_range[1]) for _ in range(len(char_crops) - 1)]

        total_char_w = len(char_crops) * 32 + sum(spacings)
        canvas_w = max(self.img_width, total_char_w + 40)

        canvas = np.full((canvas_h, canvas_w), bg_brightness, dtype=np.uint8)

        # Add plate border / frame line
        if random.random() < 0.7:
            cv2.rectangle(
                canvas,
                (4, 4),
                (canvas_w - 5, canvas_h - 5),
                color=255 if bg_brightness < 128 else 0,
                thickness=random.choice([1, 2]),
            )

        # Paste characters with variable Y-jitter and horizontal kerning
        start_x = (canvas_w - total_char_w) // 2
        curr_x = start_x

        for idx, crop in enumerate(char_crops):
            # Resize character crop with slight aspect jitter
            c_h = random.randint(40, 52)
            c_w = random.randint(26, 36)
            c_resized = cv2.resize(crop, (c_w, c_h))

            # Adjust character contrast to match background polarity
            if bg_brightness < 128:
                # White text on dark plate (Red/Black plates)
                if np.mean(c_resized) < 128:
                    c_resized = 255 - c_resized
            else:
                # Dark text on light plate (Embossed white plates)
                if np.mean(c_resized) > 128:
                    c_resized = 255 - c_resized

            y_offset = max(2, (canvas_h - c_h) // 2 + random.randint(-2, 2))
            x_end = min(canvas_w, curr_x + c_w)
            y_end = min(canvas_h, y_offset + c_h)
            actual_w = x_end - curr_x
            actual_h = y_end - y_offset

            if actual_w > 0 and actual_h > 0:
                char_patch = c_resized[:actual_h, :actual_w]
                if bg_brightness < 128:
                    canvas[y_offset:y_end, curr_x:x_end] = np.maximum(
                        canvas[y_offset:y_end, curr_x:x_end], char_patch
                    )
                else:
                    canvas[y_offset:y_end, curr_x:x_end] = np.minimum(
                        canvas[y_offset:y_end, curr_x:x_end], char_patch
                    )

            curr_x += c_w + (spacings[idx] if idx < len(spacings) else 0)

        # Final resize to fixed input shape (64, 256)
        plate_img = cv2.resize(canvas, (self.img_width, self.img_height))

        # Apply domain augmentations if training
        if self.is_training:
            plate_img = augment_plate_image(
                plate_img,
                p_emboss=0.55,
                p_blur=0.6,
                p_lighting=0.6,
                p_noise=0.5,
                p_geom=0.45,
            )

        # Normalize to [-1.0, 1.0]
        norm_img = (plate_img.astype(np.float32) / 127.5) - 1.0
        norm_img = np.expand_dims(norm_img, axis=-1)  # (64, 256, 1)

        return norm_img

    def __getitem__(self, idx):
        """Generate one batch of data for CTC training."""
        batch_images = np.zeros(
            (self.batch_size, self.img_height, self.img_width, 1), dtype=np.float32
        )
        batch_labels = np.zeros(
            (self.batch_size, self.max_label_len), dtype=np.float32
        )
        batch_input_len = np.ones((self.batch_size, 1), dtype=np.int64) * (self.img_width // 4)
        batch_label_len = np.zeros((self.batch_size, 1), dtype=np.int64)

        for b in range(self.batch_size):
            tokens = self.generate_random_plate_tokens()
            img = self.render_plate_image(tokens)
            batch_images[b] = img

            # Integer encoding
            encoded = [self.char_to_idx[t] for t in tokens if t in self.char_to_idx]
            actual_len = min(len(encoded), self.max_label_len)
            batch_labels[b, :actual_len] = encoded[:actual_len]
            batch_label_len[b, 0] = actual_len

        inputs = {
            "image_input": batch_images,
            "label_input": batch_labels,
            "input_length": batch_input_len,
            "label_length": batch_label_len,
        }
        outputs = np.zeros(self.batch_size)  # Dummy output for loss layer

        return inputs, outputs
