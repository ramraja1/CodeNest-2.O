import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/user.js';
import College from './models/college.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // 1. Clear existing test data (optional)
    await User.deleteMany({ role: 'collegeadmin' });
    await College.deleteMany({});

    // 2. Create an approved college
    const college = new College({
      name: 'Test Engineering College',
      email: 'college@example.com',
      contactName: 'Test College Admin',
      status: 'approved'
    });
    await college.save();

    // 3. Create College Admin linked to that college
    const hashedPassword = await bcrypt.hash('password123', 10);
    const collegeAdmin = new User({
      name: 'Test College Admin',
      email: 'college@example.com',
      password: hashedPassword,
      role: 'collegeadmin',
      collegeId: college._id
    });
    await collegeAdmin.save();

    console.log('🎯 Seed complete!');
    console.log('College:', college);
    console.log('College Admin:', collegeAdmin);

    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedData();
