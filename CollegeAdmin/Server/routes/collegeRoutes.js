import express from 'express';
import { registerCollege, approveCollege, rejectCollege, getPendingColleges } from '../controllers/collegeController.js';

import { authMiddleware, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();



// Super Admin Only
router.get('/pending', authMiddleware, superAdminOnly, getPendingColleges);
router.put('/:id/approve', authMiddleware, superAdminOnly, approveCollege);
router.put('/:id/reject', authMiddleware, superAdminOnly, rejectCollege);

export default router;
