import { Request, Response } from "express";
import Visit from "../models/Visit";
import Batch from "../models/Batch";

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