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

    const imagePath = `uploads/${req.file.filename}`;

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

    if (!userId) {
      res.status(401).json({ message: "User ID is required." });
      return;
    }

    const reports = await Report.find({ reportedBy: userId });
    res.status(200).json({ reports });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
      res.status(404).json({ message: "Report not found." });
      return;
    }

    res.status(200).json({ report });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    res.status(200).json({ message: "Report deleted successfully", report });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

const updateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const { number_plate, violation, description, location, status } = req.body;

    if (!reportId) {
      res.status(400).json({ messsage: "Report not found." });
    }

    if (!req.user?.id) {
      res
        .status(401)
        .json({ message: "User not authenticated. Please login again." });
    }

    if (!req.file) {
      res.status(400).json({ message: "Image is required." });
      return;
    }

    const imagePath = `uploads/${req.file.filename}`;

    const updatedData = {
      image: imagePath,
      number_plate,
      violation,
      description,
      location: JSON.parse(location),
      reportedBy: req.user?.id,
      status,
    };

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      updatedData,
      { new: true },
    );

    if (!updatedReport) {
      res.status(404).json({
        message: "Report not found.",
      });
      return;
    }

    res.status(200).json({
      message: "Report updated successfully.",
      report: updatedReport,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export { createReport, getReports, getReport, deleteReport, updateReport };
