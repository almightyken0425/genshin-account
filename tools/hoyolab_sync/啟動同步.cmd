@echo off
cd /d "%~dp0\..\.."
if not exist .venv\Scripts\python.exe py -3 -m venv .venv
if errorlevel 1 goto failed
.venv\Scripts\python.exe -m pip --disable-pip-version-check install -q -r tools\hoyolab_sync\requirements.txt
if errorlevel 1 goto failed
.venv\Scripts\python.exe -m tools.hoyolab_sync.server
pause
exit /b
:failed
echo HOYO setup could not complete. Check Python and your network connection.
pause
