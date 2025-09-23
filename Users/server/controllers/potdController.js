import POTD from '../models/potd.js';
import Question from '../models/question.js';
import User from '../models/user.js';

export const getTodayPOTD = async (req, res) => {
  try {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const potd = await POTD.findOne({ date: todayDate }).populate('questionId');
    if (!potd) return res.status(404).json({ message: "No POTD assigned today." });

    res.json(potd);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching POTD." });
  }
};

export const submitPOTD = async (req, res) => {
  try {
    const { userId, potdId, solved } = req.body;

    if (!userId || !potdId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const potd = await POTD.findById(potdId);
    if (!potd) return res.status(404).json({ message: "POTD not found." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Update potd stats
    potd.stats.attempted += 1;
    if (solved) potd.stats.solved += 1;
    await potd.save();

    // Update user potdStats and streak
    user.potdStats.attempted += 1;
    if (solved) {
      user.potdStats.solved += 1;
      user.potdStats.streak += 1;
    } else {
      user.potdStats.streak = 0;
    }
    await user.save();

    res.json({ message: "POTD submission recorded." });
  } catch (error) {
    res.status(500).json({ message: "Server error submitting POTD result." });
  }
};
