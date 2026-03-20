'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Play,
  Star,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/course/CourseCard';
import { CoursesGridSkeleton } from '@/components/ui/LoadingSpinner';
import { useCourse, Course } from '@/hooks/useCourse';

// ── Typewriter hook ────────────────────────────────────────────────────────────
function useTypewriter(words: string[], speed = 100, pause = 2000) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < word.length) {
      timeout = setTimeout(() => setText(word.slice(0, text.length + 1)), speed);
    } else if (!deleting && text.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, text.length - 1)), speed / 2);
    } else {
      setDeleting(false);
      setIdx((i) => i + 1);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, idx, words, speed, pause]);

  return text;
}

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ── Data ───────────────────────────────────────────────────────────────────────
const features = [
  { icon: <Zap size={24} />, title: 'Learn Faster', desc: 'AI-curated paths help you master skills 3× faster than traditional methods.' },
  { icon: <Globe size={24} />, title: 'Learn Anywhere', desc: 'Access courses offline or online — on any device, anytime.' },
  { icon: <Shield size={24} />, title: 'Expert Instructors', desc: 'Learn from industry veterans with real-world experience.' },
  { icon: <Award size={24} />, title: 'Get Certified', desc: 'Earn shareable certificates to boost your career prospects.' },
  { icon: <Users size={24} />, title: 'Community', desc: 'Join thousands of learners and grow together.' },
  { icon: <TrendingUp size={24} />, title: 'Track Progress', desc: 'Visual progress tracking keeps you motivated and on schedule.' },
];

const steps = [
  { num: '01', title: 'Create an Account', desc: 'Sign up for free in seconds with your email.' },
  { num: '02', title: 'Choose a Course', desc: 'Browse hundreds of curated courses across categories.' },
  { num: '03', title: 'Pay Securely', desc: 'Use bKash or other local payment methods instantly.' },
  { num: '04', title: 'Start Learning', desc: 'Watch HD videos, complete projects, earn certificates.' },
];

const testimonials = [
  {
    name: 'Rafiq Ahmed',
    role: 'Frontend Developer',
    avatar: 'https://ui-avatars.com/api/?name=Rafiq+Ahmed&background=6366f1&color=fff',
    text: 'Concept Corner transformed my career. The courses are high quality and the instructors are brilliant!',
    rating: 5,
  },
  {
    name: 'Nusrat Jahan',
    role: 'Data Scientist',
    avatar: 'https://ui-avatars.com/api/?name=Nusrat+Jahan&background=d946ef&color=fff',
    text: 'I landed my dream job after completing the data science track. The project-based approach made all the difference.',
    rating: 5,
  },
  {
    name: 'Arif Hossain',
    role: 'Entrepreneur',
    avatar: 'https://ui-avatars.com/api/?name=Arif+Hossain&background=10b981&color=fff',
    text: 'The best platform in Bangladesh for online learning. Affordable, practical, and incredibly well structured.',
    rating: 5,
  },
];

const TYPEWRITER_WORDS = ['Learn Without Limits', 'Build Real Skills', 'Shape Your Future', 'Start Today'];

export default function HomePage() {
  const { courses, isLoading, fetchFeatured } = useCourse();
  const typewriterText = useTypewriter(TYPEWRITER_WORDS);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-2xl" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-500/40 rounded-full text-primary-300 text-sm font-medium mb-8"
          >
            <Zap size={14} />
            Bangladesh&apos;s #1 Online Learning Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-poppins text-white leading-tight mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300">
              {typewriterText}
            </span>
            <span className="inline-block w-0.5 h-[1em] bg-primary-400 ml-1 animate-pulse align-middle" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Master in-demand skills with world-class courses taught by expert instructors. Pay in Bangladeshi Taka. Learn at your own pace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/courses"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold text-lg rounded-2xl hover:opacity-90 transition-all shadow-glow hover:shadow-xl active:scale-95"
            >
              Explore Courses <ArrowRight size={20} />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            >
              <Play size={18} className="fill-white" />
              Watch Demo
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {[
              { value: '50K+', label: 'Students' },
              { value: '200+', label: 'Courses' },
              { value: '4.8★', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold font-poppins text-white">{stat.value}</div>
                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">Why Concept Corner</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Everything You Need to Succeed</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle max-w-xl mx-auto">
              Designed for learners across Bangladesh, our platform combines world-class content with local payment options.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="glass-card p-6 hover:border-primary-500/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-poppins">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Courses ──────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <motion.p variants={fadeUp} className="text-primary-400 font-semibold text-sm uppercase tracking-widest mb-2">Top Picks</motion.p>
              <motion.h2 variants={fadeUp} className="section-title">Featured Courses</motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/courses" className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                View all courses <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {isLoading ? (
            <CoursesGridSkeleton count={3} />
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course: Course, i: number) => (
                <CourseCard key={course._id} course={course} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <MockCourseCard key={i} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-secondary-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">How It Works</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">Get started with Concept Corner in four simple steps.</motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-600/50 to-transparent" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-lg font-poppins mx-auto mb-4 shadow-glow">
                  {step.num}
                </div>
                <h3 className="text-white font-semibold mb-2 font-poppins">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-accent-400 font-semibold text-sm uppercase tracking-widest mb-3">Success Stories</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Loved by Learners</motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="glass-card p-6">
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <Image src={t.avatar} alt={t.name} width={40} height={40} className="rounded-full" />
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 p-12 text-center"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <BookOpen size={40} className="text-white/80" />
              </div>
              <h2 className="text-4xl font-bold font-poppins text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join 50,000+ learners and take your skills to the next level today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold text-lg rounded-2xl hover:bg-white/90 transition-all shadow-xl active:scale-95"
                >
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <Link
                  href="/courses"
                  className="flex items-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/30 transition-all active:scale-95"
                >
                  Browse Courses
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-white/70 text-sm">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Cancel anytime</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> 30-day guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Placeholder cards when no featured courses are returned yet
function MockCourseCard({ index }: { index: number }) {
  const mocks = [
    { title: 'Complete Web Development Bootcamp', category: 'Web Dev', level: 'Beginner', price: 1499, rating: 4.8, students: 12000 },
    { title: 'Python for Data Science & ML', category: 'Data Science', level: 'Intermediate', price: 1999, rating: 4.9, students: 8500 },
    { title: 'UI/UX Design Masterclass', category: 'Design', level: 'Beginner', price: 1299, rating: 4.7, students: 6200 },
  ];
  const m = mocks[index % mocks.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass-card overflow-hidden hover:border-primary-500/50 transition-all duration-300"
    >
      <div className="h-48 bg-gradient-to-br from-primary-900 to-secondary-900 flex items-center justify-center relative">
        <BookOpen size={48} className="text-white/20" />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-600/80 text-white text-xs font-semibold rounded-lg">{m.category}</span>
        <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 text-white/70 text-xs rounded-lg">{m.level}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 font-poppins">{m.title}</h3>
        <p className="text-white/50 text-xs mb-3">Concept Corner Instructor</p>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-yellow-400 text-xs font-bold">{m.rating}</span>
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={11} className={s <= Math.round(m.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-white/20'} />
          ))}
          <span className="text-white/40 text-xs">(320)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">৳{m.price.toLocaleString()}</span>
          <span className="text-xs px-2.5 py-1 bg-primary-600/20 text-primary-400 rounded-lg border border-primary-500/30">Enroll</span>
        </div>
      </div>
    </motion.div>
  );
}
