import { Response } from 'express';
import mongoose from 'mongoose';
import { Prescription, IPrescription, IMedicineItem } from '../models/Prescription.js';
import { Consultation } from '../models/Consultation.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export interface InMemoryPrescription {
  id: string;
  _id?: string;
  prescriptionId: string;
  consultationId?: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicines: IMedicineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const inMemoryPrescriptions: InMemoryPrescription[] = [
  {
    id: 'rx-mock-1',
    _id: 'rx-mock-1',
    prescriptionId: 'RX-1001',
    consultationId: 'CON-1001',
    appointmentId: 'APT-1001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    medicines: [
      {
        name: 'Paracetamol 650mg',
        dosage: '1 tablet',
        frequency: 'Thrice daily after food',
        duration: '5 days',
        instructions: 'Take if temperature exceeds 99°F',
      },
      {
        name: 'Cetirizine 10mg',
        dosage: '1 tablet',
        frequency: 'Once daily at night',
        duration: '3 days',
        instructions: 'May cause mild drowsiness',
      },
    ],
    notes: 'Take medicines after food',
    createdAt: new Date('2026-09-26T14:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-26T14:30:00.000Z').toISOString(),
  },
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate sequential Prescription ID: RX-1001, RX-1002, etc.
export const generatePrescriptionId = async (): Promise<string> => {
  if (isMongoConnected()) {
    const last = await Prescription.findOne().sort({ createdAt: -1 });
    if (!last || !last.prescriptionId) {
      return 'RX-1001';
    }
    const match = last.prescriptionId.match(/RX-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `RX-${nextNum}`;
    }
    return `RX-${Date.now().toString().slice(-4)}`;
  } else {
    const numbers = inMemoryPrescriptions
      .map((p) => {
        const m = p.prescriptionId.match(/RX-(\d+)/);
        return m ? parseInt(m[1], 10) : 1000;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `RX-${maxNum + 1}`;
  }
};

/**
 * @desc    Create prescription
 * @route   POST /api/prescriptions
 * @access  Private (Doctor, Admin)
 */
export const createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      consultationId = '',
      patientId,
      appointmentId = '',
      medicines = [],
      notes = '',
    } = req.body;

    if (!patientId || !Array.isArray(medicines) || medicines.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide patientId and at least one medicine item.',
      });
      return;
    }

    // Validate medicine items
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        res.status(400).json({
          success: false,
          message: 'Each medicine must have name, dosage, frequency, and duration.',
        });
        return;
      }
    }

    const prescriptionId = await generatePrescriptionId();

    // Resolve details
    let patientName = req.body.patientName || '';
    let doctorId = req.body.doctorId || '';
    let doctorName = req.body.doctorName || '';
    let patientMongoId: mongoose.Types.ObjectId | undefined;
    let doctorMongoId: mongoose.Types.ObjectId | undefined;
    let consultationMongoId: mongoose.Types.ObjectId | undefined;
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

      // Find consultation if provided
      if (consultationId) {
        let conObj;
        if (mongoose.Types.ObjectId.isValid(consultationId)) {
          conObj = await Consultation.findById(consultationId);
        }
        if (!conObj) {
          conObj = await Consultation.findOne({ consultationId: consultationId.toUpperCase() });
        }
        if (conObj) {
          consultationMongoId = conObj._id as mongoose.Types.ObjectId;
          if (!patientName) patientName = conObj.patientName || '';
          if (!doctorId) doctorId = conObj.doctorId || '';
          if (!doctorName) doctorName = conObj.doctorName || '';
          if (!appointmentMongoId && conObj.appointment) appointmentMongoId = conObj.appointment;
        }
      }

      // Find appointment if provided
      if (appointmentId && !appointmentMongoId) {
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
        }
      }

      // Doctor fallback from user
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

      const newPrescription = await Prescription.create({
        prescriptionId,
        consultation: consultationMongoId,
        consultationId: consultationId.trim(),
        appointment: appointmentMongoId,
        appointmentId: appointmentId.trim(),
        patient: patientMongoId,
        patientId: patientId.trim(),
        patientName: patientName || `Patient ${patientId}`,
        doctor: doctorMongoId,
        doctorId: doctorId || (req.user?.role === 'doctor' ? 'DOC-101' : ''),
        doctorName: doctorName || req.user?.name || 'Dr. Priya Sharma',
        medicines,
        notes: notes ? notes.trim() : '',
      });

      res.status(201).json({
        success: true,
        message: 'Prescription generated successfully.',
        prescriptionId: newPrescription.prescriptionId,
        prescription: newPrescription,
      });
      return;
    }

    // In-memory fallback
    if (!doctorName && req.user) {
      doctorName = req.user.name;
    }

    const newPrescription: InMemoryPrescription = {
      id: `rx-${Date.now()}`,
      _id: `rx-${Date.now()}`,
      prescriptionId,
      consultationId: consultationId.trim(),
      appointmentId: appointmentId.trim(),
      patientId: patientId.trim(),
      patientName: patientName || `Patient ${patientId}`,
      doctorId: doctorId || 'DOC-101',
      doctorName: doctorName || 'Dr. Priya Sharma',
      medicines,
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryPrescriptions.unshift(newPrescription);

    res.status(201).json({
      success: true,
      message: 'Prescription generated successfully.',
      prescriptionId: newPrescription.prescriptionId,
      prescription: newPrescription,
    });
  } catch (error: any) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create prescription.',
    });
  }
};

