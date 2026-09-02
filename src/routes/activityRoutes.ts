import express from "express";
import { getActivities } from "../controllers/activityController";
import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("owner"),
  getActivities
);

export default router;