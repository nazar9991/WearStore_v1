import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="font-display text-9xl font-bold text-primary-200">404</h1>
        <h2 className="font-display text-2xl font-bold mt-4">Сторінку не знайдено</h2>
        <p className="text-neutral-600 mt-2 mb-6">
          Вибачте, сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <Link to="/">
          <Button>Повернутись на головну</Button>
        </Link>
      </div>
    </div>
  );
}