/**
 * @desc    View Patient Prescription History
 * @route   GET /api/prescriptions/patient/:patientId
 * @access  Private
 */
export const getPatientPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    if (isMongoConnected()) {
      const prescriptions = await Prescription.find({
        patientId: patientId.toUpperCase(),
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: prescriptions.length,
        prescriptions,
      });
      return;
    }

    // In-memory fallback
    const filtered = inMemoryPrescriptions.filter(
      (p) => p.patientId.toUpperCase() === patientId.trim().toUpperCase()
    );

    res.status(200).json({
      success: true,
      count: filtered.length,
      prescriptions: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve prescription history.',
    });
  }
};

/**
 * @desc    Get all prescriptions with filters
 * @route   GET /api/prescriptions
 * @access  Private
 */
export const getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId, consultationId, appointmentId, search } = req.query as {
      patientId?: string;
      doctorId?: string;
      consultationId?: string;
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
      if (consultationId) {
        query.consultationId = consultationId.trim();
      }
      if (appointmentId) {
        query.appointmentId = appointmentId.trim();
      }
      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { prescriptionId: regex },
          { patientId: regex },
          { patientName: regex },
          { doctorName: regex },
          { 'medicines.name': regex },
        ];
      }

      const prescriptions = await Prescription.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: prescriptions.length,
        prescriptions,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...inMemoryPrescriptions];

    if (patientId) {
      filtered = filtered.filter((p) => p.patientId.toUpperCase() === patientId.trim().toUpperCase());
    }
    if (doctorId) {
      filtered = filtered.filter((p) => p.doctorId.toUpperCase() === doctorId.trim().toUpperCase());
    }
    if (consultationId) {
      filtered = filtered.filter((p) => (p.consultationId || '').toUpperCase() === consultationId.trim().toUpperCase());
    }
    if (appointmentId) {
      filtered = filtered.filter((p) => (p.appointmentId || '').toUpperCase() === appointmentId.trim().toUpperCase());
    }
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.prescriptionId.toLowerCase().includes(term) ||
          p.patientId.toLowerCase().includes(term) ||
          p.patientName.toLowerCase().includes(term) ||
          p.doctorName.toLowerCase().includes(term) ||
          p.medicines.some((m) => m.name.toLowerCase().includes(term))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      prescriptions: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve prescriptions.',
    });
  }
};

/**
 * @desc    Get single prescription by ID or prescriptionId
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
export const getPrescriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let prescription;
      if (mongoose.Types.ObjectId.isValid(id)) {
        prescription = await Prescription.findById(id);
      }
      if (!prescription) {
        prescription = await Prescription.findOne({ prescriptionId: id.toUpperCase() });
      }

      if (!prescription) {
        res.status(404).json({
          success: false,
          message: `Prescription with ID '${id}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        prescription,
      });
      return;
    }

    const found = inMemoryPrescriptions.find(
      (p) =>
        p.id === id ||
        p._id === id ||
        p.prescriptionId.toUpperCase() === id.toUpperCase()
    );

    if (!found) {
      res.status(404).json({
        success: false,
        message: `Prescription with ID '${id}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      prescription: found,
    });
  } catch (error: any) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve prescription.',
    });
  }
};

/**
 * @desc    Get prescription for a specific consultation
 * @route   GET /api/prescriptions/consultation/:consultationId
 * @access  Private
 */
export const getPrescriptionByConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { consultationId } = req.params;

    if (isMongoConnected()) {
      const prescription = await Prescription.findOne({
        consultationId: consultationId.toUpperCase(),
      });

      if (!prescription) {
        res.status(404).json({
          success: false,
          message: `Prescription for consultation '${consultationId}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        prescription,
      });
      return;
    }

    const found = inMemoryPrescriptions.find(
      (p) => (p.consultationId || '').toUpperCase() === consultationId.trim().toUpperCase()
    );

    if (!found) {
      res.status(404).json({
        success: false,
        message: `Prescription for consultation '${consultationId}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      prescription: found,
    });
  } catch (error: any) {
    console.error('Error fetching consultation prescription:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve prescription.',
    });
  }
};
