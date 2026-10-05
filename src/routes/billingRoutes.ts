import express from 'express';
import {
  getBills,
  getBillingStats,
  getBillById,
  createBill,
  recordPayment,
  cancelBill,
  updateBill,
  deleteBill,
} from '../controllers/billingController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All billing routes require authentication
router.use(authenticateToken);

// GET /api/bills/stats - Aggregate billing financial metrics
router.get('/stats', getBillingStats);

// GET /api/bills - List invoices with filters, search, and stats
// POST /api/bills - Generate a new invoice / bill
router
  .route('/')
  .get(getBills)
  .post(requireRoles('admin', 'receptionist', 'doctor'), createBill);

// PATCH or POST /api/bills/:id/pay - Record payment (cash, card, upi)
router
  .route('/:id/pay')
  .patch(requireRoles('admin', 'receptionist'), recordPayment)
  .post(requireRoles('admin', 'receptionist'), recordPayment);

// PATCH /api/bills/:id/cancel - Cancel invoice
router.patch('/:id/cancel', requireRoles('admin', 'receptionist'), cancelBill);

// GET /api/bills/:id - Single invoice details
// PATCH /api/bills/:id - Update invoice details (notes, items)
// DELETE /api/bills/:id - Delete invoice (Admin only)
router
  .route('/:id')
  .get(getBillById)
  .patch(requireRoles('admin', 'receptionist', 'doctor'), updateBill)
  .delete(requireRoles('admin'), deleteBill);

export default router;
