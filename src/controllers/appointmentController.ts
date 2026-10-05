import { Response } from 'express';
import mongoose from 'mongoose';
import { Appointment, IAppointment, AppointmentStatus } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

interface InMemoryAppointment {
  id: string;
  _id?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  date: string;
  time: string;
  timeSlot?: string;
  tokenNumber: number;
  token: string;
  reason: string;
  status: AppointmentStatus;
  fee?: number;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const defaultToday = getTodayDateString();

// Seeded in-memory store matching clinic design & mock data
export const inMemoryAppointments: InMemoryAppointment[] = [
  {
    id: 'apt-mock-1',
    _id: 'apt-mock-1',
    appointmentId: 'APT-1001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '9876543210',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: defaultToday,
    time: '09:00 AM',
    timeSlot: '09:00 AM',
    tokenNumber: 1,
    token: 'Token #01',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
    notes: 'Regular monthly follow-up for blood pressure',
    createdAt: new Date('2026-09-26T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T08:00:00Z').toISOString(),
  },
  {
    id: 'apt-mock-2',
    _id: 'apt-mock-2',
    appointmentId: 'APT-1002',
    patientId: 'PAT-1002',
    patientName: 'Ananya Patel',
    patientPhone: '9823456781',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: defaultToday,
    time: '09:30 AM',
    timeSlot: '09:30 AM',
    tokenNumber: 2,
    token: 'Token #02',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
    notes: 'Follow-up consultation',
    createdAt: new Date('2026-09-26T08:15:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T08:15:00Z').toISOString(),
  },
  {
    id: 'apt-mock-3',
    _id: 'apt-mock-3',
    appointmentId: 'APT-1003',
    patientId: 'PAT-1003',
    patientName: 'Rohan Verma',
    patientPhone: '9711223344',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: defaultToday,
    time: '10:00 AM',
    timeSlot: '10:00 AM',
    tokenNumber: 3,
    token: 'Token #03',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
    notes: 'Routine checkup',
    createdAt: new Date('2026-09-26T08:30:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T08:30:00Z').toISOString(),
  },
  {
    id: 'apt-mock-4',
    _id: 'apt-mock-4',
    appointmentId: 'APT-1004',
    patientId: 'PAT-1004',
    patientName: 'Meera Nair',
    patientPhone: '9944556677',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: defaultToday,
    time: '10:30 AM',
    timeSlot: '10:30 AM',
    tokenNumber: 4,
    token: 'Token #04',
    reason: 'Blood Pressure Checkup',
    status: 'pending',
    fee: 500,
    notes: 'New patient consultation',
    createdAt: new Date('2026-09-26T08:45:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T08:45:00Z').toISOString(),
  },
  {
    id: 'apt-mock-5',
    _id: 'apt-mock-5',
    appointmentId: 'APT-1005',
    patientId: 'PAT-1005',
    patientName: 'Vikram Reddy',
    patientPhone: '9123456789',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: defaultToday,
    time: '11:00 AM',
    timeSlot: '11:00 AM',
    tokenNumber: 5,
    token: 'Token #05',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
    notes: 'Hypertension monitoring',
    createdAt: new Date('2026-09-26T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T09:00:00Z').toISOString(),
  },
  {
    id: 'apt-mock-6',
    _id: 'apt-mock-6',
    appointmentId: 'APT-1006',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '9876543210',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Rajesh Kulkarni',
    doctorSpecialization: 'Cardiologist',
    date: defaultToday,
    time: '12:00 PM',
    timeSlot: '12:00 PM',
    tokenNumber: 1,
    token: 'Token #01',
    reason: 'ECG Review & Cardiac Assessment',
    status: 'completed',
    fee: 800,
    notes: 'Completed annual cardiac evaluation',
    createdAt: new Date('2026-09-26T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T12:30:00Z').toISOString(),
  },
  {
    id: 'apt-mock-7',
    _id: 'apt-mock-7',
    appointmentId: 'APT-1007',
    patientId: 'PAT-1002',
    patientName: 'Ananya Patel',
    patientPhone: '9823456781',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Sneha Reddy',
    doctorSpecialization: 'Pediatrician',
    date: defaultToday,
    time: '02:00 PM',
    timeSlot: '02:00 PM',
    tokenNumber: 1,
    token: 'Token #01',
    reason: 'General Pediatric Wellness',
    status: 'completed',
    fee: 600,
    notes: 'Routine checkup completed',
    createdAt: new Date('2026-09-26T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-09-26T14:30:00Z').toISOString(),
  },
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to format token string: e.g. 1 -> "Token #01"
export const formatToken = (num: number): string => {
  return `Token #${num.toString().padStart(2, '0')}`;
};

// Helper to generate sequential Appointment ID: APT-1001, APT-1002, etc.
const generateAppointmentId = async (): Promise<string> => {
  if (isMongoConnected()) {
    const last = await Appointment.findOne().sort({ createdAt: -1 });
    if (!last || !last.appointmentId) {
      return 'APT-1001';
    }
    const match = last.appointmentId.match(/APT-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `APT-${nextNum}`;
    }
    return `APT-${Date.now().toString().slice(-4)}`;
  } else {
    const numbers = inMemoryAppointments
      .map((a) => {
        const m = a.appointmentId.match(/APT-(\d+)/);
        return m ? parseInt(m[1], 10) : 1000;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `APT-${maxNum + 1}`;
  }
};

// Standard available 30-minute time slots
export const STANDARD_TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/appointments/available-slots
// @access  Private (Staff only)
export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, date } = req.query as { doctorId?: string; date?: string };

    if (!doctorId || !date) {
      res.status(400).json({
        success: false,
        message: 'Both doctorId and date query parameters are required.',
      });
      return;
    }

    let bookedSlots: string[] = [];

    if (isMongoConnected()) {
      const existing = await Appointment.find({
        doctorId: doctorId.trim(),
        date: date.trim(),
        status: { $ne: 'cancelled' },
      }).select('time timeSlot');

      bookedSlots = existing.map((a) => a.timeSlot || a.time);
    } else {
      bookedSlots = inMemoryAppointments
        .filter(
          (a) =>
            a.doctorId.toUpperCase() === doctorId.trim().toUpperCase() &&
            a.date === date.trim() &&
            a.status !== 'cancelled'
        )
        .map((a) => a.timeSlot || a.time);
    }

    const availableSlots = STANDARD_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      doctorId,
      date,
      totalSlots: STANDARD_TIME_SLOTS.length,
      availableCount: availableSlots.length,
      bookedSlots,
      availableSlots,
    });
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available slots',
      error: error.message,
    });
  }
};

