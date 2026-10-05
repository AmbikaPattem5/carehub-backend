import { Response } from 'express';
import mongoose from 'mongoose';
import { Bill, IBill, IBillItem, PaymentStatus, PaymentMethod } from '../models/Bill.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

interface InMemoryBill {
  id: string;
  _id?: string;
  billId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
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
  paidAt?: string;
  notes?: string;
  cancelReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const defaultToday = getTodayDateString();

// Seed in-memory store matching the mockup figures in designs/billing-design.jpg
const inMemoryBills: InMemoryBill[] = [
  {
    id: 'bill-mock-1',
    _id: 'bill-mock-1',
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
    paidAt: `${defaultToday}T14:40:00.000Z`,
    notes: 'Payment received via GPay UPI',
    createdAt: `${defaultToday}T14:35:00.000Z`,
    updatedAt: `${defaultToday}T14:40:00.000Z`,
  },
  {
    id: 'bill-mock-2',
    _id: 'bill-mock-2',
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
    notes: 'Awaiting cash or card counter settlement',
    createdAt: `${defaultToday}T15:10:00.000Z`,
    updatedAt: `${defaultToday}T15:10:00.000Z`,
  },
  {
    id: 'bill-mock-3',
    _id: 'bill-mock-3',
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
    paidAt: `${defaultToday}T11:30:00.000Z`,
    notes: 'Settled via HDFC POS card machine',
    createdAt: `${defaultToday}T11:15:00.000Z`,
    updatedAt: `${defaultToday}T11:30:00.000Z`,
  },
  {
    id: 'bill-mock-4',
    _id: 'bill-mock-4',
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
    paidAt: `${defaultToday}T10:00:00.000Z`,
    notes: 'Paid at desk counter in cash',
    createdAt: `${defaultToday}T09:45:00.000Z`,
    updatedAt: `${defaultToday}T10:00:00.000Z`,
  },
  {
    id: 'bill-mock-5',
    _id: 'bill-mock-5',
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
    notes: 'Insurance pre-auth verification in progress',
    createdAt: `${defaultToday}T12:00:00.000Z`,
    updatedAt: `${defaultToday}T12:00:00.000Z`,
  },
  {
    id: 'bill-mock-6',
    _id: 'bill-mock-6',
    billId: 'INV-1006',
    patientId: 'PAT-1001',
    patientName: 'Aarav Sharma',
    patientPhone: '9876543210',
    items: [
      { description: 'Pathology Blood Profile - HbA1c & Lipid', amount: 950, quantity: 1, unitPrice: 950 },
    ],
    itemsSummary: 'Blood Profile Lab Tests',
    subtotal: 950,
    discount: 0,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 950,
    amountPaid: 950,
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    transactionRef: 'UPI/20260927/11223344',
    paidAt: `${defaultToday}T16:20:00.000Z`,
    notes: 'Direct walk-in lab billing',
    createdAt: `${defaultToday}T16:00:00.000Z`,
    updatedAt: `${defaultToday}T16:20:00.000Z`,
  },
  {
    id: 'bill-mock-7',
    _id: 'bill-mock-7',
    billId: 'INV-1007',
    patientId: 'PAT-1003',
    patientName: 'Rohan Verma',
    patientPhone: '9711223344',
    items: [
      { description: 'Duplicate Consultation Request', amount: 500, quantity: 1, unitPrice: 500 },
    ],
    itemsSummary: 'Duplicate Consultation Entry',
    subtotal: 500,
    discount: 0,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 500,
    amountPaid: 0,
    paymentStatus: 'cancelled',
    cancelReason: 'Entered by mistake; appointment was cancelled',
    createdAt: `${defaultToday}T08:00:00.000Z`,
    updatedAt: `${defaultToday}T08:15:00.000Z`,
  },
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate sequential Bill ID: INV-1001, INV-1002, etc.
export const generateBillId = async (): Promise<string> => {
  if (isMongoConnected()) {
    const last = await Bill.findOne().sort({ createdAt: -1 });
    if (!last || !last.billId) {
      return 'INV-1001';
    }
    const match = last.billId.match(/INV-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `INV-${nextNum}`;
    }
    return `INV-${Date.now().toString().slice(-4)}`;
  } else {
    const numbers = inMemoryBills
      .map((b) => {
        const m = b.billId.match(/INV-(\d+)/);
        return m ? parseInt(m[1], 10) : 1000;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `INV-${maxNum + 1}`;
  }
};

// Helper to compute stats from a list of bills
const computeBillingStats = (allBills: any[]) => {
  let totalRevenue = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let todayCollections = 0;
  let todayInvoicesCount = 0;

  const todayStr = getTodayDateString();

  const statusCounts = {
    all: allBills.length,
    paid: 0,
    pending: 0,
    cancelled: 0,
  };

  for (const b of allBills) {
    const status = b.paymentStatus;
    if (status === 'paid') statusCounts.paid++;
    else if (status === 'pending' || status === 'partially-paid') statusCounts.pending++;
    else if (status === 'cancelled') statusCounts.cancelled++;

    // Total revenue is total paid across all active bills
    if (status !== 'cancelled') {
      totalRevenue += Number(b.amountPaid || 0);

      // Pending balance
      const remaining = Math.max(0, Number(b.totalAmount || 0) - Number(b.amountPaid || 0));
      if (status === 'pending' || status === 'partially-paid') {
        pendingAmount += remaining;
        pendingCount++;
      }
    }

    // Collections made today
    if (b.paidAt) {
      const paidDateStr = new Date(b.paidAt).toISOString().split('T')[0];
      if (paidDateStr === todayStr) {
        todayCollections += Number(b.amountPaid || 0);
      }
    }

    // Invoices created today
    const createdDateStr = new Date(b.createdAt).toISOString().split('T')[0];
    if (createdDateStr === todayStr) {
      todayInvoicesCount++;
    }
  }

  return {
    totalRevenue,
    pendingAmount,
    pendingCount,
    todayCollections,
    todayInvoicesCount,
    totalInvoicesCount: allBills.length,
    statusCounts,
  };
};

/**
 * GET /api/bills
 * List all invoices with filtering, search, pagination, and real-time summary statistics
 */
export const getBills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search, patientId, appointmentId, date, startDate, endDate } = req.query;

    if (isMongoConnected()) {
      const filter: Record<string, any> = {};

      if (status && status !== 'all') {
        if (status === 'pending') {
          filter.paymentStatus = { $in: ['pending', 'partially-paid'] };
        } else {
          filter.paymentStatus = status;
        }
      }

      if (patientId && patientId !== 'all') {
        filter.patientId = patientId;
      }

      if (appointmentId && appointmentId !== 'all') {
        filter.appointmentId = appointmentId;
      }

      if (date && date !== 'all') {
        const d = String(date);
        filter.createdAt = {
          $gte: new Date(`${d}T00:00:00.000Z`),
          $lte: new Date(`${d}T23:59:59.999Z`),
        };
      } else if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
        if (endDate) filter.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }

      if (search && String(search).trim() !== '') {
        const term = String(search).trim();
        filter.$or = [
          { billId: { $regex: term, $options: 'i' } },
          { patientName: { $regex: term, $options: 'i' } },
          { patientId: { $regex: term, $options: 'i' } },
          { patientPhone: { $regex: term, $options: 'i' } },
          { itemsSummary: { $regex: term, $options: 'i' } },
          { transactionRef: { $regex: term, $options: 'i' } },
        ];
      }

      const allBillsForStats = await Bill.find({});
      const stats = computeBillingStats(allBillsForStats);

      const bills = await Bill.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: bills.length,
        stats,
        bills,
      });
      return;
    }

    // In-memory fallback
    let filtered = [...inMemoryBills];

    if (status && status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(
          (b) => b.paymentStatus === 'pending' || b.paymentStatus === 'partially-paid'
        );
      } else {
        filtered = filtered.filter((b) => b.paymentStatus === status);
      }
    }

    if (patientId && patientId !== 'all') {
      filtered = filtered.filter((b) => b.patientId === patientId);
    }

    if (appointmentId && appointmentId !== 'all') {
      filtered = filtered.filter((b) => b.appointmentId === appointmentId);
    }

    if (date && date !== 'all') {
      const d = String(date);
      filtered = filtered.filter((b) => b.createdAt.startsWith(d));
    } else if (startDate || endDate) {
      if (startDate) filtered = filtered.filter((b) => b.createdAt >= `${startDate}T00:00:00.000Z`);
      if (endDate) filtered = filtered.filter((b) => b.createdAt <= `${endDate}T23:59:59.999Z`);
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.billId.toLowerCase().includes(q) ||
          b.patientName.toLowerCase().includes(q) ||
          b.patientId.toLowerCase().includes(q) ||
          (b.patientPhone && b.patientPhone.includes(q)) ||
          b.itemsSummary.toLowerCase().includes(q) ||
          (b.transactionRef && b.transactionRef.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = computeBillingStats(inMemoryBills);

    res.status(200).json({
      success: true,
      count: filtered.length,
      stats,
      bills: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch billing invoices.',
    });
  }
};

