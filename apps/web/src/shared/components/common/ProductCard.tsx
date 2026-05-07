import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn, formatPrice, getDiscountPercent } from '@/shared/lib/utils';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: string | number;
    salePrice?: string | number | null;
    images: { url: string; altText?: string }[];
    category?: { name: string; slug: string };
  };
  onWishlistClick?: (productId: string) => void;
  isInWishlist?: boolean;
}

export function ProductCard({ product, onWishlistClick, isInWishlist }: ProductCardProps) {
  const navigate = useNavigate();

  const basePrice = typeof product.basePrice === 'string'
    ? parseFloat(product.basePrice)
    : product.basePrice;

  const salePrice = product.salePrice
    ? typeof product.salePrice === 'string'
      ? parseFloat(product.salePrice)
      : product.salePrice
    : null;

  const hasDiscount = salePrice !== null && salePrice < basePrice;
  const discount = hasDiscount ? getDiscountPercent(basePrice, salePrice!) : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if click was on wishlist button
    const target = e.target as HTMLElement;
    if (target.closest('[data-wishlist-btn]')) {
      return;
    }
    navigate(`/product/${product.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistClick) {
      onWishlistClick(product.id);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.category) {
      navigate(`/catalog/${product.category.slug}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {/* Image section */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
        <img
          src={product.images[0]?.url || 'https://placehold.co/400x533/fdf2f4/e05070?text=No+Image'}
          alt={product.images[0]?.altText || product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <Badge variant="error">-{discount}%</Badge>
          </div>
        )}

        {/* Wishlist button */}
        {onWishlistClick && (
          <div
            data-wishlist-btn
            onClick={handleWishlistClick}
            className={cn(
              'absolute top-3 right-3 w-10 h-10 flex items-center justify-center',
              'rounded-full bg-white shadow-lg cursor-pointer',
              'transition-transform duration-200 hover:scale-110 active:scale-95',
              isInWishlist ? 'text-primary-500' : 'text-neutral-400 hover:text-primary-500'
            )}
          >
            <Heart className={cn('w-5 h-5 pointer-events-none', isInWishlist && 'fill-current')} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {product.category && (
          <span
            onClick={handleCategoryClick}
            className="text-xs text-neutral-500 hover:text-primary-500 transition-colors cursor-pointer"
          >
            {product.category.name}
          </span>
        )}

        <h3 className="mt-1 font-medium text-neutral-900 group-hover:text-primary-500 transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className={cn(
            'font-semibold',
            hasDiscount ? 'text-primary-500' : 'text-neutral-900'
          )}>
            {formatPrice(salePrice ?? basePrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(basePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
