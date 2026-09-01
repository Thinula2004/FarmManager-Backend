import express from "express";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";
import { getAvgWeightChartData, getMortalityChartData } from "../controllers/chartDataController";

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

export default router;