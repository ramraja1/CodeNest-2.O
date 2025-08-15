import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  batchCode: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Batch", batchSchema);
