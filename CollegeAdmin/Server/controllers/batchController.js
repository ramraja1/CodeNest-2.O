import Batch from '../models/Batch.js';
import User from '../models/user.js';

// Create a new batch
export const createBatch = async (req, res) => {
  try {
    const { name, description } = req.body;
    const collegeId = req.user.collegeId; // from auth middleware
    const createdBy = req.user._id;

    if (!name) return res.status(400).json({ message: 'Batch name is required' });

    const newBatch = await Batch.create({
      name,
      description,
      collegeId,
      createdBy,
    });

    res.status(201).json({ message: 'Batch created', batch: newBatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all batches for the logged-in college admin's college, with student counts
export const getBatches = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    // Fetch all batches for the college
    const batches = await Batch.find({ collegeId }).lean();

    // Aggregate counts of students by batch status for that college
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

    // Attach student counts to batches
    const enrichedBatches = batches.map(batch => {
      const counts = studentCounts.find(c => String(c._id) === String(batch._id)) || {};
      return {
        ...batch,
        totalStudents: counts.total || 0,
        approvedCount: counts.approved || 0,
        pendingCount: counts.pending || 0
      };
    });

    res.json(enrichedBatches);
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
