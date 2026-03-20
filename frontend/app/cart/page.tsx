'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/helpers';

export default function CartPage() {
  const { items, removeFromCart, total, count } = useCart();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold font-poppins text-white mb-2"
        >
          Shopping Cart
        </motion.h1>
        <p className="text-white/50 mb-10">{count} {count === 1 ? 'course' : 'courses'} in cart</p>

        {count === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={64} className="text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-white/50 text-sm mb-6">Add courses to get started on your learning journey.</p>
            <Link href="/courses">
              <Button rightIcon={<ArrowRight size={18} />}>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ course }) => (
                <motion.div
                  key={course._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card flex gap-4 p-4"
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-card">
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="112px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={24} className="text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/course/${course._id}`}>
                      <h3 className="text-white font-semibold text-sm leading-snug hover:text-primary-400 transition-colors line-clamp-2 font-poppins">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-white/40 text-xs mt-1">{course.instructor?.name}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-400 text-xs font-bold">{(course.rating ?? 0).toFixed(1)}</span>
                      <span className="text-white/30 text-xs">({course.reviewCount ?? 0})</span>
                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <span className="text-white font-bold">
                      {formatPrice(course.discountPrice ?? course.price)}
                    </span>
                    <button
                      onClick={() => removeFromCart(course._id)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <h2 className="text-lg font-semibold font-poppins text-white mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {items.map(({ course }) => (
                    <div key={course._id} className="flex justify-between text-sm">
                      <span className="text-white/60 line-clamp-1 flex-1 mr-3">{course.title}</span>
                      <span className="text-white font-medium flex-shrink-0">
                        {formatPrice(course.discountPrice ?? course.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button fullWidth size="lg" rightIcon={<ArrowRight size={18} />}>
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/courses" className="block text-center mt-3 text-sm text-white/50 hover:text-white transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
