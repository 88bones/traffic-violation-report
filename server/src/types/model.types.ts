import { Request } from "express";

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
