import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';
import { Pagination } from '@/shared/components/common/Pagination';
import { formatPrice } from '@/shared/lib/utils';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      const response = await apiClient.get(`/admin/products?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Товари</h1>
        <Link to="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Додати товар
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за назвою або SKU..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Товар</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Категорія</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Ціна</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Статус</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.data?.map((product: any) => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]?.url || 'https://placehold.co/48'}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{product.sku}</td>
                  <td className="px-6 py-4 text-sm">{product.category.name}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{formatPrice(product.salePrice || product.basePrice)}</span>
                    {product.salePrice && (
                      <span className="text-sm text-neutral-400 line-through ml-2">
                        {formatPrice(product.basePrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.isActive ? 'success' : 'neutral'}>
                      {product.isActive ? 'Активний' : 'Неактивний'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-neutral-400 hover:text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data?.pagination && (
          <div className="border-t border-neutral-200 px-6 py-4">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
