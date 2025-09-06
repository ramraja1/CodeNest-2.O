import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Resource", resourceSchema);
