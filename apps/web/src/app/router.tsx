import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage'));
const ProductPage = lazy(() => import('@/pages/product/ProductPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('@/pages/checkout/CheckoutSuccessPage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

const AccountPage = lazy(() => import('@/pages/account/AccountPage'));
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'));
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'));
const SettingsPage = lazy(() => import('@/pages/account/SettingsPage'));

const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminProducts = lazy(() => import('@/pages/admin/ProductsPage'));
const AdminProductEdit = lazy(() => import('@/pages/admin/ProductEditPage'));
const AdminCategories = lazy(() => import('@/pages/admin/CategoriesPage'));
const AdminOrders = lazy(() => import('@/pages/admin/OrdersPage'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/OrderDetailPage'));
const AdminUsers = lazy(() => import('@/pages/admin/UsersPage'));
const AdminPromoCodes = lazy(() => import('@/pages/admin/PromoCodesPage'));
const AdminReports = lazy(() => import('@/pages/admin/ReportsPage'));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:categorySlug" element={<CatalogPage />} />
          <Route path="/product/:productSlug" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Auth routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/orders/:id" element={<OrderDetailPage />} />
            <Route path="/account/wishlist" element={<WishlistPage />} />
            <Route path="/account/addresses" element={<AddressesPage />} />
            <Route path="/account/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute requiredRoles={['MANAGER', 'ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductEdit />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/promo-codes" element={<AdminPromoCodes />} />

            <Route element={<ProtectedRoute requiredRoles={['ADMIN']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
