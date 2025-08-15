import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      collegeId: user.collegeId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Student Registration
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
      batches: [],
      collegeId: null, // Student not assigned college on registration
    });

    await user.save();

     res.json({
      message: "Regestration  successful",
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        batches: user.batches,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student Login
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both email and password" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== "student") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return token and user data
    res.json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        batches: user.batches,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete User Account
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user with token info

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
