'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const success = await registerUser(data.name, data.email, data.password);
    if (success) {
      toast.success('Account created! Welcome to Concept Corner 🎉');
      router.push('/student');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-secondary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold font-poppins text-white">Concept Corner</span>
          </Link>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-bold font-poppins text-white mb-4">Start Learning Today</h2>
            <p className="text-white/60 text-lg max-w-sm">Join thousands of learners and build real-world skills with expert-led courses.</p>
            <ul className="mt-8 space-y-3 text-left">
              {['Free to join', 'Pay in Bangladeshi Taka', 'Certificate of completion', 'Lifetime access', '30-day money-back guarantee'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="w-5 h-5 rounded-full bg-accent-600/30 border border-accent-500 flex items-center justify-center text-accent-400 flex-shrink-0">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0f0f1a] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold font-poppins text-white">Concept Corner</span>
          </div>

          <h1 className="text-3xl font-bold font-poppins text-white mb-2">Create Account</h1>
          <p className="text-white/50 mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase & number"
              leftIcon={<Lock size={16} />}
              rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconClick={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
              hint="At least 8 characters, one uppercase letter, and one number"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              leftIcon={<Lock size={16} />}
              rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconClick={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500 flex-shrink-0"
                  {...register('terms')}
                />
                <span className="text-sm text-white/60 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-400 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-sm text-red-400">{errors.terms.message}</p>}
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>
              Create Account
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
