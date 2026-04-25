@echo off
echo ============================================
echo   Starting Fake News Frontend Server...
echo ============================================
echo.

cd /d "C:\Users\Saumya Rai\Downloads\fake_news\frontend"

echo Installing dependencies (if needed)...
call npm install

echo.
echo ============================================
echo   Starting Next.js on port 3000
echo   Open: http://localhost:3000
echo ============================================
echo.

npm run dev

pause
