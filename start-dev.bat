@echo off
setlocal

set "NODE_OPTIONS="
set "PROJ=F:\DOMN-STUDIO\domn-web\domn-portfolio-web"
set "PORT=4321"
set "URL=http://localhost:%PORT%/"

echo ============================================
echo  DOMN-STUDIO dev server
echo   %URL%
echo ============================================
echo.

cd /d "%PROJ%" || goto :err_dir

echo [cleanup] freeing port %PORT% and killing stale project processes...
echo.

REM ---- 单条 PowerShell 清理：终止本项目冗余开发进程 + 释放端口 + 校验 ----
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port=4321;$k=@();Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*domn-portfolio-web*' -and $_.CommandLine -match 'astro|vite|npm' } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; $k += $_.ProcessId } catch { Write-Output ('[WARN] cannot kill project PID ' + $_.ProcessId) } }; Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop; $k += $_.OwningProcess } catch { Write-Output ('[WARN] cannot free port holder PID ' + $_.OwningProcess) } }; Start-Sleep -Milliseconds 1000; $s = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if ($s) { Write-Output ('[ERROR] port ' + $port + ' STILL OCCUPIED by PID ' + (($s.OwningProcess) -join ',')); exit 2 } else { Write-Output ('[cleanup] done. freed PIDs: ' + (($k) -join ',')) }"
if errorlevel 1 (
  echo [WARN] cleanup could NOT fully release the port. The server may fail to bind.
  echo [WARN] Try running this script as Administrator.
)

REM ---- 2. 终止残留的 CDP 浏览器进程并清理其锁定的 profile 目录 ----
echo [cleanup] releasing CDP browser locks (tmp\cdp* / tmp\chrome* profiles)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*domn-portfolio-web\tmp*' -and ($_.Name -match 'chrome|chromium|headless_shell|msedge') } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; Write-Output ('[cleanup] killed CDP browser PID ' + $_.ProcessId) } catch { Write-Output ('[WARN] cannot kill CDP browser PID ' + $_.ProcessId) } }"
for /d %%d in ("%PROJ%\tmp\cdp*" "%PROJ%\tmp\chrome*") do (
  if exist "%%d" (
    rmdir /s /q "%%d" 2>nul
    if exist "%%d" ( echo [WARN] could not clear %%d (still locked) ) else ( echo [cleanup] cleared %%d )
  )
)

echo.

where node >nul 2>nul
if %errorlevel%==0 (
  echo [run] system node: npm run dev
  start "DOMN Dev Server" /D "%PROJ%" cmd /k "set NODE_OPTIONS=&& npm run dev -- --host 127.0.0.1 --port %PORT%"
  goto :open
)

set "NODE=C:\Users\44155\.workbuddy-ai\binaries\node\versions\22.22.2-2\node.exe"
if exist "%NODE%" (
  echo [run] workbuddy node
  start "DOMN Dev Server" /D "%PROJ%" cmd /k "set NODE_OPTIONS=&& %NODE% node_modules\astro\bin\astro.mjs dev --host 127.0.0.1 --port %PORT%"
  goto :open
)

echo [ERROR] node not found. Install Node.js first.
goto :err

:open
echo waiting for server to boot...
timeout /t 8 /nobreak >nul
start "" "%URL%"
echo.
echo server window: "DOMN Dev Server"  (close it = stop server)
goto :wait

:err_dir
echo [ERROR] project dir not found: %PROJ%
goto :err

:err
echo.
echo [FAIL] dev server was NOT started. See messages above.
echo Press any key to exit...
pause >nul
exit /b 1

:wait
echo.
echo Dev server should be running. Press any key to close this window
echo (the server keeps running in its own "DOMN Dev Server" window).
pause >nul
exit /b 0
