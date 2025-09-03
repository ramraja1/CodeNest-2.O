// submissionRoutes.js
import express from "express";
import mongoose from "mongoose";
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
    return res
      .status(400)
      .json({ message: "problemId and contestId are required." });
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
  const { contestId } = req.query;



  if (!contestId) {
    return res.status(400).json({ message: "contestId query required." });
  }

  try {
    const submissions = await Submission.find({
      userId,
      contestId,
    });
    res.json({ submissions });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});



router.get("/contests", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const contestRanks = await Submission.aggregate([
      // 1. Group by contestId and userId: get each user's total score in each contest
      {
        $group: {
          _id: { contestId: "$contestId", userId: "$userId" },
          totalScore: { $sum: "$score" },
          latestSubmission: { $max: "$submittedAt" },
        },
      },
      // 2. Group by contestId to collect all users' scores for ranking
      {
        $group: {
          _id: "$_id.contestId",
          users: {
            $push: {
              userId: "$_id.userId",
              totalScore: "$totalScore",
              latestSubmission: "$latestSubmission",
            },
          },
        },
      },
      // 3. Unwind users array to process each user individually for ranking
      { $unwind: "$users" },
      // 4. Assign a rank to each user per contest based on totalScore descending
      {
        $setWindowFields: {
          partitionBy: "$_id",
          sortBy: { "users.totalScore": -1 }, // only one key allowed here
          output: {
            rank: { $rank: {} },
          },
        },
      },
      // 5. Filter only the current logged-in user's ranking per contest
      { $match: { "users.userId": new mongoose.Types.ObjectId(userId) } },
      // 6. Lookup contest details from the contests collection
      {
        $lookup: {
          from: "contests",
          localField: "_id",
          foreignField: "_id",
          as: "contest",
        },
      },
      { $unwind: "$contest" },
      // 7. Project the result fields to send to frontend
      {
        $project: {
          contestId: "$_id",
          title: "$contest.title",
          rank: 1,
          totalScore: "$users.totalScore",
          trophy: {
            $switch: {
              branches: [
                { case: { $eq: ["$rank", 1] }, then: "🥇" },
                { case: { $eq: ["$rank", 2] }, then: "🥈" },
                { case: { $eq: ["$rank", 3] }, then: "🥉" },
              ],
              default: "",
            },
          },
        },
      },
      // Sort contests by rank ascending
      { $sort: { rank: 1 } },
    ]);


    res.json(contestRanks);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ error: "Failed to fetch contest ranks" });
  }
});


export default router;
