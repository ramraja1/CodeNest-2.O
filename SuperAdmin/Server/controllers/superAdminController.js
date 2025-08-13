import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import College from '../models/College.js';



// Get pending colleges
export const getPendingColleges = async (req, res) => {
  try {
    const colleges = await College.find({ status: 'pending' });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getApprovedColleges = async(req,res)=>{
  try {
    const colleges = await College.find({ status: "approved" });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server Error at Approved Colleges' });
  }
}
// Approve a college
export const approveCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'approved';
    await college.save();

    res.json({ message: 'College approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reject a college
export const rejectCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    college.status = 'rejected';
    await college.save();

    res.json({ message: 'College rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Stats for dashboard
export const getStats = async (req, res) => {
  try {
    const totalColleges = await College.countDocuments();
    const totalUsers = await User.countDocuments();
    // Example: Add other stats like contests if applicable
    const totalContests = 0; // Replace with actual query

    res.json({
      colleges: totalColleges,
      users: totalUsers,
      contests: totalContests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'superadmin' });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
