"""CRNN (Convolutional Recurrent Neural Network) with CTC Loss for Segmentation-Free OCR.

Architecture:
  Input (64, 256, 1)
    -> Deep CNN Feature Extractor (with asymmetric pooling)
    -> Map-to-Sequence (Reshape to [Batch, Timesteps=64, Channels=512])
    -> 2x Bidirectional LSTM (Sequence Modeling with Context)
    -> Dense + Softmax (Timestep Character Distribution)
    -> CTC Loss (Training) / CTC Greedy & Beam Search Decoding (Inference)
"""

import json
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model


class CTCLayer(layers.Layer):
    """Custom Keras layer computing Connectionist Temporal Classification (CTC) loss."""

    def __init__(self, name=None, **kwargs):
        super().__init__(name=name, **kwargs)
        self.loss_fn = tf.keras.backend.ctc_batch_cost

    def call(self, y_true, y_pred, input_length, label_length):
        loss = self.loss_fn(y_true, y_pred, input_length, label_length)
        self.add_loss(loss)
        return y_pred


def build_crnn_model(
    img_height=64,
    img_width=256,
    num_classes=34,
    max_label_len=16,
    learning_rate=1e-3,
):
    """Builds both the inference CRNN model and the CTC-loss training model.

    Args:
        img_height: Input image height (default 64)
        img_width: Input image width (default 256)
        num_classes: Number of distinct character classes (excluding CTC blank)
        max_label_len: Maximum text label length
        learning_rate: Optimizer learning rate

    Returns:
        prediction_model: Keras model (Input Image -> CTC Softmax Probabilities)
        training_model: Keras model with CTC loss computation
    """
    # -------------------------------------------------------------
    # 1. Base Prediction Model Architecture
    # -------------------------------------------------------------
    input_img = layers.Input(
        shape=(img_height, img_width, 1), name="image_input", dtype="float32"
    )

    # Conv Block 1
    x = layers.Conv2D(64, (3, 3), padding="same", name="conv1")(input_img)
    x = layers.BatchNormalization(name="bn1")(x)
    x = layers.ReLU(name="relu1")(x)
    x = layers.MaxPooling2D(pool_size=(2, 2), strides=(2, 2), name="pool1")(x)  # -> (32, 128, 64)

    # Conv Block 2
    x = layers.Conv2D(128, (3, 3), padding="same", name="conv2")(x)
    x = layers.BatchNormalization(name="bn2")(x)
    x = layers.ReLU(name="relu2")(x)
    x = layers.MaxPooling2D(pool_size=(2, 2), strides=(2, 2), name="pool2")(x)  # -> (16, 64, 128)

    # Conv Block 3
    x = layers.Conv2D(256, (3, 3), padding="same", name="conv3_1")(x)
    x = layers.BatchNormalization(name="bn3_1")(x)
    x = layers.ReLU(name="relu3_1")(x)
    x = layers.Conv2D(256, (3, 3), padding="same", name="conv3_2")(x)
    x = layers.BatchNormalization(name="bn3_2")(x)
    x = layers.ReLU(name="relu3_2")(x)
    # Asymmetric pooling: Halves height (8), preserves width (64) for sequence timesteps
    x = layers.MaxPooling2D(pool_size=(2, 1), strides=(2, 1), padding="same", name="pool3")(x)  # -> (8, 64, 256)

    # Conv Block 4
    x = layers.Conv2D(512, (3, 3), padding="same", name="conv4_1")(x)
    x = layers.BatchNormalization(name="bn4_1")(x)
    x = layers.ReLU(name="relu4_1")(x)
    x = layers.Conv2D(512, (3, 3), padding="same", name="conv4_2")(x)
    x = layers.BatchNormalization(name="bn4_2")(x)
    x = layers.ReLU(name="relu4_2")(x)
    x = layers.MaxPooling2D(pool_size=(2, 1), strides=(2, 1), padding="same", name="pool4")(x)  # -> (4, 64, 512)

    # Conv Block 5
    x = layers.Conv2D(512, (3, 3), padding="same", name="conv5")(x)
    x = layers.BatchNormalization(name="bn5")(x)
    x = layers.ReLU(name="relu5")(x)
    x = layers.MaxPooling2D(pool_size=(4, 1), strides=(4, 1), padding="same", name="pool5")(x)  # -> (1, 64, 512)

    # Map to Sequence: Transpose/Reshape to (Batch, Timesteps=64, Channels=512)
    # Permute to (batch, width, height, channels) -> (batch, 64, 1, 512) -> (batch, 64, 512)
    x = layers.Permute((2, 1, 3), name="permute")(x)
    x = layers.Reshape(target_shape=(img_width // 4, 512), name="reshape_to_sequence")(x)

    x = layers.Dense(256, activation="relu", name="dense_proj")(x)
    x = layers.Dropout(0.25, name="dropout_proj")(x)

    # Recurrent Sequence Modeling (BiLSTM)
    x = layers.Bidirectional(
        layers.LSTM(256, return_sequences=True, dropout=0.25),
        name="bilstm_1",
    )(x)
    x = layers.Bidirectional(
        layers.LSTM(256, return_sequences=True, dropout=0.25),
        name="bilstm_2",
    )(x)

    # Transcription Layer (+1 for CTC blank token at index num_classes)
    y_pred = layers.Dense(
        num_classes + 1, activation="softmax", name="ctc_softmax"
    )(x)

    # Prediction Model (for direct inference)
    prediction_model = Model(inputs=input_img, outputs=y_pred, name="CRNN_Prediction")

    # -------------------------------------------------------------
    # 2. Training Model with CTC Loss
    # -------------------------------------------------------------
    labels = layers.Input(shape=(max_label_len,), name="label_input", dtype="float32")
    input_length = layers.Input(shape=(1,), name="input_length", dtype="int64")
    label_length = layers.Input(shape=(1,), name="label_length", dtype="int64")

    loss_out = CTCLayer(name="ctc_loss")(labels, y_pred, input_length, label_length)

    training_model = Model(
        inputs=[input_img, labels, input_length, label_length],
        outputs=loss_out,
        name="CRNN_Training",
    )

    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    training_model.compile(optimizer=optimizer)

    return prediction_model, training_model


class CTCDecoder:
    """Fast Greedy & Beam Search CTC Decoder with Confidence Estimation."""

    def __init__(self, class_names):
        self.class_names = list(class_names)
        self.num_classes = len(class_names)
        self.blank_idx = self.num_classes
        self.char_to_idx = {char: idx for idx, char in enumerate(self.class_names)}
        self.idx_to_char = {idx: char for idx, char in enumerate(self.class_names)}

    def decode_greedy(self, preds, input_len=64):
        """Decode softmax predictions using CTC greedy (best path) decoding.

        Args:
            preds: Softmax probability tensor [Batch, Timesteps, NumClasses + 1]
            input_len: Sequence length (default 64)

        Returns:
            List of tuples: [(decoded_string, sequence_confidence, char_confidences), ...]
        """
        batch_size = preds.shape[0]
        results = []

        for b in range(batch_size):
            pred = preds[b]  # [Timesteps, NumClasses + 1]
            argmax_indices = np.argmax(pred, axis=-1)
            max_probs = np.max(pred, axis=-1)

            decoded_chars = []
            char_confidences = []
            prev_idx = None

            for t in range(len(argmax_indices)):
                idx = int(argmax_indices[t])
                prob = float(max_probs[t])

                # CTC Rule: Ignore blank tokens (index == blank_idx)
                # and collapse consecutive duplicate tokens
                if idx != self.blank_idx:
                    if idx != prev_idx:
                        char = self.idx_to_char.get(idx, "")
                        decoded_chars.append(char)
                        char_confidences.append(prob)
                prev_idx = idx

            decoded_text = "".join(decoded_chars)
            if char_confidences:
                seq_conf = float(np.mean(char_confidences))
            else:
                seq_conf = 0.0

            results.append((decoded_text, seq_conf, char_confidences))

        return results

    def encode_label(self, text, max_len=16):
        """Encode a string into integer sequence padded to max_len."""
        encoded = [self.char_to_idx[c] for c in text if c in self.char_to_idx]
        length = len(encoded)
        if len(encoded) < max_len:
            encoded = encoded + [0] * (max_len - len(encoded))
        else:
            encoded = encoded[:max_len]
            length = max_len
        return np.array(encoded, dtype=np.float32), length
