import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Patient, IPatient, Gender, BloodGroup, PatientStatus } from '../models/Patient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

interface InMemoryPatient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: BloodGroup;
  emergencyContact?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

// In-memory store used as fallback in development if MongoDB is not connected
const inMemoryPatients: InMemoryPatient[] = [
  {
    id: 'pat-mock-1',
    patientId: 'PAT-1001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dateOfBirth: '1988-04-15',
    gender: 'male',
    phone: '9876543210',
    email: 'aarav.sharma@example.com',
    address: 'Flat 402, Lotus Heights, Bengaluru',
    bloodGroup: 'O+',
    emergencyContact: '9876543219 (Spouse)',
    status: 'active',
    createdAt: new Date('2026-01-10T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-01-10T10:30:00Z').toISOString(),
  },
  {
    id: 'pat-mock-2',
    patientId: 'PAT-1002',
    firstName: 'Ananya',
    lastName: 'Patel',
    dateOfBirth: '1995-08-22',
    gender: 'female',
    phone: '9823456781',
    email: 'ananya.p@example.com',
    address: '12 Green Avenue, Indiranagar, Bengaluru',
    bloodGroup: 'B+',
    emergencyContact: '9823456780 (Father)',
    status: 'active',
    createdAt: new Date('2026-02-01T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-02-01T09:15:00Z').toISOString(),
  },
  {
    id: 'pat-mock-3',
    patientId: 'PAT-1003',
    firstName: 'Rohan',
    lastName: 'Verma',
    dateOfBirth: '1976-11-03',
    gender: 'male',
    phone: '9711223344',
    email: 'rohan.v@example.com',
    address: 'Sector 4, HSR Layout, Bengaluru',
    bloodGroup: 'A+',
    emergencyContact: '9711223355 (Brother)',
    status: 'active',
    createdAt: new Date('2026-02-14T11:45:00Z').toISOString(),
    updatedAt: new Date('2026-02-14T11:45:00Z').toISOString(),
  },
  {
    id: 'pat-mock-4',
    patientId: 'PAT-1004',
    firstName: 'Meera',
    lastName: 'Nair',
    dateOfBirth: '2001-02-19',
    gender: 'female',
    phone: '9944556677',
    email: 'meera.nair@example.com',
    address: '77 Lakeview Road, Koramangala, Bengaluru',
    bloodGroup: 'AB+',
    emergencyContact: '9944556688 (Mother)',
    status: 'active',
    createdAt: new Date('2026-03-05T14:20:00Z').toISOString(),
    updatedAt: new Date('2026-03-05T14:20:00Z').toISOString(),
  },
  {
    id: 'pat-mock-5',
    patientId: 'PAT-1005',
    firstName: 'Vikram',
    lastName: 'Reddy',
    dateOfBirth: '1965-07-30',
    gender: 'male',
    phone: '9123456789',
    email: 'vikram.reddy@example.com',
    address: 'Plot 88, Whitefield, Bengaluru',
    bloodGroup: 'O-',
    emergencyContact: '9123456780 (Son)',
    status: 'inactive',
    createdAt: new Date('2026-03-12T16:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-12T16:00:00Z').toISOString(),
  },
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate sequential Patient ID: PAT-1001, PAT-1002, etc.
const generatePatientId = async (): Promise<string> => {
  if (isMongoConnected()) {
    const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
    if (!lastPatient || !lastPatient.patientId) {
      return 'PAT-1001';
    }
    const match = lastPatient.patientId.match(/PAT-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `PAT-${nextNum}`;
    }
    return `PAT-${Date.now().toString().slice(-4)}`;
  } else {
    const numbers = inMemoryPatients
      .map((p) => {
        const m = p.patientId.match(/PAT-(\d+)/);
        return m ? parseInt(m[1], 10) : 1000;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `PAT-${maxNum + 1}`;
  }
};

// @desc    Get all patients with search & filter
// @route   GET /api/patients
// @access  Private (Staff only)
export const getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, gender, status } = req.query as {
      search?: string;
      gender?: string;
      status?: string;
    };

    if (isMongoConnected()) {
      const query: any = {};

      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { patientId: regex },
          { email: regex },
        ];
      }

      if (gender && gender !== 'all') {
        query.gender = gender;
      }

      if (status && status !== 'all') {
        query.status = status;
      }

      const patients = await Patient.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: patients.length,
        patients,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...inMemoryPatients];

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(term) ||
          p.lastName.toLowerCase().includes(term) ||
          p.phone.includes(term) ||
          p.patientId.toLowerCase().includes(term) ||
          (p.email && p.email.toLowerCase().includes(term))
      );
    }

    if (gender && gender !== 'all') {
      filtered = filtered.filter((p) => p.gender === gender);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      patients: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message,
    });
  }
};

