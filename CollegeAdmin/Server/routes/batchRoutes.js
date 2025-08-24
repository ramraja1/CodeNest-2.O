import express from 'express';
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatcheStudent
} from '../controllers/batchController.js';
import {authMiddleware} from '../middleware/auth.js';

const router = express.Router();

// Protect all batch routes
router.use(authMiddleware);

router.post('/', createBatch);
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

// fetching all students of batch 
router.get('/:batchId/students', getBatcheStudent);


export default router;
