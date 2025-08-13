import Contest from "../models/contest.js";

// Create Contest (College Admin only)
export const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, tags } = req.body;

    const contest = new Contest({
      title,
      description,
      startTime,
      endTime,
      tags,
      createdBy: req.user.id,
      collegeId: req.user.collegeId
    });

    await contest.save();
    res.status(201).json({ message: "Contest created", contest });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get contests for a college (College Admin view + Student view)
export const getCollegeContests = async (req, res) => {
  try {
    const contests = await Contest.find({ collegeId: req.user.collegeId });
    res.json(contests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Contest
export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findOneAndDelete({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json({ message: "Contest deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