/**
 * GET /api/bills/stats
 * Get billing aggregate financial metrics and counters
 */
export const getBillingStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isMongoConnected()) {
      const allBills = await Bill.find({});
      const stats = computeBillingStats(allBills);
      res.status(200).json({ success: true, stats });
      return;
    }

    const stats = computeBillingStats(inMemoryBills);
    res.status(200).json({ success: true, stats });
  } catch (error: any) {
    console.error('Error getting billing stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate billing statistics.',
    });
  }
};

/**
 * GET /api/bills/:id
 * Get single invoice by MongoDB _id or billId
 */
export const getBillById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let bill = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        bill = await Bill.findById(id);
      }
      if (!bill) {
        bill = await Bill.findOne({ billId: id.toUpperCase() });
      }

      if (!bill) {
        res.status(404).json({
          success: false,
          message: `Invoice '${id}' not found.`,
        });
        return;
      }

      res.status(200).json({ success: true, bill });
      return;
    }

    // In-memory lookup
    const found = inMemoryBills.find(
      (b) => b.id === id || b._id === id || b.billId.toUpperCase() === id.toUpperCase()
    );

    if (!found) {
      res.status(404).json({
        success: false,
        message: `Invoice '${id}' not found.`,
      });
      return;
    }

    res.status(200).json({ success: true, bill: found });
  } catch (error: any) {
    console.error('Error fetching bill details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve invoice details.',
    });
  }
};

