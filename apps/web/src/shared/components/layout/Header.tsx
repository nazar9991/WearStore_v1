import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const cartItemsCount = useCartStore((state) => state.itemsCount);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      {/* Top bar */}
      <div className="bg-primary-500 text-white text-center py-2 text-sm">
        Безкоштовна доставка при замовленні від 2000 ₴
      </div>

      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-neutral-700"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-display text-2xl md:text-3xl font-bold text-primary-500">
              WearStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/catalog"
              className="text-neutral-700 hover:text-primary-500 transition-colors font-medium"
            >
              Каталог
            </Link>
            <Link
              to="/catalog/sukni"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              Сукні
            </Link>
            <Link
              to="/catalog/bluzy-topy"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              Блузи
            </Link>
            <Link
              to="/catalog/verhnii-odiag"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              Верхній одяг
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-full border border-neutral-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </form>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/account/wishlist"
                className="p-2 text-neutral-700 hover:text-primary-500 transition-colors"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-neutral-700 hover:text-primary-500 transition-colors relative"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User */}
            <Link
              to={isAuthenticated ? '/account' : '/auth/login'}
              className="p-2 text-neutral-700 hover:text-primary-500 transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>

            {/* Admin/Manager link */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="hidden md:inline-flex px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Адмін
              </Link>
            )}
            {user?.role === 'MANAGER' && (
              <Link
                to="/admin"
                className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Менеджер
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 bg-white"
          >
            <div className="container py-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук товарів..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              </form>

              <nav className="space-y-2">
                <Link
                  to="/catalog"
                  className="block py-2 text-neutral-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Каталог
                </Link>
                <Link
                  to="/catalog/sukni"
                  className="block py-2 text-neutral-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Сукні
                </Link>
                <Link
                  to="/catalog/bluzy-topy"
                  className="block py-2 text-neutral-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Блузи
                </Link>
                <Link
                  to="/catalog/verhnii-odiag"
                  className="block py-2 text-neutral-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Верхній одяг
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
