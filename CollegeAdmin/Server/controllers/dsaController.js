import { responseBot } from "../utils/chatbot.js";
import Question from "../models/question.js";
import Contest from "../models/contest.js";

let dsaHistory = [
  {
    role: "system",
    content: `You are a coding assistant that responds ONLY with pure JSON without any Markdown syntax or headings.

Strict Rules:
- ❌ DO NOT add \`\`\`
- ❌ DO NOT write explanatory text, headers, or any whitespace outside the JSON array.
- ✅ Only output a pure JSON array matching the specified question model structure.

DSA Question JSON structure:
[
  {
    "contestId": "ObjectId as string",
    "title": "String",
    "description": "String",
    "inputFormat": "String",
    "outputFormat": "String",
    "constraints": "String",
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

Additional Instructions for Array or Sequence Problems:
- For languages like C++, Java, Python, always provide input samples and test cases where the input starts with the array length n, followed by n elements separated by spaces or newlines.
- For example: "5\n3 9 1 4 2" means array size 5 and elements are.
- Clearly document inputFormat as:
  The first line contains an integer n, the size of the array.
  The second line contains n integers separated by spaces, the elements of the array.

Test Case Strictness:
- ALL testCases must have fully valid, non-empty, non-whitespace 'input' and 'expectedOutput' fields.
- Do NOT generate any test case with empty or whitespace-only input or expectedOutput.
- Provide multiple test cases covering normal, edge, and corner cases—never leave test cases incomplete or blank.
- Mark testCases as hidden or not as needed.

Example question object with valid test cases:

{
  "inputFormat": "The first line contains an integer n, the size of the array.\\nThe second line contains n integers separated by spaces, the elements of the array.",
  "sampleInput": "5\\n3 9 1 4 2",
  "sampleOutput": "1",
  "testCases": [
    {
      "input": "5\\n3 9 1 4 2",
      "expectedOutput": "1",
      "isHidden": false
    },
    {
      "input": "1\\n100",
      "expectedOutput": "100",
      "isHidden": true
    }
  ]
}

Behavior:
- Respond ONLY with a JSON array of question objects exactly as defined.
- Compose constraints as a single string with each constraint separated by a newline.
- Do NOT include any fields except those listed (omit contestId).
- Generate exactly the number of question objects requested by the user.
`
  },
];

export const handleDSAChat = async (req, res) => {
  try {
    const { message, contestID } = req.body;

    if (!message) {
      console.log("No message provided in request body");
      return res.status(400).json({ error: "Message is required" });
    }
    if (!contestID) {
      console.log("No contest ID provided in request body");
      return res.status(400).json({ error: "Contest ID not found" });
    }

    dsaHistory.push({ role: "user", content: message });
    // Fix slicing here to avoid nested arrays
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


      const filteredTestCases = Array.isArray(testCases)
        ? testCases.filter(
            (t) =>
              typeof t.input === "string" &&
              t.input.trim().length > 0 &&
              typeof (t.expectedOutput || t.output) === "string" &&
              (t.expectedOutput || t.output).trim().length > 0
          ).map((t) => ({
            input: t.input,
            expectedOutput: t.expectedOutput || t.output,
            isHidden: t.isHidden || false,
          }))
        : [];

    
      const newQuestion = new Question({
        contestId: contestID,
        title,
        description: description || "",
        inputFormat: inputFormat || "",
        outputFormat: outputFormat || "",
        constraints: Array.isArray(constraints) ? constraints.join("\n") : constraints || "",
        sampleInput: sampleInput || "",
        sampleOutput: sampleOutput || "",
        explanation: explanation || "",
        marks: marks ? Number(marks) : 20,
        difficulty: difficulty || "Easy",
        tags: tags || [],
        testCases: filteredTestCases,
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
      message: `✅ ${savedCount} question${savedCount > 1 ? "s" : ""} added to this contest!`,
    });
  } catch (err) {
    console.error("DSA bot error:", err);
    res.status(500).json({
      error: "DSA bot error",
      details: err.message,
    });
  }
};
