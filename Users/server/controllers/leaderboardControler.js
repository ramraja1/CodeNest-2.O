import mongoose from "mongoose";
import Submission from "../models/Submission.js"; // Adjust path as needed
import User from "../models/user.js"; // To fetch user details if necessary

// Controller to get leaderboard for a contest
export async function getLeaderboard(req, res) {
  try {
    console.log("we reached");
    const { contestId } = req.params;
    // Optional query param to limit how many users to return
    const top = parseInt(req.query.top, 10) || 10; // default top 10

    if (!contestId) {
      return res.status(400).json({ message: "contestId parameter is required." });
    }
    
    // Aggregate submissions: group by userId, sum total score for the contest
    const leaderboardData = await Submission.aggregate([
      { $match: { contestId: new mongoose.Types.ObjectId(contestId) } },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          latestSubmission: { $max: "$submittedAt" }, // optional useful info
        },
      },
      { $sort: { totalScore: -1, latestSubmission: 1 } },
      { $limit: top },
    ]);

    console.log(leaderboard);

    // Populate usernames for each user in the leaderboard
    const userIds = leaderboardData.map((entry) => entry._id);

    const users = await User.find({ _id: { $in: userIds } }, { name: 1 }).lean();

    // Map userId to username
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.name || "User";
      return acc;
    }, {});

    // Format the leaderboard entries to include usernames
    const leaderboard = leaderboardData.map((entry, index) => ({
      _id: entry._id,
      username: userMap[entry._id.toString()] || "User",
      totalScore: entry.totalScore,
      rank: index + 1,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard", error: error.message });
  }
}
