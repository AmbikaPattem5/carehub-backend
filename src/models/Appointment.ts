import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'checked-in';

export interface IAppointment extends Document {
  appointmentId: string;
  patient?: mongoose.Types.ObjectId;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctor?: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: false,
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      trim: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
      default: '',
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: false,
    },
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
      trim: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    doctorSpecialization: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      trim: true,
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required (e.g. 09:30 AM)'],
      trim: true,
    },
    timeSlot: {
      type: String,
      trim: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    token: {
      type: String,
      required: true,
      default: 'Token #01',
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'checked-in'],
      default: 'confirmed',
      index: true,
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    cancelReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for fast lookups
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({
  appointmentId: 'text',
  patientName: 'text',
  doctorName: 'text',
  reason: 'text',
});

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
