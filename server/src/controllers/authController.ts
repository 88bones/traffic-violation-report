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

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: "Email already in use." });
      return;
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      res.status(400).json({ message: "Phone number already in use." });
      return;
    }
    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    const token = jwtGenerator(newUser._id.toString());

    res.status(201).json({
      message: "User Registered",
      token,
      User: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export default signUp;
