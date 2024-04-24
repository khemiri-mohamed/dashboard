cd /d %~dp0..
call python manage.py makemigrations
call python manage.py migrate
pause