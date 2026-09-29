# Segmentation-Free OCR Architecture: CRNN with CTC Loss

## Executive Summary
This document details the architectural migration of the Nepali License Plate OCR service from a legacy **segment-then-classify** pipeline to a modern **segmentation-free CRNN (Convolutional Recurrent Neural Network with Connectionist Temporal Classification loss)** architecture.

---

## 1. Comparison of OCR Paradigms

| Dimension | Legacy Segment-then-Classify | Segmentation-Free CRNN + CTC |
| :--- | :--- | :--- |
| **Workflow** | Binarization $\rightarrow$ Contour Search $\rightarrow$ Heuristic Filtering $\rightarrow$ Box Sorting $\rightarrow$ Individual CNN Classification | Single end-to-end forward pass: Full Plate Image $\rightarrow$ CNN Feature Sequence $\rightarrow$ BiLSTM Context $\rightarrow$ CTC Decode |
| **Touching / Overlapping Characters** | **Fails**: Merged contours are either filtered out or fed as a single multi-character blob to a single-character CNN. | **Resilient**: Temporal CTC alignments map contiguous probability activations to character tokens without explicit bounding boxes. |
| **Broken / Disjoint Characters** | **Fails**: Complex conjuncts (e.g., `को`, `डि`, `प्र`, `मे`) split into multiple fragments, generating false positives/dropped characters. | **Resilient**: Receptive fields and BiLSTM sequence context recognize fragmented strokes as parts of complete characters. |
| **Low-Light / Glare / Shadows** | **Fails**: Global/OTSU binarization introduces severe thresholding artifacts under non-uniform illumination. | **Resilient**: Feature maps operate on continuous convolutional gradients rather than brittle binary thresholds. |
| **Spatial Sorting & Skew** | **Fragile**: Row thresholding (`row_threshold = h_img * 0.35`) misorders 2-line vs 1-line plates under perspective tilt. | **Native**: Recurrent layers process the temporal sequence sequentially across the width axis. |
| **Inference Latency** | High overhead ($N$ individual CNN forward passes + contour extraction). | Ultra-fast single forward pass ($\approx 15\text{ ms}$ on CPU). |

---

## 2. CRNN Architecture Specifications

```
Input Plate Image: (H=64, W=256, C=1)
   │
   ▼
[CNN Feature Extractor]
   ├── Conv2D(64, 3x3) + BatchNorm + ReLU + MaxPool(2,2)   ──> (32, 128, 64)
   ├── Conv2D(128, 3x3) + BatchNorm + ReLU + MaxPool(2,2)  ──> (16, 64, 128)
   ├── Conv2D(256, 3x3) + BatchNorm + ReLU                 ──> (16, 64, 256)
   ├── Conv2D(256, 3x3) + BatchNorm + ReLU + MaxPool(2,1)* ──> (8, 64, 256)
   ├── Conv2D(512, 3x3) + BatchNorm + ReLU                 ──> (8, 64, 512)
   ├── Conv2D(512, 3x3) + BatchNorm + ReLU + MaxPool(2,1)* ──> (4, 64, 512)
   └── Conv2D(512, 2x2) + BatchNorm + ReLU + MaxPool(4,1)* ──> (1, 64, 512)
   │
   ▼ (*Asymmetric pooling preserves width sequence length T=64 while reducing height to 1)
[Map-to-Sequence & Projection]
   ├── Permute & Reshape ──> (Batch, Timesteps=64, Channels=512)
   └── Dense(256, ReLU) + Dropout(0.25)
   │
   ▼
[Recurrent Sequence Modeling]
   ├── Bidirectional LSTM (256 hidden units, dropout=0.25) ──> (Batch, 64, 512)
   └── Bidirectional LSTM (256 hidden units, dropout=0.25) ──> (Batch, 64, 512)
   │
   ▼
[Transcription Layer]
   └── Dense(num_classes + 1, activation='softmax') ──> (Batch, 64, 35)
   │
   ▼
[CTC Loss & Decoding]
   ├── Training: Connectionist Temporal Classification (CTC) batch loss
   └── Inference: CTC Greedy / Beam Search collapse decoding
```

