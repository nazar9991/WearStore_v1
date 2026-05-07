import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { formatPrice, SIZE_LABELS } from '@/shared/lib/utils';

export default function CartPage() {
  const { cart, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Кошик порожній</h1>
        <p className="text-neutral-600 mb-6">
          Увійдіть, щоб переглянути ваш кошик
        </p>
        <Link to="/auth/login">
          <Button>Увійти</Button>
        </Link>
      </div>
    );
  }

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Кошик порожній</h1>
        <p className="text-neutral-600 mb-6">
          Додайте товари до кошика, щоб оформити замовлення
        </p>
        <Link to="/catalog">
          <Button>Перейти до каталогу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Кошик</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white rounded-xl border border-neutral-200"
            >
              <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                <img
                  src={item.product.image || 'https://placehold.co/120x160'}
                  alt={item.product.name}
                  className="w-24 h-32 object-cover rounded-lg"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.product.slug}`}
                  className="font-medium hover:text-primary-500 transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-neutral-500 mt-1">
                  {SIZE_LABELS[item.variant.size]} / {item.variant.color}
                </p>
                <p className="font-semibold mt-2">{formatPrice(item.unitPrice)}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                      disabled={isLoading}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                      disabled={isLoading || item.quantity >= item.variant.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-neutral-400 hover:text-error transition-colors"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Підсумок замовлення</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Товари ({cart.itemCount})</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Доставка</span>
                <span className="text-success">Безкоштовно</span>
              </div>
            </div>

            <div className="border-t border-neutral-200 mt-4 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Всього</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
            </div>

            <Link to="/checkout" className="block mt-6">
              <Button className="w-full" size="lg">
                Оформити замовлення
              </Button>
            </Link>

            <Link
              to="/catalog"
              className="block text-center mt-4 text-primary-500 hover:underline"
            >
              Продовжити покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
