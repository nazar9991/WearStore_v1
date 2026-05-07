import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { formatPrice } from '@/shared/lib/utils';

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-2">
          Дякуємо за замовлення!
        </h1>
        <p className="text-neutral-600 mb-8">
          Ваше замовлення <span className="font-semibold text-neutral-900">#{order.orderNumber}</span> успішно створено.
          Ми надішлемо вам підтвердження на email.
        </p>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 text-left mb-8">
          <h2 className="font-semibold mb-4">Деталі замовлення</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Номер замовлення</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Сума</span>
              <span className="font-medium">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Спосіб оплати</span>
              <span className="font-medium">
                {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'При отриманні' : 'Онлайн'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/account/orders/${order.id}`}>
            <Button variant="secondary">Переглянути замовлення</Button>
          </Link>
          <Link to="/catalog">
            <Button>Продовжити покупки</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
