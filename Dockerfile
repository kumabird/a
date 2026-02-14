# 軽量 nginx イメージ
FROM nginx:alpine

# デフォルトの公開フォルダにファイルをコピー
COPY . /usr/share/nginx/html

# 80番ポートを公開
EXPOSE 80

# nginx 起動
CMD ["nginx", "-g", "daemon off;"]
