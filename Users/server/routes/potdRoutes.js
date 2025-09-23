import express from 'express';
import { getTodayPOTD, submitPOTD } from '../controllers/potdController.js';

const router = express.Router();

// Fetch today's POTD
router.get('/today', getTodayPOTD);

// Submit POTD solution
router.post('/submit', submitPOTD);

export default router;
