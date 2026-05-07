import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Дашборд', path: '/admin' },
  { icon: Package, label: 'Товари', path: '/admin/products' },
  { icon: FolderTree, label: 'Категорії', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Замовлення', path: '/admin/orders' },
  { icon: Tag, label: 'Промокоди', path: '/admin/promo-codes' },
  { icon: Users, label: 'Користувачі', path: '/admin/users', adminOnly: true },
  { icon: BarChart3, label: 'Звіти', path: '/admin/reports', adminOnly: true },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-neutral-900 text-white transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
          {isSidebarOpen && (
            <Link to="/admin" className="font-display text-xl font-bold text-primary-400">
              WearStore
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
          <Link
            to="/"
            className="flex items-center px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3">На сайт</span>}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3">Вийти</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-300', isSidebarOpen ? 'ml-64' : 'ml-20')}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-800">
              {user?.role === 'ADMIN' ? 'Панель адміністратора' : 'Панель менеджера'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-sm font-medium text-neutral-800">
                {user?.firstName} {user?.lastName}
              </span>
              <span className={cn(
                'text-xs',
                user?.role === 'ADMIN' ? 'text-red-600' : 'text-blue-600'
              )}>
                {user?.role === 'ADMIN' ? 'Адміністратор' : 'Менеджер'}
              </span>
            </div>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-medium',
              user?.role === 'ADMIN'
                ? 'bg-red-100 text-red-600'
                : 'bg-blue-100 text-blue-600'
            )}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
