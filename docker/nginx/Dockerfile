#FROM nginx:1.15.12-alpine
FROM nginx:1.18.0-alpine
# nginx version: nginx/1.18.0 (Ubuntu)　に変更

# デフォルトのconfを消して、別の設定を追加
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx/nginx_file/nginx.conf /etc/nginx/conf.d