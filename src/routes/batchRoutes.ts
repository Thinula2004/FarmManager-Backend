import express from "express";

import {
  addBatch,
  deleteBatch,
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
  "/:farmID",
  authenticate,
  authorize("owner", "officer"),
  getBatchesByFarm
);

router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  updateBatchStatus
);

export default router;