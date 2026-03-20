'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Users, DollarSign, Plus, Star, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { coursesApi } from '@/utils/api';
import { formatPrice } from '@/utils/helpers';
import { Course } from '@/hooks/useCourse';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    coursesApi.getCourses({ instructor: user?._id ?? '', limit: 10 })
      .then(({ data }) => setCourses(data.courses ?? data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  const totalStudents = courses.reduce((s, c) => s + (c.studentCount ?? 0), 0);
  const totalRevenue = courses.reduce((s, c) => s + (c.price * (c.studentCount ?? 0)), 0);
  const avgRating = courses.length
    ? courses.reduce((s, c) => s + (c.rating ?? 0), 0) / courses.length
    : 0;

  const stats = [
    { label: 'My Courses', value: courses.length, icon: <BookOpen size={20} />, color: 'from-primary-600 to-primary-800' },
    { label: 'Total Students', value: totalStudents.toLocaleString(), icon: <Users size={20} />, color: 'from-secondary-600 to-secondary-800' },
    { label: 'Avg Rating', value: avgRating.toFixed(1) + '★', icon: <Star size={20} />, color: 'from-yellow-600 to-orange-700' },
    { label: 'Est. Revenue', value: formatPrice(totalRevenue), icon: <DollarSign size={20} />, color: 'from-accent-600 to-accent-800' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white">Instructor Dashboard</h1>
            <p className="text-white/50 mt-1">Manage your courses and track performance</p>
          </div>
          <Link href="/instructor/courses/new">
            <Button leftIcon={<Plus size={18} />}>Create Course</Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-white font-poppins">{stat.value}</p>
              <p className="text-white/50 text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Courses table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold font-poppins text-white">My Courses</h2>
            <Link href="/courses"><Button variant="ghost" size="sm" leftIcon={<TrendingUp size={14} />}>View Public</Button></Link>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-white/40">Loading…</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">You haven&apos;t created any courses yet</p>
              <Link href="/instructor/courses/new"><Button leftIcon={<Plus size={16} />}>Create Your First Course</Button></Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/course/${course._id}`} className="text-white font-medium text-sm hover:text-primary-400 transition-colors line-clamp-1">{course.title}</Link>
                        <p className="text-white/40 text-xs mt-0.5">{course.category}</p>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-sm">{(course.studentCount ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="flex items-center gap-1 text-yellow-400 text-sm"><Star size={12} className="fill-current" />{(course.rating ?? 0).toFixed(1)}</span></td>
                      <td className="px-6 py-4 text-white font-semibold text-sm">{formatPrice(course.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${course.isPublished ? 'text-accent-400 bg-accent-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
