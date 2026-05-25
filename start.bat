@echo off
chcp 65001 >nul
echo ============================================
echo   투자 포트폴리오 트래커 시작
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] 백엔드 의존성 설치...
cd backend
pip install -r requirements.txt -q 2>nul
echo      완료

echo [2/4] 프론트엔드 의존성 설치...
cd ..\frontend
call npm install --silent 2>nul
echo      완료

echo [3/4] 백엔드 서버 시작 (포트 8000)...
cd ..\backend
start /b cmd /c "uvicorn app.main:app --host 0.0.0.0 --port 8000 2>nul"
timeout /t 3 /nobreak >nul

echo [4/4] 프론트엔드 서버 시작 (포트 5173)...
cd ..\frontend
start /b cmd /c "npx vite --host 0.0.0.0 --port 5173 2>nul"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   서버 실행 완료!
echo   브라우저에서 열고 있습니다...
echo ============================================
echo.
echo   대시보드:  http://localhost:5173
echo   API 문서:  http://localhost:8000/docs
echo.
echo   종료하려면 이 창을 닫으세요.
echo.

start http://localhost:5173

pause >nul
taskkill /f /im node.exe 2>nul
taskkill /f /im uvicorn.exe 2>nul