// @desc    Get all appointments with search & filter
// @route   GET /api/appointments
// @access  Private (Staff only)
export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, date, doctorId, patientId, status } = req.query as {
      search?: string;
      date?: string;
      doctorId?: string;
      patientId?: string;
      status?: string;
    };

    if (isMongoConnected()) {
      const query: any = {};

      if (date && date !== 'all') {
        query.date = date.trim();
      }

      if (doctorId && doctorId !== 'all') {
        query.doctorId = doctorId.trim();
      }

      if (patientId && patientId !== 'all') {
        query.patientId = patientId.trim();
      }

      if (status && status !== 'all') {
        query.status = status.trim();
      }

      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { patientName: regex },
          { doctorName: regex },
          { doctorSpecialization: regex },
          { reason: regex },
          { appointmentId: regex },
          { patientId: regex },
          { doctorId: regex },
        ];
      }

      const appointments = await Appointment.find(query).sort({ date: -1, tokenNumber: 1 });

      // Compute statistics for filtered subset or selected date
      const baseStatQuery: any = {};
      if (date && date !== 'all') baseStatQuery.date = date.trim();
      if (doctorId && doctorId !== 'all') baseStatQuery.doctorId = doctorId.trim();

      const [allCount, confirmedCount, pendingCount, completedCount, cancelledCount, checkedInCount] =
        await Promise.all([
          Appointment.countDocuments(baseStatQuery),
          Appointment.countDocuments({ ...baseStatQuery, status: 'confirmed' }),
          Appointment.countDocuments({ ...baseStatQuery, status: 'pending' }),
          Appointment.countDocuments({ ...baseStatQuery, status: 'completed' }),
          Appointment.countDocuments({ ...baseStatQuery, status: 'cancelled' }),
          Appointment.countDocuments({ ...baseStatQuery, status: 'checked-in' }),
        ]);

      res.status(200).json({
        success: true,
        count: appointments.length,
        stats: {
          all: allCount,
          confirmed: confirmedCount,
          pending: pendingCount,
          completed: completedCount,
          cancelled: cancelledCount,
          checkedIn: checkedInCount,
        },
        appointments,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...inMemoryAppointments];

    if (date && date !== 'all') {
      filtered = filtered.filter((a) => a.date === date.trim());
    }

    if (doctorId && doctorId !== 'all') {
      filtered = filtered.filter(
        (a) => a.doctorId.toUpperCase() === doctorId.trim().toUpperCase()
      );
    }

    if (patientId && patientId !== 'all') {
      filtered = filtered.filter(
        (a) => a.patientId.toUpperCase() === patientId.trim().toUpperCase()
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status.toLowerCase() === status.trim().toLowerCase());
    }

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(term) ||
          a.doctorName.toLowerCase().includes(term) ||
          (a.doctorSpecialization && a.doctorSpecialization.toLowerCase().includes(term)) ||
          a.reason.toLowerCase().includes(term) ||
          a.appointmentId.toLowerCase().includes(term) ||
          a.patientId.toLowerCase().includes(term) ||
          a.doctorId.toLowerCase().includes(term)
      );
    }

    // Calculate stats based on current date/doctor filter
    const baseItems = inMemoryAppointments.filter((a) => {
      if (date && date !== 'all' && a.date !== date.trim()) return false;
      if (doctorId && doctorId !== 'all' && a.doctorId.toUpperCase() !== doctorId.trim().toUpperCase())
        return false;
      return true;
    });

    const stats = {
      all: baseItems.length,
      confirmed: baseItems.filter((a) => a.status === 'confirmed').length,
      pending: baseItems.filter((a) => a.status === 'pending').length,
      completed: baseItems.filter((a) => a.status === 'completed').length,
      cancelled: baseItems.filter((a) => a.status === 'cancelled').length,
      checkedIn: baseItems.filter((a) => a.status === 'checked-in').length,
    };

    res.status(200).json({
      success: true,
      count: filtered.length,
      stats,
      appointments: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

// @desc    Get single appointment by ID or appointmentId
// @route   GET /api/appointments/:id
// @access  Private (Staff only)
export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let appointment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        appointment = await Appointment.findById(id);
      }
      if (!appointment) {
        appointment = await Appointment.findOne({ appointmentId: id.toUpperCase() });
      }

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: `Appointment not found with ID '${id}'`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        appointment,
      });
      return;
    }

    // In-memory
    const appointment = inMemoryAppointments.find(
      (a) =>
        a.id === id ||
        a._id === id ||
        a.appointmentId.toUpperCase() === id.toUpperCase()
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: `Appointment not found with ID '${id}'`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment details',
      error: error.message,
    });
  }
};

