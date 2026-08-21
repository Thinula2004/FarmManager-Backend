import express from "express";
import {
  addSupplyType,
  updateSupplyType,
  getAllSupplyTypes,
  deleteSupplyType,
  addSupply,
  deleteSupply,
  getSuppliesByBatch,
} from "../controllers/supplyController";
import { authenticate } from "../services/Authenticator";
import { authorize } from "../services/Authorize";

const router = express.Router();

router.post("/type/add", addSupplyType);
router.put("/type/:id", updateSupplyType);
router.get("/type", getAllSupplyTypes);
router.delete("/type/:id", deleteSupplyType);

router.post("/add", authenticate, authorize('owner'), addSupply);
router.delete("/:id", authenticate, authorize('owner'), deleteSupply);
router.get("/:batchID", authenticate, getSuppliesByBatch);

export default router;