/**
 * POST /api/bills
 * Generate a new invoice / bill
 */
export const createBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let {
      patientId,
      patientName,
      patientPhone,
      appointmentId,
      doctorId,
      doctorName,
      items,
      discount = 0,
      taxPercent = 0,
      amountPaid = 0,
      paymentMethod = '',
      transactionRef = '',
      notes = '',
    } = req.body;

    if (!patientId && !patientName) {
      res.status(400).json({
        success: false,
        message: 'Patient information (patientId or patientName) is required.',
      });
      return;
    }

    // If patientId is provided, attempt to auto-populate patientName & phone if missing
    if (patientId && (!patientName || !patientPhone)) {
      if (isMongoConnected()) {
        const patientDoc = await Patient.findOne({ patientId });
        if (patientDoc) {
          if (!patientName) patientName = `${patientDoc.firstName} ${patientDoc.lastName}`;
          if (!patientPhone && patientDoc.phone) patientPhone = patientDoc.phone;
        }
      } else {
        const inMemPatient = inMemoryBills.find((b) => b.patientId === patientId);
        if (inMemPatient && !patientName) {
          patientName = inMemPatient.patientName;
          if (!patientPhone) patientPhone = inMemPatient.patientPhone;
        }
      }
    }

    // If appointmentId is provided and doctor is not set, attempt to retrieve doctor details
    if (appointmentId && (!doctorId || !doctorName)) {
      if (isMongoConnected()) {
        const apptDoc = await Appointment.findOne({ appointmentId });
        if (apptDoc) {
          if (!doctorId) doctorId = apptDoc.doctorId;
          if (!doctorName) doctorName = apptDoc.doctorName;
        }
      }
    }

    // Ensure items array is valid
    if (!Array.isArray(items) || items.length === 0) {
      // If appointmentId given, fallback to consultation fee item
      if (appointmentId) {
        items = [{ description: 'Doctor Consultation Fee', amount: 500, quantity: 1, unitPrice: 500 }];
      } else {
        res.status(400).json({
          success: false,
          message: 'At least one billable item is required.',
        });
        return;
      }
    }

    // Normalize and compute line items
    const normalizedItems: IBillItem[] = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const amount = Number(item.amount) || Number(item.unitPrice || 0) * qty;
      const unitPrice = Number(item.unitPrice) || (qty > 0 ? Math.round(amount / qty) : amount);
      return {
        description: String(item.description || 'Clinic Service').trim(),
        quantity: qty,
        unitPrice,
        amount,
      };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
    const parsedDiscount = Math.max(0, Number(discount) || 0);
    const parsedTaxPercent = Math.max(0, Number(taxPercent) || 0);
    const taxableAmount = Math.max(0, subtotal - parsedDiscount);
    const taxAmount = Math.round((taxableAmount * parsedTaxPercent) / 100);
    const totalAmount = Math.max(0, taxableAmount + taxAmount);

    const parsedAmountPaid = Math.max(0, Number(amountPaid) || 0);
    let paymentStatus: PaymentStatus = 'pending';
    if (parsedAmountPaid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'paid';
    } else if (parsedAmountPaid > 0) {
      paymentStatus = 'partially-paid';
    }

    const itemsSummary =
      normalizedItems.length === 1
        ? normalizedItems[0].description
        : normalizedItems.length === 2
        ? `${normalizedItems[0].description} + ${normalizedItems[1].description}`
        : `${normalizedItems[0].description} + ${normalizedItems.length - 1} more items`;

    const newBillId = await generateBillId();
    const nowIso = new Date().toISOString();
    const paidAt = paymentStatus === 'paid' ? nowIso : undefined;

    if (isMongoConnected()) {
      const newBill = await Bill.create({
        billId: newBillId,
        patientId,
        patientName,
        patientPhone: patientPhone || '',
        appointmentId: appointmentId || '',
        doctorId: doctorId || '',
        doctorName: doctorName || '',
        items: normalizedItems,
        itemsSummary,
        subtotal,
        discount: parsedDiscount,
        taxPercent: parsedTaxPercent,
        taxAmount,
        totalAmount,
        amountPaid: parsedAmountPaid,
        paymentStatus,
        paymentMethod: (paymentMethod as PaymentMethod) || '',
        transactionRef: transactionRef || '',
        paidAt: paidAt ? new Date(paidAt) : undefined,
        notes: notes || '',
        createdBy: req.user?.name || 'Staff',
      });

      res.status(201).json({
        success: true,
        message: 'Invoice generated successfully.',
        bill: newBill,
      });
      return;
    }

    // In-memory fallback create
    const newInMemoryBill: InMemoryBill = {
      id: `bill-${Date.now()}`,
      _id: `bill-${Date.now()}`,
      billId: newBillId,
      patientId,
      patientName,
      patientPhone: patientPhone || '',
      appointmentId: appointmentId || '',
      doctorId: doctorId || '',
      doctorName: doctorName || '',
      items: normalizedItems,
      itemsSummary,
      subtotal,
      discount: parsedDiscount,
      taxPercent: parsedTaxPercent,
      taxAmount,
      totalAmount,
      amountPaid: parsedAmountPaid,
      paymentStatus,
      paymentMethod: (paymentMethod as PaymentMethod) || '',
      transactionRef: transactionRef || '',
      paidAt,
      notes: notes || '',
      createdBy: req.user?.name || 'Staff',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    inMemoryBills.unshift(newInMemoryBill);

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully.',
      bill: newInMemoryBill,
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate invoice.',
    });
  }
};

