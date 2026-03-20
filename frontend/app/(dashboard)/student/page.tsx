'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Clock, TrendingUp, Play, Award } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { enrollmentsApi } from '@/utils/api';
import { formatDate } from '@/utils/helpers';

interface EnrolledCourse {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructor?: { name: string };
    lessonCount: number;
    duration: number;
    category: string;
  };
  progress: number;
  completedLessons: number;
  enrolledAt: string;
  isCompleted: boolean;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    enrollmentsApi.getMyEnrollments()
      .then(({ data }) => setEnrollments(data.enrollments ?? data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const completed = enrollments.filter((e) => e.isCompleted).length;
  const inProgress = enrollments.filter((e) => !e.isCompleted && e.progress > 0).length;

  const stats = [
    { label: 'Enrolled', value: enrollments.length, icon: <BookOpen size={20} />, color: 'from-primary-600 to-primary-800' },
    { label: 'In Progress', value: inProgress, icon: <Clock size={20} />, color: 'from-secondary-600 to-secondary-800' },
    { label: 'Completed', value: completed, icon: <CheckCircle2 size={20} />, color: 'from-accent-600 to-accent-800' },
    { label: 'Certificates', value: completed, icon: <Award size={20} />, color: 'from-yellow-600 to-orange-700' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 mb-10"
        >
          <h1 className="text-3xl font-bold font-poppins text-white">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Learner'}! 👋
          </h1>
          <p className="text-white/50 mt-1">Continue where you left off. Keep learning!</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-white font-poppins">{stat.value}</p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Enrolled courses */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-poppins text-white">My Courses</h2>
          <Link href="/courses" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
            Browse more →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <BookOpen size={48} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-white/50 text-sm mb-6">Enroll in a course to start learning.</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(({ course, progress, completedLessons, enrolledAt, isCompleted }, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden hover:border-primary-500/50 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-40 bg-gradient-card">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={32} className="text-white/20" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-accent-600/30 flex items-center justify-center">
                      <CheckCircle2 size={36} className="text-accent-400" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <span className="text-xs text-primary-400 font-medium">{course.category}</span>
                  <h3 className="text-white font-semibold text-sm mt-1 mb-1 line-clamp-2 font-poppins">{course.title}</h3>
                  <p className="text-white/40 text-xs mb-3">{course.instructor?.name}</p>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{completedLessons}/{course.lessonCount} lessons</span>
                      <span className={`font-semibold ${isCompleted ? 'text-accent-400' : 'text-primary-400'}`}>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-accent-500' : 'bg-primary-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">Enrolled {formatDate(enrolledAt)}</span>
                    <Link
                      href={`/course/${course._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/20 text-primary-400 rounded-xl text-xs font-medium hover:bg-primary-600/40 transition-colors"
                    >
                      {isCompleted ? <Award size={12} /> : <Play size={12} className="fill-current" />}
                      {isCompleted ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recent activity */}
        {enrollments.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold font-poppins text-white mb-5">Learning Activity</h2>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary-400" />
                <span className="text-white/60 text-sm">Your progress this month</span>
              </div>
              <div className="space-y-3">
                {enrollments.slice(0, 5).map(({ course, progress }) => (
                  <div key={course._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0">
                      <BookOpen size={14} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm line-clamp-1">{course.title}</p>
                      <div className="h-1 bg-white/10 rounded-full mt-1.5">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <span className="text-primary-400 text-xs font-semibold flex-shrink-0">{Math.round(progress)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
