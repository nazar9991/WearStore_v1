import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/shared/lib/utils';

const STATUS_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'neutral',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders');
      return response.data;
    },
  });

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Мої замовлення</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data?.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((order: any) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block bg-white rounded-xl border border-neutral-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold">{order.orderNumber}</h2>
                    <Badge variant={STATUS_VARIANTS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {order.items.slice(0, 3).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden"
                  >
                    <img
                      src={(item.productSnapshot as any).image || 'https://placehold.co/64'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center text-sm text-neutral-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-medium mb-2">Замовлень поки немає</h2>
          <p className="text-neutral-600 mb-6">
            Ваші замовлення з'являться тут після оформлення
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
