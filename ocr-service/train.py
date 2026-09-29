"""End-to-End Training Script for Segmentation-Free CRNN Nepali License Plate OCR.

Trains a Convolutional Recurrent Neural Network (CNN + BiLSTM) with CTC loss
on augmented synthetic sequence datasets featuring touching characters,
directional 3D embossing, motion blur, and low-light variations.
"""

import json
import os
import time
import numpy as np
import tensorflow as tf

from crnn_model import build_crnn_model, CTCDecoder
from data_generator import NepaliPlateDataGenerator


class WarmupSchedule(tf.keras.callbacks.Callback):
    """Linear learning rate warmup over the first N epochs to prevent CTC collapse."""

    def __init__(self, target_lr, warmup_epochs=5):
        super().__init__()
        self.target_lr = target_lr
        self.warmup_epochs = warmup_epochs

    def on_epoch_begin(self, epoch, logs=None):
        if epoch < self.warmup_epochs:
            warmup_lr = self.target_lr * (epoch + 1) / self.warmup_epochs
            tf.keras.backend.set_value(self.model.optimizer.learning_rate, warmup_lr)
            print(f"  Warmup LR: {warmup_lr:.6f}")


class AugmentationCurriculumCallback(tf.keras.callbacks.Callback):
    """Gradually increase augmentation intensity to prevent early CTC collapse."""

    def __init__(self, train_generator, ramp_epochs=8):
        super().__init__()
        self.train_generator = train_generator
        self.ramp_epochs = ramp_epochs

    def on_epoch_begin(self, epoch, logs=None):
        progress = min(1.0, epoch / self.ramp_epochs)
        self.train_generator.aug_intensity = progress
        print(f"  Augmentation intensity: {progress:.1%}")


class CTCEvalCallback(tf.keras.callbacks.Callback):
    "Evaluates CTC prediction accuracy and logs sample predictions on validation data."

    def __init__(self, prediction_model, val_generator, decoder, num_samples=5):
        super().__init__()
        self.prediction_model = prediction_model
        self.val_generator = val_generator
        self.decoder = decoder
        self.num_samples = num_samples

    def on_epoch_end(self, epoch, logs=None):
        print(f"\n--- Epoch {epoch + 1} Sample Validations ---")
        batch_inputs, _ = self.val_generator[0]
        images = batch_inputs["image_input"][: self.num_samples]
        raw_labels = batch_inputs["label_input"][: self.num_samples]
        label_lens = batch_inputs["label_length"][: self.num_samples]

        preds = self.prediction_model.predict(images, verbose=0)
        decoded_results = self.decoder.decode_greedy(preds)

        correct = 0
        total = len(images)

        for i in range(total):
            gt_indices = [int(idx) for idx in raw_labels[i][: int(label_lens[i, 0])]]
            gt_text = "".join([self.decoder.idx_to_char.get(idx, "") for idx in gt_indices])
            pred_text, conf, _ = decoded_results[i]

            is_match = (gt_text == pred_text)
            if is_match:
                correct += 1

            status = "MATCH" if is_match else "DIFF"
            print(f"[{status}] Ground Truth: '{gt_text}' | Prediction: '{pred_text}' (Conf: {conf * 100:.1f}%)")

        print(f"Sample Accuracy: {correct}/{total} ({correct / total * 100:.1f}%)\n")


def train_crnn():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    character_dir = os.path.join(base_dir, "character_ocr")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    class_names_path = os.path.join(models_dir, "class_names.json")
    if os.path.exists(class_names_path):
        with open(class_names_path, "r", encoding="utf-8") as f:
            class_names = json.load(f)
    else:
        class_names = sorted(
            [d for d in os.listdir(character_dir) if os.path.isdir(os.path.join(character_dir, d))]
        )
        with open(class_names_path, "w", encoding="utf-8") as f:
            json.dump(class_names, f, ensure_ascii=False)

    num_classes = len(class_names)
    print(f"Vocabulary Size: {num_classes} classes: {class_names}")

    img_height = 64
    img_width = 256
    max_label_len = 16
    batch_size = 32
    epochs = 40
    steps_per_epoch = 150
    val_steps = 30

    print("Initializing Data Generators with Domain Augmentations...")
    train_gen = NepaliPlateDataGenerator(
        character_dir=character_dir,
        class_names=class_names,
        batch_size=batch_size,
        steps_per_epoch=steps_per_epoch,
        img_height=img_height,
        img_width=img_width,
        max_label_len=max_label_len,
        is_training=True,
    )

    val_gen = NepaliPlateDataGenerator(
        character_dir=character_dir,
        class_names=class_names,
        batch_size=batch_size,
        steps_per_epoch=val_steps,
        img_height=img_height,
        img_width=img_width,
        max_label_len=max_label_len,
        is_training=False,
    )

    target_lr = 3e-4

    print("Building CRNN (CNN + BiLSTM + CTC) Model...")
    pred_model, train_model = build_crnn_model(
        img_height=img_height,
        img_width=img_width,
        num_classes=num_classes,
        max_label_len=max_label_len,
        learning_rate=target_lr,
        clipnorm=5.0,
    )

    train_model.summary()

    decoder = CTCDecoder(class_names)

    # Callbacks
    best_pred_path = os.path.join(models_dir, "nepali_plate_crnn.keras")
    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        filepath=os.path.join(models_dir, "nepali_plate_crnn_checkpoint.keras"),
        monitor="val_loss",
        save_best_only=True,
        verbose=1,
    )

    early_stopping = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=8,
        restore_best_weights=True,
        verbose=1,
    )

    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=4,
        min_lr=1e-6,
        verbose=1,
    )

    warmup = WarmupSchedule(target_lr=target_lr, warmup_epochs=5)
    aug_curriculum = AugmentationCurriculumCallback(train_gen, ramp_epochs=8)

    eval_callback = CTCEvalCallback(
        prediction_model=pred_model,
        val_generator=val_gen,
        decoder=decoder,
        num_samples=5,
    )

    print("Starting CRNN Training...")
    start_time = time.time()
    train_model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        callbacks=[checkpoint, early_stopping, reduce_lr, eval_callback],
    )
    elapsed = time.time() - start_time
    print(f"Training completed in {elapsed / 60:.2f} minutes.")

    # Save final inference model
    pred_model.save(best_pred_path)
    print(f"Saved CRNN Prediction Model to {best_pred_path}")


