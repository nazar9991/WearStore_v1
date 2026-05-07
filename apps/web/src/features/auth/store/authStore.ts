import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/api/client';
import { queryClient } from '@/app/App';
import { useCartStore } from '@/features/cart/store/cartStore';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'MANAGER' | 'ADMIN';
  avatarUrl?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setUser: (user) => {
        set({ user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const { accessToken } = response.data.data;
          set({ accessToken, isAuthenticated: true });
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/register', data);
          const { accessToken } = response.data.data;
          set({ accessToken, isAuthenticated: true });
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // Ignore errors
        }
        // Clear all user-specific cached data
        queryClient.removeQueries({ queryKey: ['wishlist'] });
        queryClient.removeQueries({ queryKey: ['cart'] });
        queryClient.removeQueries({ queryKey: ['orders'] });
        queryClient.removeQueries({ queryKey: ['addresses'] });
        queryClient.removeQueries({ queryKey: ['profile'] });
        // Reset cart store
        useCartStore.getState().reset();
        set({ accessToken: null, user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const response = await apiClient.get('/auth/me');
          set({ user: response.data.data });
        } catch {
          set({ accessToken: null, user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
