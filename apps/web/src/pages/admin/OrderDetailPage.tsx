import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import {
  formatPrice,
  formatDateTime,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  DELIVERY_METHOD_LABELS,
  SIZE_LABELS,
} from '@/shared/lib/utils';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

const STATUS_FLOW: { status: OrderStatus; label: string; icon: any; color: string }[] = [
  { status: 'PENDING', label: 'Очікує', icon: Clock, color: 'bg-yellow-500' },
  { status: 'CONFIRMED', label: 'Підтверджено', icon: CheckCircle, color: 'bg-blue-500' },
  { status: 'PROCESSING', label: 'Обробляється', icon: Package, color: 'bg-indigo-500' },
  { status: 'SHIPPED', label: 'Відправлено', icon: Truck, color: 'bg-purple-500' },
  { status: 'DELIVERED', label: 'Доставлено', icon: CheckCircle, color: 'bg-green-500' },
];

const STATUS_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'neutral',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [managerNote, setManagerNote] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/orders/${id}`);
      return response.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, comment }: { status: OrderStatus; comment?: string }) => {
      return apiClient.patch(`/admin/orders/${id}/status`, { status, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Статус оновлено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка оновлення статусу');
    },
  });

  const addTrackingMutation = useMutation({
    mutationFn: async (trackingNumber: string) => {
      return apiClient.patch(`/admin/orders/${id}/tracking`, { trackingNumber });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      setTrackingNumber('');
      toast.success('Трек-номер додано');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка додавання трек-номера');
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      return apiClient.patch(`/admin/orders/${id}/note`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      setManagerNote('');
      toast.success('Нотатку збережено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка збереження нотатки');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return <div>Замовлення не знайдено</div>;
  }

  const address = order.addressSnapshot as any;
  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад до замовлень
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-neutral-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Status Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Статус замовлення</h2>

          {/* Progress bar */}
          <div className="flex items-center mb-6">
            {STATUS_FLOW.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? step.color : 'bg-neutral-200'
                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-primary-200' : ''}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentStatusIndex ? 'bg-green-500' : 'bg-neutral-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Status change buttons */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FLOW.map((step, index) => (
              <Button
                key={step.status}
                variant={order.status === step.status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateStatusMutation.mutate({ status: step.status })}
                disabled={updateStatusMutation.isPending || order.status === step.status}
              >
                {step.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateStatusMutation.mutate({ status: 'CANCELLED' })}
              disabled={updateStatusMutation.isPending || isCancelled}
              className="text-red-500 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Скасувати
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Клієнт</h2>
            <div className="space-y-2">
              <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
              <p className="text-neutral-600">{order.user.email}</p>
              {order.user.phone && <p className="text-neutral-600">{order.user.phone}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Товари</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => {
                const snapshot = item.productSnapshot as any;
                return (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={snapshot.image || 'https://placehold.co/80'}
                      alt=""
                      className="w-20 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{snapshot.name}</p>
                      <p className="text-sm text-neutral-500">
                        {SIZE_LABELS[snapshot.size]} / {snapshot.color}
                      </p>
                      <p className="text-sm text-neutral-500">Кількість: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manager Note */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Нотатка менеджера</h2>
            {order.managerNote && (
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-neutral-700">{order.managerNote}</p>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder="Додати нотатку..."
                rows={2}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
              <Button
                onClick={() => addNoteMutation.mutate(managerNote)}
                disabled={!managerNote.trim() || addNoteMutation.isPending}
              >
                Зберегти
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Доставка</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{DELIVERY_METHOD_LABELS[order.deliveryMethod]}</p>
              {address && (
                <p className="text-neutral-600">
                  {address.city}, {address.street}, {address.building}
                  {address.apartment && `, кв. ${address.apartment}`}
                </p>
              )}

              {/* Tracking Number */}
              {order.trackingNumber ? (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 uppercase font-medium mb-1">Трек-номер</p>
                  <p className="font-mono font-medium text-green-800">{order.trackingNumber}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 uppercase font-medium mb-2">Додати трек-номер</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Введіть номер"
                      className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => addTrackingMutation.mutate(trackingNumber)}
                      disabled={!trackingNumber.trim() || addTrackingMutation.isPending}
                    >
                      <Truck className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Оплата</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-400" />
                <span>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'При отриманні' : 'LiqPay'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Статус:</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Підсумок</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Товари</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Знижка</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Доставка</span>
                <span>{parseFloat(order.shippingCost) === 0 ? 'Безкоштовно' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Всього</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order history */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Історія</h2>
              <div className="space-y-3">
                {order.statusHistory.map((entry: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                    <div>
                      <p className="font-medium">{ORDER_STATUS_LABELS[entry.status]}</p>
                      <p className="text-neutral-500 text-xs">{formatDateTime(entry.createdAt)}</p>
                      {entry.comment && (
                        <p className="text-neutral-600 text-xs mt-1">{entry.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
