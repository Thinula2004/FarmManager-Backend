import express from "express";
import { createUser, login } from "../controllers/authController";


const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */

router.post("/login", login);
router.post("/register", createUser);

export default router;