import { Request, Response } from "express";
import Visit from "../models/Visit";
import Batch from "../models/Batch";
import FeedEntry from "../models/FeedEntry";

export const getAvgWeightChartData = async (
  req: Request,
  res: Response
) => {
  try {
    const { batchID } = req.params;

    if (!batchID) {
      return res.status(400).json({
        message: "Batch ID is required",
      });
    }

    const batch = await Batch.findById(batchID);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const visits = await Visit.find({
      batch: batchID,
    })
      .select("visitedDate avgWeight")
      .sort({
        visitedDate: 1,
      });

    const chartData = [
      {
        id: "0",
        date: batch.inDate,
        value: 0,
      },

      ...visits.map((visit, index) => ({
        id: (index + 1).toString(),
        date: visit.visitedDate,
        value: Number((visit.avgWeight / 1000).toFixed(2)),
      })),
    ];

    return res.status(200).json({
      message: "Average weight chart data retrieved successfully",
      data: chartData,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Average Weight Chart Data : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMortalityChartData = async (
  req: Request,
  res: Response
) => {
  try {
    const { batchID } = req.params;

    if (!batchID) {
      return res.status(400).json({
        message: "Batch ID is required",
      });
    }

    const batch = await Batch.findById(batchID);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const visits = await Visit.find({
      batch: batchID,
    })
      .select("visitedDate mortality")
      .sort({
        visitedDate: 1,
      });

    let cumulativeMortality = 0;

    const chartData = [
      {
        id: "0",
        date: batch.inDate,
        value: 0,
      },

      ...visits.map((visit, index) => {
        cumulativeMortality += visit.mortality;

        return {
          id: (index + 1).toString(),
          date: visit.visitedDate,
          value: cumulativeMortality,
        };
      }),
    ];

    return res.status(200).json({
      message: "Mortality chart data retrieved successfully",
      data: chartData,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Mortality Chart Data : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getFeedChartData = async (
  req: Request,
  res: Response
) => {
  try {
    const { batchID } = req.params;

    if (!batchID) {
      return res.status(400).json({
        message: "Batch ID is required",
      });
    }

    const batch = await Batch.findById(batchID);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const visits = await Visit.find({
      batch: batchID,
    })
      .select("visitedDate remainingFeed")
      .sort({
        visitedDate: 1,
      });

    const feedEntries = await FeedEntry.find({
      batch: batchID,
    })
      .select("weight createdAt")
      .sort({
        createdAt: 1,
      });

    const chartData = [
      {
        id: "0",
        date: batch.inDate,
        value: 0,
      },

      ...visits.map((visit, index) => {
        const visitDate = new Date(visit.visitedDate).getTime();

        const totalFeedBeforeVisit = feedEntries
          .filter(
            (entry) =>
              new Date(entry.createdAt).getTime() <= visitDate
          )
          .reduce(
            (total, entry) => total + (entry.weight ?? 0),
            0
          );

        const feedConsumed =
          totalFeedBeforeVisit - (visit.remainingFeed ?? 0);

        return {
          id: (index + 1).toString(),
          date: visit.visitedDate,
          value: Number(feedConsumed.toFixed(2)),
        };
      }),
    ];

    return res.status(200).json({
      message: "Feed chart data retrieved successfully",
      data: chartData,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Feed Chart Data : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};