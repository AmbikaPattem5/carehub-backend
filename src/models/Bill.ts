import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'partially-paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'insurance' | 'other' | '';

export interface IBillItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface IBill extends Document {
  billId: string;
  patient?: mongoose.Types.ObjectId;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  appointment?: mongoose.Types.ObjectId;
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  items: IBillItem[];
  itemsSummary: string;
  subtotal: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  paidAt?: Date;
  notes?: string;
  cancelReason?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const billItemSchema = new Schema<IBillItem>(
  {
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, 'Unit price cannot be negative'],
    },
    amount: {
      type: Number,
      required: [true, 'Item amount is required'],
      min: [0, 'Item amount cannot be negative'],
    },
  },
  { _id: false }
);

const billSchema = new Schema<IBill>(
  {
    billId: {
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
      index: true,
    },
    patientPhone: {
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
      index: true,
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
    items: {
      type: [billItemSchema],
      required: [true, 'At least one invoice item is required'],
      validate: {
        validator: (v: IBillItem[]) => Array.isArray(v) && v.length > 0,
        message: 'Invoice must contain at least one item',
      },
    },
    itemsSummary: {
      type: String,
      trim: true,
      default: '',
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: [0, 'Tax percent cannot be negative'],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially-paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'insurance', 'other', ''],
      default: '',
    },
    transactionRef: {
      type: String,
      trim: true,
      default: '',
    },
    paidAt: {
      type: Date,
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
    createdBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Search and performance indexes
billSchema.index({ createdAt: -1 });
billSchema.index({ paymentStatus: 1, createdAt: -1 });
billSchema.index({ patientId: 1, createdAt: -1 });
billSchema.index({
  billId: 'text',
  patientName: 'text',
  itemsSummary: 'text',
  patientPhone: 'text',
});

export const Bill = mongoose.model<IBill>('Bill', billSchema);