// @desc    Book / Schedule a new appointment
// @route   POST /api/appointments
// @access  Private (Staff only)
export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      timeSlot,
      reason,
      status = 'confirmed',
      notes = '',
    } = req.body;

    const chosenTime = (time || timeSlot || '').trim();

    if (!patientId || !doctorId || !date || !chosenTime || !reason) {
      res.status(400).json({
        success: false,
        message: 'Please provide patientId, doctorId, date, time (or timeSlot), and reason.',
      });
      return;
    }

    // Resolve patient details
    let patientName = req.body.patientName || '';
    let patientPhone = req.body.patientPhone || '';
    let patientMongoId: mongoose.Types.ObjectId | undefined;

    if (isMongoConnected()) {
      let patientObj;
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patientObj = await Patient.findById(patientId);
      }
      if (!patientObj) {
        patientObj = await Patient.findOne({ patientId: patientId.toUpperCase() });
      }

      if (patientObj) {
        patientMongoId = patientObj._id as mongoose.Types.ObjectId;
        patientName = `${patientObj.firstName} ${patientObj.lastName}`;
        patientPhone = patientObj.phone || patientPhone;
      }
    }

    if (!patientName) {
      patientName = req.body.patientName || `Patient ${patientId}`;
    }

    // Resolve doctor details
    let doctorName = req.body.doctorName || '';
    let doctorSpecialization = req.body.doctorSpecialization || '';
    let consultationFee = req.body.fee || 0;
    let doctorMongoId: mongoose.Types.ObjectId | undefined;

    if (isMongoConnected()) {
      let doctorObj;
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        doctorObj = await Doctor.findById(doctorId);
      }
      if (!doctorObj) {
        doctorObj = await Doctor.findOne({ doctorId: doctorId.toUpperCase() });
      }

      if (doctorObj) {
        doctorMongoId = doctorObj._id as mongoose.Types.ObjectId;
        doctorName = doctorObj.name;
        doctorSpecialization = doctorObj.specialization || doctorSpecialization;
        consultationFee = doctorObj.consultationFee || consultationFee;
      }
    }

    if (!doctorName) {
      doctorName = req.body.doctorName || `Dr. ${doctorId}`;
    }

    // Check for double booking
    if (isMongoConnected()) {
      const conflict = await Appointment.findOne({
        doctorId: doctorId.trim(),
        date: date.trim(),
        time: chosenTime,
        status: { $ne: 'cancelled' },
      });

      if (conflict) {
        res.status(409).json({
          success: false,
          message: `Doctor ${doctorName} already has an appointment booked at ${chosenTime} on ${date}.`,
        });
        return;
      }
    } else {
      const conflict = inMemoryAppointments.find(
        (a) =>
          a.doctorId.toUpperCase() === doctorId.trim().toUpperCase() &&
          a.date === date.trim() &&
          (a.time === chosenTime || a.timeSlot === chosenTime) &&
          a.status !== 'cancelled'
      );

      if (conflict) {
        res.status(409).json({
          success: false,
          message: `Doctor ${doctorName} already has an appointment booked at ${chosenTime} on ${date}.`,
        });
        return;
      }
    }

    // Calculate sequential token number for this doctor & date
    let tokenNumber = 1;
    if (isMongoConnected()) {
      const countForDay = await Appointment.countDocuments({
        doctorId: doctorId.trim(),
        date: date.trim(),
      });
      tokenNumber = countForDay + 1;
    } else {
      const countForDay = inMemoryAppointments.filter(
        (a) =>
          a.doctorId.toUpperCase() === doctorId.trim().toUpperCase() &&
          a.date === date.trim()
      ).length;
      tokenNumber = countForDay + 1;
    }
    const token = formatToken(tokenNumber);

    const appointmentId = await generateAppointmentId();

    if (isMongoConnected()) {
      const newAppointment = await Appointment.create({
        appointmentId,
        patient: patientMongoId,
        patientId: patientId.trim(),
        patientName,
        patientPhone,
        doctor: doctorMongoId,
        doctorId: doctorId.trim(),
        doctorName,
        doctorSpecialization,
        date: date.trim(),
        time: chosenTime,
        timeSlot: chosenTime,
        tokenNumber,
        token,
        reason: reason.trim(),
        status,
        fee: consultationFee,
        notes: notes ? notes.trim() : '',
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        appointment: newAppointment,
      });
      return;
    }

    // In-memory
    const newAppointment: InMemoryAppointment = {
      id: `apt-${Date.now()}`,
      _id: `apt-${Date.now()}`,
      appointmentId,
      patientId: patientId.trim(),
      patientName,
      patientPhone,
      doctorId: doctorId.trim(),
      doctorName,
      doctorSpecialization,
      date: date.trim(),
      time: chosenTime,
      timeSlot: chosenTime,
      tokenNumber,
      token,
      reason: reason.trim(),
      status,
      fee: consultationFee,
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryAppointments.unshift(newAppointment);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment: newAppointment,
    });
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message,
    });
  }
};

