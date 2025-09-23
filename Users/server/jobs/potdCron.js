import cron from 'node-cron';
import mongoose from 'mongoose';
import POTD from '../models/potd.js';
import Question from '../models/question.js';

async function assignDailyPOTD() {
  try {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // normalize to midnight

    // Check if POTD already assigned for today
    const existing = await POTD.findOne({ date: todayDate });
    if (existing) {
      console.log("POTD already assigned for today");
      return;
    }

    // Find a random question for POTD (you can customize the logic)
    const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
    if (randomQuestion.length === 0) {
      console.log("No questions available for POTD");
      return;
    }

    const potdQuestion = randomQuestion[0];

    // Create and save the new POTD record
    const newPOTD = new POTD({ questionId: potdQuestion._id, date: todayDate });
    await newPOTD.save();

    console.log(`New POTD assigned for ${todayDate.toDateString()}: ${potdQuestion.title}`);
  } catch (err) {
    console.error("Error in assignDailyPOTD:", err);
  }
}

// Schedule the cron job to run at 12 AM every day
cron.schedule('0 0 * * *', () => {
  assignDailyPOTD();
  console.log("POTD cron job executed");
});

console.log("POTD cron job scheduled");
