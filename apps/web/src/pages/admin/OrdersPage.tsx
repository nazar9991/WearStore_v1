import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';
import { Pagination } from '@/shared/components/common/Pagination';
import { formatPrice, formatDateTime, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/shared/lib/utils';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const response = await apiClient.get(`/admin/orders?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Замовлення</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за номером або email..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="">Всі статуси</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
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
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Замовлення</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Клієнт</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Дата</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Сума</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Статус</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Оплата</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.data?.map((order: any) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-sm text-neutral-500">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDateTime(order.createdAt)}</td>
                  <td className="px-6 py-4 font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANTS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="p-2 text-neutral-400 hover:text-primary-500 transition-colors inline-block"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
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
