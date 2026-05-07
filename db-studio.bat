@echo off
chcp 65001 >nul
title WearStore - Prisma Studio

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              WearStore - Prisma Studio                    ║
echo ║              Візуальний редактор бази даних               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0apps\api"

echo [*] Запуск Prisma Studio...
echo [i] Відкриється у браузері автоматично
echo [i] Для зупинки натисніть Ctrl+C
echo.

call pnpm db:studio

pause