---

## 3. Mathematical Formulation of CTC Loss

Given an input feature sequence $X = (x_1, x_2, \dots, x_T)$ of length $T = 64$ and a target label sequence $l = (l_1, l_2, \dots, l_U)$ where $U \le T$:

1. **Alignment Mapping $\mathcal{B}$**:
   The collapse operator $\mathcal{B}$ removes consecutive duplicate tokens and drops CTC blank tokens $\epsilon$:
   $$\mathcal{B}(\pi_1, \pi_2, \dots, \pi_T) = l$$
   For example, $\mathcal{B}(\text{बा, बा, } \epsilon \text{, ३, ३, } \epsilon \text{, च}) = \text{"बा ३ च"}$.

2. **Conditional Probability**:
   Assuming conditional independence between frame predictions given $X$:
   $$P(\pi | X) = \prod_{t=1}^{T} y_{\pi_t}^{t}$$
   The conditional probability of the target sequence $l$ is the sum over all valid alignments:
   $$P(l | X) = \sum_{\pi \in \mathcal{B}^{-1}(l)} P(\pi | X)$$

3. **Objective Function**:
   The model is trained by minimizing the negative log-likelihood:
   $$\mathcal{L}_{\text{CTC}} = -\ln P(l | X) = -\ln \sum_{\pi \in \mathcal{B}^{-1}(l)} \prod_{t=1}^{T} y_{\pi_t}^{t}$$
   This is computed in $O(T \cdot U)$ using the forward-backward dynamic programming algorithm.

---

## 4. Domain-Specific Data Augmentation Pipeline

To guarantee high accuracy across real-world driving and traffic conditions in Nepal, the training pipeline (`augmentations.py` and `data_generator.py`) includes:

### 1. 3D Embossed Metallic Plate Simulation
- **Filter**: Directional Sobel/Scharr convolution simulating specular highlights on the top-left edge and drop shadows on the bottom-right edge.
- **Goal**: Models modern embossed number plates without character-edge disintegration.

### 2. Motion Blur & Defocus
- **Filter**: Linear convolution kernels of size $k \in [3, 11\text{ px}]$ at angles $\theta \in [-30^\circ, 30^\circ]$ to model moving vehicles and camera shutter delays.
- **Goal**: Prevents OCR failure when vehicles are captured in motion.

### 3. Low-Light, Night, & Non-Uniform Illumination
- **Filter**: Non-linear gamma adjustments ($\gamma \in [0.35, 0.85]$), directional brightness ramps, and radial spotlight glare modeling headlight beams.
- **Goal**: Preserves readability under nighttime surveillance conditions.

### 4. Negative Kerning & Touching Characters
- **Synthesis**: Character crops from `character_ocr/` are placed with variable kerning ($\Delta x \in [-4, 8\text{ px}]$) and morphological dilation.
- **Goal**: Trains the recurrent BiLSTM layers to separate contiguous character activations naturally.

---

## 5. API Reference

### Health Check: `GET /health`
```json
{
  "status": "ok",
  "architecture": "CRNN (CNN + BiLSTM + CTC)",
  "type": "segmentation-free"
}
```

### Plate Recognition: `POST /predict`
**Request (multipart/form-data):**
- `image`: Image file (`jpg`, `jpeg`, `png`, `heic`)
- `crop_top_frac` (optional, default `0.25`): Top crop fraction for 2-line plates
- `min_confidence` (optional, default `40`): Minimum confidence threshold (0-100)
- `debug` (optional, default `false`): Save debug images to `debug_out/`

**Response:**
```json
{
  "success": true,
  "plate_text": "बा ३ च 1234",
  "processing_time_sec": 0.018,
  "architecture": "CRNN-BiLSTM-CTC (Segmentation-Free)",
  "params": {
    "crop_top_frac": 0.25,
    "min_confidence": 40
  }
}
```
