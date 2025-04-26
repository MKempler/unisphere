FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY packages/server/ ./packages/server/

# Build shared package
RUN pnpm --filter @unisphere/shared build

# Build server package
RUN pnpm --filter @unisphere/server build

# Generate Prisma client
RUN cd packages/server && pnpm prisma:generate

# Production image
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma
COPY --from=builder /app/packages/server/node_modules/.prisma ./packages/server/node_modules/.prisma

# Install production dependencies only
RUN pnpm install --prod

# Expose server port
EXPOSE 3001

# Start server
CMD ["node", "packages/server/dist/main.js"] 