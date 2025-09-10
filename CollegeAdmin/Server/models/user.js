import mongoose from 'mongoose';
import College from './college.js'; // adjust path as needed

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // required only if googleId is not present
    }
  }, // hashed
  googleId: { type: String }, // add this field to store Google user ID
  role: { 
    type: String, 
    enum: ['superadmin', 'collegeadmin', 'student'], 
    default: 'student' 
  },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], // array of batch IDs

  avatarUrl: { type: String, default: "" }, // profile pic URL
  bio: { type: String, default: "" }, // user profile summary
  collegeName: { type: String },

  solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  codingPoints: { type: Number, default: 0 },
  contestStats: [{
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
    rank: Number,
    score: Number,
    date: Date
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    calendar: [{ date: String, solved: Boolean }],
  },
  potdStats: {
    attempted: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  achievements: [{ type: String }],

  createdAt: { type: Date, default: Date.now }
});


const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
