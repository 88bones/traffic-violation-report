import { Request, Response } from "express";
import User from "../models/userModel.js";
import { hash } from "bcrypt-ts";
import jwtGenerator from "../utils/jwtGenerator.js";
import { IUser } from "../types/model.types.js";

interface SignUpRequest extends Request {
  body: IUser;
}

const signUp = async (req: SignUpRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    

  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
