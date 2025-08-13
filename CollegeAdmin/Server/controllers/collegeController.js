import College from '../models/college.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

// 1. Public - College requests approval
export const registerCollege = async (req, res) => {
  const { name, email, contactName } = req.body;

  try {
    const existing = await College.findOne({ email });
    if (existing) return res.status(400).json({ message: 'College already registered' });

    const college = new College({ name, email, contactName });
    await college.save();

    res.status(201).json({ message: 'College request submitted, awaiting approval', college });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Super Admin - Approve College and create College Admin
export const approveCollege = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body; // password for college admin

  try {
    const college = await College.findById(id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'approved';
    await college.save();

    // Create College Admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const collegeAdmin = new User({
      name: college.contactName,
      email: college.email,
      password: hashedPassword,
      role: 'collegeadmin',
      collegeId: college._id
    });
    await collegeAdmin.save();

    res.json({ message: 'College approved and admin created', college, collegeAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Super Admin - Reject College
export const rejectCollege = async (req, res) => {
  const { id } = req.params;
  try {
    const college = await College.findById(id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'rejected';
    await college.save();

    res.json({ message: 'College request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. View Pending Colleges
export const getPendingColleges = async (req, res) => {
  try {
    const pending = await College.find({ status: 'pending' });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
