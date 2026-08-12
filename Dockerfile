# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build Vite frontend bundle (outputs to /app/dist)
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy root package definitions
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built frontend dist and server source code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/tsconfig*.json ./

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npx", "tsx", "server/src/index.ts"]