/**
 * PATCH /api/bills/:id/pay
 * Record payment for an invoice (cash, card, upi, etc.)
 */
export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let { paymentMethod, amountPaid, totalAmount, transactionRef, notes } = req.body;

    if (amountPaid === undefined && totalAmount !== undefined) {
      amountPaid = totalAmount;
    }

    if (typeof paymentMethod === 'string') {
      const pm = paymentMethod.trim().toLowerCase();
      if (pm.includes('upi') || pm.includes('qr')) {
        paymentMethod = 'upi';
      } else if (pm.includes('card')) {
        paymentMethod = 'card';
      } else if (pm.includes('cash')) {
        paymentMethod = 'cash';
      } else if (pm.includes('insurance')) {
        paymentMethod = 'insurance';
      } else if (!pm) {
        paymentMethod = 'upi';
      }
    } else if (!paymentMethod) {
      paymentMethod = 'upi';
    }

    const now = new Date();

    if (isMongoConnected()) {
      let bill = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        bill = await Bill.findById(id);
      }
      if (!bill) {
        bill = await Bill.findOne({ billId: id.toUpperCase() });
      }

      if (!bill) {
        res.status(404).json({
          success: false,
          message: `Invoice '${id}' not found.`,
        });
        return;
      }

      if (bill.paymentStatus === 'cancelled') {
        res.status(400).json({
          success: false,
          message: 'Cannot record payment on a cancelled invoice.',
        });
        return;
      }

      const paymentVal = amountPaid !== undefined ? Number(amountPaid) : bill.totalAmount - bill.amountPaid;
      const updatedTotalPaid = bill.amountPaid + Math.max(0, paymentVal);

      bill.amountPaid = updatedTotalPaid;
      bill.paymentMethod = paymentMethod as PaymentMethod;
      if (transactionRef !== undefined) bill.transactionRef = transactionRef;
      if (notes) bill.notes = bill.notes ? `${bill.notes} | ${notes}` : notes;

      if (updatedTotalPaid >= bill.totalAmount) {
        bill.paymentStatus = 'paid';
        bill.paidAt = now;
      } else if (updatedTotalPaid > 0) {
        bill.paymentStatus = 'partially-paid';
        bill.paidAt = now;
      }

      await bill.save();

      res.status(200).json({
        success: true,
        message: 'Payment recorded successfully.',
        bill,
      });
      return;
    }

    // In-memory fallback
    const index = inMemoryBills.findIndex(
      (b) => b.id === id || b._id === id || b.billId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: `Invoice '${id}' not found.`,
      });
      return;
    }

    const bill = inMemoryBills[index];

    if (bill.paymentStatus === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Cannot record payment on a cancelled invoice.',
      });
      return;
    }

    const paymentVal = amountPaid !== undefined ? Number(amountPaid) : bill.totalAmount - bill.amountPaid;
    const updatedTotalPaid = bill.amountPaid + Math.max(0, paymentVal);

    bill.amountPaid = updatedTotalPaid;
    bill.paymentMethod = paymentMethod as PaymentMethod;
    if (transactionRef !== undefined) bill.transactionRef = transactionRef;
    if (notes) bill.notes = bill.notes ? `${bill.notes} | ${notes}` : notes;

    if (updatedTotalPaid >= bill.totalAmount) {
      bill.paymentStatus = 'paid';
      bill.paidAt = now.toISOString();
    } else if (updatedTotalPaid > 0) {
      bill.paymentStatus = 'partially-paid';
      bill.paidAt = now.toISOString();
    }
    bill.updatedAt = now.toISOString();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully.',
      bill,
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record invoice payment.',
    });
  }
};

