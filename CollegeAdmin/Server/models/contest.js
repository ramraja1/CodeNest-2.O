import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // College Admin
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Contest", contestSchema);
