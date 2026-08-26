import { Request, Response } from "express";
import Farm from "../models/Farm";
import Batch from "../models/Batch";
import Visit from "../models/Visit";
import User from "../models/User";
import OfficerFarm from "../models/OfficerFarm";

export const addFarm = async (req: Request, res: Response) => {
  try {
    const {
      name,
      city,
      address,
      customer,
      tel,
    } = req.body;

    if (!name || !city || !address || !customer || !tel) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const farm = await Farm.create({
      name,
      city,
      address,
      customer,
      tel,
    });

    return res.status(201).json({
      message: "Farm created successfully",
      farm: {
        id: farm._id,
        name: farm.name,
        city: farm.city,
        address: farm.address,
        customer: farm.customer,
        tel: farm.tel,
      },
    });
  } catch (err) {
    console.log(`Error Occured During Add Farm : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllFarms = async (
  req: Request,
  res: Response
) => {
  try {
    const farms = await Farm.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Farms retrieved successfully",
      farms: farms.map((farm) => ({
        id: farm._id,
        name: farm.name,
        city: farm.city,
        address: farm.address,
        customer: farm.customer,
        tel: farm.tel,
        isOpen: farm.isOpen,
        createdAt: farm.createdAt,
        updatedAt: farm.updatedAt,
      })),
    });
  } catch (err) {
    console.log(`Error Occured During Get All Farms : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ============================================================
// Update Farm
// ============================================================

export const updateFarm = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      name,
      city,
      address,
      customer,
      tel,
    } = req.body;

    // Validate required fields
    if (!name || !city || !address || !customer || !tel) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const farm = await Farm.findById(id);

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    farm.name = name;
    farm.city = city;
    farm.address = address;
    farm.customer = customer;
    farm.tel = tel;

    await farm.save();

    return res.status(200).json({
      message: "Farm updated successfully",
      farm: {
        id: farm._id,
        name: farm.name,
        city: farm.city,
        address: farm.address,
        customer: farm.customer,
        tel: farm.tel,
        createdAt: farm.createdAt,
        updatedAt: farm.updatedAt,
      },
    });
  } catch (err) {
    console.log(`Error Occured During Update Farm : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ============================================================
// Delete Farm
// ============================================================

export const deleteFarm = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const farm = await Farm.findById(id);

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    await Farm.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Farm deleted successfully",
    });
  } catch (err) {
    console.log(`Error Occured During Delete Farm : ${err}`);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {
    // Get all open farms
    const openFarms = await Farm.find({
      isOpen: true,
    }).select("_id");

    const openFarmIds = openFarms.map(
      (farm) => farm._id
    );

    // Total open farms
    const farmCount = openFarms.length;

    // Total officers
    const officerCount = await User.countDocuments({
      role: "officer",
    });

    // Get ongoing batches belonging to open farms
    const ongoingBatches = await Batch.find({
      farm: {
        $in: openFarmIds,
      },
      status: "ONGOING",
    }).select("_id initialCount");

    // Total initial chicks in ongoing batches
    const totalInitialChicks = ongoingBatches.reduce(
      (total, batch) => total + batch.initialCount,
      0
    );

    // IDs of ongoing batches
    const ongoingBatchIds = ongoingBatches.map(
      (batch) => batch._id
    );

    // Get total mortality from visits belonging
    // to ongoing batches of open farms
    const mortalityResult = await Visit.aggregate([
      {
        $match: {
          batch: {
            $in: ongoingBatchIds,
          },
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
      mortalityResult.length > 0
        ? mortalityResult[0].totalMortality
        : 0;

    // Calculate live chicks
    const liveChicks = Math.max(
      totalInitialChicks - totalMortality,
      0
    );

    return res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      stats: {
        liveChicks,
        totalMortality,
        farmCount,
        officerCount,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Dashboard Stats : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get Officer Statistics
export const getOfficerStats = async (
  req: Request,
  res: Response
) => {
  try {
    const { officerId } = req.params;

    if (!officerId || typeof officerId !== "string") {
      return res.status(400).json({
        message: "officerId parameter is required",
      });
    }

    const officer = await User.findOne({
      _id: officerId,
      role: "officer",
    });

    if (!officer) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    const assignments = await OfficerFarm.find({
      officer: officerId,
    }).select("farm");

    const assignedFarmIds = assignments.map(
      (assignment) => assignment.farm
    );

    // Only open farms
    const openFarms = await Farm.find({
      _id: {
        $in: assignedFarmIds,
      },
      isOpen: true,
    }).select("_id");

    const farmIds = openFarms.map(
      (farm) => farm._id
    );

    const assignedFarms = farmIds.length;

    if (farmIds.length === 0) {
      return res.status(200).json({
        message: "Officer statistics retrieved successfully",
        stats: {
          assignedFarms: 0,
          totalVisits: 0,
          activeBatches: 0,
        },
      });
    }

    const activeBatches = await Batch.countDocuments({
      farm: {
        $in: farmIds,
      },
      status: {
        $in: ["ONGOING", "PARTIALLY_SOLD"],
      },
    });

    // Only visits belonging to batches of open farms
    const openFarmBatchIds = await Batch.find({
      farm: {
        $in: farmIds,
      },
    }).distinct("_id");

    const totalVisits = await Visit.countDocuments({
      officer: officerId,
      batch: {
        $in: openFarmBatchIds,
      },
    });

    return res.status(200).json({
      message: "Officer statistics retrieved successfully",
      stats: {
        assignedFarms,
        totalVisits,
        activeBatches,
      },
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Officer Stats : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getFarmsDetailed = async (
  req: Request,
  res: Response
) => {
  try {
    const farms = await Farm.find({
  isOpen: true,
}).sort({
  createdAt: -1,
});

    const detailedFarms = await Promise.all(
      farms.map(async (farm) => {
        const batches = await Batch.find({
          farm: farm._id,
        }).select("_id initialCount status");

        const hasOngoingBatch = batches.some(
          (batch) => batch.status === "ONGOING"
        );

        const hasPartiallySoldBatch = batches.some(
          (batch) => batch.status === "PARTIALLY_SOLD"
        );

        let activeStatus: "ACTIVE" | "PARTIALLY_ACTIVE" | "INACTIVE";

        if (hasOngoingBatch) {
          activeStatus = "ACTIVE";
        } else if (hasPartiallySoldBatch) {
          activeStatus = "PARTIALLY_ACTIVE";
        } else {
          activeStatus = "INACTIVE";
        }

        const activeBatchCount = batches.filter(
          (batch) =>
            batch.status === "ONGOING" ||
            batch.status === "PARTIALLY_SOLD"
        ).length;

        const totalBatchCount = batches.length;

        const ongoingBatches = batches.filter(
          (batch) => batch.status === "ONGOING"
        );

        const ongoingBatchIds = ongoingBatches.map(
          (batch) => batch._id
        );

        let totalMortality = 0;

        if (ongoingBatchIds.length > 0) {
          const mortalityResult = await Visit.aggregate([
            {
              $match: {
                batch: {
                  $in: ongoingBatchIds,
                },
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

          totalMortality =
            mortalityResult.length > 0
              ? mortalityResult[0].totalMortality
              : 0;
        }

        const totalInitialChicks = ongoingBatches.reduce(
          (total, batch) => total + batch.initialCount,
          0
        );

        const liveChicks = Math.max(
          0,
          totalInitialChicks - totalMortality
        );

        const lastVisit =
          batches.length > 0
            ? await Visit.findOne({
                batch: {
                  $in: batches.map((batch) => batch._id),
                },
              })
                .sort({ visitedDate: -1 })
                .select("visitedDate")
            : null;

        const officerAssignments = await OfficerFarm.find({
          farm: farm._id,
        }).select("officer");

        const officerIds = officerAssignments.map(
          (assignment) => assignment.officer
        );

        const officers = await User.find({
          _id: {
            $in: officerIds,
          },
          role: "officer",
        }).select("_id name phone");

        return {
          id: farm._id,
          name: farm.name,
          tel: farm.tel,
          city: farm.city,
          address: farm.address,
          customer: farm.customer,
          activeStatus,
          activeBatchCount,
          totalBatchCount,
          liveChicks,
          totalMortality,
          lastVisit: lastVisit
            ? lastVisit.visitedDate
            : null,
          officers: officers.map((officer) => ({
            id: officer._id,
            name: officer.name,
            phone: officer.phone,
            farms: [],
          })),
          createdAt: farm.createdAt,
          updatedAt: farm.updatedAt,
        };
      })
    );

    return res.status(200).json({
      message: "Farm statistics retrieved successfully",
      farms: detailedFarms,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Farms Detailed : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get Farms Assigned to Officer

export const getFarmsAssigned = async (
  req: Request,
  res: Response
) => {
  try {
    const { officerId } = req.params;

    if (!officerId || typeof officerId !== "string") {
      return res.status(400).json({
        message: "officerId query parameter is required",
      });
    }

    const assignments = await OfficerFarm.find({
      officer: officerId,
    }).select("farm");

    const farmIds = assignments.map(
      (assignment) => assignment.farm
    );

    if (farmIds.length === 0) {
      return res.status(200).json({
        message: "Assigned farms retrieved successfully",
        farms: [],
      });
    }

    const farms = await Farm.find({
  _id: {
    $in: farmIds,
  },
  isOpen: true,
}).sort({
  createdAt: -1,
});

    const detailedFarms = await Promise.all(
      farms.map(async (farm) => {
        const batches = await Batch.find({
          farm: farm._id,
        }).select("_id initialCount status");

        const hasOngoingBatch = batches.some(
          (batch) => batch.status === "ONGOING"
        );

        const hasPartiallySoldBatch = batches.some(
          (batch) => batch.status === "PARTIALLY_SOLD"
        );

        let activeStatus:
          | "ACTIVE"
          | "PARTIALLY_ACTIVE"
          | "INACTIVE";

        if (hasOngoingBatch) {
          activeStatus = "ACTIVE";
        } else if (hasPartiallySoldBatch) {
          activeStatus = "PARTIALLY_ACTIVE";
        } else {
          activeStatus = "INACTIVE";
        }

        const activeBatchCount = batches.filter(
          (batch) =>
            batch.status === "ONGOING" ||
            batch.status === "PARTIALLY_SOLD"
        ).length;

        const totalBatchCount = batches.length;

        const ongoingBatches = batches.filter(
          (batch) => batch.status === "ONGOING"
        );

        const ongoingBatchIds = ongoingBatches.map(
          (batch) => batch._id
        );

        let totalMortality = 0;

        if (ongoingBatchIds.length > 0) {
          const mortalityResult = await Visit.aggregate([
            {
              $match: {
                batch: {
                  $in: ongoingBatchIds,
                },
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

          totalMortality =
            mortalityResult.length > 0
              ? mortalityResult[0].totalMortality
              : 0;
        }

        const totalInitialChicks = ongoingBatches.reduce(
          (total, batch) => total + batch.initialCount,
          0
        );

        const liveChicks = Math.max(
          0,
          totalInitialChicks - totalMortality
        );

        const lastVisit =
          batches.length > 0
            ? await Visit.findOne({
                batch: {
                  $in: batches.map((batch) => batch._id),
                },
              })
                .sort({
                  visitedDate: -1,
                })
                .select("visitedDate")
            : null;

        const officerAssignments = await OfficerFarm.find({
          farm: farm._id,
        }).select("officer");

        const officerIds = officerAssignments.map(
          (assignment) => assignment.officer
        );

        const officers = await User.find({
          _id: {
            $in: officerIds,
          },
          role: "officer",
        }).select("_id name phone");

        return {
          id: farm._id,
          name: farm.name,
          tel: farm.tel,
          city: farm.city,
          address: farm.address,
          customer: farm.customer,

          activeStatus,
          activeBatchCount,
          totalBatchCount,

          liveChicks,
          totalMortality,

          lastVisit: lastVisit
            ? lastVisit.visitedDate
            : null,

          officers: officers.map((officer) => ({
            id: officer._id,
            name: officer.name,
            phone: officer.phone,
            farms: [],
          })),

          createdAt: farm.createdAt,
          updatedAt: farm.updatedAt,
        };
      })
    );

    return res.status(200).json({
      message: "Assigned farms retrieved successfully",
      farms: detailedFarms,
    });
  } catch (err) {
    console.log(
      `Error Occured During Get Farms Assigned : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Open Farm

export const openFarm = async (
  req: Request,
  res: Response
) => {
  try {
    const { farmId } = req.params;

    if (!farmId || typeof farmId !== "string") {
      return res.status(400).json({
        message: "farmId parameter is required",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    farm.isOpen = true;

    await farm.save();

    return res.status(200).json({
      message: "Farm opened successfully",
      success: true,
    });
  } catch (err) {
    console.log(
      `Error Occured During Open Farm : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Close Farm

export const closeFarm = async (
  req: Request,
  res: Response
) => {
  try {
    const { farmId } = req.params;

    if (!farmId || typeof farmId !== "string") {
      return res.status(400).json({
        message: "farmId parameter is required",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    farm.isOpen = false;

    await farm.save();

    return res.status(200).json({
      message: "Farm closed successfully",
      success: true,
    });
  } catch (err) {
    console.log(
      `Error Occured During Close Farm : ${err}`
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};