#!/bin/bash

# Script to switch between PostgreSQL and MongoDB databases
# Usage: ./switch-database.sh [postgres|mongodb]

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

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please copy env.example to .env first."
    exit 1
fi

# Get the target database from command line argument
TARGET_DB=${1:-postgres}

# Validate input
if [ "$TARGET_DB" != "postgres" ] && [ "$TARGET_DB" != "mongodb" ]; then
    print_error "Invalid database type. Use 'postgres' or 'mongodb'"
    echo "Usage: $0 [postgres|mongodb]"
    exit 1
fi

print_header "Switching to $TARGET_DB database"

# Update .env file
if [ "$TARGET_DB" = "mongodb" ]; then
    print_status "Setting DATABASE_TYPE to mongodb"
    sed -i.bak 's/DATABASE_TYPE=.*/DATABASE_TYPE=mongodb/' .env
    
    print_status "Database configuration:"
    echo "  - Database Type: MongoDB"
    echo "  - Connection: mongodb://localhost:27017/scholar_weave"
    echo "  - Test Connection: mongodb://localhost:27017/scholar_weave_test"
    
else
    print_status "Setting DATABASE_TYPE to postgres"
    sed -i.bak 's/DATABASE_TYPE=.*/DATABASE_TYPE=postgres/' .env
    
    print_status "Database configuration:"
    echo "  - Database Type: PostgreSQL"
    echo "  - Connection: postgresql://postgres:postgres@localhost:5432/scholar_weave"
    echo "  - Test Connection: postgresql://postgres:postgres@localhost:5432/scholar_weave_test"
fi

# Remove backup file
rm -f .env.bak

print_status "Database switch completed successfully!"
print_warning "Remember to restart your application for changes to take effect."

# Show current configuration
print_header "Current Database Configuration"
echo "DATABASE_TYPE=$(grep DATABASE_TYPE .env | cut -d'=' -f2)"

print_status "To restart the application:"
echo "  npm run dev" 