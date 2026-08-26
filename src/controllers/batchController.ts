import { Request, Response } from "express";
import Batch from "../models/Batch";
import Farm from "../models/Farm";
import Breed from "../models/Breed";
import Visit from "../models/Visit";
import FeedEntry from "../models/FeedEntry";

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

// Get a single batch by ID
export const getBatchByID = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id)
      .populate(
        "farm",
        "name city address customer tel"
      )
      .populate("breed", "name");

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const batchId = batch._id;

    const mortalityResult = await Visit.aggregate([
      {
        $match: {
          batch: batchId,
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

    const latestVisitResult = await Visit.aggregate([
      {
        $match: {
          batch: batchId,
        },
      },
      {
        $sort: {
          visitedDate: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    const latestVisit = latestVisitResult[0];

    const feedEntries = await FeedEntry.aggregate([
      {
        $match: {
          batch: batchId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    // Total feed given to this batch
    const totalFeedWeight = feedEntries.reduce(
      (total, entry) => total + (entry.weight ?? 0),
      0
    );

    let feedRemaining = 0;

    if (latestVisit) {
      feedRemaining = latestVisit.remainingFeed;

      const feedAddedAfterVisit = feedEntries
        .filter(
          (entry) =>
            new Date(entry.createdAt).getTime() >
            new Date(latestVisit.visitedDate).getTime()
        )
        .reduce(
          (total, entry) => total + (entry.weight ?? 0),
          0
        );

      feedRemaining += feedAddedAfterVisit;
    } else {
      feedRemaining = totalFeedWeight;
    }

    const totalMortality =
      mortalityResult[0]?.totalMortality ?? 0;

    // Live chicks = initial chicks - deaths
    const liveChicks =
      Math.max(batch.initialCount - totalMortality, 0);

    // Average weight from latest visit
    const avgWeight = latestVisit?.avgWeight ?? 0;

    // FCR = Total Feed / (Average Weight × Live Chicks)
    const fcr =
      avgWeight > 0 && liveChicks > 0
        ?  (totalFeedWeight - feedRemaining)  / (avgWeight * liveChicks)
        : 0;

    return res.status(200).json({
      message: "Batch retrieved successfully",

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

        totalMortality,

        avgWeight,

        fcr,

        lastVisit:
          latestVisit?.visitedDate ?? null,

        feedRemaining,

        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Batch By ID : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


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

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const mortalityResults = await Visit.aggregate([
      {
        $match: {
          batch: {
            $in: batchIds,
          },
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

    const latestVisits = await Visit.aggregate([
      {
        $match: {
          batch: {
            $in: batchIds,
          },
        },
      },
      {
        $sort: {
          visitedDate: -1,
        },
      },
      {
        $group: {
          _id: "$batch",
          latestVisit: {
            $first: "$$ROOT",
          },
        },
      },
    ]);

    const feedEntries = await FeedEntry.aggregate([
      {
        $match: {
          batch: {
            $in: batchIds,
          },
        },
      },
      {
        $project: {
          batch: 1,
          weight: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const mortalityMap = new Map(
      mortalityResults.map((item) => [
        item._id.toString(),
        item.totalMortality,
      ])
    );

    const latestVisitMap = new Map(
      latestVisits.map((item) => [
        item._id.toString(),
        item.latestVisit,
      ])
    );

    const feedEntriesMap = new Map<string, any[]>();

    feedEntries.forEach((entry) => {
      const batchId = entry.batch.toString();

      if (!feedEntriesMap.has(batchId)) {
        feedEntriesMap.set(batchId, []);
      }

      feedEntriesMap.get(batchId)!.push(entry);
    });

    return res.status(200).json({
  message: "Batches retrieved successfully",

  batches: batches.map((batch) => {
    const batchId = batch._id.toString();

    const latestVisit =
      latestVisitMap.get(batchId);

    const batchFeedEntries =
      feedEntriesMap.get(batchId) ?? [];

    // Total feed given to this batch
    const totalFeedWeight = batchFeedEntries.reduce(
      (total, entry) =>
        total + (entry.weight ?? 0),
      0
    );

    let feedRemaining = 0;

    if (latestVisit) {
      feedRemaining =
        latestVisit.remainingFeed;

      const feedAddedAfterVisit =
        batchFeedEntries
          .filter(
            (entry) =>
              new Date(entry.createdAt).getTime() >
              new Date(
                latestVisit.visitedDate
              ).getTime()
          )
          .reduce(
            (total, entry) =>
              total + (entry.weight ?? 0),
            0
          );

      feedRemaining += feedAddedAfterVisit;
    } else {
      feedRemaining =
        totalFeedWeight;
    }

    const totalMortality =
      mortalityMap.get(batchId) ?? 0;

    // Live chicks = initial chicks - deaths
    const liveChicks = Math.max(
      batch.initialCount - totalMortality,
      0
    );

    // Average weight from latest visit
    const avgWeight =
      latestVisit?.avgWeight ?? 0;

    // FCR = Total Feed / (Average Weight × Live Chicks)
    const fcr =
      avgWeight > 0 && liveChicks > 0
        ? (totalFeedWeight - feedRemaining) /
          (avgWeight * liveChicks)
        : 0;

    return {
      id: batch._id,
      name: batch.name,
      farm: batch.farm,
      inDate: batch.inDate,
      initialCount: batch.initialCount,
      breed: batch.breed,
      subBreed: batch.subBreed,
      totalCost: batch.totalCost,
      status: batch.status,

      totalMortality,

      avgWeight,

      fcr,

      lastVisit:
        latestVisit?.visitedDate ?? null,

      feedRemaining,

      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    };
  }),
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