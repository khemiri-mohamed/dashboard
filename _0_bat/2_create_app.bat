@echo off

:CLASSIFIED
cls
cd /d %~dp0..
set /p appname=Please enter your django app name:
echo.

:APPNAME
call python manage.py startapp %appname%
pause
goto CLASSIFIED
