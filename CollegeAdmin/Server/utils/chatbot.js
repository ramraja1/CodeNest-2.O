// import OpenAI from 'openai';
// import dotenv from "dotenv";

// dotenv.config();

// const openai = new OpenAI({
//   baseURL: process.env.OPENAI_BASE_URL,
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const responseBot = async (messages) => {
//   const response = await openai.chat.completions.create({
//     model: 'Provider-9/gpt-4.1',
//     messages,
//     temperature: 0.7,
//     max_tokens: 4000,
//   });

//   return response.choices[0].message.content;
// // };
import OpenAI from 'openai';
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.HTTP_REFERER || "", 
    "X-Title": process.env.X_TITLE || "",           
  }
});

export const responseBot = async (messages) => {
  const response = await openai.chat.completions.create({
    model: 'qwen/qwen3-30b-a3b:free',  // <-- fixed model ID
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });
  

  return response.choices[0].message.content;
};


// import axios from 'axios';
// import dotenv from 'dotenv';

// dotenv.config();

// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.OPENAI_API_KEY}`;

// /**
//  * Gemini-based chat response function
//  * @param {Array} messages - Array of messages: [{ role: 'user', content: 'Hello' }, ...]
//  * @returns {string} AI-generated response content
//  */
// export const responseBot = async (messages) => {
//   try {
//     // Convert messages to Gemini format
//     const geminiFormatted = {
//       contents: [
//         {
//           role: 'user',
//           parts: messages.map((msg) => ({ text: msg.content }))
//         }
//       ]
//     };

//     const response = await axios.post(
//       GEMINI_API_URL,
//       geminiFormatted,
//       {
//         headers: { 'Content-Type': 'application/json' }
//       }
//     );

//     const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     return reply || "No response from Gemini.";
//   } catch (error) {
//     console.error("Gemini API error:", error?.response?.data || error.message);
//     return "Failed to get response from Gemini.";
//   }
// };
