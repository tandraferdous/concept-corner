import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  bkashPaymentID?: string;
  bkashTrxID?: string;
  bkashPayerReference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentType: 'bkash';
  invoiceNumber: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: { type: String, default: 'BDT' },
    bkashPaymentID: { type: String },
    bkashTrxID: { type: String },
    bkashPayerReference: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentType: {
      type: String,
      enum: ['bkash'],
      default: 'bkash',
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ bkashPaymentID: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