// @desc    Update appointment details
// @route   PATCH /api/appointments/:id
// @access  Private (Staff only)
export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.time && !updates.timeSlot) {
      updates.timeSlot = updates.time;
    } else if (updates.timeSlot && !updates.time) {
      updates.time = updates.timeSlot;
    }

    if (isMongoConnected()) {
      let appointment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        appointment = await Appointment.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        });
      }
      if (!appointment) {
        appointment = await Appointment.findOneAndUpdate(
          { appointmentId: id.toUpperCase() },
          updates,
          { new: true, runValidators: true }
        );
      }

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found to update',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully.',
        appointment,
      });
      return;
    }

    // In-memory
    const index = inMemoryAppointments.findIndex(
      (a) =>
        a.id === id ||
        a._id === id ||
        a.appointmentId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found to update',
      });
      return;
    }

    inMemoryAppointments[index] = {
      ...inMemoryAppointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      appointment: inMemoryAppointments[index],
    });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message,
    });
  }
};

// @desc    Reschedule appointment date & time
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private (Staff only)
export const rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, time, timeSlot, reason } = req.body;

    const newTime = (time || timeSlot || '').trim();

    if (!date || !newTime) {
      res.status(400).json({
        success: false,
        message: 'Please provide both date and time to reschedule.',
      });
      return;
    }

    if (isMongoConnected()) {
      let appointment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        appointment = await Appointment.findById(id);
      }
      if (!appointment) {
        appointment = await Appointment.findOne({ appointmentId: id.toUpperCase() });
      }

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found to reschedule',
        });
        return;
      }

      // Check slot conflict
      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: appointment.doctorId,
        date: date.trim(),
        time: newTime,
        status: { $ne: 'cancelled' },
      });

      if (conflict) {
        res.status(409).json({
          success: false,
          message: `Time slot ${newTime} on ${date} is already booked for Dr. ${appointment.doctorName}.`,
        });
        return;
      }

      // Recalculate token if date changed
      let tokenNumber = appointment.tokenNumber;
      let token = appointment.token;
      if (appointment.date !== date.trim()) {
        const countForDay = await Appointment.countDocuments({
          doctorId: appointment.doctorId,
          date: date.trim(),
        });
        tokenNumber = countForDay + 1;
        token = formatToken(tokenNumber);
      }

      appointment.date = date.trim();
      appointment.time = newTime;
      appointment.timeSlot = newTime;
      appointment.tokenNumber = tokenNumber;
      appointment.token = token;
      if (reason) {
        appointment.notes = appointment.notes
          ? `${appointment.notes}; Rescheduled: ${reason}`
          : `Rescheduled: ${reason}`;
      }
      appointment.status = 'confirmed';

      await appointment.save();

      res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully.',
        appointment,
      });
      return;
    }

    // In-memory
    const index = inMemoryAppointments.findIndex(
      (a) =>
        a.id === id ||
        a._id === id ||
        a.appointmentId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found to reschedule',
      });
      return;
    }

    const current = inMemoryAppointments[index];

    const conflict = inMemoryAppointments.find(
      (a) =>
        a.appointmentId !== current.appointmentId &&
        a.doctorId.toUpperCase() === current.doctorId.toUpperCase() &&
        a.date === date.trim() &&
        (a.time === newTime || a.timeSlot === newTime) &&
        a.status !== 'cancelled'
    );

    if (conflict) {
      res.status(409).json({
        success: false,
        message: `Time slot ${newTime} on ${date} is already booked for Dr. ${current.doctorName}.`,
      });
      return;
    }

    let tokenNumber = current.tokenNumber;
    let token = current.token;
    if (current.date !== date.trim()) {
      const countForDay = inMemoryAppointments.filter(
        (a) =>
          a.doctorId.toUpperCase() === current.doctorId.toUpperCase() &&
          a.date === date.trim()
      ).length;
      tokenNumber = countForDay + 1;
      token = formatToken(tokenNumber);
    }

    inMemoryAppointments[index] = {
      ...current,
      date: date.trim(),
      time: newTime,
      timeSlot: newTime,
      tokenNumber,
      token,
      status: 'confirmed',
      notes: reason
        ? current.notes
          ? `${current.notes}; Rescheduled: ${reason}`
          : `Rescheduled: ${reason}`
        : current.notes,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      appointment: inMemoryAppointments[index],
    });
  } catch (error: any) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: error.message,
    });
  }
};

