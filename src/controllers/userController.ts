import { Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User";
import Farm from "../models/Farm";
import OfficerFarm from "../models/OfficerFarm";

import { AuthenticatedRequest } from "../types/AuthenticatedRequest";


// Add officer

export const addUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      name,
      phone,
      password,
      farmIds,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !phone ||
      !password ||
      !Array.isArray(farmIds) ||
      farmIds.length === 0
    ) {
      return res.status(400).json({
        message:
          "Name, phone, password and at least one farmId are required",
      });
    }

    // Remove duplicate farm IDs
    const uniqueFarmIds = [...new Set(farmIds)];

    // Check all farms
    const farms = await Farm.find({
      _id: { $in: uniqueFarmIds },
    });

    if (farms.length !== uniqueFarmIds.length) {
      return res.status(404).json({
        message: "One or more farms not found",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      phone,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create officer
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "officer",
    });

    // Create officer-farm relationships
    await OfficerFarm.insertMany(
      uniqueFarmIds.map((farmId) => ({
        officer: user._id,
        farm: farmId,
      }))
    );

    return res.status(201).json({
      message: "Officer created successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      farms: uniqueFarmIds,
    });
  } catch (err) {
    console.log(
      `Error Occured During Add User : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      password,
      farmIds,
    } = req.body;

    if (
      !name ||
      !phone ||
      !Array.isArray(farmIds) ||
      farmIds.length === 0
    ) {
      return res.status(400).json({
        message:
          "Name, phone and at least one farmId are required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "owner") {
      return res.status(403).json({
        message: "Owner cannot be updated",
      });
    }

    const uniqueFarmIds = [...new Set(farmIds)];

    const farms = await Farm.find({
      _id: { $in: uniqueFarmIds },
    });

    if (farms.length !== uniqueFarmIds.length) {
      return res.status(404).json({
        message: "One or more farms not found",
      });
    }

    const existingUser = await User.findOne({
      phone,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Phone number already exists",
      });
    }

    user.name = name;
    user.phone = phone;

    if (password) {
      user.password = await bcrypt.hash(
        password,
        10
      );
    }

    await user.save();

    await OfficerFarm.deleteMany({
      officer: id,
    });

    await OfficerFarm.insertMany(
      uniqueFarmIds.map((farmId) => ({
        officer: user._id,
        farm: farmId,
      }))
    );

    return res.status(200).json({
      message: "Officer updated successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      farms: uniqueFarmIds,
    });
  } catch (err) {
    console.log(
      `Error Occured During Update User : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};



// Delete officer

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {

    const { id } = req.params;


    const user = await User.findById(id);


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    // Prevent deleting owners
    if (user.role === "owner") {
      return res.status(403).json({
        message: "Owner cannot be deleted",
      });
    }


    await OfficerFarm.deleteMany({
      officer: id,
    });


    await User.findByIdAndDelete(id);


    return res.status(200).json({
      message: "Officer deleted successfully",
    });


  } catch (err) {

    console.log(
      `Error Occured During Delete User : ${err}`
    );


    return res.status(500).json({
      message: "Server error",
    });
  }
};



// Get all officers

export const getOfficers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const officers = await User.find({
      role: "officer",
    })
      .select("-tokenVersion")
      .sort({
        createdAt: -1,
      })
      .lean();

    const officerIds = officers.map((officer) => officer._id);

    const officerFarms = await OfficerFarm.find({
      officer: { $in: officerIds },
    })
      .populate("farm")
      .lean();

    const officersWithFarms = officers.map((officer) => {
      const farms = officerFarms
        .filter(
          (officerFarm) =>
            officerFarm.officer.toString() ===
            officer._id.toString()
        )
        .map((officerFarm) => officerFarm.farm);

      return {
        id: officer._id,
        name: officer.name,
        phone: officer.phone,
        password: officer.password,
        farms,
      };
    });

    return res.status(200).json({
      message: "Officers retrieved successfully",
      officers: officersWithFarms,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Officers : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};



