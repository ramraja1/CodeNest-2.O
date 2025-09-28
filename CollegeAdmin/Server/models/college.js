import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // For login/primary communication
  email: { type: String, required: true, unique: true },

  // Who registered or is the main contact at the time of creation
  contactName: { type: String, required: true },
  contactPhone: { type: String },

  // Optional: store a join code students can use when signing up
  // joinCode: { type: String, unique: true },

  // Status for super-admin approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // College admin user(s) linked to this college
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Batches (for optional reference caching)
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],

  // Optional metadata
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  logoUrl: { type: String }, // store cloud URL

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('College', collegeSchema);
