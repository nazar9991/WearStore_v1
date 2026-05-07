import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, MapPin, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { apiClient } from '@/shared/api/client';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { formatPrice, DELIVERY_METHOD_LABELS } from '@/shared/lib/utils';

interface Address {
  id: string;
  label: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('NOVA_POSHTA_WAREHOUSE');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [customerNote, setCustomerNote] = useState('');
  const [newAddress, setNewAddress] = useState({
    city: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: '',
  });

  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/addresses');
      return response.data.data as Address[];
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
      setUseNewAddress(false);
    } else {
      setUseNewAddress(true);
    }
  }, [addresses]);

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!useNewAddress && !selectedAddressId) {
      toast.error('Виберіть адресу доставки');
      return;
    }

    if (useNewAddress && (!newAddress.city || !newAddress.street || !newAddress.building)) {
      toast.error('Заповніть обовязкові поля адреси');
      return;
    }

    setIsLoading(true);
    try {
      const orderData: any = {
        deliveryMethod,
        paymentMethod,
        customerNote: customerNote || undefined,
      };

      if (!useNewAddress && selectedAddressId) {
        orderData.addressId = selectedAddressId;
      }

      const response = await apiClient.post('/orders', orderData);

      toast.success('Замовлення створено!');
      navigate('/checkout/success', {
        state: { order: response.data.data },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка створення замовлення');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Кошик порожній</h1>
        <p className="text-neutral-600 mb-6">Додайте товари для оформлення замовлення</p>
        <Button onClick={() => navigate('/catalog')}>До каталогу</Button>
      </div>
    );
  }

  const subtotal = parseFloat(cart.subtotal);
  const shippingCost = subtotal >= 2000 ? 0 : 70;
  const total = subtotal + shippingCost;

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Оформлення замовлення</h1>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Method */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-lg mb-4">Спосіб доставки</h2>
              <div className="space-y-3">
                {Object.entries(DELIVERY_METHOD_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      deliveryMethod === value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={value}
                      checked={deliveryMethod === value}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-3">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Address Selection */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-lg mb-4">Адреса доставки</h2>

              {addressesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {/* Saved Addresses */}
                  {addresses && addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                            !useNewAddress && selectedAddressId === address.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressSelection"
                            checked={!useNewAddress && selectedAddressId === address.id}
                            onChange={() => {
                              setSelectedAddressId(address.id);
                              setUseNewAddress(false);
                            }}
                            className="w-4 h-4 mt-1 text-primary-500 focus:ring-primary-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{address.label}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                  За замовчуванням
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">
                              {address.city}, {address.street}, {address.building}
                              {address.apartment && `, кв. ${address.apartment}`}
                            </p>
                            <p className="text-sm text-neutral-500">{address.postalCode}</p>
                          </div>
                          {!useNewAddress && selectedAddressId === address.id && (
                            <Check className="w-5 h-5 text-primary-500" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* New Address Option */}
                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      useNewAddress
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressSelection"
                      checked={useNewAddress}
                      onChange={() => setUseNewAddress(true)}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                    />
                    <Plus className="w-4 h-4 ml-3 text-neutral-400" />
                    <span className="ml-2">Ввести нову адресу</span>
                  </label>

                  {/* New Address Form */}
                  {useNewAddress && (
                    <div className="mt-4 p-4 bg-neutral-50 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Місто *"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          placeholder="Київ"
                          required={useNewAddress}
                        />
                        <Input
                          label="Поштовий індекс"
                          name="postalCode"
                          value={newAddress.postalCode}
                          onChange={handleNewAddressChange}
                          placeholder="01001"
                        />
                      </div>
                      <Input
                        label="Вулиця *"
                        name="street"
                        value={newAddress.street}
                        onChange={handleNewAddressChange}
                        placeholder="вул. Хрещатик"
                        required={useNewAddress}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Будинок *"
                          name="building"
                          value={newAddress.building}
                          onChange={handleNewAddressChange}
                          placeholder="1"
                          required={useNewAddress}
                        />
                        <Input
                          label="Квартира"
                          name="apartment"
                          value={newAddress.apartment}
                          onChange={handleNewAddressChange}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-lg mb-4">Спосіб оплати</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-3">Оплата при отриманні</span>
                </label>
                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'LIQPAY'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="LIQPAY"
                    checked={paymentMethod === 'LIQPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-3">Онлайн оплата (LiqPay)</span>
                </label>
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-lg mb-4">Коментар до замовлення</h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={3}
                placeholder="Додаткова інформація..."
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Ваше замовлення</h2>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Підсумок</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Доставка</span>
                  <span className={shippingCost === 0 ? 'text-success' : ''}>
                    {shippingCost === 0 ? 'Безкоштовно' : formatPrice(shippingCost)}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 mt-4 pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Всього</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                isLoading={isLoading}
              >
                Підтвердити замовлення
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
