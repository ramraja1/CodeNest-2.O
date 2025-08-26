import mongoose from 'mongoose';
import College from './college.js'; // adjust path as needed

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  role: { 
    type: String, 
    enum: ['superadmin', 'collegeadmin', 'student'], 
    default: 'student' 
  },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], // array of batch IDs

  // --- Profile enhancement fields ---
  avatarUrl: { type: String, default: "" },           // profile pic URL
  bio: { type: String, default: "" },                 // user profile summary
  collegeName: { type: String },


  // --- Coding analytics and gamification ---
  solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // All solved question IDs
  codingPoints: { type: Number, default: 0 },         // Earned points/coins
  contestStats: [{
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    rank: Number,
    score: Number,
    date: Date
  }],                                                 // Past contest performance
  streak: {                                           // Coding streak in days
    current:   { type: Number, default: 0 },
    longest:   { type: Number, default: 0 },
    calendar:  [{ date: String, solved: Boolean }],   // For contribution calendar (YYYY-MM-DD)
  },
  potdStats: {                                        // Problem of the Day stats
    attempted: { type: Number, default: 0 },
    solved:    { type: Number, default: 0 },
    streak:    { type: Number, default: 0 }
  },

  achievements: [                                     // Badge/achievement IDs or names
    { type: String }
  ],

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
