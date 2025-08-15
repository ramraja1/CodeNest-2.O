import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Contest title
    description: { type: String, default: "" }, // Contest description/rules

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    tags: [{ type: String }], // e.g. ["DSA", "JavaScript"]

    // College / Batch / Creator info
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // College Admin
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },

    // New: Optional batch link
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null }, 
    // null = college-wide contest

    // Questions linked to this contest
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
    ],

    // Contest visibility / status
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft"
    },

    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Contest", contestSchema);
