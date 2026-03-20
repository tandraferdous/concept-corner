'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Users, Clock, BookOpen } from 'lucide-react';
import { Course } from '@/hooks/useCourse';
import { formatPrice, formatDuration, truncateText, discountPercent } from '@/utils/helpers';

interface CourseCardProps {
  course: Course;
  index?: number;
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  const hasDiscount =
    course.discountPrice !== undefined && course.discountPrice < course.price;
  const displayPrice = hasDiscount ? course.discountPrice! : course.price;
  const percent = hasDiscount ? discountPercent(course.price, course.discountPrice!) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link href={`/course/${course._id}`}>
        <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 hover:shadow-card-hover transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative w-full h-48 overflow-hidden bg-gradient-card">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={40} className="text-white/30" />
              </div>
            )}
            {/* Category badge */}
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
              {course.category}
            </span>
            {/* Level badge */}
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white/80 text-xs rounded-lg">
              {course.level}
            </span>
            {percent > 0 && (
              <span className="absolute bottom-3 left-3 px-2 py-1 bg-accent-600 text-white text-xs font-bold rounded-lg">
                -{percent}%
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-white text-sm leading-snug mb-1 group-hover:text-primary-400 transition-colors font-poppins">
              {truncateText(course.title, 60)}
            </h3>

            {/* Instructor */}
            <p className="text-white/50 text-xs mb-3">
              {course.instructor?.name ?? 'Unknown Instructor'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-yellow-400 text-xs font-bold">
                {course.rating?.toFixed(1) ?? '0.0'}
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    className={
                      s <= Math.round(course.rating ?? 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-transparent text-white/20'
                    }
                  />
                ))}
              </div>
              <span className="text-white/40 text-xs">({course.reviewCount ?? 0})</span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-white/40 text-xs mb-4">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {(course.studentCount ?? 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(course.duration ?? 0)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {course.lessonCount ?? 0} lessons
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-white/40 line-through">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>
              <span className="text-xs px-2.5 py-1 bg-primary-600/20 text-primary-400 rounded-lg border border-primary-500/30">
                Enroll
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
