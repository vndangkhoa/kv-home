# Stage 1: Build frontend assets
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Zero external runtime dependencies needed!
COPY server.js ./
COPY --from=builder /app/dist ./dist
COPY src/data ./src/data

# Prepare data and uploads directories
RUN mkdir -p data uploads && cp -n src/data/*.json data/ 2>/dev/null || true

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

CMD ["node", "server.js"]
