import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/utils/api';
import toast from 'react-hot-toast';
import { Course } from './useCourse';

interface CartItem {
  course: Course;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (course: Course) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  isInCart: (courseId: string) => boolean;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      isInCart: (courseId: string) =>
        get().items.some((item) => item.course._id === courseId),

      total: () =>
        get().items.reduce((sum, item) => {
          const price = item.course.discountPrice ?? item.course.price;
          return sum + price;
        }, 0),

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await cartApi.getCart();
          set({ items: data.items ?? [] });
        } catch {
          // Cart might not be available for guests
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: async (course: Course) => {
        if (get().isInCart(course._id)) {
          toast('Already in cart');
          return;
        }
        const newItem: CartItem = { course, addedAt: new Date().toISOString() };
        set((state) => ({ items: [...state.items, newItem] }));
        try {
          await cartApi.addToCart(course._id);
          toast.success(`${course.title} added to cart`);
        } catch {
          // Revert on failure
          set((state) => ({
            items: state.items.filter((i) => i.course._id !== course._id),
          }));
          toast.error('Failed to add to cart');
        }
      },

      removeFromCart: async (courseId: string) => {
        const prev = get().items;
        set((state) => ({
          items: state.items.filter((i) => i.course._id !== courseId),
        }));
        try {
          await cartApi.removeFromCart(courseId);
          toast.success('Removed from cart');
        } catch {
          set({ items: prev });
          toast.error('Failed to remove from cart');
        }
      },

      clearCart: async () => {
        const prev = get().items;
        set({ items: [] });
        try {
          await cartApi.clearCart();
        } catch {
          set({ items: prev });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    isLoading: store.isLoading,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,
    fetchCart: store.fetchCart,
    isInCart: store.isInCart,
    total: store.total(),
    count: store.items.length,
  };
}
