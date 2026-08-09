import express from "express";

import {
  addUser,
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

export default router;