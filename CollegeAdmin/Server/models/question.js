import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // Link to the contest this question belongs to
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },

    // Basic info
    title: { type: String, required: true },
    description: { type: String, default: "" },

    // Problem statement details
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints: { type: String, default: "" },
    sampleInput: { type: String, default: "" },
    sampleOutput: { type: String, default: "" },
    explanation: { type: String, default: "" },

    marks: { type: Number, default: 20 }, // Total marks/points for the question
    // Metadata
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    tags: [{ type: String }],

    // Test cases for judging
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

export default mongoose.model("Question", questionSchema);
