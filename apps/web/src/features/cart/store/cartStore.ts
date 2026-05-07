import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/api/client';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    color: string;
    stock: number;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    salePrice: string | null;
    image: string | null;
  };
  unitPrice: string;
  totalPrice: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: string;
  itemCount: number;
}

interface CartState {
  cart: Cart | null;
  itemsCount: number;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      itemsCount: 0,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.get('/cart');
          const cart = response.data.data;
          set({ cart, itemsCount: cart.itemCount });
        } catch {
          // Not authenticated
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (variantId, quantity = 1) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/cart/items', { variantId, quantity });
          const cart = response.data.data;
          set({ cart, itemsCount: cart.itemCount });
          toast.success('Товар додано до кошика');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Помилка додавання товару');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
          const cart = response.data.data;
          set({ cart, itemsCount: cart.itemCount });
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Помилка оновлення кількості');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.delete(`/cart/items/${itemId}`);
          const cart = response.data.data;
          set({ cart, itemsCount: cart.itemCount });
          toast.success('Товар видалено з кошика');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Помилка видалення товару');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.delete('/cart');
          const cart = response.data.data;
          set({ cart, itemsCount: cart.itemCount });
        } catch {
          // Ignore
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set({ cart: null, itemsCount: 0, isLoading: false });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        itemsCount: state.itemsCount,
      }),
    }
  )
);
