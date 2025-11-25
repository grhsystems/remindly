#!/bin/bash

# Remindly Docker Compose Deployment Script
# Usage: ./deploy-docker.sh [environment]
# Example: ./deploy-docker.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🚀 Starting Remindly Docker Compose deployment...${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Check if Docker is installed
check_docker() {
    echo -e "${YELLOW}Checking Docker installation...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        echo -e "${YELLOW}Install Docker from: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker is installed${NC}"
}

# Check if .env files exist
check_env_files() {
    echo -e "${YELLOW}Checking environment files...${NC}"
    
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}⚠️  backend/.env not found. Creating from .env.example...${NC}"
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            echo -e "${YELLOW}⚠️  Please edit backend/.env and add your configuration${NC}"
        else
            echo -e "${RED}❌ backend/.env.example not found${NC}"
            exit 1
        fi
    fi
    
    if [ ! -f "web-app/.env" ]; then
        echo -e "${YELLOW}⚠️  web-app/.env not found. Creating from .env.example...${NC}"
        if [ -f "web-app/.env.example" ]; then
            cp web-app/.env.example web-app/.env
            echo -e "${YELLOW}⚠️  Please edit web-app/.env and add your configuration${NC}"
        else
            echo -e "${RED}❌ web-app/.env.example not found${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Environment files ready${NC}"
}

# Pull latest changes (if git repo)
pull_latest() {
    if [ -d ".git" ]; then
        echo -e "${YELLOW}Pulling latest changes...${NC}"
        git pull origin main || git pull origin master || echo -e "${YELLOW}⚠️  Could not pull latest changes${NC}"
    fi
}

# Build images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    if docker compose version &> /dev/null; then
        docker compose build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Wait for services to be ready
wait_for_services() {
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3001/health &> /dev/null; then
            echo -e "${GREEN}✅ Backend is ready${NC}"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -e "${YELLOW}Waiting for backend... (${attempt}/${max_attempts})${NC}"
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ Backend did not become ready in time${NC}"
        exit 1
    fi
}

# Run health checks
health_check() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Check backend
    if curl -f http://localhost:3001/health &> /dev/null; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    # Check web app
    if curl -f http://localhost:3000 &> /dev/null; then
        echo -e "${GREEN}✅ Web app health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Web app health check failed (might still be starting)${NC}"
    fi
    
    echo -e "${GREEN}✅ Health checks completed${NC}"
}

# Show service status
show_status() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e ""
    echo -e "${YELLOW}Service URLs:${NC}"
    echo -e "  Backend API:  ${GREEN}http://localhost:3001${NC}"
    echo -e "  Web App:      ${GREEN}http://localhost:3000${NC}"
    echo -e "  Health Check: ${GREEN}http://localhost:3001/health${NC}"
    echo -e ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "  View logs:    ${BLUE}docker compose logs -f${NC}"
    echo -e "  Stop:         ${BLUE}docker compose down${NC}"
    echo -e "  Restart:      ${BLUE}docker compose restart${NC}"
    echo -e "  Status:       ${BLUE}docker compose ps${NC}"
    echo -e ""
}

# Main deployment function
main() {
    check_docker
    check_env_files
    pull_latest
    build_images
    start_services
    wait_for_services
    health_check
    show_status
}

# Handle script arguments
case "${1:-}" in
    "stop")
        echo -e "${YELLOW}Stopping services...${NC}"
        if docker compose version &> /dev/null; then
            docker compose down
        else
            docker-compose down
        fi
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
    "restart")
        echo -e "${YELLOW}Restarting services...${NC}"
        if docker compose version &> /dev/null; then
            docker compose restart
        else
            docker-compose restart
        fi
        echo -e "${GREEN}✅ Services restarted${NC}"
        ;;
    "logs")
        if docker compose version &> /dev/null; then
            docker compose logs -f
        else
            docker-compose logs -f
        fi
        ;;
    "status")
        if docker compose version &> /dev/null; then
            docker compose ps
        else
            docker-compose ps
        fi
        ;;
    "clean")
        echo -e "${YELLOW}Cleaning up...${NC}"
        if docker compose version &> /dev/null; then
            docker compose down -v
            docker system prune -f
        else
            docker-compose down -v
            docker system prune -f
        fi
        echo -e "${GREEN}✅ Cleanup completed${NC}"
        ;;
    *)
        main
        ;;
esac

