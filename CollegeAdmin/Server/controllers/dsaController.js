import { responseBot } from "../utils/chatbot.js";
import Question from "../models/question.js";
import Contest from "../models/contest.js";

let dsaHistory = [
  {
    role: "system",
    content: `
You are a coding assistant that responds ONLY with pure JSON without any Markdown syntax or headings.
Strict Rules:
- ❌ DO NOT add \`\`\`json or other Markdown syntax.
- ❌ DO NOT write any explanatory text or headers.
- ❌ DO NOT add any whitespace outside the JSON array.
- ✅ Only a pure JSON array matching the question model structure must be output.

DSA Question JSON structure:

[
  {
    "contestId": "ObjectId as string",         // omitted by AI, set by server
    "title": "String",
    "description": "String",
    "inputFormat": "String",
    "outputFormat": "String",
    "constraints": "String",                    // multiple constraints joined by newline
    "sampleInput": "String",
    "sampleOutput": "String",
    "explanation": "String",
    "marks": Number,
    "difficulty": "Easy" | "Medium" | "Hard",
    "tags": ["String"],
    "testCases": [
      {
        "input": "String",
        "expectedOutput": "String",
        "isHidden": Boolean
      }
    ]
  }
]

Behavior:
- Respond ONLY with a JSON array of question objects.
- Compose constraints as a single string with each constraint separated by newlines.
- Include all fields except "contestId" which will be set by the server.
- Do NOT include any fields not listed above.
- If user requests N questions, generate exactly N objects.
`
  },
];

export const handleDSAChat = async (req, res) => {
  try {
    const { message, contestID } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!contestID) return res.status(400).json({ error: "Contest ID not found" });

    dsaHistory.push({ role: "user", content: message });
    const trimmed = [dsaHistory[0], ...dsaHistory.slice(-2)];
    const botReply = await responseBot(trimmed);
    dsaHistory.push({ role: "assistant", content: botReply });

    let questions;
    try {
      questions = JSON.parse(botReply);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON from bot", botReply });
    }

    let savedCount = 0;

    for (const q of questions) {
      const {
        title,
        description,
        inputFormat,
        outputFormat,
        constraints,
        sampleInput,
        sampleOutput,
        explanation,
        marks,
        difficulty,
        tags,
        testCases,
      } = q;

      const newQuestion = new Question({
        contestId: contestID,
        title,
        description: description || "",
        inputFormat: inputFormat || "",
        outputFormat: outputFormat || "",
        constraints: Array.isArray(constraints)
          ? constraints.join("\n")
          : constraints || "",
        sampleInput: sampleInput || "",
        sampleOutput: sampleOutput || "",
        explanation: explanation || "",
        marks: marks ? Number(marks) : 20,
        difficulty: difficulty || "Easy",
        tags: tags || [],
        testCases: Array.isArray(testCases)
          ? testCases.map((t) => ({
              input: t.input,
              expectedOutput: t.expectedOutput || t.output,
              isHidden: t.isHidden || false,
            }))
          : [],
      });

      await newQuestion.save();

      await Contest.findByIdAndUpdate(
        contestID,
        { $push: { questions: newQuestion._id } },
        { new: true }
      );

      savedCount++;
    }

    res.json({
      message: `✅ ${savedCount} question${savedCount > 1 ? "s" : ""} saved and linked to this contest!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "DSA bot error",
      details: err.message,
    });
  }
};
