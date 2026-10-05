import mongoose, { Document, Schema } from 'mongoose';

export type DoctorStatus = 'active' | 'inactive';

export interface IDoctor extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    doctorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Doctor email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Doctor phone is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },
    availableDays: {
      type: [String],
      required: [true, 'Available days are required'],
      default: [],
    },
    availableHours: {
      type: String,
      required: [true, 'Available hours are required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ name: 'text', specialization: 'text', doctorId: 'text' });

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
