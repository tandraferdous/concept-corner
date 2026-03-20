'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { paymentsApi } from '@/utils/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatPrice } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface BkashButtonProps {
  courseIds: string[];
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

type Step = 'idle' | 'phone' | 'processing' | 'verify' | 'success' | 'error';

export default function BkashButton({
  courseIds,
  amount,
  onSuccess,
  onError,
}: BkashButtonProps) {
  const [step, setStep] = useState<Step>('idle');
  const [phone, setPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInitiate = async () => {
    if (!phone.match(/^01[3-9]\d{8}$/)) {
      toast.error('Enter a valid bKash number (11 digits starting with 01)');
      return;
    }
    setStep('processing');
    try {
      const { data } = await paymentsApi.createPayment({ courseIds, amount, phone });
      setPaymentId(data.paymentId ?? data._id ?? '');
      setStep('verify');
      toast.success('Payment initiated! Enter your Transaction ID to verify.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to initiate payment';
      setErrorMsg(msg);
      setStep('error');
      onError?.(msg);
    }
  };

  const handleVerify = async () => {
    if (!trxId.trim()) {
      toast.error('Please enter your Transaction ID');
      return;
    }
    setStep('processing');
    try {
      await paymentsApi.verifyPayment(paymentId, trxId);
      setStep('success');
      onSuccess?.(paymentId);
      toast.success('Payment verified! Enrollment confirmed.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Verification failed';
      setErrorMsg(msg);
      setStep('error');
      onError?.(msg);
    }
  };

  const reset = () => {
    setStep('idle');
    setPhone('');
    setTrxId('');
    setPaymentId('');
    setErrorMsg('');
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              onClick={() => setStep('phone')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #e2136e 0%, #ff4b8b 100%)' }}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#e2136e] font-black text-sm">b</span>
              </div>
              Pay with bKash · {formatPrice(amount)}
            </button>
          </motion.div>
        )}

        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-[#e2136e]/10 border border-[#e2136e]/30 rounded-2xl">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Phone size={16} className="text-[#e2136e]" />
                bKash Payment
              </h3>
              <p className="text-white/60 text-sm">Enter your bKash mobile number to proceed</p>
            </div>
            <Input
              label="bKash Number"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone size={16} />}
              maxLength={11}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={reset} className="flex-1">Cancel</Button>
              <Button
                onClick={handleInitiate}
                className="flex-1"
                style={{ background: 'linear-gradient(135deg, #e2136e 0%, #ff4b8b 100%)' }}
              >
                Initiate Payment
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <Loader2 size={36} className="text-[#e2136e] animate-spin" />
            <p className="text-white/60 text-sm">Processing payment…</p>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
              <h3 className="text-white font-semibold mb-1">Verify your payment</h3>
              <p className="text-white/60 text-sm">
                Send {formatPrice(amount)} to bKash number <strong className="text-white">{process.env.NEXT_PUBLIC_BKASH_MERCHANT_NUMBER ?? 'our bKash merchant number'}</strong> and enter the Transaction ID below.
              </p>
            </div>
            <Input
              label="Transaction ID (TrxID)"
              placeholder="e.g. ABC1234DEF5"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              leftIcon={<CreditCard size={16} />}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={reset} className="flex-1">Cancel</Button>
              <Button
                onClick={handleVerify}
                className="flex-1"
                style={{ background: 'linear-gradient(135deg, #e2136e 0%, #ff4b8b 100%)' }}
              >
                Verify Payment
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-6 text-center"
          >
            <CheckCircle2 size={48} className="text-accent-400" />
            <h3 className="text-white font-semibold text-lg">Payment Successful!</h3>
            <p className="text-white/60 text-sm">You are now enrolled. Happy learning!</p>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-white/70 text-sm">{errorMsg}</p>
            </div>
            <Button variant="outline" fullWidth onClick={reset}>Try Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
