FROM ubuntu:20.04

WORKDIR /app

# Environment Variables
ENV TZ=Asia/Tokyo
ENV LANG ja_JP.UTF-8
ENV LANGUAGE ja_JP:ja
ENV LC_ALL ja_JP.UTF-8

# Ubuntu Packages
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y tzdata && \
    apt-get install -y software-properties-common locales vim unzip libpq-dev libssl-dev libffi-dev python3-dev libcurl4-openssl-dev build-essential libgl1-mesa-dev postgresql rsyslog curl poppler-utils && \
    locale-gen $LANG && \
    apt-get install -y python3.9 python3.9-dev python3.9-distutils libtesseract-dev git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Python and PIP Install
RUN echo 'alias python3="/usr/bin/python3.9"' >> ~/.bashrc && \
    ln -sfn /usr/bin/python3.9 /usr/bin/python3 && \
    ln -sfn /usr/bin/python3.9 /usr/bin/python && \
    curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py" && \
    python3 get-pip.py && \
    ln -sfn /usr/bin/pip3 /usr/bin/pip && \
    pip3 install --upgrade pip && \
    pip3 install setuptools-scm==6.3.2 setuptools-scm-git-archive==1.1 && \
    pip3 install Cython==0.29.24

# Copy requirements and install Python dependencies
COPY docker/back/requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt

WORKDIR /app/django_project
