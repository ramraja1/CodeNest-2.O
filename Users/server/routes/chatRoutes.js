// routes/chatRoutes.js
import express from "express";
import { responseBot } from "../utils/chatbot.js";


const router = express.Router();

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const reply = await responseBot(messages);
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong with chatbot" });
  }
});

export default router;
