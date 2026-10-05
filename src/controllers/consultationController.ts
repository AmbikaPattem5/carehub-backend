import { Response } from 'express';
import mongoose from 'mongoose';
import { Consultation, IConsultation } from '../models/Consultation.js';
import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Prescription, IMedicineItem } from '../models/Prescription.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { inMemoryAppointments } from './appointmentController.js';

export interface InMemoryConsultation {
  id: string;
  _id?: string;
  consultationId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  symptoms: string[];
  diagnosis: string;
  doctorNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const inMemoryConsultations: InMemoryConsultation[] = [
  {
    id: 'con-mock-1',
    _id: 'con-mock-1',
    consultationId: 'CON-1001',
    appointmentId: 'APT-1001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    symptoms: ['Mild fever', 'Headache', 'Sore throat'],
    diagnosis: 'Viral Upper Respiratory Infection',
    doctorNotes: 'Patient advised rest for 3 days and adequate hydration.',
    createdAt: new Date('2026-09-26T14:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-26T14:30:00.000Z').toISOString(),
  },
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate sequential Consultation ID: CON-1001, CON-1002, etc.
export const generateConsultationId = async (): Promise<string> => {
  if (isMongoConnected()) {
    const last = await Consultation.findOne().sort({ createdAt: -1 });
    if (!last || !last.consultationId) {
      return 'CON-1001';
    }
    const match = last.consultationId.match(/CON-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `CON-${nextNum}`;
    }
    return `CON-${Date.now().toString().slice(-4)}`;
  } else {
    const numbers = inMemoryConsultations
      .map((c) => {
        const m = c.consultationId.match(/CON-(\d+)/);
        return m ? parseInt(m[1], 10) : 1000;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `CON-${maxNum + 1}`;
  }
};

/**
 * @desc    Save consultation notes
 * @route   POST /api/consultations
 * @access  Private (Doctor, Admin)
 */
export const saveConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      appointmentId,
      patientId,
      symptoms = [],
      diagnosis,
      doctorNotes = '',
      medicines = [],
    } = req.body;

    if (!appointmentId || !patientId || !diagnosis) {
      res.status(400).json({
        success: false,
        message: 'Please provide appointmentId, patientId, and diagnosis.',
      });
      return;
    }

    const consultationId = await generateConsultationId();

    // Resolve patient details
    let patientName = req.body.patientName || '';
    let patientMongoId: mongoose.Types.ObjectId | undefined;

    // Resolve doctor details
    let doctorId = req.body.doctorId || '';
    let doctorName = req.body.doctorName || '';
    let doctorMongoId: mongoose.Types.ObjectId | undefined;
    let appointmentMongoId: mongoose.Types.ObjectId | undefined;

    if (isMongoConnected()) {
      // Find patient
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
      }

      // Find appointment
      let appObj;
      if (mongoose.Types.ObjectId.isValid(appointmentId)) {
        appObj = await Appointment.findById(appointmentId);
      }
      if (!appObj) {
        appObj = await Appointment.findOne({ appointmentId: appointmentId.toUpperCase() });
      }
      if (appObj) {
        appointmentMongoId = appObj._id as mongoose.Types.ObjectId;
        if (!patientName) patientName = appObj.patientName;
        if (!doctorId) doctorId = appObj.doctorId;
        if (!doctorName) doctorName = appObj.doctorName;
        if (appObj.doctor) doctorMongoId = appObj.doctor;

        // Auto mark appointment as completed upon consultation
        appObj.status = 'completed';
        if (!appObj.notes) {
          appObj.notes = 'Consultation concluded successfully';
        }
        await appObj.save();
      }

      // If doctor not resolved yet, check logged-in user or doctor collection
      if (!doctorName && req.user) {
        doctorName = req.user.name;
        if (req.user.role === 'doctor') {
          const doc = await Doctor.findOne({ email: req.user.email });
          if (doc) {
            doctorId = doc.doctorId;
            doctorMongoId = doc._id as mongoose.Types.ObjectId;
          }
        }
      }

      const newConsultation = await Consultation.create({
        consultationId,
        appointment: appointmentMongoId,
        appointmentId: appointmentId.trim(),
        patient: patientMongoId,
        patientId: patientId.trim(),
        patientName: patientName || `Patient ${patientId}`,
        doctor: doctorMongoId,
        doctorId: doctorId || (req.user?.role === 'doctor' ? 'DOC-101' : ''),
        doctorName: doctorName || req.user?.name || 'Dr. Priya Sharma',
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        diagnosis: diagnosis.trim(),
        doctorNotes: doctorNotes ? doctorNotes.trim() : '',
      });

      // If medicines are provided with consultation, create linked prescription
      let prescriptionId: string | undefined;
      if (Array.isArray(medicines) && medicines.length > 0) {
        const count = await Prescription.countDocuments();
        prescriptionId = `RX-${1001 + count}`;
        await Prescription.create({
          prescriptionId,
          consultation: newConsultation._id,
          consultationId: newConsultation.consultationId,
          appointment: appointmentMongoId,
          appointmentId: appointmentId.trim(),
          patient: patientMongoId,
          patientId: patientId.trim(),
          patientName: newConsultation.patientName,
          doctor: doctorMongoId,
          doctorId: newConsultation.doctorId,
          doctorName: newConsultation.doctorName,
          medicines,
          notes: doctorNotes,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Consultation saved successfully.',
        consultationId: newConsultation.consultationId,
        prescriptionId,
        consultation: newConsultation,
      });
      return;
    }

    // In-memory fallback
    // Try to find appointment in in-memory list
    const memApp = inMemoryAppointments.find(
      (a) =>
        a.appointmentId.toUpperCase() === appointmentId.trim().toUpperCase() ||
        a.id === appointmentId ||
        a._id === appointmentId
    );
    if (memApp) {
      memApp.status = 'completed';
      if (!patientName) patientName = memApp.patientName;
      if (!doctorId) doctorId = memApp.doctorId;
      if (!doctorName) doctorName = memApp.doctorName;
    }

    if (!doctorName && req.user) {
      doctorName = req.user.name;
    }

    const newConsultation: InMemoryConsultation = {
      id: `con-${Date.now()}`,
      _id: `con-${Date.now()}`,
      consultationId,
      appointmentId: appointmentId.trim(),
      patientId: patientId.trim(),
      patientName: patientName || `Patient ${patientId}`,
      doctorId: doctorId || 'DOC-101',
      doctorName: doctorName || 'Dr. Priya Sharma',
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      diagnosis: diagnosis.trim(),
      doctorNotes: doctorNotes ? doctorNotes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryConsultations.unshift(newConsultation);

    res.status(201).json({
      success: true,
      message: 'Consultation saved successfully.',
      consultationId: newConsultation.consultationId,
      consultation: newConsultation,
    });
  } catch (error: any) {
    console.error('Error saving consultation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save consultation notes.',
    });
  }
};

/**
 * @desc    Get all consultations with search & filter
 * @route   GET /api/consultations
 * @access  Private
 */
export const getConsultations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId, appointmentId, search } = req.query as {
      patientId?: string;
      doctorId?: string;
      appointmentId?: string;
      search?: string;
    };

    if (isMongoConnected()) {
      const query: any = {};

      if (patientId) {
        query.patientId = patientId.trim();
      }
      if (doctorId) {
        query.doctorId = doctorId.trim();
      }
      if (appointmentId) {
        query.appointmentId = appointmentId.trim();
      }
      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { consultationId: regex },
          { patientId: regex },
          { patientName: regex },
          { diagnosis: regex },
          { doctorNotes: regex },
        ];
      }

      const consultations = await Consultation.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: consultations.length,
        consultations,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...inMemoryConsultations];

    if (patientId) {
      filtered = filtered.filter((c) => c.patientId.toUpperCase() === patientId.trim().toUpperCase());
    }
    if (doctorId) {
      filtered = filtered.filter((c) => c.doctorId.toUpperCase() === doctorId.trim().toUpperCase());
    }
    if (appointmentId) {
      filtered = filtered.filter((c) => c.appointmentId.toUpperCase() === appointmentId.trim().toUpperCase());
    }
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.consultationId.toLowerCase().includes(term) ||
          c.patientId.toLowerCase().includes(term) ||
          c.patientName.toLowerCase().includes(term) ||
          c.diagnosis.toLowerCase().includes(term) ||
          c.doctorNotes.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      consultations: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve consultations.',
    });
  }
};

