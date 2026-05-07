import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { ProductCard } from '@/shared/components/common/ProductCard';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { useWishlist } from '@/features/wishlist/useWishlist';

export default function WishlistPage() {
  const { toggleWishlist } = useWishlist();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiClient.get('/wishlist');
      return response.data.data;
    },
  });

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Список бажань</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((item: any) => (
            <ProductCard
              key={item.id}
              product={{
                ...item.product,
                images: item.product.image ? [{ url: item.product.image }] : [],
              }}
              isInWishlist
              onWishlistClick={() => toggleWishlist(item.product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-medium mb-2">Список бажань порожній</h2>
          <p className="text-neutral-600 mb-6">
            Додавайте товари до списку, натискаючи на серце
          </p>
          <Link
            to="/catalog"
            className="text-primary-500 hover:underline font-medium"
          >
            Перейти до каталогу
          </Link>
        </div>
      )}
    </div>
  );
}
