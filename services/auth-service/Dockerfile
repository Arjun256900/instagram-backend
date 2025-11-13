FROM node:24-alpine

WORKDIR /app

# Copy shared package
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared ./packages/shared

# Install shared dependencies
WORKDIR /app/packages/shared
RUN npm install

# Copy auth-service
WORKDIR /app
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/auth-service ./services/auth-service

# Install auth-service dependencies
WORKDIR /app/services/auth-service
RUN npm install

# Expose port
EXPOSE 5000

# Set working directory for startup
WORKDIR /app/services/auth-service

# Start the service
CMD ["npm", "start"]