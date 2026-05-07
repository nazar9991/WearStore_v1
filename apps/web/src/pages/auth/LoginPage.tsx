import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Quick login credentials for development
const quickLoginUsers = [
  { role: 'Клієнт', email: 'client1@example.com', password: 'client123', color: 'bg-blue-500 hover:bg-blue-600' },
  { role: 'Менеджер', email: 'manager1@wearstore.ua', password: 'manager123', color: 'bg-amber-500 hover:bg-amber-600' },
  { role: 'Адмін', email: 'admin@wearstore.ua', password: 'admin123', color: 'bg-red-500 hover:bg-red-600' },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Вітаємо!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка входу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (user: typeof quickLoginUsers[0]) => {
    setQuickLoginLoading(user.role);
    try {
      await login(user.email, user.password);
      toast.success(`Вітаємо, ${user.role}!`);
      // Redirect admin/manager to admin panel
      if (user.role === 'Адмін' || user.role === 'Менеджер') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка входу');
    } finally {
      setQuickLoginLoading(null);
    }
  };

  const fillCredentials = (user: typeof quickLoginUsers[0]) => {
    setValue('email', user.email);
    setValue('password', user.password);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">Вхід</h1>
          <p className="text-neutral-600 mt-2">
            Увійдіть до свого акаунту WearStore
          </p>
        </div>

        {/* Quick Login Buttons */}
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-sm text-neutral-500 mb-3 text-center font-medium">
            Швидкий вхід (для тестування)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quickLoginUsers.map((user) => (
              <button
                key={user.role}
                type="button"
                onClick={() => handleQuickLogin(user)}
                disabled={quickLoginLoading !== null}
                className={`${user.color} text-white text-sm font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {quickLoginLoading === user.role ? (
                  <span className="inline-block animate-spin">...</span>
                ) : (
                  user.role
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-2">
            {quickLoginUsers.map((user) => (
              <button
                key={`fill-${user.role}`}
                type="button"
                onClick={() => fillCredentials(user)}
                className="text-xs text-neutral-400 hover:text-neutral-600 underline"
              >
                {user.role}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 text-center mt-1">
            Натисніть для заповнення форми
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            label="Пароль"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-neutral-600">Запам'ятати мене</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-primary-500 hover:underline"
            >
              Забули пароль?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Увійти
          </Button>
        </form>

        <p className="text-center mt-6 text-neutral-600">
          Ще не маєте акаунту?{' '}
          <Link to="/auth/register" className="text-primary-500 hover:underline font-medium">
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
