import express from "express";
import {
  addFarm,
  getAllFarms,
  updateFarm,
  deleteFarm,
  getDashboardStats,
  getFarmsDetailed,
  getFarmsAssigned,
  getOfficerStats,
  openFarm,
  closeFarm,
} from "../controllers/farmController";
import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize("owner"),
  addFarm
);

router.get(
  "/",
  authenticate,
  authorize("owner", "officer"),
  getAllFarms
);

router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  updateFarm
);

router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  deleteFarm
);

router.get(
  "/stats",
  authenticate,
  authorize("owner"),
  getDashboardStats
);

router.get(
  "/officer/stats/:officerId",
  authenticate,
  authorize("owner", "officer"),
  getOfficerStats
);

router.get(
  "/details",
  authenticate,
  authorize("owner"),
  getFarmsDetailed
);

router.get(
  "/assigned/:officerId",
  authenticate,
  authorize("owner", "officer"),
  getFarmsAssigned
);

router.post(
  "/open/:farmId",
  authenticate,
  authorize("owner"),
  openFarm
);

router.post(
  "/close/:farmId",
  authenticate,
  authorize("owner"),
  closeFarm
);

export default router;