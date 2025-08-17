import express from "express";
import {
  joinBatchByCode,
  getMyBatches,
  getBatchById,
  leaveBatch
} from "../controllers/batchController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST /api/batches/join
router.post("/join", authMiddleware, joinBatchByCode);

// GET /api/batches/my
router.get("/my", authMiddleware, getMyBatches);

// GET /api/batches/:id
router.get("/:id", authMiddleware, getBatchById);

// POST /api/batches/leave
router.post("/leave", authMiddleware, leaveBatch);

export default router;
