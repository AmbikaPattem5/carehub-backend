import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { Bill } from '../models/Bill.js';
import { Consultation } from '../models/Consultation.js';
import { Prescription } from '../models/Prescription.js';

dotenv.config();

const defaultUsers = [
  {
    name: 'Admin User',
    email: 'admin@carehub.com',
    password: 'password123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'doctor@carehub.com',
    password: 'password123',
    role: 'doctor',
    status: 'active',
  },
  {
    name: 'Reception Desk',
    email: 'reception@carehub.com',
    password: 'password123',
    role: 'receptionist',
    status: 'active',
  },
];

const defaultDoctors = [
  {
    doctorId: 'DOC-101',
    name: 'Dr. Priya Sharma',
    email: 'doctor@carehub.com',
    phone: '9876543210',
    specialization: 'General Medicine',
    experience: 8,
    consultationFee: 500,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableHours: '09:00-12:00',
    status: 'active',
  },
  {
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
  },
  {
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
  },
];

const defaultPatients = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

const todayDate = new Date().toISOString().split('T')[0];

const defaultAppointments = [
  {
    appointmentId: 'APT-1001',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '9876543210',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: todayDate,
    time: '09:00 AM',
    timeSlot: '09:00 AM',
    tokenNumber: 1,
    token: 'Token #01',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
  },
  {
    appointmentId: 'APT-1002',
    patientId: 'PAT-1002',
    patientName: 'Ananya Patel',
    patientPhone: '9823456781',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: todayDate,
    time: '09:30 AM',
    timeSlot: '09:30 AM',
    tokenNumber: 2,
    token: 'Token #02',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
  },
  {
    appointmentId: 'APT-1003',
    patientId: 'PAT-1003',
    patientName: 'Rohan Verma',
    patientPhone: '9711223344',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: todayDate,
    time: '10:00 AM',
    timeSlot: '10:00 AM',
    tokenNumber: 3,
    token: 'Token #03',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
  },
  {
    appointmentId: 'APT-1004',
    patientId: 'PAT-1004',
    patientName: 'Meera Nair',
    patientPhone: '9944556677',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: todayDate,
    time: '10:30 AM',
    timeSlot: '10:30 AM',
    tokenNumber: 4,
    token: 'Token #04',
    reason: 'Blood Pressure Checkup',
    status: 'pending',
    fee: 500,
  },
  {
    appointmentId: 'APT-1005',
    patientId: 'PAT-1005',
    patientName: 'Vikram Reddy',
    patientPhone: '9123456789',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'General Medicine',
    date: todayDate,
    time: '11:00 AM',
    timeSlot: '11:00 AM',
    tokenNumber: 5,
    token: 'Token #05',
    reason: 'Blood Pressure Checkup',
    status: 'confirmed',
    fee: 500,
  },
  {
    appointmentId: 'APT-1006',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '9876543210',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Rajesh Kulkarni',
    doctorSpecialization: 'Cardiologist',
    date: todayDate,
    time: '12:00 PM',
    timeSlot: '12:00 PM',
    tokenNumber: 1,
    token: 'Token #01',
    reason: 'ECG Review & Cardiac Assessment',
    status: 'completed',
    fee: 800,
  },
  {
    appointmentId: 'APT-1007',
    patientId: 'PAT-1002',
    patientName: 'Ananya Patel',
    patientPhone: '9823456781',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Sneha Reddy',
    doctorSpecialization: 'Pediatrician',
    date: todayDate,
    time: '02:00 PM',
    timeSlot: '02:00 PM',
    tokenNumber: 1,
    token: 'Token #01',
    reason: 'General Pediatric Wellness',
    status: 'completed',
    fee: 600,
  },
];

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carehub';
  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Remove existing seed users
    await User.deleteMany({
      email: { $in: defaultUsers.map((u) => u.email) },
    });

    for (const u of defaultUsers) {
      await User.create(u);
    }

    // Doctors
    await Doctor.deleteMany({
      doctorId: { $in: defaultDoctors.map((d) => d.doctorId) },
    });

    for (const d of defaultDoctors) {
      await Doctor.create(d);
    }

    // Patients
    await Patient.deleteMany({
      patientId: { $in: defaultPatients.map((p) => p.patientId) },
    });

    for (const p of defaultPatients) {
      await Patient.create(p);
    }

    // Appointments
    await Appointment.deleteMany({
      appointmentId: { $in: defaultAppointments.map((a) => a.appointmentId) },
    });

    for (const a of defaultAppointments) {
      await Appointment.create(a);
    }

    // Bills & Invoices
    const defaultBills = [
      {
        billId: 'INV-1001',
        patientId: 'PAT-1001',
        patientName: 'Aarav Sharma',
        patientPhone: '9876543210',
        appointmentId: 'APT-1001',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Priya Sharma',
        items: [
          { description: 'Doctor Consultation Fee', amount: 500, quantity: 1, unitPrice: 500 },
          { description: 'BP Check & Vitals Monitoring', amount: 150, quantity: 1, unitPrice: 150 },
        ],
        itemsSummary: 'Consultation + BP Check',
        subtotal: 650,
        discount: 50,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 600,
        amountPaid: 600,
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        transactionRef: 'UPI/20260926/98765432',
        paidAt: new Date(),
        notes: 'Payment received via GPay UPI',
        createdBy: 'Admin User',
      },
      {
        billId: 'INV-1002',
        patientId: 'PAT-1002',
        patientName: 'Priya Singh',
        patientPhone: '9823456781',
        appointmentId: 'APT-1002',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Priya Sharma',
        items: [
          { description: 'Full Body Comprehensive Checkup', amount: 1250, quantity: 1, unitPrice: 1250 },
        ],
        itemsSummary: 'Full Body Checkup',
        subtotal: 1250,
        discount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 1250,
        amountPaid: 0,
        paymentStatus: 'pending',
        notes: 'Awaiting counter settlement',
        createdBy: 'Reception Desk',
      },
      {
        billId: 'INV-1003',
        patientId: 'PAT-1003',
        patientName: 'Rohan Verma',
        patientPhone: '9711223344',
        appointmentId: 'APT-1003',
        doctorId: 'DOC-102',
        doctorName: 'Dr. Rajesh Kulkarni',
        items: [
          { description: 'Cardiology Specialist Consultation', amount: 800, quantity: 1, unitPrice: 800 },
          { description: '12-Lead Resting ECG', amount: 400, quantity: 1, unitPrice: 400 },
        ],
        itemsSummary: 'Cardiology Consultation + ECG',
        subtotal: 1200,
        discount: 100,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 1100,
        amountPaid: 1100,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        transactionRef: 'TXN-CRD-88231',
        paidAt: new Date(),
        notes: 'Settled via HDFC POS card machine',
        createdBy: 'Reception Desk',
      },
      {
        billId: 'INV-1004',
        patientId: 'PAT-1004',
        patientName: 'Meera Nair',
        patientPhone: '9944556677',
        appointmentId: 'APT-1004',
        doctorId: 'DOC-103',
        doctorName: 'Dr. Sneha Reddy',
        items: [
          { description: 'Pediatric Wellness Consultation', amount: 600, quantity: 1, unitPrice: 600 },
        ],
        itemsSummary: 'Pediatric Consultation',
        subtotal: 600,
        discount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 600,
        amountPaid: 600,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        paidAt: new Date(),
        notes: 'Paid at desk counter in cash',
        createdBy: 'Reception Desk',
      },
      {
        billId: 'INV-1005',
        patientId: 'PAT-1005',
        patientName: 'Vikram Reddy',
        patientPhone: '9123456789',
        appointmentId: 'APT-1005',
        doctorId: 'DOC-102',
        doctorName: 'Dr. Rajesh Kulkarni',
        items: [
          { description: 'Orthopedic Consultation', amount: 700, quantity: 1, unitPrice: 700 },
          { description: 'Digital X-Ray Knee (AP/LAT)', amount: 800, quantity: 1, unitPrice: 800 },
        ],
        itemsSummary: 'Orthopedic Consultation + X-Ray',
        subtotal: 1500,
        discount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 1500,
        amountPaid: 0,
        paymentStatus: 'pending',
        notes: 'Insurance verification pending',
        createdBy: 'Reception Desk',
      },
    ];

    await Bill.deleteMany({
      billId: { $in: defaultBills.map((b) => b.billId) },
    });

    for (const b of defaultBills) {
      await Bill.create(b);
    }

    const defaultConsultations = [
      {
        consultationId: 'CON-1001',
        appointmentId: 'APT-1001',
        patientId: 'PAT-1001',
        patientName: 'Aarav Sharma',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Priya Sharma',
        symptoms: ['Mild fever', 'Headache', 'Sore throat'],
        diagnosis: 'Viral Upper Respiratory Infection',
        doctorNotes: 'Patient advised rest for 3 days and adequate hydration.',
      },
    ];

    await Consultation.deleteMany({
      consultationId: { $in: defaultConsultations.map((c) => c.consultationId) },
    });

    for (const c of defaultConsultations) {
      await Consultation.create(c);
    }

    const defaultPrescriptions = [
      {
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
      },
    ];

    await Prescription.deleteMany({
      prescriptionId: { $in: defaultPrescriptions.map((p) => p.prescriptionId) },
    });

    for (const p of defaultPrescriptions) {
      await Prescription.create(p);
    }

    console.log('✅ Seed successful! Default test credentials:');
    console.log('----------------------------------------------------');
    console.log('👑 Admin:        admin@carehub.com      / password123');
    console.log('🩺 Doctor:       doctor@carehub.com     / password123');
    console.log('📋 Receptionist: reception@carehub.com  / password123');
    console.log('🩺 Doctors:      3 doctors seeded (DOC-101 to DOC-103)');
    console.log('👥 Patients:     5 sample patients seeded (PAT-1001 to PAT-1005)');
    console.log('📅 Appointments: 7 sample appointments seeded (APT-1001 to APT-1007)');
    console.log('🧾 Bills:        5 sample invoices seeded (INV-1001 to INV-1005)');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
