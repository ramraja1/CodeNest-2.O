import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import {registerCollegeAdmin,loginCollegeAdmin} from "../controllers/collegeAdminAuth.js"
const router = express.Router();

/**
 * @route POST /api/college-admin/login
 * @desc Login for College Admins only
 * @access Public
 */
router.post('/login', loginCollegeAdmin);

router.post('/register',registerCollegeAdmin)

export default router;
