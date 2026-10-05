import { Response } from 'express';
import mongoose from 'mongoose';
import { Doctor, IDoctor, DoctorStatus } from '../models/Doctor.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

interface InMemoryDoctor {
  id: string;
  _id?: string;
  doctorId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  availableDays: string[];
  availableHours: string;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback if MongoDB is not connected
const inMemoryDoctors: InMemoryDoctor[] = [
  {
    id: 'doc-mock-1',
    _id: 'doc-mock-1',
    doctorId: 'DOC-101',
    name: 'Dr. Priya Sharma',
    email: 'doctor@carehub.com',
    phone: '9876543210',
    specialization: 'General Physician',
    experience: 8,
    consultationFee: 500,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableHours: '09:00-12:00',
    status: 'active',
    createdAt: new Date('2026-01-10T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-01-10T10:30:00Z').toISOString(),
  },
  {
    id: 'doc-mock-2',
    _id: 'doc-mock-2',
    doctorId: 'DOC-102',
    name: 'Dr. Rajesh Kulkarni',
    email: 'rajesh@carehub.com',
    phone: '9812345678',
    specialization: 'Cardiologist',
    experience: 12,
    consultationFee: 800,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableHours: '12:00-15:00',
    status: 'active',
    createdAt: new Date('2026-01-15T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-01-15T10:30:00Z').toISOString(),
  },
  {
    id: 'doc-mock-3',
    _id: 'doc-mock-3',
    doctorId: 'DOC-103',
    name: 'Dr. Sneha Reddy',
    email: 'sneha@carehub.com',
    phone: '9833445566',
    specialization: 'Pediatrician',
    experience: 6,
    consultationFee: 600,
    availableDays: ['Monday', 'Tuesday', 'Friday'],
    availableHours: '09:00-12:00',
    status: 'active',
    createdAt: new Date('2026-02-01T10:30:00Z').toISOString(),
    updatedAt: new Date('2026-02-01T10:30:00Z').toISOString(),
  },
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate sequential Doctor ID: DOC-101, DOC-102, etc.
const generateDoctorId = async (): Promise<string> => {
  if (isMongoConnected()) {
    const lastDoctor = await Doctor.findOne().sort({ createdAt: -1 });
    if (!lastDoctor || !lastDoctor.doctorId) {
      return 'DOC-101';
    }
    const match = lastDoctor.doctorId.match(/DOC-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `DOC-${nextNum}`;
    }
    return `DOC-${Date.now().toString().slice(-3)}`;
  } else {
    const numbers = inMemoryDoctors
      .map((d) => {
        const m = d.doctorId.match(/DOC-(\d+)/);
        return m ? parseInt(m[1], 10) : 100;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 100;
    return `DOC-${maxNum + 1}`;
  }
};

// @desc    Get all doctors with search & filter
// @route   GET /api/doctors
// @access  Private (Staff only)
export const getDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, specialization, status } = req.query as {
      search?: string;
      specialization?: string;
      status?: string;
    };

    if (isMongoConnected()) {
      const query: any = {};

      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: regex },
          { specialization: regex },
          { phone: regex },
          { doctorId: regex },
          { email: regex },
        ];
      }

      if (specialization && specialization !== 'all') {
        query.specialization = new RegExp(`^${specialization}$`, 'i');
      }

      if (status && status !== 'all') {
        query.status = status;
      }

      const doctors = await Doctor.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: doctors.length,
        doctors,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...inMemoryDoctors];

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.specialization.toLowerCase().includes(term) ||
          d.phone.includes(term) ||
          d.doctorId.toLowerCase().includes(term) ||
          (d.email && d.email.toLowerCase().includes(term))
      );
    }

    if (specialization && specialization !== 'all') {
      filtered = filtered.filter(
        (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((d) => d.status === status);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      doctors: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message,
    });
  }
};

// @desc    Get single doctor by ID or doctorId
// @route   GET /api/doctors/:id
// @access  Private (Staff only)
export const getDoctorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let doctor;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doctor = await Doctor.findById(id);
      }
      if (!doctor) {
        doctor = await Doctor.findOne({ doctorId: id.toUpperCase() });
      }

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: `Doctor not found with ID '${id}'`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        doctor,
      });
      return;
    }

    // In-memory
    const doctor = inMemoryDoctors.find(
      (d) => d.id === id || d._id === id || d.doctorId.toUpperCase() === id.toUpperCase()
    );

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: `Doctor not found with ID '${id}'`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: error.message,
    });
  }
};

// @desc    Register a new doctor
// @route   POST /api/doctors
// @access  Private (Admin / Staff)
export const createDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      experience,
      consultationFee,
      availableDays,
      availableHours,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !specialization) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and specialization.',
      });
      return;
    }

    // Normalize availableDays to array if sent as string
    const normalizedDays: string[] = Array.isArray(availableDays)
      ? availableDays
      : availableDays
      ? [availableDays]
      : [];

    const numExperience = Number(experience) || 0;
    const numFee = Number(consultationFee) || 0;

    const doctorId = await generateDoctorId();

    if (isMongoConnected()) {
      const newDoctor = await Doctor.create({
        doctorId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        experience: numExperience,
        consultationFee: numFee,
        availableDays: normalizedDays,
        availableHours: availableHours || '09:00-12:00',
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully.',
        doctor: newDoctor,
      });
      return;
    }

    // In-memory
    const newDoctor: InMemoryDoctor = {
      id: `doc-${Date.now()}`,
      _id: `doc-${Date.now()}`,
      doctorId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      specialization: specialization.trim(),
      experience: numExperience,
      consultationFee: numFee,
      availableDays: normalizedDays,
      availableHours: availableHours || '09:00-12:00',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryDoctors.unshift(newDoctor);

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully.',
      doctor: newDoctor,
    });
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create doctor',
    });
  }
};

// @desc    Update doctor details
// @route   PATCH /api/doctors/:id
// @access  Private (Admin / Staff)
export const updateDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected()) {
      let doctor = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doctor = await Doctor.findById(id);
      }
      if (!doctor) {
        doctor = await Doctor.findOne({ doctorId: id.toUpperCase() });
      }

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: `Doctor not found with ID '${id}'`,
        });
        return;
      }

      Object.assign(doctor, updates);
      await doctor.save();

      res.status(200).json({
        success: true,
        message: 'Doctor details updated successfully.',
        doctor,
      });
      return;
    }

    // In-memory
    const index = inMemoryDoctors.findIndex(
      (d) => d.id === id || d._id === id || d.doctorId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: `Doctor not found with ID '${id}'`,
      });
      return;
    }

    inMemoryDoctors[index] = {
      ...inMemoryDoctors[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Doctor details updated successfully.',
      doctor: inMemoryDoctors[index],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update doctor',
    });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
export const deleteDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let result = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        result = await Doctor.findByIdAndDelete(id);
      }
      if (!result) {
        result = await Doctor.findOneAndDelete({ doctorId: id.toUpperCase() });
      }

      if (!result) {
        res.status(404).json({
          success: false,
          message: `Doctor not found with ID '${id}'`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Doctor deleted successfully.',
      });
      return;
    }

    // In-memory
    const index = inMemoryDoctors.findIndex(
      (d) => d.id === id || d._id === id || d.doctorId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: `Doctor not found with ID '${id}'`,
      });
      return;
    }

    inMemoryDoctors.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete doctor',
    });
  }
};