/**
 * PATCH /api/bills/:id/cancel
 * Cancel an invoice
 */
export const cancelBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (isMongoConnected()) {
      let bill = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        bill = await Bill.findById(id);
      }
      if (!bill) {
        bill = await Bill.findOne({ billId: id.toUpperCase() });
      }

      if (!bill) {
        res.status(404).json({
          success: false,
          message: `Invoice '${id}' not found.`,
        });
        return;
      }

      bill.paymentStatus = 'cancelled';
      bill.cancelReason = cancelReason || 'Invoice cancelled by staff';
      await bill.save();

      res.status(200).json({
        success: true,
        message: 'Invoice cancelled successfully.',
        bill,
      });
      return;
    }

    // In-memory fallback
    const index = inMemoryBills.findIndex(
      (b) => b.id === id || b._id === id || b.billId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: `Invoice '${id}' not found.`,
      });
      return;
    }

    inMemoryBills[index].paymentStatus = 'cancelled';
    inMemoryBills[index].cancelReason = cancelReason || 'Invoice cancelled by staff';
    inMemoryBills[index].updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Invoice cancelled successfully.',
      bill: inMemoryBills[index],
    });
  } catch (error: any) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel invoice.',
    });
  }
};

/**
 * PATCH /api/bills/:id
 * General update for an invoice (notes, items, discount)
 */
