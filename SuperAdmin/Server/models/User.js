import mongoose from 'mongoose';

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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
