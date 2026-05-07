import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { ProductCard } from '@/shared/components/common/ProductCard';
import { Pagination } from '@/shared/components/common/Pagination';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, page],
    queryFn: async () => {
      if (!query) return null;
      const response = await apiClient.get(
        `/catalog/search?q=${encodeURIComponent(query)}&page=${page}&limit=12`
      );
      return response.data;
    },
    enabled: !!query,
  });

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Результати пошуку
        </h1>
        {query && (
          <p className="text-neutral-600 mt-2">
            За запитом "{query}" {data?.pagination?.total ? `знайдено ${data.pagination.total} товарів` : ''}
          </p>
        )}
      </div>

      {!query ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-medium mb-2">Введіть пошуковий запит</h2>
          <p className="text-neutral-600">
            Використовуйте поле пошуку у верхній частині сторінки
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.data.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Search className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-medium mb-2">Нічого не знайдено</h2>
          <p className="text-neutral-600">
            Спробуйте змінити пошуковий запит
          </p>
        </div>
      )}
    </div>
  );
}
