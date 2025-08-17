import Contest from "../models/contest.js";
import Question from "../models/question.js";

export const getQuestions = async (req, res) => {
  try {
    const { contestId } = req.query;
    if (!contestId) {
      return res.status(400).json({ message: "contestId is required" });
    }

    // Find contest by ID and populate questions
    const contest = await Contest.findById(contestId).populate("questions");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Return only the questions part
    res.json({ questions: contest.questions });
  } catch (error) {
    console.error("Error fetching questions for contest:", error);
    res.status(500).json({ message: "Server error fetching questions" });
  }
};
