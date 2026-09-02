import { Request, Response } from "express";
import Activity from "../models/Acivity";

export const getActivities = async (
  req: Request,
  res: Response
) => {
  try {
    const activities = await Activity.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Activities retrieved successfully",
      data: activities,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Activities : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};