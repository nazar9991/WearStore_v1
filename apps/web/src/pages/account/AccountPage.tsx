import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

const menuItems = [
  { icon: Package, label: 'Мої замовлення', path: '/account/orders', description: 'Перегляд історії замовлень' },
  { icon: Heart, label: 'Список бажань', path: '/account/wishlist', description: 'Збережені товари' },
  { icon: MapPin, label: 'Адреси доставки', path: '/account/addresses', description: 'Управління адресами' },
  { icon: Settings, label: 'Налаштування', path: '/account/settings', description: 'Профіль та пароль' },
];

export default function AccountPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-8">
          <h1 className="font-display text-2xl font-bold">
            Вітаємо, {user?.firstName}!
          </h1>
          <p className="text-primary-100 mt-1">{user?.email}</p>
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-start gap-4 p-6 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="p-3 rounded-lg bg-primary-50">
                <item.icon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h2 className="font-semibold">{item.label}</h2>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-neutral-600 hover:text-error hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Вийти з акаунту
        </button>
      </div>
    </div>
  );
}
