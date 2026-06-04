import express from "express";
import {
  createReport,
  getReports,
  getReport,
  deleteReport,
  updateReport,
  patchReportStatus,
} from "../controllers/reportController.js";
import upload from "./../middleware/upload.js";
import authMiddleware from "./../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createReport);

router.get("/", authMiddleware, getReports);
router.get("/:reportId", authMiddleware, getReport);
router.delete("/:reportId", authMiddleware, deleteReport);
router.patch(
  "/:reportId",
  // authMiddleware,
  patchReportStatus,
);
router.put("/:reportId", authMiddleware, upload.single("image"), updateReport);

export default router;
