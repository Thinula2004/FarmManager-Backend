import express from "express";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";
import { addChillout } from "../controllers/chilloutController";

const router = express.Router();

router.post(
  "/add",
  authenticate,
  authorize("owner"),
  addChillout
);

export default router;