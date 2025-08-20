// submissionRoutes.js
import express from "express";
import Submission from "../models/Submission.js"; // adjust path as needed
import { authMiddleware } from "../middleware/auth.js"; // optional auth middleware

const router = express.Router();

// Create or update a submission
router.post("/", authMiddleware, async (req, res) => {

   
  

  const {
    problemId,
    contestId,
    language,
    sourceCode,
    testResults,
    score,
    penalty,
    runtime,
    memory,
  } = req.body;

  const userId = req.user._id; // assuming auth middleware sets req.user

  if (!problemId || !contestId) {
    return res.status(400).json({ message: "problemId and contestId are required." });
  }

  try {
    // Find existing submission by user, problem, contest
    const existingSubmission = await Submission.findOne({
      userId,
      problemId,
      contestId,
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.language = language;
      existingSubmission.sourceCode = sourceCode;
      existingSubmission.testResults = testResults;
      existingSubmission.score = score;
      existingSubmission.penalty = penalty || 0;
      existingSubmission.runtime = runtime || "N/A";
      existingSubmission.memory = memory || "N/A";
      existingSubmission.submittedAt = new Date();

      await existingSubmission.save();
      return res.json({ submission: existingSubmission });
    }

    // Create new submission
    const submission = new Submission({
      userId,
      problemId,
      contestId,
      language,
      sourceCode,
      testResults,
      score,
      penalty: penalty || 0,
      runtime: runtime || "N/A",
      memory: memory || "N/A",
    });

    await submission.save();
    res.status(201).json({ submission });

  } catch (error) {
    console.error("Submission save error:", error);
    res.status(500).json({ message: "Failed to save submission" });
  }
});

// Get latest submission for a user/problem/contest
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user._id;
  const { problemId, contestId } = req.query;

  if (!problemId || !contestId) {
    return res.status(400).json({ message: "problemId and contestId query required." });
  }

  try {
    const submission = await Submission.findOne({
      userId,
      problemId,
      contestId,
    }).sort({ submittedAt: -1 }); // get latest

    res.json({ submission });
  } catch (error) {
    console.error("Fetch submission error:", error);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

export default router;
