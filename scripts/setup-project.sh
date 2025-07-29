#!/bin/bash

# ScholarWeave Project Setup Script
# This script helps set up the development environment with the new folder structure

set -e

echo "🚀 Setting up ScholarWeave Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Current directory structure:"
tree -L 3 -I 'node_modules|.git' || echo "tree command not available, showing with ls:"
ls -la

echo ""
print_info "Installing dependencies..."

# Install frontend dependencies
if [ -d "frontend" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    print_warning "Frontend directory not found"
fi

# Install backend dependencies
if [ -d "backend" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
else
    print_warning "Backend directory not found"
fi

# Check Docker
if command -v docker &> /dev/null; then
    print_status "Docker is available"
    
    # Start database containers
    print_info "Starting database containers..."
    if [ -f "docker/docker-compose.yml" ]; then
        docker-compose -f docker/docker-compose.yml up -d postgres mongodb
        print_status "Database containers started"
    else
        print_warning "Docker compose file not found in docker/ directory"
    fi
else
    print_warning "Docker not found. Please install Docker to use database containers"
fi

# Create environment files if they don't exist
print_info "Setting up environment files..."

if [ ! -f "backend/.env" ] && [ -f "backend/env.example" ]; then
    cp backend/env.example backend/.env
    print_status "Created backend/.env from example"
fi

if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3001
EOF
    print_status "Created frontend/.env"
fi

echo ""
print_status "Setup complete!"
echo ""
print_info "Next steps:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: npm run dev"
echo "3. Access the application: http://localhost:8080"
echo ""
print_info "Useful commands:"
echo "- View logs: docker-compose -f docker/docker-compose.yml logs"
echo "- Stop containers: docker-compose -f docker/docker-compose.yml down"
echo "- Run tests: cd backend && npm test"
echo ""
print_info "Project structure:"
echo "- Frontend: frontend/src/"
echo "- Backend: backend/src/"
echo "- Config: config/ (centralized configuration)"
echo "- Shared: shared/"
echo "- Docker: docker/"
echo "- Scripts: scripts/"
echo "- Docs: docs/"
echo ""
print_info "Configuration management:"
echo "- Check status: ./scripts/manage-config.sh status"
echo "- Fix links: ./scripts/manage-config.sh fix-links"
echo "- Create backup: ./scripts/manage-config.sh backup" 