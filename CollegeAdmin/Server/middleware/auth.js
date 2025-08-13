// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Access denied' });
  next();
};

export const collegeAdminOnly = (req, res, next) => {
  if (req.user.role !== 'collegeadmin') return res.status(403).json({ message: 'Access denied' });
  next();
};
