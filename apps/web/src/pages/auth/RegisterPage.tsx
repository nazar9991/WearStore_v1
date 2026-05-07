import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

const registerSchema = z.object({
  firstName: z.string().min(2, "Ім'я повинно містити мінімум 2 символи"),
  lastName: z.string().min(2, 'Прізвище повинно містити мінімум 2 символи'),
  email: z.string().email('Невірний формат email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Пароль повинен містити мінімум 8 символів'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролі не співпадають',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      toast.success('Реєстрація успішна!');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">Реєстрація</h1>
          <p className="text-neutral-600 mt-2">
            Створіть акаунт у WearStore
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="Ім'я"
              placeholder="Ваше ім'я"
              error={errors.firstName?.message}
            />
            <Input
              {...register('lastName')}
              label="Прізвище"
              placeholder="Ваше прізвище"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register('email')}
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
          />

          <Input
            {...register('phone')}
            label="Телефон (необов'язково)"
            type="tel"
            placeholder="+380501234567"
            error={errors.phone?.message}
          />

          <Input
            {...register('password')}
            label="Пароль"
            type="password"
            placeholder="Мінімум 8 символів"
            error={errors.password?.message}
          />

          <Input
            {...register('confirmPassword')}
            label="Підтвердіть пароль"
            type="password"
            placeholder="Повторіть пароль"
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Зареєструватись
          </Button>
        </form>

        <p className="text-center mt-6 text-neutral-600">
          Вже маєте акаунт?{' '}
          <Link to="/auth/login" className="text-primary-500 hover:underline font-medium">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
