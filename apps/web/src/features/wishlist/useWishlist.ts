import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useAuthStore();

  const handleAuthError = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      toast.error('Сесія закінчилась. Увійдіть знову.');
      logout();
      return true;
    }
    return false;
  };

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiClient.get('/wishlist');
      return response.data.data;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const wishlistProductIds = new Set(
    wishlistItems.map((item: any) => item.product.id)
  );

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiClient.post(`/wishlist/${productId}`);
    },
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist']);
      // Optimistically update
      queryClient.setQueryData(['wishlist'], (old: any[] = []) => [
        ...old,
        { product: { id: productId } }
      ]);
      return { previousWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Додано до списку бажань');
    },
    onError: (error, _productId, context) => {
      // Rollback on error
      queryClient.setQueryData(['wishlist'], context?.previousWishlist);
      if (!handleAuthError(error)) {
        toast.error('Помилка додавання');
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiClient.delete(`/wishlist/${productId}`);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData(['wishlist']);
      queryClient.setQueryData(['wishlist'], (old: any[] = []) =>
        old.filter((item: any) => item.product.id !== productId)
      );
      return { previousWishlist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Видалено зі списку бажань');
    },
    onError: (error, _productId, context) => {
      queryClient.setQueryData(['wishlist'], context?.previousWishlist);
      if (!handleAuthError(error)) {
        toast.error('Помилка видалення');
      }
    },
  });

  const toggleWishlist = (productId: string) => {
    // Check auth state from store
    const authState = useAuthStore.getState();

    if (!authState.isAuthenticated || !authState.accessToken) {
      toast.error('Увійдіть, щоб додати до списку бажань');
      return;
    }

    const isCurrentlyInWishlist = wishlistProductIds.has(productId);

    if (isCurrentlyInWishlist) {
      toast.loading('Видаляємо...', { id: 'wishlist-action' });
      removeMutation.mutate(productId, {
        onSettled: () => toast.dismiss('wishlist-action')
      });
    } else {
      toast.loading('Додаємо...', { id: 'wishlist-action' });
      addMutation.mutate(productId, {
        onSettled: () => toast.dismiss('wishlist-action')
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistProductIds.has(productId);
  };

  return {
    wishlistItems,
    wishlistProductIds,
    toggleWishlist,
    isInWishlist,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
