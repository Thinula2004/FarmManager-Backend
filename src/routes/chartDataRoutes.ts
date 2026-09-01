import express from "express";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";
import { getAvgWeightChartData, getFeedChartData, getMortalityChartData } from "../controllers/chartDataController";

const router = express.Router();

router.get(
  "/weight/:batchID",
  authenticate,
  authorize("owner", "officer"),
  getAvgWeightChartData
);

router.get(
  "/mortality/:batchID",
  authenticate,
  authorize("owner", "officer"),
  getMortalityChartData
);

router.get(
  "/feed/:batchID",
  authenticate,
  authorize("owner", "officer"),
  getFeedChartData
);

export default router;