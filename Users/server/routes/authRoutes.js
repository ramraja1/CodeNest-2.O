import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import {registerStudent,loginStudent} from "../controllers/UserAuth.js"
const router = express.Router();

/**
 * @route POST /api/college-admin/login
 * @desc Login for College Admins only
 * @access Public
 */
router.post('/login', loginStudent);

router.post('/register',registerStudent)

export default router;
