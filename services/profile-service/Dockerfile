FROM node:24-alpine

WORKDIR /app

# Copy shared package
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared ./packages/shared

# Install shared dependencies
WORKDIR /app/packages/shared
RUN npm install

# Copy profile-service
WORKDIR /app
COPY services/profile-service/package*.json ./services/profile-service/
COPY services/profile-service ./services/profile-service

# Install profile-service dependencies
WORKDIR /app/services/profile-service
RUN npm install

EXPOSE 6000

# Set working directory for startup
WORKDIR /app/services/profile-service

# Start the service
CMD ["npm", "start"]