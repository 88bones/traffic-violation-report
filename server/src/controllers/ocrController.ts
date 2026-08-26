import { Request, Response } from "express";
import FormData from "form-data";
import axios from "axios";

export const predictPlate = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No image file uploaded" });
    }

    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname || "plate.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const ocrServiceUrl =
      process.env.OCR_SERVICE_URL || "http://localhost:5000/predict";
    const response = await axios.post(ocrServiceUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 15000, // model inference can be slow on CPU — adjust as needed
    });

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("OCR proxy error:", err.message);

    // Flask responded with an error status (e.g. bad file, 500 from the model)
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }

    // Flask is unreachable entirely (not running, wrong port, network issue)
    return res.status(502).json({
      success: false,
      error: "OCR service unavailable",
    });
  }
};
