# Frontend Production Dockerfile
# Multi-stage build for optimized Next.js application

# Stage 1: Dependencies
FROM node:22.21.0-alpine AS deps

# Install pnpm
RUN npm install -g pnpm@10.15.0

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package.json for all workspaces
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all dependencies using workspace
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22.21.0-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.15.0

WORKDIR /app

# Copy workspace files and dependencies
COPY --from=deps /app ./

# Copy frontend source code
COPY frontend ./frontend

# Set working directory to frontend
WORKDIR /app/frontend

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application (Telugu/English instance)
# For multi-language support, build with default locale
ARG DEFAULT_LOCALE=te
ARG SUPPORTED_LOCALES=te,en
ENV DEFAULT_LOCALE=${DEFAULT_LOCALE}
ENV SUPPORTED_LOCALES=${SUPPORTED_LOCALES}

RUN pnpm run build:te

# Stage 3: Production
FROM node:22.21.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install pnpm for production dependencies
RUN npm install -g pnpm@10.15.0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy workspace files for pnpm
COPY pnpm-workspace.yaml package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy package.json files
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install ONLY production dependencies with proper symlinks
RUN pnpm install --frozen-lockfile --prod

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.js ./frontend/
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.te.js ./frontend/
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./frontend/package.json
COPY --from=builder --chown=nextjs:nodejs /app/frontend/locales ./frontend/locales

# Copy built application - Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone/frontend ./frontend/
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Switch to non-root user
USER nextjs

# Set working directory to frontend
WORKDIR /app/frontend

# Expose port
EXPOSE 3000

# Set default environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js
CMD ["node", "server.js"]
