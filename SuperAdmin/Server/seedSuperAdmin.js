import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "owner@codenest.com" });
  if (existing) {
    console.log("Super Admin already exists");
    process.exit();
  }

  const hashed = await bcrypt.hash("Pawan@12345", 10);

  await User.create({
    name: "Platform Owner",
    email: "owner@codenest.com",
    password: hashed,
    role: "superadmin"
  });

  console.log("Super Admin created!");
  process.exit();
}

seed();
