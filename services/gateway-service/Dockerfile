FROM node:24-alpine

WORKDIR /app

COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared ./packages/shared

WORKDIR /app/packages/shared
RUN npm install

WORKDIR /app
COPY services/gateway-service/package*.json ./services/gateway-service/
COPY services/gateway-service ./services/gateway-service

WORKDIR /app/services/gateway-service
RUN npm install

EXPOSE 4000
CMD ["npm", "start"]
