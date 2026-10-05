import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  prescriptionId: string;
  consultation?: mongoose.Types.ObjectId;
  consultationId?: string;
  appointment?: mongoose.Types.ObjectId;
  appointmentId?: string;
  patient?: mongoose.Types.ObjectId;
  patientId: string;
  patientName?: string;
  doctor?: mongoose.Types.ObjectId;
  doctorId?: string;
  doctorName?: string;
  medicines: IMedicineItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicineItemSchema = new Schema<IMedicineItem>(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const prescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    consultation: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      required: false,
    },
    consultationId: {
      type: String,
      trim: true,
      default: '',
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
    },
    appointmentId: {
      type: String,
      trim: true,
      default: '',
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
    medicines: {
      type: [medicineItemSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ prescriptionId: 'text', patientId: 'text', consultationId: 'text', appointmentId: 'text' });

export const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
