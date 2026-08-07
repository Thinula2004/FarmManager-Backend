import express from "express";
import { addFarm, getAllFarms } from "../controllers/farmController";
import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.post("/add", authenticate, authorize("owner"), addFarm);
router.get("/", authenticate, getAllFarms);

export default router;