export const updateBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected()) {
      let bill = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        bill = await Bill.findById(id);
      }
      if (!bill) {
        bill = await Bill.findOne({ billId: id.toUpperCase() });
      }

      if (!bill) {
        res.status(404).json({
          success: false,
          message: `Invoice '${id}' not found.`,
        });
        return;
      }

      // If items, discount or tax updated, re-calculate totals
      if (updates.items || updates.discount !== undefined || updates.taxPercent !== undefined) {
        const items = updates.items || bill.items;
        const discount = updates.discount !== undefined ? Number(updates.discount) : bill.discount;
        const taxPercent = updates.taxPercent !== undefined ? Number(updates.taxPercent) : bill.taxPercent;

        const subtotal = items.reduce((s: number, it: any) => s + (Number(it.amount) || 0), 0);
        const taxable = Math.max(0, subtotal - discount);
        const taxAmount = Math.round((taxable * taxPercent) / 100);
        const totalAmount = Math.max(0, taxable + taxAmount);

        updates.subtotal = subtotal;
        updates.discount = discount;
        updates.taxPercent = taxPercent;
        updates.taxAmount = taxAmount;
        updates.totalAmount = totalAmount;

        if (updates.items) {
          updates.itemsSummary =
            items.length === 1
              ? items[0].description
              : `${items[0].description} + ${items.length - 1} more items`;
        }
      }

      Object.assign(bill, updates);
      await bill.save();

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully.',
        bill,
      });
      return;
    }

    // In-memory fallback
    const index = inMemoryBills.findIndex(
      (b) => b.id === id || b._id === id || b.billId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: `Invoice '${id}' not found.`,
      });
      return;
    }

    const bill = inMemoryBills[index];
    if (updates.items || updates.discount !== undefined || updates.taxPercent !== undefined) {
      const items = updates.items || bill.items;
      const discount = updates.discount !== undefined ? Number(updates.discount) : bill.discount;
      const taxPercent = updates.taxPercent !== undefined ? Number(updates.taxPercent) : bill.taxPercent;

      const subtotal = items.reduce((s: number, it: any) => s + (Number(it.amount) || 0), 0);
      const taxable = Math.max(0, subtotal - discount);
      const taxAmount = Math.round((taxable * taxPercent) / 100);
      const totalAmount = Math.max(0, taxable + taxAmount);

      bill.items = items;
      bill.subtotal = subtotal;
      bill.discount = discount;
      bill.taxPercent = taxPercent;
      bill.taxAmount = taxAmount;
      bill.totalAmount = totalAmount;
      bill.itemsSummary =
        items.length === 1
          ? items[0].description
          : `${items[0].description} + ${items.length - 1} more items`;
    }

    if (updates.notes !== undefined) bill.notes = updates.notes;
    if (updates.patientPhone !== undefined) bill.patientPhone = updates.patientPhone;
    bill.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully.',
      bill,
    });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update invoice.',
    });
  }
};

/**
 * DELETE /api/bills/:id
 * Delete an invoice (Admin only)
 */
export const deleteBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let bill = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        bill = await Bill.findByIdAndDelete(id);
      }
      if (!bill) {
        bill = await Bill.findOneAndDelete({ billId: id.toUpperCase() });
      }

      if (!bill) {
        res.status(404).json({
          success: false,
          message: `Invoice '${id}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully.',
      });
      return;
    }

    // In-memory fallback
    const index = inMemoryBills.findIndex(
      (b) => b.id === id || b._id === id || b.billId.toUpperCase() === id.toUpperCase()
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        message: `Invoice '${id}' not found.`,
      });
      return;
    }

    inMemoryBills.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete invoice.',
    });
  }
};
