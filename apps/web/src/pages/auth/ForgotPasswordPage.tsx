import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/shared/api/client';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

const schema = z.object({
  email: z.string().email('Невірний формат email'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка відправки');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <div className="w-full max-w-md px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Перевірте вашу пошту</h1>
          <p className="text-neutral-600 mb-6">
            Якщо акаунт з вказаним email існує, ви отримаєте лист з інструкціями для відновлення пароля.
          </p>
          <Link to="/auth/login">
            <Button variant="secondary">Повернутись до входу</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-6">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад до входу
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Відновлення пароля</h1>
          <p className="text-neutral-600 mt-2">
            Введіть email, і ми надішлемо вам інструкції для відновлення пароля.
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

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Надіслати інструкції
          </Button>
        </form>
      </div>
    </div>
  );
}
