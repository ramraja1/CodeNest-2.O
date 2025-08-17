import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import questionRoutes from "./routes/questionRoutes.js"
import judgeRoutes from "./routes/judgeRoutes.js"

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/",(req,res)=>{
  res.send("i am alive");
})

app.use("/api/student", authRoutes);
app.use("/api/batches", batchRoutes);


app.use("/api/contests", contestRoutes);


app.use("/api/questions", questionRoutes);


app.use("/api/judge", judgeRoutes);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
