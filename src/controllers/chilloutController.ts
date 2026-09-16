import { Request, Response } from "express";
import Chillout from "../models/Chillout";
import Batch from "../models/Batch";
import FeedEntry from "../models/FeedEntry";
import Visit from "../models/Visit";
import { createActivity } from "../services/ActivityService";
import { ActivityAction } from "../enums/ActivityAction";
import { ActivityEntity } from "../enums/ActivityEntity";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const addChillout = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      batchId,
      date,
      customer,
      count,
      weight,
    } = req.body;

    if (
      !batchId ||
      !date ||
      !customer ||
      count === undefined ||
      weight === undefined
    ) {
      return res.status(400).json({
        message:
          "batchId, date, customer, count and weight are required",
      });
    }

    if (count <= 0) {
      return res.status(400).json({
        message: "Count must be greater than 0",
      });
    }

    if (weight <= 0) {
      return res.status(400).json({
        message: "Weight must be greater than 0",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const chillout = await Chillout.create({
      date,
      batch: batchId,
      count,
      weight,
      customer,
    });

    await createActivity({
        userId: req.user!.id,
        action: ActivityAction.CREATED,
        entity: ActivityEntity.CHILLOUT,
        entityId: chillout._id.toString(),
    });

    return res.status(201).json({
      message: "Chillout added successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Add Chillout : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const addLastChillout = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      batchId,
      date,
      customer,
      count,
      weight,
      feedRemaining,
    } = req.body;

    if (
      !batchId ||
      !date ||
      !customer ||
      count === undefined ||
      weight === undefined ||
      feedRemaining === undefined
    ) {
      return res.status(400).json({
        message:
          "batchId, date, customer, count, weight and feedRemaining are required",
      });
    }

    if (count <= 0) {
      return res.status(400).json({
        message: "Count must be greater than 0",
      });
    }

    if (weight <= 0) {
      return res.status(400).json({
        message: "Weight must be greater than 0",
      });
    }

    if (feedRemaining < 0) {
      return res.status(400).json({
        message: "Feed remaining cannot be negative",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const mortalityResult = await Visit.aggregate([
      {
        $match: {
          batch: batch._id,
        },
      },
      {
        $group: {
          _id: "$batch",
          totalMortality: {
            $sum: "$mortality",
          },
        },
      },
    ]);

    const totalMortality =
      mortalityResult[0]?.totalMortality ?? 0;

      const previousChilloutResult = await Chillout.aggregate([
      {
        $match: {
          batch: batch._id,
        },
      },
      {
        $group: {
          _id: "$batch",
          totalCount: {
            $sum: "$count",
          },
        },
      },
    ]);

    const previousChilloutCount =
      previousChilloutResult[0]?.totalCount ?? 0;

    const liveChicks = Math.max(
      batch.initialCount -
        totalMortality -
        previousChilloutCount,
      0
    );

    if (count !== liveChicks) {
      return res.status(400).json({
        message: `This must be the final chillout. The remaining live chick count is ${liveChicks}, but ${count} were entered.`,
      });
    }

    const chillout = await Chillout.create({
      date,
      batch: batchId,
      count,
      weight,
      customer,
    });

    const feedEntries = await FeedEntry.find({
      batch: batch._id,
    });

    const totalFeedWeight = feedEntries.reduce(
      (total, entry) =>
        total + (entry.weight ?? 0),
      0
    );

    const chillouts = await Chillout.find({
      batch: batch._id,
    });

    const totalChilloutWeight = chillouts.reduce(
      (total, chillout) =>
        total + (chillout.weight ?? 0),
      0
    );

    const feedConsumed =
      totalFeedWeight - feedRemaining;

    const fcr =
      totalChilloutWeight > 0
        ? feedConsumed / totalChilloutWeight
        : 0;

    batch.finalFeedRemaining = feedRemaining;
    batch.totalWeight = totalChilloutWeight;
    batch.fcr = fcr;
    batch.status = "COMPLETED";

    await batch.save();

    await createActivity({
        userId: req.user!.id,
        action: ActivityAction.CREATED,
        entity: ActivityEntity.CHILLOUT,
        entityId: chillout._id.toString(),
    });

    return res.status(201).json({
      message: "Final chillout added successfully"
    });
  } catch (err) {
    console.log(
      `Error Occured During Add Last Chillout : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getChilloutsByBatch = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        message: "Batch ID is required",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const chillouts = await Chillout.find({
      batch: batchId,
    }).sort({ date: 1 });

    return res.status(200).json({
       message:
        "Chillouts retrieved successfully",
      chillouts,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Chillouts By Batch : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};