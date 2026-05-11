import express from "express";
import reportController from "../controllers/reportController.js";
import upload from "./../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), reportController.createReport);

export default router;
