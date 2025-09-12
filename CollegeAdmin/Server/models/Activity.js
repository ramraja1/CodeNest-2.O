import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  type: { type: String, enum: ["contest", "student", "leaderboard", "submission"], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Activity", activitySchema);
