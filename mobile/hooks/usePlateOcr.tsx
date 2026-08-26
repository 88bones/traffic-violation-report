import { useEffect, useRef, useState } from "react";
import API_BASE_URL from "@/config/apiConfig";

interface UsePlateOCRResult {
  detectedPlate: string | null;
  isDetecting: boolean;
  error: string | null;
}

/**
 * Calls the plate OCR service with the captured image and returns the
 * detected plate text. Fires once per unique imageUri.
 *
 * This does NOT set any form state itself — the screen using this hook
 * decides what to do with detectedPlate (e.g. prefill a text input, but
 * still let the user edit/override it, since OCR can be wrong).
 */
export function usePlateOCR(imageUri: string | null): UsePlateOCRResult {
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // avoid re-running for the same image if the screen re-renders
  const lastUriRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageUri || imageUri === lastUriRef.current) return;
    lastUriRef.current = imageUri;

    let cancelled = false;

    const detectPlate = async () => {
      setIsDetecting(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("image", {
          uri: imageUri,
          name: "plate.jpg",
          type: "image/jpeg",
        } as any);

        const response = await fetch(`${API_BASE_URL}/api/ocr/predict`, {
          method: "POST",
          body: formData,
        });

        const responseText = await response.text();
        let json: { success?: boolean; plate_text?: string; error?: string };
        try {
          json = JSON.parse(responseText);
        } catch {
          throw new Error(
            `OCR server returned an invalid response (${response.status})`,
          );
        }

        if (cancelled) return;

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Plate detection failed");
        }

        setDetectedPlate(json.plate_text || null);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Could not reach OCR service");
        }
      } finally {
        if (!cancelled) setIsDetecting(false);
      }
    };

    detectPlate();

    return () => {
      cancelled = true;
    };
  }, [imageUri]);

  return { detectedPlate, isDetecting, error };
}
