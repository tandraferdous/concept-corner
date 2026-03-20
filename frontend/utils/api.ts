import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || Cookies.get('token')
        : Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          const newToken = data.token;
          localStorage.setItem('token', newToken);
          Cookies.set('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — clear credentials
        localStorage.removeItem('token');
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }
export interface ForgotPasswordPayload { email: string }
export interface ResetPasswordPayload { token: string; password: string }
export interface CoursePayload {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  thumbnail?: string;
}
export interface LessonPayload {
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
}
export interface ReviewPayload { rating: number; comment: string }
export interface PaymentPayload { courseIds: string[]; amount: number; phone: string }

// ── Auth ───────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) => api.post('/auth/login', payload),
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (payload: ForgotPasswordPayload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload: ResetPasswordPayload) =>
    api.post(`/auth/reset-password/${payload.token}`, { password: payload.password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// ── Courses ────────────────────────────────────────────────────────────────────

export const coursesApi = {
  getCourses: (params?: Record<string, string | number>) => api.get('/courses', { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (payload: CoursePayload) => api.post('/courses', payload),
  updateCourse: (id: string, payload: Partial<CoursePayload>) => api.put(`/courses/${id}`, payload),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
  getFeaturedCourses: () => api.get('/courses/featured'),
  searchCourses: (query: string) => api.get('/courses/search', { params: { q: query } }),
};

// ── Lessons ────────────────────────────────────────────────────────────────────

export const lessonsApi = {
  getLessons: (courseId: string) => api.get(`/courses/${courseId}/lessons`),
  getLesson: (courseId: string, lessonId: string) =>
    api.get(`/courses/${courseId}/lessons/${lessonId}`),
  createLesson: (courseId: string, payload: LessonPayload) =>
    api.post(`/courses/${courseId}/lessons`, payload),
  updateLesson: (courseId: string, lessonId: string, payload: Partial<LessonPayload>) =>
    api.put(`/courses/${courseId}/lessons/${lessonId}`, payload),
  deleteLesson: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
};

// ── Enrollments ────────────────────────────────────────────────────────────────

export const enrollmentsApi = {
  getMyEnrollments: () => api.get('/enrollments/me'),
  checkEnrollment: (courseId: string) => api.get(`/enrollments/check/${courseId}`),
};

// ── Payments ───────────────────────────────────────────────────────────────────

export const paymentsApi = {
  createPayment: (payload: PaymentPayload) => api.post('/payments/create', payload),
  verifyPayment: (paymentId: string, trxId: string) =>
    api.post('/payments/verify', { paymentId, trxId }),
  getPaymentHistory: () => api.get('/payments/history'),
};

// ── Cart ───────────────────────────────────────────────────────────────────────

export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (courseId: string) => api.post('/cart', { courseId }),
  removeFromCart: (courseId: string) => api.delete(`/cart/${courseId}`),
  clearCart: () => api.delete('/cart'),
};

// ── Reviews ────────────────────────────────────────────────────────────────────

export const reviewsApi = {
  getCourseReviews: (courseId: string) => api.get(`/courses/${courseId}/reviews`),
  createReview: (courseId: string, payload: ReviewPayload) =>
    api.post(`/courses/${courseId}/reviews`, payload),
  updateReview: (courseId: string, reviewId: string, payload: Partial<ReviewPayload>) =>
    api.put(`/courses/${courseId}/reviews/${reviewId}`, payload),
  deleteReview: (courseId: string, reviewId: string) =>
    api.delete(`/courses/${courseId}/reviews/${reviewId}`),
};

// ── Admin ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllUsers: (params?: Record<string, string | number>) => api.get('/admin/users', { params }),
  getAllCourses: (params?: Record<string, string | number>) => api.get('/admin/courses', { params }),
  getAllPayments: (params?: Record<string, string | number>) =>
    api.get('/admin/payments', { params }),
};
