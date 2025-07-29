#!/bin/bash

# Frontend Startup Script for ScholarWeave
# Usage: ./start-frontend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_header "ScholarWeave Frontend Startup"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js first:"
    echo "  brew install node"
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the correct directory?"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
else
    print_status "Dependencies already installed"
fi

print_status "Starting frontend development server..."
print_status "Frontend will be available at: http://localhost:8080"
print_status "Press Ctrl+C to stop the server"

# Start the development server
npm run dev 