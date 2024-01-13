#!/bin/bash
echo ------------ migration start ------------

python3 manage.py makemigrations
python3 manage.py migrate

echo ------------ migration end ------------

python3 manage.py collectstatic --no-input
python3 manage.py custom_createsuperuser --email admin@example.com --password campfinder