import express from "express";
import { createUser, getCurrentUser, login } from "../controllers/authController";
import { authenticate } from "../services/Authenticator";


const router = express.Router();

router.post("/login", login);
router.post("/register", createUser);
router.get(
  "/profile",
  authenticate,
  getCurrentUser
);

export default router;