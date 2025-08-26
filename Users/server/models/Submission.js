import mongoose from "mongoose";

const submission = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },

    language: { type: String, required: true },
    sourceCode: { type: String, required: true },

    testResults: [
      {
        input: { type: String },
        expectedOutput: { type: String },
        output: { type: String },
        verdict: { type: String },        // e.g., "Accepted", "Wrong Answer", "Runtime/Error"
        error: { type: String, default: "" },  // optional error message if any
      }
    ],

    score: { type: Number, default: 0 },      // marks earned from all test cases
    penalty: { type: Number, default: 0 },    // penalty percentage if applicable

    runtime: { type: String, default: "N/A" },  // runtime info string
    memory: { type: String, default: "N/A" },   // memory usage string

    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,  // adds createdAt, updatedAt fields automatically
  }
);

export default mongoose.model("Submission", submission);
