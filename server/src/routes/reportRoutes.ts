import express from "express";
import reportController from "../controllers/reportController.js";
import upload from "./../middleware/upload.js";
import authMiddleware from "./../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  // authMiddleware,
  upload.single("image"),
  reportController.createReport,
);

export default router;
