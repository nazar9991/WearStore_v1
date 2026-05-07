@echo off
chcp 65001 >nul
title WearStore - Початкове налаштування

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              WearStore - Налаштування проекту             ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Перевірка Node.js
echo [1/7] Перевірка Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js не встановлено!
    echo     Завантажте з https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo       Версія: %%i

:: Перевірка pnpm
echo [2/7] Перевірка pnpm...
pnpm -v >nul 2>&1
if errorlevel 1 (
    echo [!] pnpm не встановлено. Встановлюю...
    call npm install -g pnpm
    if errorlevel 1 (
        echo [X] Не вдалося встановити pnpm!
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('pnpm -v') do echo       Версія: %%i

:: Встановлення залежностей
echo [3/7] Встановлення залежностей...
call pnpm install
if errorlevel 1 (
    echo [X] Помилка встановлення залежностей!
    pause
    exit /b 1
)
echo       Готово!

:: Перевірка .env файлу
echo [4/7] Перевірка конфігурації...
if not exist "apps\api\.env" (
    echo [!] Файл .env не знайдено. Створюю...
    (
        echo NODE_ENV=development
        echo.
        echo # База даних PostgreSQL
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wearstore
        echo.
        echo # JWT секрети
        echo JWT_ACCESS_SECRET=wearstore-jwt-access-secret-key-32chars
        echo JWT_REFRESH_SECRET=wearstore-jwt-refresh-secret-key-32ch
        echo.
        echo # Сервер
        echo API_PORT=3001
        echo API_URL=http://localhost:3001
        echo FRONTEND_URL=http://localhost:5173
    ) > "apps\api\.env"
    echo       Створено apps\api\.env
    echo.
    echo [!] ВАЖЛИВО: Відредагуйте DATABASE_URL у файлі apps\api\.env
    echo     Вкажіть правильний пароль від PostgreSQL
    echo.
) else (
    echo       Конфігурація існує
)

:: Генерація Prisma Client
echo [5/7] Генерація Prisma Client...
cd apps\api
call pnpm db:generate >nul 2>&1
echo       Готово!

:: Міграції
echo [6/7] Застосування міграцій БД...
call pnpm db:migrate 2>nul
if errorlevel 1 (
    echo [!] Помилка міграції. Перевірте:
    echo     - PostgreSQL запущено
    echo     - База даних 'wearstore' існує
    echo     - Пароль в DATABASE_URL правильний
    cd ..\..
    pause
    exit /b 1
)
echo       Готово!

:: Seed
echo [7/7] Заповнення тестовими даними...
call pnpm db:seed
if errorlevel 1 (
    echo [!] Помилка заповнення даних
    cd ..\..
    pause
    exit /b 1
)

cd ..\..

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Налаштування завершено успішно!                          ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║                                                           ║
echo ║  Для запуску проекту використовуйте:                      ║
echo ║                                                           ║
echo ║    start-all.bat  - Запуск API + Frontend                 ║
echo ║    start-api.bat  - Тільки API сервер                     ║
echo ║    start-web.bat  - Тільки фронтенд                       ║
echo ║                                                           ║
echo ║  Тестові акаунти:                                         ║
echo ║    Адмін:    admin@wearstore.ua / admin123                ║
echo ║    Менеджер: manager1@wearstore.ua / manager123           ║
echo ║    Клієнт:   client1@example.com / client123              ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

pause
