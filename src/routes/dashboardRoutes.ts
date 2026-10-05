import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard endpoints require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats - Fetch role-tailored stats (admin, doctor, receptionist)
router.get('/stats', getDashboardStats);

export default router;
