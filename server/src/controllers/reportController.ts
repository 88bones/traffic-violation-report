import { Request, Response } from "express";
import Report from "../models/reportModel.js";

const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { number_plate, violation, description, location } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "Image is required." });
      return;
    }

    const imagePath = req.file.path; // ← path to saved image

    const newReport = new Report({
      image: imagePath, // ← save path to db
      number_plate,
      violation,
      description,
      location: JSON.parse(location), // ← parse since FormData sends strings
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

export default { createReport };
