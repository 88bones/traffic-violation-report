 import { Request } from "express";
import mongoose from "mongoose";

// users
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

//report
export enum Violation {
  Speeding = "speeding",
  RunningRedLight = "running_red_light",
  DrunkDriving = "drunk_driving",
  RecklessDriving = "reckless_driving",
}

export interface ILocation {
  name?: string;
  latitude: number;
  longitude: number;
}

export interface IReport {
  id: string;
  image: string;
  number_plate: string;
  violation: Violation;
  description: string;
  location: ILocation;
  status: "pending" | "approved" | "rejected";
  reportedBy: mongoose.Types.ObjectId;
  createdAt: string;
}
