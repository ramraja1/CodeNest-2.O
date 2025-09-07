import express from "express";
import { authMiddleware, collegeAdminOnly } from "../middleware/auth.js";
import { handleDSAChat } from '../controllers/dsaController.js';
const router = express.Router();

// College Admin creates contest
router.post("/question", authMiddleware, collegeAdminOnly, handleDSAChat);

// College contests list


export default router;
