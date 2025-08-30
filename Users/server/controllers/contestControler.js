
import Contest from "../models/contest.js";

export const getContests=async (req, res) => {
  try {
    const { batchId } = req.query;

    let query = {};
    if (batchId) {
      query.batchId = batchId; // only contests for this batch
    }

    // Optional: filter only active or upcoming contests for students
    // query.status = { $in: ["active", "completed"] };

    const contests = await Contest.find(query).sort({ startTime: -1 });

    res.json(contests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Server error fetching contests" });
  }
}



export const getContest = async (req, res) => {
  try {
const contestId = req.params.contestId;
const { batchId } = req.query;


    if (contestId) {
      // Fetch one contest by ID, optionally populate questions
      const contest = await Contest.findById(contestId).populate("questions");
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      return res.json(contest);
    }

    // If no contestId, but batchId provided, fetch contests for that batch
    let query = {};
    if (batchId) {
      query.batchId = batchId;
    }

    // Optionally filter contests by status for students, uncomment if needed
    // query.status = { $in: ["active", "completed"] };

    const contests = await Contest.find(query).sort({ startTime: -1 });

    return res.json(contests);

  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Server error fetching contests" });
  }
};

// PATCH/POST /api/contests/:id/end
export const endContest = async (req, res) => {
  try {
  
    const contest = await Contest.findById(req.params.contestId);
    
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    if (contest.status === "completed") {
      return res.status(400).json({ message: "Contest already ended" });
    }

    contest.status = "completed";
    await contest.save();
    

    res.json({ message: "Contest ended", status: contest.status });
  } catch (err) {
    res.status(500).json({ message: "Failed to end contest" });
  }
};
