import { Request } from "express";

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
    email?: string;
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
  createdAt: string;
}
