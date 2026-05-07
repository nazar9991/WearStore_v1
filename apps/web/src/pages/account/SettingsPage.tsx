import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { apiClient } from '@/shared/api/client';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Введіть поточний пароль'),
  newPassword: z.string().min(8, 'Мінімум 8 символів'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Паролі не співпадають',
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { user, fetchMe } = useAuthStore();
  const [isProfileLoading, setProfileLoading] = useState(false);
  const [isPasswordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setProfileLoading(true);
    try {
      await apiClient.patch('/profile', data);
      await fetchMe();
      toast.success('Профіль оновлено');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка оновлення');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setPasswordLoading(true);
    try {
      await apiClient.patch('/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success('Пароль змінено');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка зміни пароля');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Налаштування</h1>

      <div className="max-w-xl space-y-8">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-lg mb-4">Особисті дані</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...profileForm.register('firstName')}
                label="Ім'я"
                error={profileForm.formState.errors.firstName?.message}
              />
              <Input
                {...profileForm.register('lastName')}
                label="Прізвище"
                error={profileForm.formState.errors.lastName?.message}
              />
            </div>
            <Input
              value={user?.email || ''}
              label="Email"
              disabled
              className="bg-neutral-50"
            />
            <Input
              {...profileForm.register('phone')}
              label="Телефон"
              error={profileForm.formState.errors.phone?.message}
            />
            <Button type="submit" isLoading={isProfileLoading}>
              Зберегти зміни
            </Button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-lg mb-4">Зміна пароля</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              {...passwordForm.register('currentPassword')}
              type="password"
              label="Поточний пароль"
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <Input
              {...passwordForm.register('newPassword')}
              type="password"
              label="Новий пароль"
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <Input
              {...passwordForm.register('confirmPassword')}
              type="password"
              label="Підтвердіть пароль"
              error={passwordForm.formState.errors.confirmPassword?.message}
            />
            <Button type="submit" isLoading={isPasswordLoading}>
              Змінити пароль
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
