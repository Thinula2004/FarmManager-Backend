import { Request, Response } from "express";
import Farm from "../models/Farm";

export const addFarm = async (req: Request, res: Response) => {
  try {
    const {
      name,
      city,
      address,
      customer,
      tel,
    } = req.body;

    // Validate required fields
    if (!name || !city || !address || !customer || !tel) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Create the farm
    const farm = await Farm.create({
      name,
      city,
      address,
      customer,
      tel,
    });

    return res.status(201).json({
      message: "Farm created successfully",
      farm: {
        id: farm._id,
        name: farm.name,
        city: farm.city,
        address: farm.address,
        customer: farm.customer,
        tel: farm.tel,
      },
    });
  } catch (err) {
    console.log(`Error Occured During Add Farm : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllFarms = async (
  req: Request,
  res: Response
) => {
  try {
    const farms = await Farm.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Farms retrieved successfully",
      farms: farms.map((farm) => ({
        id: farm._id,
        name: farm.name,
        city: farm.city,
        address: farm.address,
        customer: farm.customer,
        tel: farm.tel,
        createdAt: farm.createdAt,
        updatedAt: farm.updatedAt,
      })),
    });
  } catch (err) {
    console.log(`Error Occured During Get All Farms : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};