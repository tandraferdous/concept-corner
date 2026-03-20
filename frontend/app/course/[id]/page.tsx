'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Play,
  ChevronDown,
  ChevronRight,
  Award,
  Globe,
  CheckCircle2,
  ShoppingCart,
  Zap,
  Lock,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import VideoPlayer from '@/components/course/VideoPlayer';
import { useCourse, Course } from '@/hooks/useCourse';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { enrollmentsApi, reviewsApi } from '@/utils/api';
import { formatPrice, formatDuration, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface Lesson {
  _id: string;
  title: string;
  duration: number;
  isPreview: boolean;
  order: number;
}
interface Section {
  title: string;
  lessons: Lesson[];
}
interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { course, isLoading, fetchCourse } = useCourse();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) fetchCourse(id as string);
  }, [id, fetchCourse]);

  useEffect(() => {
    if (!id) return;
    // Check enrollment
    if (isAuthenticated) {
      enrollmentsApi.checkEnrollment(id as string)
        .then(({ data }) => setIsEnrolled(data.enrolled ?? false))
        .catch(() => {});
    }
    // Load reviews
    reviewsApi.getCourseReviews(id as string)
      .then(({ data }) => setReviews(data.reviews ?? data))
      .catch(() => {});
  }, [id, isAuthenticated]);

  // Build mock curriculum if API doesn't return sections
  useEffect(() => {
    if (course) {
      setSections([
        {
          title: 'Getting Started',
          lessons: [
            { _id: '1', title: 'Introduction & Setup', duration: 480, isPreview: true, order: 1 },
            { _id: '2', title: 'Course Overview', duration: 360, isPreview: true, order: 2 },
            { _id: '3', title: 'Tools Installation', duration: 720, isPreview: false, order: 3 },
          ],
        },
        {
          title: 'Core Concepts',
          lessons: [
            { _id: '4', title: 'Fundamentals Deep Dive', duration: 1200, isPreview: false, order: 4 },
            { _id: '5', title: 'Practical Examples', duration: 900, isPreview: false, order: 5 },
            { _id: '6', title: 'Exercises & Quiz', duration: 600, isPreview: false, order: 6 },
          ],
        },
        {
          title: 'Advanced Topics',
          lessons: [
            { _id: '7', title: 'Advanced Patterns', duration: 1500, isPreview: false, order: 7 },
            { _id: '8', title: 'Real-world Project', duration: 2400, isPreview: false, order: 8 },
            { _id: '9', title: 'Deployment & Wrap-up', duration: 600, isPreview: false, order: 9 },
          ],
        },
      ]);
    }
  }, [course]);

  const toggleSection = (i: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const openPreview = (videoUrl?: string) => {
    setPreviewUrl(videoUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    setPreviewModal(true);
  };

  const handleEnroll = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (isEnrolled) { router.push('/student'); return; }
    if (course) {
      addToCart(course as Course);
      router.push('/cart');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (course) addToCart(course as Course);
  };

  const submitReview = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (myRating === 0) { toast.error('Please select a rating'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await reviewsApi.createReview(id as string, { rating: myRating, comment: myComment });
      setReviews((prev) => [data.review ?? data, ...prev]);
      setMyRating(0);
      setMyComment('');
      toast.success('Review submitted!');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!course && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <button onClick={() => router.push('/courses')} className="text-primary-400 hover:underline">Browse courses</button>
        </div>
      </div>
    );
  }

  const c = course!;
  const inCart = isInCart(c._id);
  const displayPrice = c.discountPrice ?? c.price;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="pt-16 bg-gradient-to-b from-[#0a0a16] to-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left content */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="inline-flex px-3 py-1 bg-primary-600/30 text-primary-300 text-sm font-medium rounded-lg mb-4">{c.category}</span>
                <h1 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-4 leading-tight">{c.title}</h1>
                <p className="text-white/60 text-lg mb-6 leading-relaxed">{c.description}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-bold">{(c.rating ?? 0).toFixed(1)}</span>
                    <StarRating value={Math.round(c.rating ?? 0)} readonly size={14} />
                    <span className="text-white/40 text-sm">({c.reviewCount ?? 0} reviews)</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-white/60 text-sm"><Users size={14} />{(c.studentCount ?? 0).toLocaleString()} students</span>
                  <span className="flex items-center gap-1.5 text-white/60 text-sm"><Clock size={14} />{formatDuration(c.duration ?? 0)}</span>
                  <span className="flex items-center gap-1.5 text-white/60 text-sm"><BookOpen size={14} />{c.lessonCount ?? 0} lessons</span>
                  <span className="flex items-center gap-1.5 text-white/60 text-sm"><Globe size={14} />Bengali / English</span>
                  <span className="flex items-center gap-1.5 text-white/60 text-sm"><Award size={14} />Certificate included</span>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                    {c.instructor?.name?.[0] ?? 'I'}
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Instructor</p>
                    <p className="text-white font-medium text-sm">{c.instructor?.name ?? 'Instructor'}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sticky sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card overflow-hidden"
                >
                  {/* Thumbnail with preview button */}
                  <div className="relative w-full h-52 bg-gradient-card cursor-pointer group" onClick={() => openPreview()}>
                    {c.thumbnail ? (
                      <Image src={c.thumbnail} alt={c.title} fill className="object-cover" sizes="400px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={40} className="text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play size={24} className="text-white fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white/80 text-xs rounded-lg">Preview</div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Price */}
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold text-white">{formatPrice(displayPrice)}</span>
                      {c.discountPrice && c.discountPrice < c.price && (
                        <span className="text-white/40 line-through text-lg">{formatPrice(c.price)}</span>
                      )}
                    </div>

                    {/* CTA buttons */}
                    {isEnrolled ? (
                      <Button fullWidth size="lg" onClick={() => router.push('/student')} leftIcon={<Play size={18} />}>
                        Continue Learning
                      </Button>
                    ) : (
                      <>
                        <Button fullWidth size="lg" onClick={handleEnroll} leftIcon={<Zap size={18} />}>
                          Enroll Now
                        </Button>
                        {!inCart ? (
                          <Button fullWidth variant="secondary" onClick={handleAddToCart} leftIcon={<ShoppingCart size={18} />}>
                            Add to Cart
                          </Button>
                        ) : (
                          <Button fullWidth variant="outline" onClick={() => router.push('/cart')} leftIcon={<ShoppingCart size={18} />}>
                            View Cart
                          </Button>
                        )}
                      </>
                    )}

                    <p className="text-center text-white/40 text-xs">30-day money-back guarantee</p>

                    {/* Includes */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3">This course includes:</p>
                      {[
                        `${formatDuration(c.duration ?? 0)} on-demand video`,
                        `${c.lessonCount ?? 0} lessons`,
                        'Full lifetime access',
                        'Certificate of completion',
                        'Downloadable resources',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-white/60 text-sm">
                          <CheckCircle2 size={14} className="text-accent-400 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Curriculum */}
            <section>
              <h2 className="text-2xl font-bold font-poppins text-white mb-6">Course Curriculum</h2>
              <div className="space-y-3">
                {sections.map((section, si) => (
                  <div key={si} className="border border-white/10 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(si)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                    >
                      <div>
                        <p className="font-semibold text-white">{section.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{section.lessons.length} lessons</p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-white/50 transition-transform ${expandedSections.has(si) ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSections.has(si) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10">
                            {section.lessons.map((lesson) => (
                              <div
                                key={lesson._id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.isPreview ? (
                                    <button
                                      onClick={() => openPreview()}
                                      className="w-7 h-7 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 hover:bg-primary-600/40 transition-colors"
                                    >
                                      <Play size={12} className="fill-current ml-0.5" />
                                    </button>
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                                      <Lock size={12} />
                                    </div>
                                  )}
                                  <span className={`text-sm ${lesson.isPreview ? 'text-white' : 'text-white/60'}`}>
                                    {lesson.title}
                                  </span>
                                  {lesson.isPreview && (
                                    <span className="text-xs px-1.5 py-0.5 bg-accent-600/20 text-accent-400 rounded">Preview</span>
                                  )}
                                </div>
                                <span className="text-white/40 text-xs flex-shrink-0">{formatDuration(lesson.duration)}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold font-poppins text-white mb-6">Student Reviews</h2>

              {/* Rating summary */}
              <div className="glass-card p-5 flex items-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-white">{(c.rating ?? 0).toFixed(1)}</p>
                  <StarRating value={Math.round(c.rating ?? 0)} readonly size={16} className="justify-center mt-1" />
                  <p className="text-white/40 text-xs mt-1">{c.reviewCount ?? 0} ratings</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-white/40 w-2">{star}</span>
                      <Star size={11} className="fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: star === 5 ? '65%' : star === 4 ? '25%' : star === 3 ? '7%' : '2%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add review */}
              {isAuthenticated && isEnrolled && (
                <div className="glass-card p-5 mb-6">
                  <h3 className="text-white font-semibold mb-4">Leave a Review</h3>
                  <StarRating value={myRating} onChange={setMyRating} size={24} className="mb-3" />
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="Share your experience…"
                    rows={3}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 resize-none mb-3 text-sm"
                  />
                  <Button onClick={submitReview} isLoading={submittingReview} size="sm">Submit Review</Button>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((r) => (
                  <div key={r._id} className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                        {r.user?.name?.[0] ?? 'U'}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{r.user?.name ?? 'Student'}</p>
                        <div className="flex items-center gap-2">
                          <StarRating value={r.rating} readonly size={12} />
                          <span className="text-white/30 text-xs">{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                )) : (
                  <p className="text-white/40 text-sm text-center py-8">No reviews yet. Be the first!</p>
                )}
              </div>
            </section>
          </div>

          {/* Right column spacer (sidebar is sticky in top section) */}
          <div className="hidden lg:block lg:col-span-1" />
        </div>
      </div>

      {/* Preview modal */}
      <Modal isOpen={previewModal} onClose={() => setPreviewModal(false)} title="Course Preview" size="xl">
        <VideoPlayer src={previewUrl} className="w-full aspect-video" />
      </Modal>

      <Footer />
    </div>
  );
}
