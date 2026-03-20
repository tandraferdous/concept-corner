import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi, RegisterPayload } from '@/utils/api';
import toast from 'react-hot-toast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  setUser: (user: User) => void;
  fetchMe: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: User) => set({ user, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { token, refreshToken, user } = data;
          localStorage.setItem('token', token);
          Cookies.set('token', token, { expires: 7 });
          if (refreshToken) Cookies.set('refreshToken', refreshToken, { expires: 30 });
          set({ user, token, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : (error as { response?: { data?: { message?: string } } })?.response?.data
                  ?.message || 'Login failed';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        localStorage.removeItem('token');
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const payload: RegisterPayload = { name, email, password };
          const { data } = await authApi.register(payload);
          const { token, refreshToken, user } = data;
          localStorage.setItem('token', token);
          Cookies.set('token', token, { expires: 7 });
          if (refreshToken) Cookies.set('refreshToken', refreshToken, { expires: 30 });
          set({ user, token, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: unknown) {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Registration failed';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      initAuth: async () => {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('token') || Cookies.get('token')
            : undefined;
        if (token) {
          set({ token, isLoading: true });
          await get().fetchMe();
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    logout: store.logout,
    register: store.register,
    fetchMe: store.fetchMe,
    initAuth: store.initAuth,
  };
}
