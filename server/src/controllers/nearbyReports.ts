import { AuthRequest } from "../types/model.types.js";
import { Request, Response } from "express";
import Report from "../models/reportModel.js";

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

const getNearbyReports = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { latitude, longitude, radius = 40 } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({ message: "Latitude and longitude are required." });
      return;
    }

    const userLat = parseFloat(latitude as string);
    const userLon = parseFloat(longitude as string);
    const maxRadius = parseFloat(radius as string);

    //fetches all reports and filter by distance
    const allReports = await Report.find({ status: "approved" });

    const nearbyReports = allReports.filter((report) => {
      const distance = haversineDistance(
        userLat,
        userLon,
        report.location.latitude,
        report.location.longitude,
      );
      return distance <= maxRadius;
    });

    res.status(200).json({ reports: nearbyReports });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export { getNearbyReports };
