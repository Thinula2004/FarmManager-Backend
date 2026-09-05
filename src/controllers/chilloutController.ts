import { Request, Response } from "express";
import Chillout from "../models/Chillout";
import Batch from "../models/Batch";
import FeedEntry from "../models/FeedEntry";
import Visit from "../models/Visit";
import { BatchStatus } from "../enums/BatchStatus";

export const addChillout = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      batchId,
      date,
      customer,
      count,
      totalWeight,
    } = req.body;

    if (
      !batchId ||
      !date ||
      !customer ||
      count === undefined
    ) {
      return res.status(400).json({
        message:
          "batchId, date, customer and count are required",
      });
    }

    if (count <= 0) {
      return res.status(400).json({
        message: "Count must be greater than 0",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const isFirstChillout =
      batch.totalWeight === null;

    if (isFirstChillout) {
      if (
        totalWeight === undefined ||
        totalWeight === null
      ) {
        return res.status(400).json({
          message:
            "totalWeight is required for the first chillout",
        });
      }

      if (totalWeight <= 0) {
        return res.status(400).json({
          message:
            "Total weight must be greater than 0",
        });
      }
    }
    const chillout = await Chillout.create({
      date,
      batch: batchId,
      count,
      customer,
    });

    if (isFirstChillout) {
      const feedResult = await FeedEntry.aggregate([
        {
          $match: {
            batch: batch._id,
          },
        },
        {
          $group: {
            _id: null,
            totalFeedWeight: {
              $sum: "$weight",
            },
          },
        },
      ]);

      const totalFeedWeight =
        feedResult[0]?.totalFeedWeight ?? 0;

      const fcr =
        totalWeight > 0
          ? totalFeedWeight / totalWeight
          : 0;

      batch.fcr = fcr;
      batch.totalWeight = totalWeight;
    }

    const mortalityResult = await Visit.aggregate([
      {
        $match: {
          batch: batch._id,
        },
      },
      {
        $group: {
          _id: null,
          totalMortality: {
            $sum: "$mortality",
          },
        },
      },
    ]);

    const totalMortality =
      mortalityResult[0]?.totalMortality ?? 0;

    const chilloutResult = await Chillout.aggregate([
      {
        $match: {
          batch: batch._id,
        },
      },
      {
        $group: {
          _id: null,
          totalChilloutCount: {
            $sum: "$count",
          },
        },
      },
    ]);

    const totalChilloutCount =
      chilloutResult[0]?.totalChilloutCount ?? 0;

    const liveChicks = Math.max(
      batch.initialCount -
        totalMortality -
        totalChilloutCount,
      0
    );

    const status: BatchStatus =
      liveChicks > 0
        ? "PARTIALLY_SOLD"
        : "COMPLETED";

    batch.status = status;

    await batch.save();

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