import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
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

export default function OrderDetailPage() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${id}`);
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

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Замовлення не знайдено</h1>
        <Link to="/account/orders" className="text-primary-500 hover:underline">
          Повернутись до замовлень
        </Link>
      </div>
    );
  }

  const address = order.addressSnapshot as any;

  return (
    <div className="container py-8">
      <Link
        to="/account/orders"
        className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад до замовлень
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-neutral-600">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge
          variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : 'primary'}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {order.items.map((item: any) => {
            const snapshot = item.productSnapshot as any;
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-neutral-200"
              >
                <img
                  src={snapshot.image || 'https://placehold.co/100x130'}
                  alt={snapshot.name}
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{snapshot.name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {SIZE_LABELS[snapshot.size]} / {snapshot.color}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Кількість: {item.quantity}
                  </p>
                  <p className="font-semibold mt-2">{formatPrice(item.totalPrice)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Payment */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="font-semibold mb-4">Оплата</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Спосіб</span>
                <span>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'При отриманні' : 'LiqPay'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Статус</span>
                <span>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="font-semibold mb-4">Доставка</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Спосіб</span>
                <span>{DELIVERY_METHOD_LABELS[order.deliveryMethod]}</span>
              </div>
              {address && (
                <div>
                  <span className="text-neutral-600">Адреса:</span>
                  <p className="mt-1">
                    {address.city}, {address.street}, {address.building}
                    {address.apartment && `, кв. ${address.apartment}`}
                  </p>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Трек-номер</span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="font-semibold mb-4">Підсумок</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Товари</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-success">
                  <span>Знижка</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Доставка</span>
                <span>
                  {parseFloat(order.shippingCost) === 0 ? 'Безкоштовно' : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Всього</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
