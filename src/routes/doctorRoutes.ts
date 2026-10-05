import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All doctor routes require authentication
router.use(authenticateToken);

// GET /api/doctors - List doctors with search & filter
// POST /api/doctors - Register a new doctor
router
  .route('/')
  .get(getDoctors)
  .post(requireRoles('admin', 'doctor', 'receptionist'), createDoctor);

// GET /api/doctors/:id - Single doctor details
// PATCH /api/doctors/:id - Update doctor details
// DELETE /api/doctors/:id - Delete doctor
router
  .route('/:id')
  .get(getDoctorById)
  .patch(requireRoles('admin', 'doctor', 'receptionist'), updateDoctor)
  .delete(requireRoles('admin'), deleteDoctor);

export default router;
