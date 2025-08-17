// routes/contestRoutes.js
import express from "express";
import Contest from "../models/contest.js";
import { authMiddleware } from "../middleware/auth.js";
import { getQuestions } from "../controllers/questionControler.js";

const router = express.Router();

/**
 * GET /api/contests?batchId=123
 * Returns contests filtered by batch
 */
router.get("/", authMiddleware, getQuestions);

export default router;
