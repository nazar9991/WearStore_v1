import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { formatPrice } from '@/shared/lib/utils';

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Продажі за місяць',
      value: formatPrice(dashboard?.revenue?.thisMonth || 0),
      icon: TrendingUp,
      color: 'text-green-500 bg-green-100',
    },
    {
      label: 'Замовлень сьогодні',
      value: dashboard?.orders?.today || 0,
      icon: ShoppingCart,
      color: 'text-blue-500 bg-blue-100',
    },
    {
      label: 'Очікують підтвердження',
      value: dashboard?.orders?.pending || 0,
      icon: Package,
      color: 'text-yellow-500 bg-yellow-100',
    },
    {
      label: 'Нових клієнтів',
      value: dashboard?.users?.newThisMonth || 0,
      icon: Users,
      color: 'text-purple-500 bg-purple-100',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Загальна статистика</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <span className="text-neutral-600">Всього замовлень</span>
              <span className="font-semibold">{dashboard?.orders?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <span className="text-neutral-600">Замовлень за місяць</span>
              <span className="font-semibold">{dashboard?.orders?.thisMonth || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <span className="text-neutral-600">Загальний дохід</span>
              <span className="font-semibold">{formatPrice(dashboard?.revenue?.total || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Активних товарів</span>
              <span className="font-semibold">{dashboard?.products?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Увага потребують</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <span className="text-neutral-600">Замовлення в очікуванні</span>
              <span className="font-semibold text-yellow-600">{dashboard?.orders?.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Товари з низьким залишком</span>
              <span className="font-semibold text-red-600">{dashboard?.products?.lowStock || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
