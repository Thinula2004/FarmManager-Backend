import express from "express";

import {
  activateUser,
  addUser,
  deactivateUser,
  deleteUser,
  getOfficers,
  updateUser,
} from "../controllers/userController";

import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";


const router = express.Router();



router.post(
  "/add",
  authenticate,
  authorize("owner"),
  addUser
);

router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  updateUser
);

router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  deleteUser
);

router.get(
  "/officers",
  authenticate,
  authorize("owner"),
  getOfficers
);

router.post(
  "/activate/:userId",
  authenticate,
  authorize("owner"),
  activateUser
);

router.post(
  "/deactivate/:userId",
  authenticate,
  authorize("owner"),
  deactivateUser
);

export default router;