if __name__ == "__main__":
    train_crnn()


# """End-to-End Training Script for Segmentation-Free CRNN Nepali License Plate OCR.

# Trains a Convolutional Recurrent Neural Network (CNN + BiLSTM) with CTC loss
# on augmented synthetic sequence datasets featuring touching characters,
# directional 3D embossing, motion blur, and low-light variations.
# """

# import json
# import os
# import time
# import numpy as np
# import tensorflow as tf

# from crnn_model import build_crnn_model, CTCDecoder
# from data_generator import NepaliPlateDataGenerator


# class WarmupSchedule(tf.keras.callbacks.Callback):
#     """Linear learning rate warmup over the first N epochs to prevent CTC collapse."""

#     def __init__(self, target_lr, warmup_epochs=5):
#         super().__init__()
#         self.target_lr = target_lr
#         self.warmup_epochs = warmup_epochs

#     def on_epoch_begin(self, epoch, logs=None):
#         if epoch < self.warmup_epochs:
#             warmup_lr = self.target_lr * (epoch + 1) / self.warmup_epochs
#             # .assign works on both tf.keras (2.x) and Keras 3 optimizers
#             self.model.optimizer.learning_rate.assign(warmup_lr)
#             print(f"  Warmup LR: {warmup_lr:.6f}")


# class AugmentationCurriculumCallback(tf.keras.callbacks.Callback):
#     """Gradually increase augmentation intensity to prevent early CTC collapse."""

#     def __init__(self, train_generator, ramp_epochs=8):
#         super().__init__()
#         self.train_generator = train_generator
#         self.ramp_epochs = ramp_epochs

#     def on_epoch_begin(self, epoch, logs=None):
#         progress = min(1.0, epoch / self.ramp_epochs)
#         self.train_generator.aug_intensity = progress
#         print(f"  Augmentation intensity: {progress:.1%}")


# class CTCEvalCallback(tf.keras.callbacks.Callback):
#     """Evaluates CTC prediction accuracy and logs sample predictions on validation data."""

#     def __init__(self, prediction_model, val_generator, decoder, num_samples=5):
#         super().__init__()
#         self.prediction_model = prediction_model
#         self.val_generator = val_generator
#         self.decoder = decoder
#         self.num_samples = num_samples

#     def on_epoch_end(self, epoch, logs=None):
#         print(f"\n--- Epoch {epoch + 1} Sample Validations ---")
#         batch_inputs, _ = self.val_generator[0]
#         images = batch_inputs["image_input"][: self.num_samples]
#         raw_labels = batch_inputs["label_input"][: self.num_samples]
#         label_lens = batch_inputs["label_length"][: self.num_samples]

#         preds = self.prediction_model.predict(images, verbose=0)
#         decoded_results = self.decoder.decode_greedy(preds)

#         correct = 0
#         total = len(images)

#         for i in range(total):
#             gt_indices = [int(idx) for idx in raw_labels[i][: int(label_lens[i, 0])]]
#             gt_text = "".join([self.decoder.idx_to_char.get(idx, "") for idx in gt_indices])
#             pred_text, conf, _ = decoded_results[i]

#             is_match = (gt_text == pred_text)
#             if is_match:
#                 correct += 1

#             status = "MATCH" if is_match else "DIFF"
#             print(f"[{status}] Ground Truth: '{gt_text}' | Prediction: '{pred_text}' (Conf: {conf * 100:.1f}%)")

