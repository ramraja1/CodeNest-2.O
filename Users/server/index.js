import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import questionRoutes from "./routes/questionRoutes.js"
import judgeRoutes from "./routes/judgeRoutes.js"
import submissionRoutes from "./routes/submissionRoutes.js"
import userRoutes from "./routes/userRoutes.js"
dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',// frontend URL exact origin
  credentials: true, // allow cookies/auth headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.get("/",(req,res)=>{
  res.send("i am alive");
});

app.use("/api/student", authRoutes);
app.use("/api/batches", batchRoutes);


app.use("/api/contests", contestRoutes);


app.use("/api/users", userRoutes);

app.use("/api/questions", questionRoutes);
app.use("/api/submissions",submissionRoutes)

app.use("/api/judge", judgeRoutes);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
