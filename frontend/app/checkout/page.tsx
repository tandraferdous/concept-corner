'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BkashButton from '@/components/payment/BkashButton';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/helpers';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const courseIds = items.map((i) => i.course._id);

  const handleSuccess = async (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    await clearCart();
    router.push('/student');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-white/50">Your cart is empty.</p>
          <button onClick={() => router.push('/courses')} className="mt-4 text-primary-400 hover:underline">Browse Courses</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold font-poppins text-white mb-2"
        >
          Checkout
        </motion.h1>
        <p className="text-white/50 mb-10">Complete your purchase to access your courses</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order summary */}
          <div>
            <h2 className="text-lg font-semibold font-poppins text-white mb-4">Order Summary</h2>
            <div className="glass-card p-5 space-y-4">
              {items.map(({ course }) => (
                <div key={course._id} className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-2">{course.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{course.instructor?.name}</p>
                  </div>
                  <span className="text-white font-semibold text-sm flex-shrink-0">
                    {formatPrice(course.discountPrice ?? course.price)}
                  </span>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-4 flex items-center gap-2 text-white/40 text-xs">
              <ShieldCheck size={14} className="text-accent-400" />
              Secure payment powered by bKash. Your data is encrypted.
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-lg font-semibold font-poppins text-white mb-4">Payment Method</h2>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-5 p-3 bg-[#e2136e]/10 border border-[#e2136e]/30 rounded-xl">
                <div className="w-8 h-8 bg-[#e2136e] rounded-full flex items-center justify-center">
                  <span className="text-white font-black text-sm">b</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">bKash Mobile Banking</p>
                  <p className="text-white/50 text-xs">Fast, secure payment via bKash</p>
                </div>
              </div>

              <BkashButton
                courseIds={courseIds}
                amount={total}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
