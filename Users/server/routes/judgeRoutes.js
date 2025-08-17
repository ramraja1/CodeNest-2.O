import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { sourceCode, languageId, stdin, expectedOutput } = req.body;

  const API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
  const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

  try {
    const judge0Res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin || "",
        expected_output: expectedOutput || ""
      })
    });
    const result = await judge0Res.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Execution failed', details: error.toString() });
  }
});

export default router;
