FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine
ENV API_UPSTREAM=api:8080
ENV SSL_CERT_PATH=/home/ec2-user/nginx/certs.pem
ENV SSL_CERT_KEY_PATH=/home/ec2-user/nginx/key.pem
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
