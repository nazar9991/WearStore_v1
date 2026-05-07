@echo off
chcp 65001 >nul
title WearStore API Server

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              WearStore API Server                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0apps\api"

echo [*] Перевірка залежностей...
if not exist "node_modules" (
    echo [!] Залежності не встановлені. Встановлюю...
    call pnpm install
    if errorlevel 1 (
        echo [X] Помилка встановлення залежностей!
        pause
        exit /b 1
    )
)

echo [*] Перевірка Prisma Client...
call pnpm db:generate >nul 2>&1

echo.
echo [✓] Запуск API сервера на http://localhost:3001
echo [i] Для зупинки натисніть Ctrl+C
echo.
echo ─────────────────────────────────────────────────────────────
echo.

call pnpm dev

pause
