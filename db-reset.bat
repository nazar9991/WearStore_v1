@echo off
chcp 65001 >nul
title WearStore - Скидання бази даних

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              WearStore - Скидання бази даних              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo [!] УВАГА: Ця дія видалить всі дані та заповнить БД заново!
echo.

set /p confirm="Ви впевнені? (y/n): "
if /i not "%confirm%"=="y" (
    echo Скасовано.
    pause
    exit /b 0
)

cd /d "%~dp0apps\api"

echo.
echo [1/2] Застосування міграцій...
call pnpm db:migrate
if errorlevel 1 (
    echo [X] Помилка міграції!
    pause
    exit /b 1
)

echo.
echo [2/2] Заповнення тестовими даними...
call pnpm db:seed
if errorlevel 1 (
    echo [X] Помилка заповнення!
    pause
    exit /b 1
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  База даних успішно скинута та заповнена!                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

pause
