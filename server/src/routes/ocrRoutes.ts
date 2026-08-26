import { Router } from "express";
import multer from "multer";
import { predictPlate } from "../controllers/ocrController.js";

// keep the file in memory — we just forward the buffer to Flask, no need
// to write it to disk on the Express side
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap
});

const router = Router();

router.post("/predict", upload.single("image"), predictPlate);

export default router;
