import express from 'express';
import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptions,
  getPrescriptionById,
  getPrescriptionByConsultation,
} from '../controllers/prescriptionController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All prescription routes require authentication
router.use(authenticateToken);

// GET /api/prescriptions - List all prescriptions
// POST /api/prescriptions - Create a prescription with medicines
router
  .route('/')
  .get(getPrescriptions)
  .post(requireRoles('doctor', 'admin'), createPrescription);

// GET /api/prescriptions/patient/:patientId - View patient prescription history
router.get('/patient/:patientId', getPatientPrescriptions);

// GET /api/prescriptions/consultation/:consultationId - Prescription by consultation ID
router.get('/consultation/:consultationId', getPrescriptionByConsultation);

// GET /api/prescriptions/:id - Single prescription details
router.get('/:id', getPrescriptionById);

export default router;
