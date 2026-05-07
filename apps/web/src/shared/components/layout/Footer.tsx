import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold text-white">
                WearStore
              </span>
            </Link>
            <p className="text-neutral-400 mb-4">
              Сучасний інтернет-магазин жіночого одягу з елегантним дизайном та якісним сервісом.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-full bg-neutral-800 hover:bg-primary-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-neutral-800 hover:bg-primary-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog/sukni" className="hover:text-primary-400 transition-colors">
                  Сукні
                </Link>
              </li>
              <li>
                <Link to="/catalog/bluzy-topy" className="hover:text-primary-400 transition-colors">
                  Блузи та топи
                </Link>
              </li>
              <li>
                <Link to="/catalog/spidnytsi-shtany" className="hover:text-primary-400 transition-colors">
                  Спідниці та штани
                </Link>
              </li>
              <li>
                <Link to="/catalog/verhnii-odiag" className="hover:text-primary-400 transition-colors">
                  Верхній одяг
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Інформація</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  Про нас
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-primary-400 transition-colors">
                  Доставка та оплата
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-primary-400 transition-colors">
                  Повернення
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover:text-primary-400 transition-colors">
                  Таблиця розмірів
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-400 transition-colors">
                  Політика конфіденційності
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-white font-semibold mb-4">Контакти</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary-400" />
                <a href="tel:+380501234567" className="hover:text-primary-400 transition-colors">
                  +380 50 123 45 67
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary-400" />
                <a href="mailto:info@wearstore.ua" className="hover:text-primary-400 transition-colors">
                  info@wearstore.ua
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>м. Київ, вул. Хрещатик, 1</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} WearStore. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}
