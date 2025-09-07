import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { 
  login, 
  getPendingColleges,
  getApprovedColleges,
  approveCollege,
  rejectCollege,
  stopServiceCollege,
  getStats
} from './controllers/superAdminController.js';
import { protectSuperAdmin } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Basic route
app.get('/', (req, res) => res.send("Happy Coding..."));

// Auth
app.post('/api/superadmin/login', login);

// Dashboard welcome
app.get('/api/superadmin/dashboard', protectSuperAdmin, (req, res) => {
  res.json({ message: 'Welcome Super Admin!', user: req.user });
});

// API Requirements
// Get all approved colleges
app.get("/api/superadmin/colleges/approved", protectSuperAdmin, getApprovedColleges);

app.get('/api/superadmin/colleges/pending', protectSuperAdmin, getPendingColleges);
app.post('/api/superadmin/colleges/:id/approve', protectSuperAdmin, approveCollege);
app.post('/api/superadmin/colleges/:id/stop', protectSuperAdmin, stopServiceCollege);
app.post('/api/superadmin/colleges/:id/reject', protectSuperAdmin, rejectCollege);
app.get('/api/superadmin/stats', protectSuperAdmin, getStats);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
