import express from "express";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";
import { addChillout, addLastChillout, deleteChillout, getChilloutsByBatch } from "../controllers/chilloutController";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize("owner"),
  addChillout
);

router.post(
  "/add/last",
  authenticate,
  authorize("owner"),
  addLastChillout
);

router.get(
  "/:batchId",
  authenticate,
  authorize("owner"),
  getChilloutsByBatch
);

router.delete(
  "/:chilloutId",
  authenticate,
  authorize("owner"),
  deleteChillout
);

export default router;