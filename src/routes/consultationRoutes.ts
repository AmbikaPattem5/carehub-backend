import express from 'express';
import {
  saveConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByPatient,
  getConsultationByAppointment,
} from '../controllers/consultationController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All consultation routes require authentication
router.use(authenticateToken);

// GET /api/consultations - List consultations with search/filters
// POST /api/consultations - Save consultation diagnosis & notes
router
  .route('/')
  .get(getConsultations)
  .post(requireRoles('doctor', 'admin'), saveConsultation);

// GET /api/consultations/patient/:patientId - Consultations for a patient
router.get('/patient/:patientId', getConsultationsByPatient);

// GET /api/consultations/appointment/:appointmentId - Consultation for an appointment
router.get('/appointment/:appointmentId', getConsultationByAppointment);

// GET /api/consultations/:id - Single consultation by ID
router.get('/:id', getConsultationById);

export default router;
