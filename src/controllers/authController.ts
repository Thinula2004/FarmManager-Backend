import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    user.tokenVersion += 1;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET as string
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Login : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role } = req.body;

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: role || "officer",
      tokenVersion: 0,
    });

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.log(`Error Occured During Create User : ${err}`);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get logged in user

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    const user = await User.findById(
      req.user?.id
    )
      .select(
        "-password -tokenVersion"
      );


    if (!user) {
      return res.status(404).json({
        message:"User not found",
      });
    }


    return res.status(200).json({
      user,
    });


  } catch(err){

    console.log(
      `Error Occured During Get Current User : ${err}`
    );


    return res.status(500).json({
      message:"Server error",
    });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { password } = req.body;

    if (!password || !password.trim()) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.tokenVersion += 1;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET as string
    );

    return res.status(200).json({
      message: "Password changed successfully",
      token,
    });
  } catch (err) {
    console.log(`Error Occured During Change Password : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};