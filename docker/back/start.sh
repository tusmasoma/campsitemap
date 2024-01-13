#!/bin/bash

host="$1"

sleep 5
psql -h "$host" -U "user" -d db -c "\q"

if [ $? = 0 ]; then  # $?には直前のコマンドのステータスが入っている
  echo --------------- already initialized ---------------
  # gunicorn --workers=3 config.wsgi:application --timeout 240 --bind 0.0.0.0:8083
  python manage.py runserver 0.0.0.0:8083
else
  echo --------------- start initialize ---------------
  sh ../wait-for-postgres.sh db sh ../init.sh
  echo --------------- finish initialize ---------------
  # gunicorn --workers=3 config.wsgi:application --timeout 240 --bind 0.0.0.0:8083
  python manage.py runserver 0.0.0.0:8083
fi