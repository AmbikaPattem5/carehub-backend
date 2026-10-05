import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All patient routes require valid authentication
router.use(authenticateToken);

// GET /api/patients - List patients with search/filters
// POST /api/patients - Register a new patient
router
  .route('/')
  .get(getPatients)
  .post(requireRoles('admin', 'receptionist', 'doctor'), createPatient);

// GET /api/patients/:id - Single patient details
// PATCH /api/patients/:id - Update patient contact/profile
// DELETE /api/patients/:id - Delete patient (Admin/Receptionist only)
router
  .route('/:id')
  .get(getPatientById)
  .patch(requireRoles('admin', 'receptionist', 'doctor'), updatePatient)
  .delete(requireRoles('admin', 'receptionist'), deletePatient);

export default router;
