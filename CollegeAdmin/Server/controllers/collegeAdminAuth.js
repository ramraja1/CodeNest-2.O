import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import College from '../models/college.js';
export const loginCollegeAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'collegeadmin' }).populate('collegeId');
    if (!user) return res.status(404).json({ message: 'College Admin not found' });

    if (!user.collegeId || user.collegeId.status !== 'approved') {
      return res.status(403).json({ message: 'Your college is not approved yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, collegeId: user.collegeId._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, college: user.collegeId.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// College Admin Registration (Pending)
export const registerCollegeAdmin = async (req, res) => {
  const { collegeName, contactName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Check if this college name already exists (optional)
    const existingCollege = await College.findOne({ name: collegeName });
    if (existingCollege) {
      return res.status(400).json({ message: 'College is already registered' });
    }

    // Create new College entry with pending status
    const college = new College({
      name: collegeName,
      email, // main contact email for the college
      contactName,
      status: 'pending'
    });
    await college.save();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create College Admin account linked to the college, but they can't log in until approved
    const user = new User({
      name: contactName,
      email,
      password: hashedPassword,
      role: 'collegeadmin',
      collegeId: college._id
    });
    await user.save();

    res.status(201).json({
      message: 'College registration submitted. Waiting for approval.',
      collegeId: college._id,
      status: college.status
    });

  } catch (err) {
    console.error('Error registering college admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

