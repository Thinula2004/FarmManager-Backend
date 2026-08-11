import express from "express";
import { changePassword, createUser, getCurrentUser, login } from "../controllers/authController";
import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";


const router = express.Router();

router.post("/login", login);
router.post("/register", createUser);
router.get(
  "/profile",
  authenticate,
  getCurrentUser
);
router.put("/change-password", authenticate, authorize("owner"), changePassword);

export default router;