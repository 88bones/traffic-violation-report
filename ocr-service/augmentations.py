"""Domain-specific data augmentations for Nepali License Plate OCR.

Specifically addresses real-world plate degradations:
1. Embossed 3D plate effects (metallic relief, highlights, cast shadows).
2. Low-light, nighttime, headlight glare, and non-uniform shadow gradients.
3. Motion blur (linear camera/vehicle velocity kernels) and defocus blur.
4. Touching/overlapping characters via negative kerning and morph ops.
5. Geometric variations (perspective tilt, shear, aspect ratio changes).
"""

import cv2
import numpy as np
import random


def apply_emboss_effect(img, intensity=None):
    """Simulate 3D stamped/embossed metallic plate lettering with directional lighting.

    Creates specular highlights on one edge and drop shadows on the opposite edge.
    """
    if intensity is None:
        intensity = random.uniform(0.6, 1.4)

    # Randomize light direction (top-left, top-right, etc.)
    directions = [
        np.array([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], dtype=np.float32),  # Top-left light
        np.array([[0, -1, -2], [1, 1, -1], [2, 1, 0]], dtype=np.float32),  # Top-right light
        np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32),  # Top light
    ]
    kernel = random.choice(directions) * intensity

    if len(img.shape) == 2:
        embossed = cv2.filter2D(img, -1, kernel) + 128
        # Blend with original
        alpha = random.uniform(0.3, 0.7)
        out = cv2.addWeighted(img, 1.0 - alpha, embossed.astype(np.uint8), alpha, 0)
    else:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        embossed = cv2.filter2D(gray, -1, kernel) + 128
        embossed_bgr = cv2.cvtColor(embossed.astype(np.uint8), cv2.COLOR_GRAY2BGR)
        alpha = random.uniform(0.25, 0.6)
        out = cv2.addWeighted(img, 1.0 - alpha, embossed_bgr, alpha, 0)

    return out


def apply_motion_blur(img, kernel_size=None, angle=None):
    """Simulate linear motion blur caused by vehicle movement or camera shutter lag."""
    if kernel_size is None:
        kernel_size = random.choice([3, 5, 7, 9, 11])
    if angle is None:
        angle = random.uniform(-30, 30)  # Primary horizontal motion with tilt

    # Create motion blur kernel
    kernel = np.zeros((kernel_size, kernel_size), dtype=np.float32)
    center = (kernel_size - 1) / 2.0
    rad = np.deg2rad(angle)
    dx = np.cos(rad)
    dy = np.sin(rad)

    for i in range(kernel_size):
        offset = i - center
        x = int(round(center + offset * dx))
        y = int(round(center + offset * dy))
        if 0 <= x < kernel_size and 0 <= y < kernel_size:
            kernel[y, x] = 1.0

    k_sum = kernel.sum()
    if k_sum > 0:
        kernel /= k_sum
    else:
        kernel[kernel_size // 2, kernel_size // 2] = 1.0

    return cv2.filter2D(img, -1, kernel)


def apply_defocus_blur(img, sigma=None):
    """Simulate camera out-of-focus blur."""
    if sigma is None:
        sigma = random.uniform(0.5, 2.0)
    ksize = int(2 * round(3 * sigma) + 1)
    ksize = max(3, ksize if ksize % 2 == 1 else ksize + 1)
    return cv2.GaussianBlur(img, (ksize, ksize), sigma)


def apply_low_light_and_shadows(img):
    """Simulate nighttime capture, poor lighting, non-uniform shadow gradients, and glare."""
    h, w = img.shape[:2]
    out = img.astype(np.float32)

    aug_choice = random.random()

    if aug_choice < 0.4:
        # Non-linear gamma adjustment (low-light darkening / contrast compression)
        gamma = random.uniform(0.35, 0.85)
        out = 255.0 * np.power(out / 255.0, 1.0 / gamma)

    elif aug_choice < 0.7:
        # Directional shadow / illumination gradient across plate
        gradient = np.linspace(
            random.uniform(0.2, 0.6), random.uniform(0.8, 1.2), w, dtype=np.float32
        )
        if random.random() < 0.5:
            gradient = gradient[::-1]
        grad_mask = np.tile(gradient, (h, 1))
        if len(img.shape) == 3:
            grad_mask = np.expand_dims(grad_mask, axis=2)
        out = out * grad_mask

    else:
        # Radial spotlight / headlight glare effect
        cx = random.randint(int(w * 0.2), int(w * 0.8))
        cy = random.randint(int(h * 0.2), int(h * 0.8))
        radius = random.uniform(w * 0.4, w * 0.9)

        y_coords, x_coords = np.ogrid[:h, :w]
        dist_sq = (x_coords - cx) ** 2 + (y_coords - cy) ** 2
        spotlight = np.exp(-dist_sq / (2 * (radius ** 2))).astype(np.float32)
        spotlight = 0.4 + 0.8 * spotlight
        if len(img.shape) == 3:
            spotlight = np.expand_dims(spotlight, axis=2)
        out = out * spotlight

    return np.clip(out, 0, 255).astype(np.uint8)


def apply_sensor_noise(img):
    """Add realistic camera sensor noise (Gaussian + Salt/Pepper/ISO grain)."""
    h, w = img.shape[:2]
    out = img.astype(np.float32)

    # Additive Gaussian noise
    sigma = random.uniform(5.0, 25.0)
    noise = np.random.normal(0, sigma, img.shape)
    out = out + noise

    # Occasional Salt and Pepper noise
    if random.random() < 0.3:
        num_sp = int(0.002 * h * w)
        for _ in range(num_sp):
            y = random.randint(0, h - 1)
            x = random.randint(0, w - 1)
            val = 255 if random.random() < 0.5 else 0
            if len(img.shape) == 3:
                out[y, x, :] = val
            else:
                out[y, x] = val

    return np.clip(out, 0, 255).astype(np.uint8)


def apply_touching_characters_morph(img):
    """Apply slight morphological dilation/closing to simulate touching/smeared strokes."""
    kernel_w = random.choice([2, 3])
    kernel_h = random.choice([1, 2])
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_w, kernel_h))

    op = random.choice(["dilate", "close"])
    if op == "dilate":
        return cv2.dilate(img, kernel, iterations=1)
    else:
        return cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)


