@echo off
echo ============================================
echo   Fake News Backend - Debug Startup
echo ============================================
echo.

cd /d "C:\Users\Saumya Rai\Downloads\fake_news\backend"
echo [OK] Changed to backend directory
echo Current directory: %CD%
echo.

echo --- Checking Python ---
python --version
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found! Install Python first.
    pause
    exit /b
)
echo [OK] Python found
echo.

echo --- Checking Virtual Environment ---
if not exist "venv\Scripts\activate.bat" (
    echo [WARNING] venv not found. Creating new virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create venv!
        pause
        exit /b
    )
    echo [OK] venv created
)
echo [OK] venv exists
echo.

echo --- Activating venv ---
call venv\Scripts\activate.bat
echo [OK] venv activated
echo.

echo --- Installing requirements ---
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install requirements!
    pause
    exit /b
)
echo [OK] All packages installed
echo.

echo --- Checking if model files exist ---
if exist "model.pkl" (
    echo [OK] model.pkl found
) else (
    echo [WARNING] model.pkl NOT found - will use rule-based fallback
)
if exist "vectorizer.pkl" (
    echo [OK] vectorizer.pkl found
) else (
    echo [WARNING] vectorizer.pkl NOT found - will use rule-based fallback
)
echo.

echo ============================================
echo   Starting FastAPI Server...
echo   API Docs: http://localhost:8000/docs
echo   Press Ctrl+C to stop
echo ============================================
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo [ERROR] Server stopped or crashed!
echo.
pause
