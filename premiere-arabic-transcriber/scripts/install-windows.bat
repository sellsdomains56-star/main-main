@echo off
rem Installs the Arabic Transcriber panel for the current user and lets Premiere
rem Pro load it without a signed .zxp package.
setlocal

set "SRC=%~dp0.."
set "DEST=%APPDATA%\Adobe\CEP\extensions\com.arabictranscriber.panel"

for %%v in (9 10 11 12 13) do (
  reg add "HKCU\Software\Adobe\CSXS.%%v" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul
)

if exist "%DEST%" rmdir /s /q "%DEST%"
robocopy "%SRC%" "%DEST%" /E /XD .git test scripts /NFL /NDL /NJH /NJS /NP >nul
if %ERRORLEVEL% GEQ 8 (
  echo Copying the panel failed.
  pause
  exit /b 1
)

echo Installed to: %DEST%
echo Restart Premiere Pro, then open Window ^> Extensions ^> Arabic Transcriber.
pause
