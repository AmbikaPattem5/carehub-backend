import mongoose, { Document, Schema } from 'mongoose';

export interface IConsultation extends Document {
  consultationId: string;
  appointment?: mongoose.Types.ObjectId;
  appointmentId: string;
  patient?: mongoose.Types.ObjectId;
  patientId: string;
  patientName?: string;
  doctor?: mongoose.Types.ObjectId;
  doctorId?: string;
  doctorName?: string;
  symptoms: string[];
  diagnosis: string;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<IConsultation>(
  {
    consultationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
    },
    appointmentId: {
      type: String,
      required: [true, 'Appointment ID is required'],
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
      trim: true,
      default: '',
    },
    doctorName: {
      type: String,
      trim: true,
      default: '',
    },
    symptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    doctorNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

consultationSchema.index({ consultationId: 'text', patientId: 'text', appointmentId: 'text', diagnosis: 'text' });

export const Consultation = mongoose.model<IConsultation>('Consultation', consultationSchema);
