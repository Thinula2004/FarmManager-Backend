import { Request, Response } from "express";
import SupplyType from "../models/SupplyType";
import Supply from "../models/Supply";
import Batch from "../models/Batch";

// ============================================================
// Supply Type
// ============================================================

export const addSupplyType = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const existingType = await SupplyType.findOne({
      name: name.trim(),
    });

    if (existingType) {
      return res.status(400).json({
        message: "Supply type already exists",
      });
    }

    const supplyType = await SupplyType.create({
      name: name.trim(),
    });

    return res.status(201).json({
      message: "Supply type created successfully",
      supplyType: {
        id: supplyType._id,
        name: supplyType.name,
        createdAt: supplyType.createdAt,
        updatedAt: supplyType.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Add Supply Type : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateSupplyType = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const supplyType = await SupplyType.findById(id);

    if (!supplyType) {
      return res.status(404).json({
        message: "Supply type not found",
      });
    }

    const existingType = await SupplyType.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });

    if (existingType) {
      return res.status(400).json({
        message: "Supply type already exists",
      });
    }

    supplyType.name = name.trim();

    await supplyType.save();

    return res.status(200).json({
      message: "Supply type updated successfully",
      supplyType: {
        id: supplyType._id,
        name: supplyType.name,
        createdAt: supplyType.createdAt,
        updatedAt: supplyType.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Update Supply Type : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllSupplyTypes = async (
  req: Request,
  res: Response
) => {
  try {
    const supplyTypes = await SupplyType.find().sort({
      name: 1,
    });

    return res.status(200).json({
      message: "Supply types retrieved successfully",
      supplyTypes: supplyTypes.map((type) => ({
        id: type._id,
        name: type.name,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      })),
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Supply Types : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteSupplyType = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const supplyType = await SupplyType.findById(id);

    if (!supplyType) {
      return res.status(404).json({
        message: "Supply type not found",
      });
    }

    await SupplyType.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Supply type deleted successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Delete Supply Type : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ============================================================
// Supply
// ============================================================

export const addSupply = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      quantity,
      unit,
      type,
      batch,
    } = req.body;

    if (
      !name ||
      !name.trim() ||
      quantity === undefined ||
      quantity === null ||
      !unit ||
      !unit.trim() ||
      !type ||
      !batch
    ) {
      return res.status(400).json({
        message:
          "Name, quantity, unit, type and batch are required",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    const supplyType = await SupplyType.findById(type);

    if (!supplyType) {
      return res.status(404).json({
        message: "Supply type not found",
      });
    }

    const existingBatch = await Batch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const supply = await Supply.create({
      name: name.trim(),
      quantity,
      unit: unit.trim(),
      type,
      batch,
    });

    const populatedSupply = await Supply.findById(
      supply._id
    ).populate("type", "name");

    return res.status(201).json({
      message: "Supply created successfully",
      supply: {
        id: populatedSupply!._id,
        name: populatedSupply!.name,
        quantity: populatedSupply!.quantity,
        unit: populatedSupply!.unit,
        type: populatedSupply!.type,
        batch: populatedSupply!.batch,
        createdAt: populatedSupply!.createdAt,
        updatedAt: populatedSupply!.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Add Supply : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteSupply = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const supply = await Supply.findById(id);

    if (!supply) {
      return res.status(404).json({
        message: "Supply not found",
      });
    }

    await Supply.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Supply deleted successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Delete Supply : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSuppliesByBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const { batchID } = req.params;

    const existingBatch = await Batch.findById(batchID);

    if (!existingBatch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const supplies = await Supply.find({
      batch: batchID,
    })
      .populate("type", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Supplies retrieved successfully",
      supplies: supplies.map((supply) => ({
        id: supply._id,
        name: supply.name,
        quantity: supply.quantity,
        unit: supply.unit,
        type: supply.type,
        batch: supply.batch,
        createdAt: supply.createdAt,
        updatedAt: supply.updatedAt,
      })),
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Supplies By Batch : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};