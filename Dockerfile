# Multi-stage build for production
FROM node:20-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (need devDependencies for build)
RUN pnpm install --frozen-lockfile && pnpm store prune && rm -rf /root/.npm /root/.pnpm-store

# Copy source code
COPY . .

# Set build arguments and environment variables
ARG VITE_BASE_API
ENV VITE_BASE_API=$VITE_BASE_API

# Build the application for production
RUN pnpm build

# Production stage - minimal nginx
FROM nginx:1.25-alpine AS production

# Install security updates and remove unnecessary packages
RUN apk update && apk upgrade \
    && apk add --no-cache curl \
    && rm -rf /var/cache/apk/*

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy only built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions for static files
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
