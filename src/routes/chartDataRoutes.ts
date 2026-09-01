import express from "express";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";
import { getAvgWeightChartData } from "../controllers/chartDataController";

const router = express.Router();

router.get(
  "/weight/:batchID",
  authenticate,
  authorize("owner", "officer"),
  getAvgWeightChartData
);

export default router;