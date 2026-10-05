import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  getAvailableSlots,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  cancelAppointment,
  checkInAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// GET /api/appointments/available-slots - Query available booking slots for a doctor & date
router.get('/available-slots', getAvailableSlots);

// GET /api/appointments - List appointments with date, doctor, patient, status, and search filters
// POST /api/appointments - Book a new appointment
router
  .route('/')
  .get(getAppointments)
  .post(requireRoles('admin', 'receptionist', 'doctor'), createAppointment);

// Specialized action routes
// PATCH /api/appointments/:id/reschedule - Reschedule appointment date and time
router.patch(
  '/:id/reschedule',
  requireRoles('admin', 'receptionist', 'doctor'),
  rescheduleAppointment
);

// PATCH /api/appointments/:id/cancel - Cancel appointment and free the slot
router.patch(
  '/:id/cancel',
  requireRoles('admin', 'receptionist', 'doctor'),
  cancelAppointment
);

// PATCH /api/appointments/:id/check-in - Check in patient on arrival
router.patch(
  '/:id/check-in',
  requireRoles('admin', 'receptionist', 'doctor'),
  checkInAppointment
);

// GET /api/appointments/:id - Single appointment details
// PATCH /api/appointments/:id - General update of appointment details
// DELETE /api/appointments/:id - Delete appointment (Admin & Receptionist only)
router
  .route('/:id')
  .get(getAppointmentById)
  .patch(requireRoles('admin', 'receptionist', 'doctor'), updateAppointment)
  .delete(requireRoles('admin', 'receptionist'), deleteAppointment);

export default router;