#         print(f"Sample Accuracy: {correct}/{total} ({correct / total * 100:.1f}%)\n")


# def train_crnn():
#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     character_dir = os.path.join(base_dir, "character_ocr")
#     models_dir = os.path.join(base_dir, "models")
#     os.makedirs(models_dir, exist_ok=True)

#     class_names_path = os.path.join(models_dir, "class_names.json")
#     if os.path.exists(class_names_path):
#         with open(class_names_path, "r", encoding="utf-8") as f:
#             class_names = json.load(f)
#     else:
#         class_names = sorted(
#             [d for d in os.listdir(character_dir) if os.path.isdir(os.path.join(character_dir, d))]
#         )
#         with open(class_names_path, "w", encoding="utf-8") as f:
#             json.dump(class_names, f, ensure_ascii=False)

#     num_classes = len(class_names)
#     print(f"Vocabulary Size: {num_classes} classes: {class_names}")

#     img_height = 64
#     img_width = 256
#     max_label_len = 16
#     batch_size = 32
#     epochs = 60  # was 40; leaves room after warmup + augmentation ramp
#     steps_per_epoch = 150
#     val_steps = 30
#     warmup_epochs = 5
#     ramp_epochs = 8

#     print("Initializing Data Generators with Domain Augmentations...")
#     train_gen = NepaliPlateDataGenerator(
#         character_dir=character_dir,
#         class_names=class_names,
#         batch_size=batch_size,
#         steps_per_epoch=steps_per_epoch,
#         img_height=img_height,
#         img_width=img_width,
#         max_label_len=max_label_len,
#         is_training=True,
#     )

#     val_gen = NepaliPlateDataGenerator(
#         character_dir=character_dir,
#         class_names=class_names,
#         batch_size=batch_size,
#         steps_per_epoch=val_steps,
#         img_height=img_height,
#         img_width=img_width,
#         max_label_len=max_label_len,
#         is_training=False,
#     )

#     target_lr = 3e-4

#     print("Building CRNN (CNN + BiLSTM + CTC) Model...")
#     pred_model, train_model = build_crnn_model(
#         img_height=img_height,
#         img_width=img_width,
#         num_classes=num_classes,
#         max_label_len=max_label_len,
#         learning_rate=target_lr,
#         clipnorm=5.0,
#     )

#     train_model.summary()

#     decoder = CTCDecoder(class_names)

#     # Callbacks
#     best_pred_path = os.path.join(models_dir, "nepali_plate_crnn.keras")
#     best_weights_path = os.path.join(models_dir, "nepali_plate_crnn_best.weights.h5")

#     # Weights-only checkpoint avoids serialization problems with CTC layers
#     checkpoint = tf.keras.callbacks.ModelCheckpoint(
#         filepath=best_weights_path,
#         monitor="val_loss",
#         save_best_only=True,
#         save_weights_only=True,
#         verbose=1,
#     )

#     # Don't let warmup/ramp epochs (noisy val_loss) consume patience
#     early_stopping = tf.keras.callbacks.EarlyStopping(
#         monitor="val_loss",
#         patience=8,
#         restore_best_weights=True,
#         start_from_epoch=warmup_epochs + ramp_epochs,
#         verbose=1,
#     )

#     reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
#         monitor="val_loss",
#         factor=0.5,
#         patience=4,
#         min_lr=1e-6,
#         verbose=1,
#     )

#     warmup = WarmupSchedule(target_lr=target_lr, warmup_epochs=warmup_epochs)
#     aug_curriculum = AugmentationCurriculumCallback(train_gen, ramp_epochs=ramp_epochs)

#     eval_callback = CTCEvalCallback(
#         prediction_model=pred_model,
#         val_generator=val_gen,
#         decoder=decoder,
#         num_samples=5,
#     )

#     print("Starting CRNN Training...")
#     start_time = time.time()
#     train_model.fit(
#         train_gen,
#         validation_data=val_gen,
#         epochs=epochs,
#         callbacks=[
#             warmup,
#             aug_curriculum,
#             checkpoint,
#             early_stopping,
#             reduce_lr,
#             eval_callback,
#         ],
#     )
#     elapsed = time.time() - start_time
#     print(f"Training completed in {elapsed / 60:.2f} minutes.")

#     # Reload the best weights so the exported model is the best epoch,
#     # not just whichever epoch training ended on.
#     if os.path.exists(best_weights_path):
#         train_model.load_weights(best_weights_path)
#         print(f"Loaded best weights from {best_weights_path}")
#     else:
#         print("WARNING: no best-weights checkpoint found; saving final weights.")

#     # Save final inference model (shares layers with train_model)
#     pred_model.save(best_pred_path)
#     print(f"Saved CRNN Prediction Model to {best_pred_path}")


# if __name__ == "__main__":
#     train_crnn()