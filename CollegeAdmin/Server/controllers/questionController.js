import Contest from '../models/contest.js';
import Question from '../models/question.js';

// Get all questions for a contest
export const getQuestionsByContest = async (req, res) => {
  try {
    const { contestId } = req.query;
    if (!contestId) return res.status(400).json({ message: "contestId query param required" });

    const questions = await Question.find({ contestId }).sort({ createdAt: 1 });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new question
export const createQuestion = async (req, res) => {
  try {
    const { contestId, title, description, inputFormat, outputFormat, constraints, sampleInput,marks ,sampleOutput, explanation, difficulty, tags, testCases } = req.body;

    if (!contestId || !title) {
      return res.status(400).json({ message: "contestId and title are required" });
    }

    // Create question
    const question = await Question.create({
      contestId,
      title,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      explanation,
      difficulty,
      marks,
      tags,
      testCases,
    });

    // Add question ID to contest.questions
    await Contest.findByIdAndUpdate(contestId, { $push: { questions: question._id } });
    
    res.status(201).json({ message: "Question added", question });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing question
export const updateQuestion = async (req, res) => {
  try {
    const updatedData = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question updated", updatedQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a question and remove it from the contest
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const contestId = question.contestId;

    await Question.findByIdAndDelete(req.params.id);

    // Remove question ID from contest.questions array
    await Contest.findByIdAndUpdate(contestId, { $pull: { questions: req.params.id } });

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
