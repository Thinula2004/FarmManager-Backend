import { Request, Response } from "express";
import Batch from "../models/Batch";
import Farm from "../models/Farm";
import Breed from "../models/Breed";

// Add a new batch

export const addBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      farm,
      inDate,
      initialCount,
      breed,
      subBreed,
      totalCost,
    } = req.body;

    if (
      !name ||
      !farm ||
      !inDate ||
      initialCount === undefined ||
      !breed ||
      totalCost === undefined
    ) {
      return res.status(400).json({
        message: "All required batch fields are required",
      });
    }

    if (initialCount <= 0) {
      return res.status(400).json({
        message: "Initial count must be greater than 0",
      });
    }

    if (totalCost < 0) {
      return res.status(400).json({
        message: "Total cost cannot be negative",
      });
    }

    const existingFarm = await Farm.findById(farm);

    if (!existingFarm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    const existingBreed = await Breed.findById(breed);

    if (!existingBreed) {
      return res.status(404).json({
        message: "Breed not found",
      });
    }

    const batch = await Batch.create({
      name,
      farm,
      inDate,
      initialCount,
      breed,
      subBreed: subBreed ? subBreed.trim() : "",
      totalCost,
      status: "ONGOING",
    });

    return res.status(201).json({
      message: "Batch created successfully",
      batch: {
        id: batch._id,
        name: batch.name,
        farm: batch.farm,
        inDate: batch.inDate,
        initialCount: batch.initialCount,
        breed: batch.breed,
        subBreed: batch.subBreed,
        totalCost: batch.totalCost,
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      },
    });
  } catch (err) {
    console.log(`Error Occured During Add Batch : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Delete a batch

export const deleteBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    await Batch.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Batch deleted successfully",
    });
  } catch (err) {
    console.log(`Error Occured During Delete Batch : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get all batches belonging to a farm

export const getBatchesByFarm = async (
  req: Request,
  res: Response
) => {
  try {
    const { farmID } = req.params;

    const existingFarm = await Farm.findById(farmID);

    if (!existingFarm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    const batches = await Batch.find({
      farm: farmID,
    })
      .populate(
        "farm",
        "name city address customer tel"
      )
      .populate("breed", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Batches retrieved successfully",
      batches: batches.map((batch) => ({
        id: batch._id,
        name: batch.name,
        farm: batch.farm,
        inDate: batch.inDate,
        initialCount: batch.initialCount,
        breed: batch.breed,
        subBreed: batch.subBreed,
        totalCost: batch.totalCost,
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      })),
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Batches By Farm : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Update batch status only

export const updateBatchStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "ONGOING",
      "PARTIALLY_SOLD",
      "COMPLETED",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be ONGOING, PARTIALLY_SOLD, or COMPLETED",
      });
    }

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    batch.status = status;

    await batch.save();

    return res.status(200).json({
      message: "Batch status updated successfully",
      batch: {
        id: batch._id,
        name: batch.name,
        farm: batch.farm,
        inDate: batch.inDate,
        initialCount: batch.initialCount,
        breed: batch.breed,
        subBreed: batch.subBreed,
        totalCost: batch.totalCost,
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Update Batch Status : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};