#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
APP_NAME="flight-frontend"
COMPOSE_FILE="docker-compose.yml"
IMAGE_REGISTRY="ghcr.io"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-tuandm21/flight_web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
# Allow overriding whole image (from workflow outputs)
if [ -n "${IMAGE_FULL:-}" ]; then
    FULL_IMAGE_NAME="${IMAGE_FULL}"
else
    FULL_IMAGE_NAME="${IMAGE_REGISTRY}/${GITHUB_REPOSITORY}:${IMAGE_TAG}"
fi

log_info "Starting deployment of ${APP_NAME}"
log_info "Image: ${FULL_IMAGE_NAME}"

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

# Set COMPOSE_CMD
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

log_info "Using Docker Compose command: ${COMPOSE_CMD}"

# Login to GitHub Container Registry (if token is available)
if [ -n "${GITHUB_TOKEN:-}" ]; then
    log_info "Logging in to GitHub Container Registry..."
    echo "${GITHUB_TOKEN}" | docker login ${IMAGE_REGISTRY} -u "${GITHUB_ACTOR:-$(whoami)}" --password-stdin 2>/dev/null || {
        log_warning "Could not login to registry with token, trying without authentication"
    }
else
    log_info "No GitHub token provided, attempting to pull public image"
fi

# Pull the latest image
log_info "Pulling latest image: ${FULL_IMAGE_NAME}"
if ! docker pull "${FULL_IMAGE_NAME}"; then
    log_error "Failed to pull image: ${FULL_IMAGE_NAME}"
    exit 1
fi

# Stop and remove existing containers
log_info "Stopping existing containers..."
${COMPOSE_CMD} -f "${COMPOSE_FILE}" down --remove-orphans || {
    log_warning "No existing containers to stop"
}

# Remove old images (keep last 3)
log_info "Cleaning up old images..."
docker images "${IMAGE_REGISTRY}/${GITHUB_REPOSITORY}" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
    tail -n +2 | sort -k2 -r | tail -n +4 | awk '{print $1}' | xargs -r docker rmi || {
    log_warning "Could not clean up old images"
}

# Set environment variables for docker-compose
export GITHUB_REPOSITORY
export IMAGE_TAG
export DOCKER_IMAGE="${FULL_IMAGE_NAME}"
export CONTAINER_NAME="flight-frontend"
export HOST_PORT="80"
export NODE_ENV="production"

# Start the new containers
log_info "Starting new containers..."
if ! ${COMPOSE_CMD} -f "${COMPOSE_FILE}" up -d; then
    log_error "Failed to start containers"

    # Show logs for debugging
    log_info "Container logs:"
    ${COMPOSE_CMD} -f "${COMPOSE_FILE}" logs --tail=50

    exit 1
fi

# Wait for health check
log_info "Waiting for application to be healthy..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec "${APP_NAME}" curl -f http://localhost/health >/dev/null 2>&1; then
        log_success "Application is healthy!"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    log_info "Health check attempt ${ATTEMPT}/${MAX_ATTEMPTS}..."
    sleep 10
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log_error "Application failed health check after ${MAX_ATTEMPTS} attempts"

    # Show container logs
    log_info "Container logs:"
    ${COMPOSE_CMD} -f "${COMPOSE_FILE}" logs --tail=50 "${APP_NAME}"

    exit 1
fi

# Show running containers
log_info "Current running containers:"
${COMPOSE_CMD} -f "${COMPOSE_FILE}" ps

# Show application logs
log_info "Recent application logs:"
${COMPOSE_CMD} -f "${COMPOSE_FILE}" logs --tail=20 "${APP_NAME}"

log_success "Deployment completed successfully!"
log_success "Application is running at: http://$(hostname -I | awk '{print $1}')"

# Optional: Send notification (uncomment if needed)
# curl -X POST -H 'Content-type: application/json' \
#     --data '{"text":"Flight Frontend deployed successfully!"}' \
#     "${SLACK_WEBHOOK_URL:-}"
