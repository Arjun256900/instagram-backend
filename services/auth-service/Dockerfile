FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

# Copy shared package
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared ./packages/shared/

# Copy auth service
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/auth-service ./services/auth-service/

# Install dependencies for shared package
WORKDIR /app/packages/shared
RUN npm install

# Install dependencies for auth service
WORKDIR /app/services/auth-service
RUN npm install

WORKDIR /app

EXPOSE 5000

# Start the service
CMD ["node", "services/auth-service/server.js"]