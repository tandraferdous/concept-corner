'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 18,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn(
            'transition-transform duration-100',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors duration-100',
              star <= active
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-white/20'
            )}
          />
        </button>
      ))}
    </div>
  );
}
