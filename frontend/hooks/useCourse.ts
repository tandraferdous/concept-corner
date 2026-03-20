import { useState, useCallback } from 'react';
import { coursesApi, CoursePayload } from '@/utils/api';
import toast from 'react-hot-toast';

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: number;
  lessonCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  tags?: string[];
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  pages: number;
}

export function useCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchCourses = useCallback(
    async (params?: Record<string, string | number>) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await coursesApi.getCourses(params);
        setCourses(data.courses ?? data);
        setTotal(data.total ?? data.length);
        setPages(data.pages ?? 1);
      } catch {
        setError('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchCourse = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await coursesApi.getCourse(id);
      setCourse(data.course ?? data);
    } catch {
      setError('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await coursesApi.getFeaturedCourses();
      setCourses(data.courses ?? data);
    } catch {
      setError('Failed to load featured courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (payload: CoursePayload) => {
    setIsLoading(true);
    try {
      const { data } = await coursesApi.createCourse(payload);
      toast.success('Course created successfully');
      return data.course ?? data;
    } catch {
      toast.error('Failed to create course');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCourse = useCallback(
    async (id: string, payload: Partial<CoursePayload>) => {
      setIsLoading(true);
      try {
        const { data } = await coursesApi.updateCourse(id, payload);
        toast.success('Course updated successfully');
        return data.course ?? data;
      } catch {
        toast.error('Failed to update course');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteCourse = useCallback(async (id: string) => {
    try {
      await coursesApi.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      toast.success('Course deleted');
      return true;
    } catch {
      toast.error('Failed to delete course');
      return false;
    }
  }, []);

  const searchCourses = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const { data } = await coursesApi.searchCourses(query);
      setCourses(data.courses ?? data);
    } catch {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    course,
    isLoading,
    error,
    total,
    pages,
    fetchCourses,
    fetchCourse,
    fetchFeatured,
    createCourse,
    updateCourse,
    deleteCourse,
    searchCourses,
  };
}