/**
 * @desc    Get single consultation by ID or consultationId
 * @route   GET /api/consultations/:id
 * @access  Private
 */
export const getConsultationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let consultation;
      if (mongoose.Types.ObjectId.isValid(id)) {
        consultation = await Consultation.findById(id);
      }
      if (!consultation) {
        consultation = await Consultation.findOne({ consultationId: id.toUpperCase() });
      }

      if (!consultation) {
        res.status(404).json({
          success: false,
          message: `Consultation with ID '${id}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        consultation,
      });
      return;
    }

    // In-memory fallback
    const found = inMemoryConsultations.find(
      (c) =>
        c.id === id ||
        c._id === id ||
        c.consultationId.toUpperCase() === id.toUpperCase()
    );

    if (!found) {
      res.status(404).json({
        success: false,
        message: `Consultation with ID '${id}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      consultation: found,
    });
  } catch (error: any) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve consultation details.',
    });
  }
};

/**
 * @desc    Get consultations for a specific patient
 * @route   GET /api/consultations/patient/:patientId
 * @access  Private
 */
export const getConsultationsByPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    if (isMongoConnected()) {
      const consultations = await Consultation.find({
        patientId: patientId.toUpperCase(),
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: consultations.length,
        consultations,
      });
      return;
    }

    const filtered = inMemoryConsultations.filter(
      (c) => c.patientId.toUpperCase() === patientId.trim().toUpperCase()
    );

    res.status(200).json({
      success: true,
      count: filtered.length,
      consultations: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve patient consultations.',
    });
  }
};

/**
 * @desc    Get consultation for a specific appointment
 * @route   GET /api/consultations/appointment/:appointmentId
 * @access  Private
 */
export const getConsultationByAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;

    if (isMongoConnected()) {
      const consultation = await Consultation.findOne({
        appointmentId: appointmentId.toUpperCase(),
      });

      if (!consultation) {
        res.status(404).json({
          success: false,
          message: `Consultation for appointment '${appointmentId}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        consultation,
      });
      return;
    }

    const found = inMemoryConsultations.find(
      (c) => c.appointmentId.toUpperCase() === appointmentId.trim().toUpperCase()
    );

    if (!found) {
      res.status(404).json({
        success: false,
        message: `Consultation for appointment '${appointmentId}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      consultation: found,
    });
  } catch (error: any) {
    console.error('Error fetching appointment consultation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve consultation.',
    });
  }
};
