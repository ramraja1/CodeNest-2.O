import mongoose from 'mongoose';

const potdSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  date: { type: Date, required: true, unique: true },
  stats: {
    attempted: { type: Number, default: 0 },
    solved: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

const POTD = mongoose.models.POTD || mongoose.model('POTD', potdSchema);
export default POTD;
