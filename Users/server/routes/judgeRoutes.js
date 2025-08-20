import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { LANGUAGE_VERSIONS } from "../constants/constant.js";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { sourceCode, language, version, stdin } = req.body;

  

  const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

  try {
    const pistonRes = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        language,
        version: LANGUAGE_VERSIONS[language],       // fallback to "latest"
        files: [
          {
            name: "main",                    // generic file name
            content: sourceCode || "",       // code from request
          },
        ],
        stdin: stdin || "",                   // optional stdin
      }),
    });

    const result = await pistonRes.json();
    // console.log("Piston API response:", result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Execution failed", details: error.toString() });
  }
});
export default router;
