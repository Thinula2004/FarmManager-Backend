import express from "express";

import {
  addFeedType,
  deleteFeedType,
  updateFeedType,
  getAllFeedTypes,
  addFeedEntry,
  deleteFeedEntry,
  getFeedEntriesByBatch,
} from "../controllers/feedController";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.post(
  "/type/add",
  addFeedType
);

router.delete(
  "/type/:id",
  deleteFeedType
);

router.put(
  "/type/:id",
  updateFeedType
);

router.get(
  "/type/",
  getAllFeedTypes
);

router.post(
  "/entry/add",
  authenticate,
  authorize("owner"),
  addFeedEntry
);

router.delete(
  "/entry/:id",
  authenticate,
  authorize("owner"),
  deleteFeedEntry
);

router.get(
  "/entry/:batchID",
  authenticate,
  authorize("owner", "officer"),
  getFeedEntriesByBatch
);

export default router;