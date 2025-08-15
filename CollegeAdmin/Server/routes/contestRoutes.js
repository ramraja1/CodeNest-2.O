import express from "express";
import { authMiddleware, collegeAdminOnly } from "../middleware/auth.js";
import { createContest, getCollegeContests, deleteContest,getCollegeContest,editCollegeContest } from "../controllers/contestController.js";

const router = express.Router();

// College Admin creates contest
router.post("/", authMiddleware, collegeAdminOnly, createContest);

// College contests list
router.get("/", authMiddleware, getCollegeContests);
// get Single Contest

router.get("/:id", authMiddleware, getCollegeContest);

//edit contest
router.put("/:id",authMiddleware,editCollegeContest)

// Delete contest
router.delete("/:id", authMiddleware, collegeAdminOnly, deleteContest);



export default router;
