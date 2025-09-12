import express from 'express';
import { registerCollege, approveCollege, rejectCollege, getPendingColleges } from '../controllers/collegeController.js';

import { authMiddleware, superAdminOnly } from '../middleware/auth.js';
import {getCollegeAdminStats,getCollegeStudentsData ,getCollegeActivities} from '../controllers/collegeDashBoardControler.js'
const router = express.Router();



// Super Admin Only
router.get('/pending', authMiddleware, superAdminOnly, getPendingColleges);
router.put('/:id/approve', authMiddleware, superAdminOnly, approveCollege);
router.put('/:id/reject', authMiddleware, superAdminOnly, rejectCollege);


router.get('/stats', authMiddleware, getCollegeAdminStats );

router.get('/student-progress', authMiddleware, getCollegeStudentsData );
router.get('/activities', authMiddleware, getCollegeActivities  );
export default router;
