FROM node:20-alpine

WORKDIR /app

# Install required build tools
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy full source
COPY . .

# Backend runs on 5000
EXPOSE 5003

# Production start
CMD ["npx", "tsx", "src/index.ts"]