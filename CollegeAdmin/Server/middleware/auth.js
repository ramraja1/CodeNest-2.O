// middleware/auth.js
import jwt from 'jsonwebtoken';


import User from "../models/user.js";

export const authMiddleware= async (req, res, next)=> {
 
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    

    // Load full user to get collegeId
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId._id // so it's always available
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
}


export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Access denied' });
  next();
};

export const collegeAdminOnly = (req, res, next) => {
  if (req.user.role !== 'collegeadmin') return res.status(403).json({ message: 'Access denied' });
  next();
};
