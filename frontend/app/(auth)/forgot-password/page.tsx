'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { authApi } from '@/utils/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to send reset email';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f0f1a] relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-600/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold font-poppins text-white">Concept Corner</span>
          </Link>
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                    <Mail size={28} className="text-primary-400" />
                  </div>
                  <h1 className="text-2xl font-bold font-poppins text-white mb-2">Forgot Password?</h1>
                  <p className="text-white/50 text-sm">
                    Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail size={16} />}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} rightIcon={<ArrowRight size={18} />}>
                    Send Reset Link
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-600/20 border border-accent-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-accent-400" />
                </div>
                <h2 className="text-2xl font-bold font-poppins text-white mb-2">Check Your Email</h2>
                <p className="text-white/50 text-sm mb-2">
                  We&apos;ve sent a password reset link to:
                </p>
                <p className="text-primary-400 font-semibold mb-6">{sentEmail}</p>
                <p className="text-white/40 text-xs mb-6">
                  Didn&apos;t receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-primary-400 hover:underline"
                  >
                    try again
                  </button>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