// @desc    Cancel appointment and release slot
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (Staff only)
export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (isMongoConnected()) {
      let appointment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        appointment = await Appointment.findById(id);
      }
      if (!appointment) {
        appointment = await Appointment.findOne({ appointmentId: id.toUpperCase() });
      }

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found to cancel',
        });
        return;
      }

      appointment.status = 'cancelled';
      if (cancelReason) {
        appointment.cancelReason = cancelReason.trim();
      }

      await appointment.save();

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled and time slot released.',
        appointment,
      });
      return;
    }

    // In-memory
    const index = inMemoryAppointments.findIndex(
      (a) =>
        a.id === id ||
        a._id === id ||
        a.appointmentId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found to cancel',
      });
      return;
    }

    inMemoryAppointments[index] = {
      ...inMemoryAppointments[index],
      status: 'cancelled',
      cancelReason: cancelReason ? cancelReason.trim() : inMemoryAppointments[index].cancelReason,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled and time slot released.',
      appointment: inMemoryAppointments[index],
    });
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message,
    });
  }
};

// @desc    Mark patient as checked-in for consultation
// @route   PATCH /api/appointments/:id/check-in
// @access  Private (Staff only)
export const checkInAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let appointment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        appointment = await Appointment.findById(id);
      }
      if (!appointment) {
        appointment = await Appointment.findOne({ appointmentId: id.toUpperCase() });
      }

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
        return;
      }

      appointment.status = 'checked-in';
      await appointment.save();

      res.status(200).json({
        success: true,
        message: 'Patient checked in successfully.',
        appointment,
      });
      return;
    }

    // In-memory
    const index = inMemoryAppointments.findIndex(
      (a) =>
        a.id === id ||
        a._id === id ||
        a.appointmentId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
      return;
    }

    inMemoryAppointments[index] = {
      ...inMemoryAppointments[index],
      status: 'checked-in',
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Patient checked in successfully.',
      appointment: inMemoryAppointments[index],
    });
  } catch (error: any) {
    console.error('Error checking in patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in appointment',
      error: error.message,
    });
  }
};

// @desc    Delete appointment (admin or receptionist only)
// @route   DELETE /api/appointments/:id
// @access  Private (Admin / Receptionist)
export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await Appointment.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Appointment.findOneAndDelete({ appointmentId: id.toUpperCase() });
      }

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found to delete',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully.',
      });
      return;
    }

    // In-memory
    const index = inMemoryAppointments.findIndex(
      (a) =>
        a.id === id ||
        a._id === id ||
        a.appointmentId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found to delete',
      });
      return;
    }

    inMemoryAppointments.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message,
    });
  }
};
