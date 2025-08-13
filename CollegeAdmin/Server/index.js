import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import contestRoutes from "./routes/contestRoutes.js";

// Import Routes
import collegeRoutes from './routes/collegeRoutes.js';
// If you have existing Super Admin auth routes
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(bodyParser.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded

// ===== DB Connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ DB Connection Error:', err));

// ===== Routes =====
// Super Admin auth & other app auth routes
app.use('/api/auth/college', authRoutes);

// College module (register/approve/login College Admin)
app.use('/api/college', collegeRoutes);
//===contest ===
app.use("/api/contests", contestRoutes);

// ===== Health Check =====
app.get('/', (req, res) => {
  res.send('CodeNest API is running...');
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
