import { Request, Response } from "express";
import Batch from "../models/Batch";
import Farm from "../models/Farm";
import Breed from "../models/Breed";
import Visit from "../models/Visit";
import FeedEntry from "../models/FeedEntry";
import { ActivityAction } from "../enums/ActivityAction";
import { ActivityEntity } from "../enums/ActivityEntity";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { createActivity } from "../services/ActivityService";
import Chillout from "../models/Chillout";

// Add a new batch

export const addBatch = async (
  req: AuthenticatedRequest,
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

    await createActivity({
      userId: req.user!.id,
      action: ActivityAction.CREATED,
      entity: ActivityEntity.BATCH,
      entityId: batch._id.toString(),
    });

    return res.status(201).json({
      message: "Batch created successfully",
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
  req: AuthenticatedRequest,
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

    await createActivity({
      userId: req.user!.id,
      action: ActivityAction.DELETED,
      entity: ActivityEntity.BATCH,
      entityId: batch._id.toString(),
    });

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
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "ONGOING",
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
          "Invalid status. Status must be ONGOING, or COMPLETED",
      });
    }

    const batch = await Batch.findById(id);

    await createActivity({
      userId: req.user!.id,
      action: ActivityAction.UPDATED,
      entity: ActivityEntity.BATCH,
      entityId: id.toString(),
    });

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    batch.status = status;

    await batch.save();

    return res.status(200).json({
      message: "Batch status updated successfully",
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

    const totalFeedWeight = feedEntries.reduce(
      (total, entry) => total + (entry.weight ?? 0),
      0
    );

    let feedRemaining = 0;

    if (batch.finalFeedRemaining !== null) {
      feedRemaining = batch.finalFeedRemaining;
    } else if (latestVisit) {
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

    const chillouts = await Chillout.find({
      batch: batchId,
    });

    const totalChilloutCount = chillouts.reduce(
      (total, chillout) =>
        total + (chillout.count ?? 0),
      0
    );

    const totalChilloutWeight = chillouts.reduce(
      (total, chillout) =>
        total + (chillout.weight ?? 0),
      0
    );

    const liveChicks = Math.max(
      batch.initialCount -
        totalMortality -
        totalChilloutCount,
      0
    );

    const avgWeight = latestVisit?.avgWeight ?? 0;

    const avgWeightKg = avgWeight / 1000;

    const fcr =
      batch.fcr !== null
        ? batch.fcr
        : (
            (liveChicks > 0 && avgWeightKg > 0) ||
            totalChilloutWeight > 0
          )
          ? (totalFeedWeight - feedRemaining) /
            (avgWeightKg * liveChicks + totalChilloutWeight)
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

        liveChicks,

        avgWeight,

        fcr,

        totalWeight: batch.totalWeight,

        totalChilloutWeight,

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

    const chillouts = await Chillout.aggregate([
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
          totalCount: {
            $sum: "$count",
          },
          totalWeight: {
            $sum: "$weight",
          },
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

    const chilloutMap = new Map(
      chillouts.map((item) => [
        item._id.toString(),
        {
          totalCount: item.totalCount ?? 0,
          totalWeight: item.totalWeight ?? 0,
        },
      ])
    );

    feedEntries.forEach((entry) => {
      const batchId = entry.batch.toString();

      if (!feedEntriesMap.has(batchId)) {
        feedEntriesMap.set(batchId, []);
      }

      feedEntriesMap.get(batchId)!.push(entry);
    });

    return res.status(200).json({
      message: "Batches retrieved successfully",

      batches: batches
        .map((batch) => {
          const batchId = batch._id.toString();

          const latestVisit =
            latestVisitMap.get(batchId);

          const batchFeedEntries =
            feedEntriesMap.get(batchId) ?? [];

          const totalFeedWeight =
            batchFeedEntries.reduce(
              (total, entry) =>
                total + (entry.weight ?? 0),
              0
            );

          const chilloutData =
            chilloutMap.get(batchId) ?? {
              totalCount: 0,
              totalWeight: 0,
            };

          const totalChilloutCount =
            chilloutData.totalCount;

          const totalChilloutWeight =
            chilloutData.totalWeight;

          let feedRemaining = 0;

          if (batch.finalFeedRemaining !== null) {
            feedRemaining = batch.finalFeedRemaining;
          } else if (latestVisit) {
            feedRemaining = latestVisit.remainingFeed;

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
            feedRemaining = totalFeedWeight;
          }

          const totalMortality =
            mortalityMap.get(batchId) ?? 0;

          const liveChicks = Math.max(
            batch.initialCount -
              totalMortality -
              totalChilloutCount,
            0
          );

          const avgWeight =
            latestVisit?.avgWeight ?? 0;

          const avgWeightKg =
            avgWeight / 1000;

          const fcr =
            batch.fcr !== null
              ? batch.fcr
              : (
                  (liveChicks > 0 &&
                    avgWeightKg > 0) ||
                  totalChilloutWeight > 0
                )
                ? (totalFeedWeight - feedRemaining) /
                  (
                    avgWeightKg * liveChicks +
                    totalChilloutWeight
                  )
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

            liveChicks,

            avgWeight,

            fcr,

            totalWeight: batch.totalWeight,

            totalChilloutWeight,

            lastVisit:
              latestVisit?.visitedDate ?? null,

            feedRemaining,

            createdAt: batch.createdAt,
            updatedAt: batch.updatedAt,
          };
        })
        .sort((a, b) => {
          if (
            a.status === "ONGOING" &&
            b.status !== "ONGOING"
          ) {
            return -1;
          }

          if (
            a.status !== "ONGOING" &&
            b.status === "ONGOING"
          ) {
            return 1;
          }

          return (
            new Date(b.inDate).getTime() -
            new Date(a.inDate).getTime()
          );
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