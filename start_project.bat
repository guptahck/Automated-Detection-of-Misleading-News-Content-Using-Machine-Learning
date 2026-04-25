@echo off
echo ===========================================
echo   Fake News Detection System - Launcher
echo ===========================================
echo.

echo Starting Backend API Server...
start "Backend API (FastAPI)" cmd /k "cd /d "C:\Users\Saumya Rai\Downloads\fake_news" && call run_backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Next.js Application...
start "Frontend (Next.js)" cmd /k "cd /d "C:\Users\Saumya Rai\Downloads\fake_news" && call run_frontend.bat"

echo.
echo ===========================================
echo   Both servers are launching!
echo   - Backend API:  http://localhost:8000/docs
echo   - Frontend UI:  http://localhost:3000
echo ===========================================
echo.
pause