def apply_geometric_distortion(img):
    """Apply slight perspective tilt, affine shearing, and scaling."""
    h, w = img.shape[:2]

    # Affine shear
    shear_x = random.uniform(-0.15, 0.15)
    shear_y = random.uniform(-0.05, 0.05)
    M_shear = np.array([[1, shear_x, 0], [shear_y, 1, 0]], dtype=np.float32)

    sheared = cv2.warpAffine(
        img, M_shear, (w, h), borderMode=cv2.BORDER_REPLICATE
    )

    # Perspective warp
    if random.random() < 0.4:
        dx = random.uniform(-0.05, 0.05) * w
        dy = random.uniform(-0.05, 0.05) * h
        pts1 = np.float32([[0, 0], [w, 0], [0, h], [w, h]])
        pts2 = np.float32([
            [max(0, dx), max(0, dy)],
            [min(w - 1, w - dx), max(0, -dy)],
            [max(0, -dx), min(h - 1, h - dy)],
            [min(w - 1, w + dx), min(h - 1, h + dy)],
        ])
        M_persp = cv2.getPerspectiveTransform(pts1, pts2)
        sheared = cv2.warpPerspective(
            sheared, M_persp, (w, h), borderMode=cv2.BORDER_REPLICATE
        )

    return sheared


def augment_plate_image(img, p_emboss=0.5, p_blur=0.6, p_lighting=0.6, p_noise=0.5, p_geom=0.5):
    """Comprehensive augmentation pipeline simulating real-world plate capture conditions."""
    out = img.copy()

    if random.random() < p_geom:
        out = apply_geometric_distortion(out)

    if random.random() < p_emboss:
        out = apply_emboss_effect(out)

    if random.random() < p_blur:
        if random.random() < 0.65:
            out = apply_motion_blur(out)
        else:
            out = apply_defocus_blur(out)

    if random.random() < p_lighting:
        out = apply_low_light_and_shadows(out)

    if random.random() < p_noise:
        out = apply_sensor_noise(out)

    if random.random() < 0.35:
        out = apply_touching_characters_morph(out)

    return out
