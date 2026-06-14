import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role } = req.body;

    // 1. check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. create user
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: role || "officer",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};