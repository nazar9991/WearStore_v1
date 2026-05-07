import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/shared/api/client';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useWishlist } from '@/features/wishlist/useWishlist';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { cn, formatPrice, getDiscountPercent, SIZE_LABELS } from '@/shared/lib/utils';

export default function ProductPage() {
  const { productSlug } = useParams();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { addItem, isLoading: isCartLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productSlug],
    queryFn: async () => {
      const response = await apiClient.get(`/catalog/products/${productSlug}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Товар не знайдено</h1>
        <Link to="/catalog" className="text-primary-500 hover:underline">
          Повернутись до каталогу
        </Link>
      </div>
    );
  }

  const basePrice = parseFloat(product.basePrice);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
  const hasDiscount = salePrice !== null && salePrice < basePrice;
  const discount = hasDiscount ? getDiscountPercent(basePrice, salePrice!) : 0;

  // Get unique sizes and colors
  const sizes = [...new Set(product.variants.map((v: any) => v.size))];
  const colors = [...new Set(product.variants.map((v: any) => v.color))];

  // Find selected variant
  const selectedVariant = product.variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id, quantity);
  };

  // Check if selected variant is in stock, or if any variant is in stock when nothing selected
  const isInStock = selectedVariant
    ? selectedVariant.stock > 0
    : product.variants.some((v: any) => v.stock > 0);

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link to="/" className="hover:text-primary-500">Головна</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/catalog" className="hover:text-primary-500">Каталог</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/catalog/${product.category.slug}`} className="hover:text-primary-500">
          {product.category.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100"
          >
            <img
              src={product.images[selectedImage]?.url || 'https://placehold.co/600x800'}
              alt={product.images[selectedImage]?.altText || product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((image: any, idx: number) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                    idx === selectedImage ? 'border-primary-500' : 'border-transparent'
                  )}
                >
                  <img
                    src={image.url}
                    alt={image.altText || ''}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-500">Артикул: {product.sku}</p>
              <h1 className="font-display text-3xl font-bold mt-1">{product.name}</h1>
            </div>
            {hasDiscount && (
              <Badge variant="error">-{discount}%</Badge>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className={cn(
              'text-3xl font-bold',
              hasDiscount ? 'text-primary-500' : 'text-neutral-900'
            )}>
              {formatPrice(salePrice ?? basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-neutral-400 line-through">
                {formatPrice(basePrice)}
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">
              Колір: {selectedColor && <span className="text-neutral-500">{selectedColor}</span>}
            </h3>
            <div className="flex gap-2">
              {colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    color === selectedColor
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-300 hover:border-primary-300'
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">
              Розмір: {selectedSize && <span className="text-neutral-500">{SIZE_LABELS[selectedSize]}</span>}
            </h3>
            <div className="flex gap-2">
              {sizes.map((size: string) => {
                const variant = product.variants.find(
                  (v: any) => v.size === size && v.color === (selectedColor || colors[0])
                );
                const inStock = variant?.stock > 0;

                return (
                  <button
                    key={size}
                    onClick={() => inStock && setSelectedSize(size)}
                    disabled={!inStock}
                    className={cn(
                      'w-12 h-12 rounded-lg border font-medium transition-colors',
                      size === selectedSize
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : inStock
                        ? 'border-neutral-300 hover:border-primary-300'
                        : 'border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                    )}
                  >
                    {SIZE_LABELS[size]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">Кількість</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-neutral-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {selectedVariant && (
                <span className="text-sm text-neutral-500">
                  В наявності: {selectedVariant.stock} шт.
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || !isInStock || isCartLoading}
              isLoading={isCartLoading}
              className="flex-1"
              size="lg"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {!isInStock
                ? 'Немає в наявності'
                : !selectedSize || !selectedColor
                ? 'Оберіть розмір та колір'
                : 'Додати до кошика'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => toggleWishlist(product.id)}
              className={isInWishlist(product.id) ? 'text-primary-500' : ''}
            >
              <Heart className={cn('w-5 h-5', isInWishlist(product.id) && 'fill-current')} />
            </Button>
          </div>

          {/* Description */}
          <div className="mt-10">
            <h3 className="font-semibold text-lg mb-4">Опис</h3>
            <p className="text-neutral-600 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Details */}
          {(product.material || product.careInstructions) && (
            <div className="mt-8 space-y-4">
              {product.material && (
                <div>
                  <h4 className="font-medium">Матеріал</h4>
                  <p className="text-neutral-600">{product.material}</p>
                </div>
              )}
              {product.careInstructions && (
                <div>
                  <h4 className="font-medium">Догляд</h4>
                  <p className="text-neutral-600">{product.careInstructions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
