'use client';

import { cn } from '@/utils/helpers';

// ── Spinner ────────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export function LoadingSpinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-white/20 border-t-primary-500',
        spinnerSizes[size],
        className
      )}
    />
  );
}

// ── Full-page loader ───────────────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/50 text-sm animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

// ── Skeleton components ────────────────────────────────────────────────────────

export function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <SkeletonBox className="w-full h-48" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-5 w-full" />
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <div className="flex justify-between pt-2">
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CoursesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
