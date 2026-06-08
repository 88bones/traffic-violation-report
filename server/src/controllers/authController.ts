import { Request, Response } from "express";
import User from "../models/userModel.js";
import { hash, compare } from "bcrypt-ts";
import jwtGenerator from "../utils/jwtGenerator.js";
import { AuthRequest, IUser } from "../types/model.types.js";

interface SignUpRequest extends Request {
  body: IUser;
}

// sigup controller
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

// sign in contrtoller
const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid Credentials." });
      return;
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Password is incorrect" });
      return;
    }

    const token = jwtGenerator(user._id.toString());

    res.status(200).json({
      message: "Login Successful",
      token,
      User: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

const fetchUserProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "No Users found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

// push token
const savePushToken = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user?.id, {
      pushToken: req.body.pushToken,
    });
    res.status(200).json({ message: "Push token saved." });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export default { signUp, signIn, fetchUserProfile, savePushToken };
