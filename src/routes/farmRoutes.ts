import express from "express";
import {
  addFarm,
  getAllFarms,
  updateFarm,
  deleteFarm,
  getDashboardStats,
  getFarmsDetailed,
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
  "/details",
  authenticate,
  authorize("owner"),
  getFarmsDetailed
);

export default router;