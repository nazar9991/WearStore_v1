import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API client - use function inside factory to avoid hoisting issues
vi.mock('../../src/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useCartStore } from '../../src/features/cart/store/cartStore';
import { apiClient } from '../../src/shared/api/client';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({
      cart: null,
      itemsCount: 0,
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = useCartStore.getState();

    expect(state.cart).toBeNull();
    expect(state.itemsCount).toBe(0);
    expect(state.isLoading).toBe(false);
  });

  describe('fetchCart', () => {
    it('fetches and sets cart data', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [
          { id: 'item-1', quantity: 2 },
        ],
        subtotal: '2000',
        itemCount: 2,
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCart },
      });

      await useCartStore.getState().fetchCart();

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
      expect(state.itemsCount).toBe(2);
    });

    it('handles fetch error gracefully', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Not authenticated'));

      await useCartStore.getState().fetchCart();

      const state = useCartStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addItem', () => {
    it('adds item to cart', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [{ id: 'item-1', quantity: 1 }],
        subtotal: '1000',
        itemCount: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockCart },
      });

      await useCartStore.getState().addItem('variant-1', 1);

      expect(apiClient.post).toHaveBeenCalledWith('/cart/items', {
        variantId: 'variant-1',
        quantity: 1,
      });

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
      expect(state.itemsCount).toBe(1);
    });

    it('throws error on add failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({
        response: { data: { message: 'Out of stock' } },
      });

      await expect(
        useCartStore.getState().addItem('variant-1', 1)
      ).rejects.toBeDefined();
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [{ id: 'item-1', quantity: 3 }],
        subtotal: '3000',
        itemCount: 3,
      };

      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { data: mockCart },
      });

      await useCartStore.getState().updateQuantity('item-1', 3);

      expect(apiClient.patch).toHaveBeenCalledWith('/cart/items/item-1', {
        quantity: 3,
      });

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
    });
  });

  describe('removeItem', () => {
    it('removes item from cart', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [],
        subtotal: '0',
        itemCount: 0,
      };

      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { data: mockCart },
      });

      await useCartStore.getState().removeItem('item-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/cart/items/item-1');

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
      expect(state.itemsCount).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('clears all items from cart', async () => {
      useCartStore.setState({
        cart: {
          id: 'cart-1',
          items: [{ id: 'item-1' }, { id: 'item-2' }] as any,
          subtotal: '2000',
          itemCount: 2,
        },
        itemsCount: 2,
      });

      const mockCart = {
        id: 'cart-1',
        items: [],
        subtotal: '0',
        itemCount: 0,
      };

      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { data: mockCart },
      });

      await useCartStore.getState().clearCart();

      expect(apiClient.delete).toHaveBeenCalledWith('/cart');

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
      expect(state.itemsCount).toBe(0);
    });
  });

  describe('loading state', () => {
    it('sets isLoading during fetch', async () => {
      let loadingDuringFetch = false;

      vi.mocked(apiClient.get).mockImplementation(() => {
        loadingDuringFetch = useCartStore.getState().isLoading;
        return Promise.resolve({
          data: { data: { id: 'cart-1', items: [], subtotal: '0', itemCount: 0 } },
        });
      });

      await useCartStore.getState().fetchCart();

      expect(loadingDuringFetch).toBe(true);
      expect(useCartStore.getState().isLoading).toBe(false);
    });
  });
});
