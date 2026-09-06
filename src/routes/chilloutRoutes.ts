import express from "express";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";
import { addChillout, addLastChillout } from "../controllers/chilloutController";

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

export default router;