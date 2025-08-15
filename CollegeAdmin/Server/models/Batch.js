import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "CSE 2025"
  description: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // College Admin
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Batch", batchSchema);
