import Batch from "../models/Batch.js";
import User from "../models/user.js";

// Student joins batch via code
export const joinBatchByCode = async (req, res) => {
  try {
    const { batchCode } = req.body;
    const user = req.user;

    if (!batchCode) {
      return res.status(400).json({ message: "Batch code is required" });
    }

    // Find the batch by code
    const batch = await Batch.findOne({ batchCode });
    if (!batch) {
      return res.status(404).json({ message: "Invalid batch code" });
    }

    // Check if student already joined this batch
    if (user.batches.some(id => id.toString() === batch._id.toString())) {
      return res.status(400).json({ message: "You already joined this batch" });
    }

    // Add batch to user's batches array
    user.batches.push(batch._id);
    await user.save();

    // Add user to batch.students array if not already there
    if (!batch.students.some(id => id.toString() === user._id.toString())) {
      batch.students.push(user._id);
      await batch.save();
    }

    return res.json({ message: "Batch joined successfully", batchId: batch._id });
  } catch (err) {
    console.error("Join Batch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all batches joined by logged-in student
export const getMyBatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("batches");
  
    res.json(user.batches || []);
  } catch (err) {
    console.error("Fetch My Batches Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get batch details by batch ID
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate("students", "name email");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.json(batch);
  } catch (err) {
    console.error("Get Batch By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student leaves a batch
export const leaveBatch = async (req, res) => {
  try {
    const user = req.user;
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    // Check if user is in this batch
    if (!user.batches.some(id => id.toString() === batchId)) {
      return res.status(400).json({ message: "You are not a member of this batch" });
    }

    // Remove batchId from user's batches array
    user.batches = user.batches.filter(id => id.toString() !== batchId);
    await user.save();

    // Remove user from batch.students array
    const batch = await Batch.findById(batchId);
    if (batch) {
      batch.students = batch.students.filter(id => id.toString() !== user._id.toString());
      await batch.save();
    }

    res.json({ message: "Left batch successfully" });
  } catch (err) {
    console.error("Leave Batch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
