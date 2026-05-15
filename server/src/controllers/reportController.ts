import { Request, Response } from "express";
import Report from "../models/reportModel.js";
import { AuthRequest } from "../types/model.types.js";

const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { number_plate, violation, description, location } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "Image is required." });
      return;
    }

    if (!req.user?.id) {
      res
        .status(401)
        .json({ message: "User not authenticated. Please login again." });
      return;
    }

    const imagePath = req.file.path;

    const newReport = new Report({
      image: imagePath,
      number_plate,
      violation,
      description,
      location: JSON.parse(location),
      reportedBy: req.user?.id,
      status: "pending",
    });

    await newReport.save();

    res.status(201).json({
      message: "Report submitted successfully.",
      report: newReport,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const reports = await Report.find({ reportedBy: userId });
    res.status(200).json({ reports });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export { createReport, getReports };
