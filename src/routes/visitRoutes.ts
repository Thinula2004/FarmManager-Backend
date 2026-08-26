import express from "express";

import {
  addVisit,
  updateVisit,
  deleteVisit,
  getVisitsByBatch,
  getVisitsByOfficer,
} from "../controllers/visitController";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize("owner", "officer"),
  addVisit
);

router.put(
  "/:id",
  authenticate,
  authorize("owner", "officer"),
  updateVisit
);

router.delete(
  "/:id",
  authenticate,
  authorize("owner", "officer"),
  deleteVisit
);

router.get(
  "/:batchID",
  authenticate,
  authorize("owner", "officer"),
  getVisitsByBatch
);

router.get(
  "/officer/:officerId",
  authenticate,
  authorize("owner", "officer"),
  getVisitsByOfficer
);

export default router;