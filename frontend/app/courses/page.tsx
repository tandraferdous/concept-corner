'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/course/CourseCard';
import { CoursesGridSkeleton } from '@/components/ui/LoadingSpinner';
import { useCourse, Course } from '@/hooks/useCourse';
import { cn } from '@/utils/helpers';

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Design', 'Mobile', 'DevOps', 'AI/ML', 'Business', 'Photography'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function CoursesPage() {
  const { courses, isLoading, total, pages, fetchCourses } = useCourse();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    const params: Record<string, string | number> = { page, limit: 9, sort };
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (level !== 'All') params.level = level;
    fetchCourses(params);
  }, [page, sort, search, category, level, fetchCourses]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, category, level, sort]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero banner */}
      <div className="pt-20 pb-10 bg-gradient-to-b from-primary-950/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-poppins text-white mb-2"
          >
            Explore Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 mb-6"
          >
            {total > 0 ? `${total} courses available` : 'Browse our course catalog'}
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <div className="relative flex-1 max-w-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, topics, instructors…"
                className="w-full bg-white/5 border border-white/15 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-3.5 rounded-2xl border transition-all text-sm font-medium',
                showFilters
                  ? 'bg-primary-600 border-primary-500 text-white'
                  : 'bg-white/5 border-white/15 text-white/70 hover:border-primary-500/50 hover:text-white'
              )}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-2xl px-4 py-3.5 text-white/80 focus:outline-none focus:border-primary-500 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#1a1a2e]">{o.label}</option>
              ))}
            </select>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filter row */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="glass-card p-5 space-y-4">
              <div>
                <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"><Filter size={12} /> Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
                        category === cat
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-3">Level</p>
                <div className="flex gap-2">
                  {LEVELS.map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setLevel(lv)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
                        level === lv
                          ? 'bg-secondary-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                      )}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category quick-filter chips (always visible) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <CoursesGridSkeleton count={9} />
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: Course, i: number) => (
                <CourseCard key={course._id} course={course} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-medium transition-all',
                      page === p
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
            <p className="text-white/50 text-sm">Try a different search term or adjust your filters.</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); setLevel('All'); }}
              className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
