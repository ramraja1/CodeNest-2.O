import Batch from '../models/Batch.js';
import User from '../models/user.js';
import crypto from 'crypto';

/**
 * Generate a unique batch code.
 */
const generateBatchCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // e.g. A1B2C3
};

// Create a new batch (Admin)
export const createBatch = async (req, res) => {
  try {
    const { name, description } = req.body;
    const collegeId = req.user.collegeId; // from auth middleware
    const createdBy = req.user._id;

    if (!name) return res.status(400).json({ message: 'Batch name is required' });

    const batchCode = generateBatchCode();

    const newBatch = await Batch.create({
      name,
      description,
      collegeId,
      createdBy,
      batchCode
    });

    res.status(201).json({
      message: 'Batch created successfully',
      batch: {
        id: newBatch._id,
        name: newBatch.name,
        description: newBatch.description,
        batchCode: newBatch.batchCode
      }
    });
  } catch (err) {
    console.error("Create Batch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all batches for the logged-in college admin's college
export const getBatches = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    

    const batches = await Batch.find({ collegeId }).lean();

    // Aggregate counts of students by batch for that college
    const studentCounts = await User.aggregate([
      { $match: { collegeId, role: 'student' } },
      {
        $group: {
          _id: "$batchId",
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
        }
      }
    ]);

    // Attach student counts + batch code
    const enrichedBatches = batches.map(batch => {
      const counts = studentCounts.find(c => String(c._id) === String(batch._id)) || {};
      return {
        ...batch,
        totalStudents: counts.total || 0,
        approvedCount: counts.approved || 0,
        pendingCount: counts.pending || 0,
        batchCode: batch.batchCode
      };
    });

    res.json(enrichedBatches);
  } catch (err) {
    console.error("Get Batches Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific batch by ID
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ batch });
  } catch (err) {
    console.error("Get Batch By ID Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update batch details
export const updateBatch = async (req, res) => {
  try {
    const { name, description } = req.body;
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch updated', batch });
  } catch (err) {
    console.error("Update Batch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a batch and remove references from its students
export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    // Remove batchId from all users assigned to this batch
    await User.updateMany({ batchId: batch._id }, { $unset: { batchId: "" } });

    res.json({ message: 'Batch deleted' });
  } catch (err) {
    console.error("Delete Batch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student joins a batch by code
export const joinBatchByCode = async (req, res) => {
  try {
    const { batchCode } = req.body;
    const studentId = req.user._id;

    if (!batchCode) {
      return res.status(400).json({ message: 'Batch code is required' });
    }

    const batch = await Batch.findOne({ batchCode });
    if (!batch) {
      return res.status(404).json({ message: "Invalid batch code" });
    }

    // Prevent duplicate joining
    if (batch.students.includes(studentId)) {
      return res.status(400).json({ message: "You already joined this batch" });
    }

    batch.students.push(studentId);
    await batch.save();

    // Optional: also set user's batchId for quick reference
    await User.findByIdAndUpdate(studentId, { batchId: batch._id });

    res.json({ message: "Batch joined successfully", batchId: batch._id });
  } catch (error) {
    console.error("Join Batch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
