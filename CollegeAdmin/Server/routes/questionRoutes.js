import express from 'express';
import {
  getQuestionsByContest,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getQuestionsByContest);        // expects contestId query param
router.get('/:id', getQuestionById);         
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