// @desc    Get single patient by ID or patientId
// @route   GET /api/patients/:id
// @access  Private (Staff only)
export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let patient;
      if (mongoose.Types.ObjectId.isValid(id)) {
        patient = await Patient.findById(id);
      }
      if (!patient) {
        patient = await Patient.findOne({ patientId: id.toUpperCase() });
      }

      if (!patient) {
        res.status(404).json({
          success: false,
          message: `Patient not found with ID '${id}'`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        patient,
      });
      return;
    }

    // In-memory
    const patient = inMemoryPatients.find(
      (p) => p.id === id || p.patientId.toUpperCase() === id.toUpperCase()
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        message: `Patient not found with ID '${id}'`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details',
      error: error.message,
    });
  }
};

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private (Staff only)
export const createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      emergencyContact,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !phone) {
      res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, dateOfBirth, gender, and phone.',
      });
      return;
    }

    const patientId = await generatePatientId();

    if (isMongoConnected()) {
      const newPatient = await Patient.create({
        patientId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : '',
        address: address ? address.trim() : '',
        bloodGroup: bloodGroup || 'Unknown',
        emergencyContact: emergencyContact ? emergencyContact.trim() : '',
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully.',
        patient: newPatient,
      });
      return;
    }

    // In-memory
    const newPatient: InMemoryPatient = {
      id: `pat-${Date.now()}`,
      patientId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      address: address ? address.trim() : '',
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: emergencyContact ? emergencyContact.trim() : '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryPatients.unshift(newPatient);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      patient: newPatient,
    });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
      error: error.message,
    });
  }
};

// @desc    Update patient details
// @route   PATCH /api/patients/:id
// @access  Private (Staff only)
export const updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected()) {
      let patient;
      if (mongoose.Types.ObjectId.isValid(id)) {
        patient = await Patient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      }
      if (!patient) {
        patient = await Patient.findOneAndUpdate({ patientId: id.toUpperCase() }, updates, {
          new: true,
          runValidators: true,
        });
      }

      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found to update',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Patient updated successfully.',
        patient,
      });
      return;
    }

    // In-memory
    const index = inMemoryPatients.findIndex(
      (p) => p.id === id || p.patientId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Patient not found to update',
      });
      return;
    }

    inMemoryPatients[index] = {
      ...inMemoryPatients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully.',
      patient: inMemoryPatients[index],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update patient',
      error: error.message,
    });
  }
};

// @desc    Delete patient (or mark inactive)
// @route   DELETE /api/patients/:id
// @access  Private (Admin or Receptionist only)
export const deletePatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let patient;
      if (mongoose.Types.ObjectId.isValid(id)) {
        patient = await Patient.findByIdAndDelete(id);
      }
      if (!patient) {
        patient = await Patient.findOneAndDelete({ patientId: id.toUpperCase() });
      }

      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found to delete',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Patient deleted successfully.',
      });
      return;
    }

    // In-memory
    const index = inMemoryPatients.findIndex(
      (p) => p.id === id || p.patientId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: 'Patient not found to delete',
      });
      return;
    }

    inMemoryPatients.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message,
    });
  }
};
