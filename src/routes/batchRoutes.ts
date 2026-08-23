import express from "express";

import {
  addBatch,
  deleteBatch,
  getBatchByID,
  getBatchesByFarm,
  updateBatchStatus,
} from "../controllers/batchController";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize("owner"),
  addBatch
);

router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  deleteBatch
);

router.get(
  "/farm/:farmID",
  authenticate,
  authorize("owner", "officer"),
  getBatchesByFarm
);

router.get(
  "/:id",
  authenticate,
  authorize("owner", "officer"),
  getBatchByID
);

router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  updateBatchStatus
);

export default router;