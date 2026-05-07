@echo off
chcp 65001 >nul
title WearStore Frontend

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              WearStore Frontend (React + Vite)            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0apps\web"

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

echo.
echo [✓] Запуск фронтенду на http://localhost:5173
echo [i] Для зупинки натисніть Ctrl+C
echo.
echo ─────────────────────────────────────────────────────────────
echo.

call pnpm dev

pause
