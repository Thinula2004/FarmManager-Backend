import { Request, Response } from "express";

import FeedType from "../models/FeedType";
import FeedEntry from "../models/FeedEntry";
import Batch from "../models/Batch";

// Add a new Feed Type

export const addFeedType = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Feed type name is required",
      });
    }

    const trimmedName = name.trim();

    const existingFeedType = await FeedType.findOne({
      name: trimmedName,
    });

    if (existingFeedType) {
      return res.status(400).json({
        message: "Feed type already exists",
      });
    }

    const feedType = await FeedType.create({
      name: trimmedName,
    });

    return res.status(201).json({
      message: "Feed type created successfully",
      feedType: {
        id: feedType._id,
        name: feedType.name,
        createdAt: feedType.createdAt,
        updatedAt: feedType.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Add Feed Type : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete a Feed Type

export const deleteFeedType = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const feedType = await FeedType.findById(id);

    if (!feedType) {
      return res.status(404).json({
        message: "Feed type not found",
      });
    }

    const existingFeedEntry = await FeedEntry.findOne({
      feedType: id,
    });

    if (existingFeedEntry) {
      return res.status(400).json({
        message:
          "Cannot delete feed type because it is being used by feed entries",
      });
    }

    await FeedType.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Feed type deleted successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Delete Feed Type : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update a Feed Type

export const updateFeedType = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Feed type name is required",
      });
    }

    const trimmedName = name.trim();

    const feedType = await FeedType.findById(id);

    if (!feedType) {
      return res.status(404).json({
        message: "Feed type not found",
      });
    }

    const existingFeedType = await FeedType.findOne({
      name: trimmedName,
      _id: { $ne: id },
    });

    if (existingFeedType) {
      return res.status(400).json({
        message: "Feed type already exists",
      });
    }

    feedType.name = trimmedName;

    await feedType.save();

    return res.status(200).json({
      message: "Feed type updated successfully",
      feedType: {
        id: feedType._id,
        name: feedType.name,
        createdAt: feedType.createdAt,
        updatedAt: feedType.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Update Feed Type : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all Feed Types

export const getAllFeedTypes = async (
  req: Request,
  res: Response
) => {
  try {
    const feedTypes = await FeedType.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Feed types retrieved successfully",
      feedTypes: feedTypes.map((feedType) => ({
        id: feedType._id,
        name: feedType.name,
        createdAt: feedType.createdAt,
        updatedAt: feedType.updatedAt,
      })),
    });
  } catch (err) {
    console.log(
      `Error Occured During Get All Feed Types : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Add a new Feed Entry

export const addFeedEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      feedType,
      weight,
      cost,
      batch,
    } = req.body;

    if (
      !feedType ||
      weight === undefined ||
      cost === undefined ||
      !batch
    ) {
      return res.status(400).json({
        message:
          "Feed type, weight, cost, and batch are required",
      });
    }

    if (weight <= 0) {
      return res.status(400).json({
        message: "Weight must be greater than 0",
      });
    }

    if (cost < 0) {
      return res.status(400).json({
        message: "Cost cannot be negative",
      });
    }

    const existingFeedType = await FeedType.findById(
      feedType
    );

    if (!existingFeedType) {
      return res.status(404).json({
        message: "Feed type not found",
      });
    }

    const existingBatch = await Batch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const feedEntry = await FeedEntry.create({
      feedType,
      weight,
      cost,
      batch,
    });

    await feedEntry.populate("feedType", "name");

    return res.status(201).json({
      message: "Feed entry created successfully",
      feedEntry: {
        id: feedEntry._id,
        feedType: {
          id: (feedEntry.feedType as any)._id,
          name: (feedEntry.feedType as any).name,
        },
        weight: feedEntry.weight,
        cost: feedEntry.cost,
        batch: feedEntry.batch,
        createdAt: feedEntry.createdAt,
        updatedAt: feedEntry.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Add Feed Entry : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete a Feed Entry

export const deleteFeedEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const feedEntry = await FeedEntry.findById(id);

    if (!feedEntry) {
      return res.status(404).json({
        message: "Feed entry not found",
      });
    }

    await FeedEntry.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Feed entry deleted successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Delete Feed Entry : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all Feed Entries of a Batch

export const getFeedEntriesByBatch = async (
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

    const feedEntries = await FeedEntry.find({
      batch: batchID,
    })
      .populate("feedType", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      message: "Feed entries retrieved successfully",
      feedEntries: feedEntries.map((feedEntry) => ({
        id: feedEntry._id,
        feedType: feedEntry.feedType
          ? {
              id: (feedEntry.feedType as any)._id,
              name: (feedEntry.feedType as any).name,
            }
          : null,
        weight: feedEntry.weight,
        cost: feedEntry.cost,
        batch: feedEntry.batch,
        createdAt: feedEntry.createdAt,
        updatedAt: feedEntry.updatedAt,
      })),
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Feed Entries By Batch : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};