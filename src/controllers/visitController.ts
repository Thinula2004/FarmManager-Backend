import { Request, Response } from "express";
import Visit from "../models/Visit";
import Batch from "../models/Batch";
import FeedEntry from "../models/FeedEntry";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { createActivity } from "../services/ActivityService";
import { ActivityAction } from "../enums/ActivityAction";
import { ActivityEntity } from "../enums/ActivityEntity";

// Add a new field visit

export const addVisit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      visitedDate,
      batch,
      remainingFeed,
      mortality,
      avgWeight,
      FCR,
      note,
    } = req.body;

    if (
      !visitedDate ||
      !batch ||
      remainingFeed === undefined ||
      mortality === undefined ||
      avgWeight === undefined ||
      FCR === undefined
    ) {
      return res.status(400).json({
        message: "All required visit fields are required",
      });
    }

    if (remainingFeed < 0) {
      return res.status(400).json({
        message: "Remaining feed cannot be negative",
      });
    }

    if (mortality < 0) {
      return res.status(400).json({
        message: "Mortality cannot be negative",
      });
    }

    if (avgWeight < 0) {
      return res.status(400).json({
        message: "Average weight cannot be negative",
      });
    }

    if (FCR < 0) {
      return res.status(400).json({
        message: "FCR cannot be negative",
      });
    }

    const officer = req.user?.id;

    if (!officer) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const existingBatch = await Batch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const latestFeedEntry = await FeedEntry.findOne({
      batch,
    }).sort({
      createdAt: -1,
    });

    if (!latestFeedEntry) {
      return res.status(404).json({
        message: "No feed entry found for this batch",
      });
    }

    const latestVisit = await Visit.findOne({
      batch,
    }).sort({
      visitNumber: -1,
    });

    const visitNumber = latestVisit
      ? latestVisit.visitNumber + 1
      : 1;

    const visit = await Visit.create({
      visitNumber,
      visitedDate,
      batch,
      feedEntry: latestFeedEntry._id,
      remainingFeed,
      mortality,
      avgWeight,
      FCR,
      officer,
      note: note || "",
    });

    await createActivity({
      userId: req.user!.id,
      action: ActivityAction.ADDED,
      entity: ActivityEntity.VISIT,
      entityId: visit._id.toString(),
    });

    return res.status(201).json({
      message: "Field visit created successfully",
    });

  } catch (err) {
    console.log(
      `Error Occured During Add Visit : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Update a field visit

export const updateVisit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      visitedDate,
      batch,
      remainingFeed,
      mortality,
      avgWeight,
      FCR,
      note,
    } = req.body;

    const visit = await Visit.findById(id);

    if (!visit) {
      return res.status(404).json({
        message: "Visit not found",
      });
    }

    if (FCR !== undefined && FCR < 0) {
      return res.status(400).json({
        message: "FCR cannot be negative",
      });
    }

    if (
      remainingFeed !== undefined &&
      remainingFeed < 0
    ) {
      return res.status(400).json({
        message: "Remaining feed cannot be negative",
      });
    }

    if (
      mortality !== undefined &&
      mortality < 0
    ) {
      return res.status(400).json({
        message: "Mortality cannot be negative",
      });
    }

    if (
      avgWeight !== undefined &&
      avgWeight < 0
    ) {
      return res.status(400).json({
        message: "Average weight cannot be negative",
      });
    }

    if (batch) {
      const existingBatch = await Batch.findById(batch);

      if (!existingBatch) {
        return res.status(404).json({
          message: "Batch not found",
        });
      }
    }

    if (visitedDate !== undefined) {
        visit.visitedDate = visitedDate;
    }

    if (remainingFeed !== undefined) {
        visit.remainingFeed = remainingFeed;
    }

    if (mortality !== undefined) {
        visit.mortality = mortality;
    }

    if (avgWeight !== undefined) {
        visit.avgWeight = avgWeight;
    }

    if (note !== undefined) {
        visit.note = note;
    }

    if (FCR !== undefined) {
      visit.FCR = FCR;
    }

    await visit.save();

    await createActivity({
      userId: req.user!.id,
      action: ActivityAction.UPDATED,
      entity: ActivityEntity.VISIT,
      entityId: visit._id.toString(),
    });

    return res.status(200).json({
      message: "Field visit updated successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Update Visit : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Delete a field visit

export const deleteVisit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const visit = await Visit.findById(id);

    if (!visit) {
      return res.status(404).json({
        message: "Visit not found",
      });
    }

    await Visit.findByIdAndDelete(id);

    await createActivity({
      userId: req.user!.id,
      action: ActivityAction.DELETED,
      entity: ActivityEntity.VISIT,
      entityId: visit._id.toString(),
    });

    return res.status(200).json({
      message: "Field visit deleted successfully",
    });
  } catch (err) {
    console.log(
      `Error Occured During Delete Visit : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get all visits belonging to a batch

export const getVisitsByBatch = async (
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

    const visits = await Visit.find({
      batch: batchID,
    })
      .populate({
        path: "batch",
        select: "name inDate initialCount breed subBreed status farm",
        populate: [
          {
            path: "breed",
            select: "name",
          },
          {
            path: "farm",
            select: "name city address customer tel",
          },
        ],
      })
      .populate({
        path: "feedEntry",
        select: "weight cost",
        populate: {
          path: "feedType",
          select: "name",
        },
      })
      .populate({
        path: "officer",
        select: "name phone role",
      })
      .sort({
        visitNumber: 1,
      });

    return res.status(200).json({
      message: "Visits retrieved successfully",
      visits,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Visits By Batch : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all visits done by an officer

export const getVisitsByOfficer = async (
  req: Request,
  res: Response
) => {
  try {
    const { officerId } = req.params;

    if (!officerId) {
      return res.status(400).json({
        message: "Officer ID is required",
      });
    }

    const visits = await Visit.find({
      officer: officerId,
    })
      .populate({
        path: "batch",
        select: "name inDate initialCount breed subBreed status farm",
        populate: [
          {
            path: "breed",
            select: "name",
          },
          {
            path: "farm",
            select: "name city address customer tel",
          },
        ],
      })
      .populate({
        path: "feedEntry",
        select: "weight cost",
        populate: {
          path: "feedType",
          select: "name",
        },
      })
      .populate({
        path: "officer",
        select: "name phone role",
      })
      .sort({
        visitedDate: -1,
      });

    return res.status(200).json({
      message: "Officer visits retrieved successfully",
      visits,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Visits Of Officer : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};