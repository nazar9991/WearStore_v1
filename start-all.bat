@echo off
chcp 65001 >nul
title WearStore - Запуск проекту

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              WearStore - Повний запуск                    ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [*] Запуск API сервера...
start "WearStore API" cmd /k "%~dp0start-api.bat"

echo [*] Очікування запуску API (5 секунд)...
timeout /t 5 /nobreak >nul

echo [*] Запуск фронтенду...
start "WearStore Web" cmd /k "%~dp0start-web.bat"

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Проект запущено!                                         ║
echo ║                                                           ║
echo ║  API:      http://localhost:3001                          ║
echo ║  Frontend: http://localhost:5173                          ║
echo ║                                                           ║
echo ║  Тестові акаунти:                                         ║
echo ║  - Адмін:    admin@wearstore.ua / admin123                ║
echo ║  - Менеджер: manager1@wearstore.ua / manager123           ║
echo ║  - Клієнт:   client1@example.com / client123              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo [i] Закрийте це вікно, щоб продовжити роботу
echo [i] Сервери працюють в окремих вікнах
echo.

pause
