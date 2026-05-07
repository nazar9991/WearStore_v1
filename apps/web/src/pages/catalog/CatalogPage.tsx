import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, X } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { ProductCard } from '@/shared/components/common/ProductCard';
import { Pagination } from '@/shared/components/common/Pagination';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { SIZE_LABELS } from '@/shared/lib/utils';
import { useWishlist } from '@/features/wishlist/useWishlist';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Ціна: за зростанням' },
  { value: 'price_desc', label: 'Ціна: за спаданням' },
];

export default function CatalogPage() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'newest';
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const onSale = searchParams.get('onSale') === 'true';

  const { data: category } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      const response = await apiClient.get(`/catalog/categories/${categorySlug}`);
      return response.data.data;
    },
    enabled: !!categorySlug,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { categorySlug, page, sort, sizes, onSale }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categorySlug) params.set('category', categorySlug);
      params.set('page', page.toString());
      params.set('limit', '12');
      params.set('sort', sort);
      if (sizes.length) params.set('sizes', sizes.join(','));
      if (onSale) params.set('onSale', 'true');

      const response = await apiClient.get(`/catalog/products?${params.toString()}`);
      return response.data;
    },
  });

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleSize = (size: string) => {
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    updateFilter('sizes', newSizes.length ? newSizes.join(',') : null);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          {category?.name || 'Каталог'}
        </h1>
        {category?.description && (
          <p className="mt-2 text-neutral-600">{category.description}</p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-0 z-40 bg-white p-6 transform transition-transform lg:relative lg:inset-auto lg:z-0 lg:block lg:w-64 lg:flex-shrink-0 lg:p-0 lg:transform-none
          ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="font-semibold text-lg">Фільтри</h2>
            <button onClick={() => setIsFilterOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Size Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Розмір</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SIZE_LABELS).map(([size, label]) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    sizes.includes(size)
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-neutral-300 text-neutral-700 hover:border-primary-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sale Filter */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => updateFilter('onSale', e.target.checked ? 'true' : null)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2">Тільки зі знижкою</span>
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-neutral-700"
            >
              <Filter className="w-5 h-5" />
              Фільтри
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Сортування:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : productsData?.data?.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productsData.data.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInWishlist={isInWishlist(product.id)}
                    onWishlistClick={toggleWishlist}
                  />
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  page={productsData.pagination.page}
                  totalPages={productsData.pagination.totalPages}
                  onPageChange={(p) => updateFilter('page', p.toString())}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">Товарів не знайдено</p>
              <Button variant="secondary" onClick={() => setSearchParams({})}>
                Скинути фільтри
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
