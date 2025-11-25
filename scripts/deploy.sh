#!/bin/bash

# Remindly Deployment Script
# Usage: ./deploy.sh [environment] [version]
# Example: ./deploy.sh production v1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
NAMESPACE="remindly-${ENVIRONMENT}"

echo -e "${GREEN}🚀 Starting Remindly deployment...${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Namespace: ${NAMESPACE}${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        echo -e "${RED}❌ helm is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
}

# Build and push Docker images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    # Build backend image
    echo -e "${YELLOW}Building backend image...${NC}"
    docker build -t remindly/backend:${VERSION} ./backend
    docker tag remindly/backend:${VERSION} remindly/backend:latest
    
    # Build web-app image
    echo -e "${YELLOW}Building web-app image...${NC}"
    docker build -t remindly/web-app:${VERSION} ./web-app
    docker tag remindly/web-app:${VERSION} remindly/web-app:latest
    
    echo -e "${GREEN}✅ Images built successfully${NC}"
}

# Deploy to Kubernetes
deploy_k8s() {
    echo -e "${YELLOW}Deploying to Kubernetes...${NC}"
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply secrets
    echo -e "${YELLOW}Applying secrets...${NC}"
    kubectl apply -f k8s/secrets.yaml -n ${NAMESPACE}
    
    # Apply configmaps
    echo -e "${YELLOW}Applying configmaps...${NC}"
    kubectl apply -f k8s/configmaps.yaml -n ${NAMESPACE}
    
    # Apply persistent volume claims
    echo -e "${YELLOW}Applying persistent volume claims...${NC}"
    kubectl apply -f k8s/pvc.yaml -n ${NAMESPACE}
    
    # Apply services
    echo -e "${YELLOW}Applying services...${NC}"
    kubectl apply -f k8s/services.yaml -n ${NAMESPACE}
    
    # Apply deployments
    echo -e "${YELLOW}Applying deployments...${NC}"
    kubectl apply -f k8s/backend-deployment.yaml -n ${NAMESPACE}
    kubectl apply -f k8s/web-app-deployment.yaml -n ${NAMESPACE}
    kubectl apply -f k8s/postgres-deployment.yaml -n ${NAMESPACE}
    
    # Apply ingress
    echo -e "${YELLOW}Applying ingress...${NC}"
    kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}
    
    echo -e "${GREEN}✅ Kubernetes deployment completed${NC}"
}

# Wait for deployment to be ready
wait_for_deployment() {
    echo -e "${YELLOW}Waiting for deployment to be ready...${NC}"
    
    kubectl wait --for=condition=available --timeout=300s deployment/remindly-backend -n ${NAMESPACE}
    kubectl wait --for=condition=available --timeout=300s deployment/remindly-web-app -n ${NAMESPACE}
    kubectl wait --for=condition=available --timeout=300s deployment/remindly-postgres -n ${NAMESPACE}
    
    echo -e "${GREEN}✅ All deployments are ready${NC}"
}

# Run health checks
health_check() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Get service URLs
    BACKEND_URL=$(kubectl get service remindly-backend -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    WEB_APP_URL=$(kubectl get service remindly-web-app -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    # Check backend health
    echo -e "${YELLOW}Checking backend health...${NC}"
    if curl -f http://${BACKEND_URL}:3001/health; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    # Check web-app health
    echo -e "${YELLOW}Checking web-app health...${NC}"
    if curl -f http://${WEB_APP_URL}:3000; then
        echo -e "${GREEN}✅ Web-app is healthy${NC}"
    else
        echo -e "${RED}❌ Web-app health check failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All health checks passed${NC}"
}

# Rollback deployment
rollback() {
    echo -e "${YELLOW}Rolling back deployment...${NC}"
    
    kubectl rollout undo deployment/remindly-backend -n ${NAMESPACE}
    kubectl rollout undo deployment/remindly-web-app -n ${NAMESPACE}
    
    echo -e "${GREEN}✅ Rollback completed${NC}"
}

# Cleanup old resources
cleanup() {
    echo -e "${YELLOW}Cleaning up old resources...${NC}"
    
    # Delete old replicas
    kubectl delete pods -l app=remindly-backend --field-selector=status.phase=Succeeded -n ${NAMESPACE}
    kubectl delete pods -l app=remindly-web-app --field-selector=status.phase=Succeeded -n ${NAMESPACE}
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main deployment function
main() {
    echo -e "${GREEN}🎯 Starting Remindly deployment process...${NC}"
    
    check_requirements
    build_images
    deploy_k8s
    wait_for_deployment
    health_check
    cleanup
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${YELLOW}Backend URL: http://${BACKEND_URL}:3001${NC}"
    echo -e "${YELLOW}Web App URL: http://${WEB_APP_URL}:3000${NC}"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        health_check
        ;;
    *)
        main
        ;;
esac
