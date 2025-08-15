import Contest from "../models/contest.js";

// Create Contest
import mongoose from "mongoose";

export const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, tags, batchId } = req.body;

    // Validate batchId if provided
    let batchRef = null;
    if (batchId) {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ message: "Invalid Batch ID" });
      }
      batchRef = batchId;
    }

    const contest = new Contest({
      title,
      description,
      startTime,
      endTime,
      tags,
      batchId: batchRef, // safe assignment
      createdBy: req.user._id,
      collegeId: req.user.collegeId
    });

    await contest.save();
    res.status(201).json({ message: "Contest created", contest });

  } catch (err) {
    console.error("Contest creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Edit Contest
export const editCollegeContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, tags, batchId } = req.body;

    const contest = await Contest.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      { title, description, startTime, endTime, tags, batch: batchId || null, createdBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.status(200).json({ message: "Contest updated", contest });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Contests (optionally filter by batch)
export const getCollegeContests = async (req, res) => {
  try {
    const filter = { collegeId: req.user.collegeId };

    if (req.query.batchId) {
      filter.batchId = req.query.batchId; // matches schema field
    }

    const contests = await Contest.find(filter).sort({ startTime: 1 });
    res.json(contests);
  } catch (err) {
    console.error("Error fetching contests:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get Single Contest
export const getCollegeContest = async (req, res) => {
  try {
    const contest = await Contest.findOne({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Contest
export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json({ message: "Contest deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
