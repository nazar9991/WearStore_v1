import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, Users } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { formatPrice } from '@/shared/lib/utils';

export default function ReportsPage() {
  const { data: topProducts, isLoading: isLoadingTop } = useQuery({
    queryKey: ['admin', 'reports', 'top-products'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/reports/products/top?limit=10');
      return response.data.data;
    },
  });

  const { data: lowStock, isLoading: isLoadingLow } = useQuery({
    queryKey: ['admin', 'reports', 'low-stock'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/reports/products/low-stock?threshold=10');
      return response.data.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Звіти та аналітика</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-lg">Топ товарів за продажами</h2>
          </div>

          {isLoadingTop ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts?.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <img
                    src={product.image || 'https://placehold.co/40'}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-neutral-500">Продано: {product.soldQuantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-lg">Товари з низьким залишком</h2>
          </div>

          {isLoadingLow ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock?.slice(0, 10).map((variant: any) => (
                <div key={variant.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{variant.product.name}</p>
                    <p className="text-sm text-neutral-500">
                      {variant.size} / {variant.color}
                    </p>
                  </div>
                  <span className={`font-medium ${variant.stock < 5 ? 'text-error' : 'text-warning'}`}>
                    {variant.stock} шт
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
