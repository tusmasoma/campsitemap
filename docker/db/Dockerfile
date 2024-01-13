#FROM postgres:10.12
FROM postgres:14.9
#ubuntu@ip-172-31-20-153:~$ psql -V
#psql (PostgreSQL) 14.9 (Ubuntu 14.9-0ubuntu0.22.04.1) クライアントのバージョン

#postgres=# SELECT version();
#PostgreSQL 14.9 (Ubuntu 14.9-0ubuntu0.22.04.1) on x86_64-pc-linux-gnu, compiled by gcc データベースサーバのバージョン

#lang settings
RUN localedef -i ja_JP -c -f UTF-8 -A /usr/share/locale/locale.alias ja_JP.UTF-8
ENV LANG ja_JP.utf8