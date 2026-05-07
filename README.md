# WearStore - Інтернет-магазин жіночого одягу

Повнофункціональний інтернет-магазин жіночого одягу з адмін-панеллю, побудований на сучасному стеку технологій.

## Зміст

- [Технології](#технології)
- [Структура проекту](#структура-проекту)
- [Вимоги](#вимоги)
- [Встановлення](#встановлення)
- [Запуск](#запуск)
- [Тестові дані](#тестові-дані)
- [API Документація](#api-документація)
- [Скрипти](#скрипти)

## Технології

### Backend (API)
| Технологія | Призначення |
|------------|-------------|
| Node.js | Середовище виконання |
| Express.js | Web-фреймворк |
| TypeScript | Типізація |
| Prisma ORM | Робота з базою даних |
| PostgreSQL | База даних |
| JWT | Аутентифікація |
| Argon2 | Хешування паролів |
| Zod | Валідація даних |
| Winston | Логування |

### Frontend (Web)
| Технологія | Призначення |
|------------|-------------|
| React 18 | UI бібліотека |
| TypeScript | Типізація |
| Vite | Збірка та dev-сервер |
| TanStack Query | Управління серверним станом |
| Zustand | Клієнтський стан |
| React Router | Маршрутизація |
| Tailwind CSS | Стилізація |
| Radix UI | UI компоненти |

## Структура проекту

```
WearStore_v1.0/
├── apps/
│   ├── api/                    # Backend сервер
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Схема бази даних
│   │   │   ├── migrations/     # Міграції БД
│   │   │   └── seed.ts         # Тестові дані
│   │   ├── src/
│   │   │   ├── config/         # Конфігурація
│   │   │   ├── controllers/    # Контролери
│   │   │   ├── middleware/     # Middleware
│   │   │   ├── routes/         # Маршрути API
│   │   │   ├── services/       # Бізнес-логіка
│   │   │   ├── utils/          # Утиліти
│   │   │   └── index.ts        # Точка входу
│   │   ├── tests/              # Тести
│   │   └── package.json
│   │
│   └── web/                    # Frontend додаток
│       ├── src/
│       │   ├── components/     # React компоненти
│       │   ├── pages/          # Сторінки
│       │   ├── hooks/          # Custom hooks
│       │   ├── stores/         # Zustand stores
│       │   ├── api/            # API клієнт
│       │   └── main.tsx        # Точка входу
│       └── package.json
│
├── packages/
│   └── shared/                 # Спільний код (типи, утиліти)
│
├── start-api.bat               # Запуск API сервера
├── start-web.bat               # Запуск фронтенду
├── start-all.bat               # Запуск всього проекту
├── setup.bat                   # Початкове налаштування
└── README.md
```

## Вимоги

- **Node.js** 18+ (рекомендовано 20+)
- **pnpm** 8+ (менеджер пакетів)
- **PostgreSQL** 14+ (база даних)

### Встановлення pnpm

```bash
npm install -g pnpm
```

## Встановлення

### Варіант 1: Автоматичне (рекомендовано)

Запустіть `setup.bat` - він виконає всі кроки автоматично.

### Варіант 2: Ручне

1. **Клонуйте репозиторій та встановіть залежності:**
   ```bash
   pnpm install
   ```

2. **Створіть базу даних PostgreSQL:**
   ```sql
   CREATE DATABASE wearstore;
   ```

3. **Створіть файл конфігурації `apps/api/.env`:**
   ```env
   NODE_ENV=development

   # База даних
   DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/wearstore

   # JWT (мінімум 32 символи кожен)
   JWT_ACCESS_SECRET=ваш-секретний-ключ-для-access-токенів
   JWT_REFRESH_SECRET=ваш-секретний-ключ-для-refresh-токенів

   # Сервер
   API_PORT=3001
   API_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:5173
   ```

4. **Застосуйте міграції та заповніть БД тестовими даними:**
   ```bash
   cd apps/api
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

## Запуск

### Варіант 1: Через батники (Windows)

| Файл | Опис |
|------|------|
| `start-api.bat` | Запускає тільки API сервер |
| `start-web.bat` | Запускає тільки фронтенд |
| `start-all.bat` | Запускає API + фронтенд в окремих вікнах |

### Варіант 2: Через командний рядок

**API сервер:**
```bash
cd apps/api
pnpm dev
```

**Фронтенд:**
```bash
cd apps/web
pnpm dev
```

### Адреси після запуску

| Сервіс | URL |
|--------|-----|
| Фронтенд | http://localhost:5173 |
| API | http://localhost:3001 |
| Prisma Studio (БД) | `pnpm db:studio` в apps/api |

## Тестові дані

Після виконання `pnpm db:seed` створюються:

### Користувачі

| Роль | Email | Пароль |
|------|-------|--------|
| Адміністратор | admin@wearstore.ua | admin123 |
| Менеджер | manager1@wearstore.ua | manager123 |
| Менеджер | manager2@wearstore.ua | manager123 |
| Клієнт | client1@example.com | client123 |
| Клієнт | client2@example.com | client123 |
| ... | client3-10@example.com | client123 |

### Каталог

- **4 категорії:** Сукні, Блузи та топи, Спідниці та штани, Верхній одяг
- **40 товарів** з варіантами (розмір + колір)
- **24 замовлення** з різними статусами
- **4 промокоди:** WELCOME10, SALE20, FREESHIP, VIP30

## API Документація

### Аутентифікація

| Метод | Endpoint | Опис |
|-------|----------|------|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід |
| POST | `/api/auth/logout` | Вихід |
| POST | `/api/auth/refresh` | Оновлення токенів |
| GET | `/api/auth/me` | Поточний користувач |

### Каталог

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | `/api/catalog/categories` | Список категорій |
| GET | `/api/catalog/products` | Список товарів |
| GET | `/api/catalog/products/:slug` | Деталі товару |

### Кошик

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | `/api/cart` | Отримати кошик |
| POST | `/api/cart/items` | Додати товар |
| PATCH | `/api/cart/items/:id` | Змінити кількість |
| DELETE | `/api/cart/items/:id` | Видалити товар |

### Замовлення

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | `/api/orders` | Мої замовлення |
| POST | `/api/orders` | Створити замовлення |
| GET | `/api/orders/:id` | Деталі замовлення |
| POST | `/api/orders/:id/cancel` | Скасувати замовлення |

### Адмін-панель

| Метод | Endpoint | Опис |
|-------|----------|------|
| GET | `/api/admin/dashboard` | Статистика |
| GET | `/api/admin/orders` | Всі замовлення |
| PATCH | `/api/admin/orders/:id/status` | Змінити статус |
| GET | `/api/admin/products` | Управління товарами |
| GET | `/api/admin/users` | Управління користувачами |
| GET | `/api/admin/reports/*` | Звіти |

## Скрипти

### API (`apps/api`)

| Команда | Опис |
|---------|------|
| `pnpm dev` | Запуск в режимі розробки |
| `pnpm build` | Збірка для продакшену |
| `pnpm start` | Запуск зібраного проекту |
| `pnpm test` | Запуск тестів |
| `pnpm test:coverage` | Тести з покриттям |
| `pnpm db:generate` | Генерація Prisma Client |
| `pnpm db:migrate` | Застосування міграцій |
| `pnpm db:seed` | Заповнення тестовими даними |
| `pnpm db:studio` | Відкрити Prisma Studio |

### Frontend (`apps/web`)

| Команда | Опис |
|---------|------|
| `pnpm dev` | Запуск dev-сервера |
| `pnpm build` | Збірка для продакшену |
| `pnpm preview` | Перегляд зібраного проекту |
| `pnpm lint` | Перевірка коду |

## Ролі користувачів

| Роль | Можливості |
|------|------------|
| **CLIENT** | Перегляд каталогу, кошик, замовлення, особистий кабінет |
| **MANAGER** | + Управління замовленнями, перегляд звітів |
| **ADMIN** | + Управління товарами, категоріями, користувачами, промокодами |

## Статуси замовлень

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓           ↓           ↓
    └─────────┴───────────┴───────────┴──→ CANCELLED
                                           REFUNDED
```

## Методи оплати

- **LiqPay** - онлайн оплата карткою
- **Накладений платіж** - оплата при отриманні

## Методи доставки

- **Нова Пошта (відділення)** - 70 грн
- **Нова Пошта (кур'єр)** - 120 грн
- **Укрпошта** - 50 грн
- **Безкоштовно** при замовленні від 2000 грн

## Ліцензія

MIT License
