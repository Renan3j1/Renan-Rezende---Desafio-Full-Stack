@echo off
setlocal
cd /d "%~dp0"

set "PY_CMD="
set "PY_ARGS="

where py >nul 2>nul
if not errorlevel 1 (
  call py -3 --version >nul 2>&1
  if not errorlevel 1 (
    set "PY_CMD=py"
    set "PY_ARGS=-3"
  )
)

if "%PY_CMD%"=="" (
  where python >nul 2>nul
  if not errorlevel 1 (
    call python --version >nul 2>&1
    if not errorlevel 1 (
      set "PY_CMD=python"
      set "PY_ARGS="
    )
  )
)

if "%PY_CMD%"=="" (
  echo [0/5] Python 3 nao foi encontrado ou o executavel do PATH esta corrompido.
  echo Instale o Python 3.11/3.12 e confirme que "py" ou "python" funciona no terminal.
  echo Exemplo: https://www.python.org/downloads/windows/
  pause
  exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
  echo [0/5] Docker nao foi encontrado no PATH.
  echo Instale o Docker Desktop e reinicie o terminal.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [0/5] Node.js/NPM nao foi encontrado no PATH.
  echo Instale o Node.js LTS e reinicie o terminal.
  pause
  exit /b 1
)

echo [1/5] Iniciando Docker Compose...
docker compose -f "backend\docker-compose.yml" up -d --wait
if errorlevel 1 goto erro

echo [1/5] Containers iniciados. Continuando...

echo [2/5] Instalando dependencias do backend...
call "%PY_CMD%" %PY_ARGS% -m pip install --upgrade pip
if errorlevel 1 goto erro
call "%PY_CMD%" %PY_ARGS% -m pip install -r "backend\requirements.txt"
if errorlevel 1 goto erro

echo [3/5] Carregando dados no banco...
call "%PY_CMD%" %PY_ARGS% "backend\seed\pg_engine.py"
if errorlevel 1 goto erro

echo [4/5] Instalando dependencias do frontend...
cd /d "%~dp0frontend\notescreen"
call npm install
if errorlevel 1 goto erro

echo [5/5] Iniciando API e frontend...
start "Notescreen API" /D "%~dp0backend" cmd /c "%PY_CMD% %PY_ARGS% -m uvicorn main:app --reload"
call npm run dev
goto fim

:erro
echo.
echo Ocorreu um erro. Confira a mensagem acima e tente novamente.
echo Se o problema for Python, rode: py -3 --version ou python --version
pause
exit /b 1

:fim
endlocal
