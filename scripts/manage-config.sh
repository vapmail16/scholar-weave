#!/bin/bash

# Configuration Management Script for ScholarWeave
# This script helps manage the centralized configuration structure

set -e

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

# Function to show usage
show_usage() {
    echo "Configuration Management Script"
    echo "==============================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status     - Show configuration status and symbolic links"
    echo "  fix-links  - Recreate broken symbolic links"
    echo "  backup     - Create backup of current configurations"
    echo "  restore    - Restore configurations from backup"
    echo "  validate   - Validate configuration files"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 fix-links"
    echo "  $0 backup"
}

# Function to check symbolic links
check_links() {
    print_info "Checking symbolic links..."
    
    local broken_links=()
    
    # Check root level links
    if [ ! -L "package.json" ] || [ ! -e "package.json" ]; then
        broken_links+=("package.json")
    fi
    
    if [ ! -L "package-lock.json" ] || [ ! -e "package-lock.json" ]; then
        broken_links+=("package-lock.json")
    fi
    
    # Check frontend links
    if [ ! -L "frontend/package.json" ] || [ ! -e "frontend/package.json" ]; then
        broken_links+=("frontend/package.json")
    fi
    
    if [ ! -L "frontend/tsconfig.json" ] || [ ! -e "frontend/tsconfig.json" ]; then
        broken_links+=("frontend/tsconfig.json")
    fi
    
    # Check backend links
    if [ ! -L "backend/package.json" ] || [ ! -e "backend/package.json" ]; then
        broken_links+=("backend/package.json")
    fi
    
    if [ ! -L "backend/tsconfig.json" ] || [ ! -e "backend/tsconfig.json" ]; then
        broken_links+=("backend/tsconfig.json")
    fi
    
    if [ ${#broken_links[@]} -eq 0 ]; then
        print_status "All symbolic links are working correctly"
        return 0
    else
        print_warning "Found ${#broken_links[@]} broken symbolic links:"
        for link in "${broken_links[@]}"; do
            echo "  - $link"
        done
        return 1
    fi
}

# Function to fix symbolic links
fix_links() {
    print_info "Fixing symbolic links..."
    
    # Remove existing broken links
    rm -f package.json package-lock.json .gitignore .dockerignore
    rm -f frontend/package.json frontend/package-lock.json frontend/tsconfig*.json frontend/vite.config.ts frontend/tailwind.config.ts frontend/postcss.config.js frontend/components.json frontend/eslint.config.js frontend/index.html
    rm -f backend/package.json backend/package-lock.json backend/tsconfig.json backend/jest.config.js backend/.gitignore backend/env.example
    
    # Recreate root links
    ln -s config/root/package.json package.json
    ln -s config/root/package-lock.json package-lock.json
    ln -s config/root/.gitignore .gitignore
    ln -s config/root/.dockerignore .dockerignore
    
    # Recreate frontend links
    cd frontend
    ln -s ../config/frontend/package.json package.json
    ln -s ../config/frontend/package-lock.json package-lock.json
    ln -s ../config/frontend/tsconfig.json tsconfig.json
    ln -s ../config/frontend/tsconfig.app.json tsconfig.app.json
    ln -s ../config/frontend/tsconfig.node.json tsconfig.node.json
    ln -s ../config/frontend/vite.config.ts vite.config.ts
    ln -s ../config/frontend/tailwind.config.ts tailwind.config.ts
    ln -s ../config/frontend/postcss.config.js postcss.config.js
    ln -s ../config/frontend/components.json components.json
    ln -s ../config/frontend/eslint.config.js eslint.config.js
    ln -s ../config/frontend/index.html index.html
    cd ..
    
    # Recreate backend links
    cd backend
    ln -s ../config/backend/package.json package.json
    ln -s ../config/backend/package-lock.json package-lock.json
    ln -s ../config/backend/tsconfig.json tsconfig.json
    ln -s ../config/backend/jest.config.js jest.config.js
    ln -s ../config/backend/.gitignore .gitignore
    ln -s ../config/backend/env.example env.example
    cd ..
    
    print_status "Symbolic links recreated successfully"
}

# Function to create backup
create_backup() {
    local backup_dir="config/backup/$(date +%Y%m%d_%H%M%S)"
    print_info "Creating backup in $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    # Backup config files
    cp -r config/root "$backup_dir/"
    cp -r config/frontend "$backup_dir/"
    cp -r config/backend "$backup_dir/"
    
    print_status "Backup created successfully in $backup_dir"
}

# Function to restore from backup
restore_backup() {
    if [ -z "$1" ]; then
        print_error "Please specify backup directory"
        echo "Usage: $0 restore <backup_directory>"
        exit 1
    fi
    
    local backup_dir="$1"
    
    if [ ! -d "$backup_dir" ]; then
        print_error "Backup directory $backup_dir does not exist"
        exit 1
    fi
    
    print_info "Restoring from backup $backup_dir..."
    
    # Restore config files
    cp -r "$backup_dir/root"/* config/root/
    cp -r "$backup_dir/frontend"/* config/frontend/
    cp -r "$backup_dir/backend"/* config/backend/
    
    # Recreate links
    fix_links
    
    print_status "Configuration restored successfully"
}

# Function to validate configuration files
validate_configs() {
    print_info "Validating configuration files..."
    
    local errors=0
    
    # Validate JSON files
    for json_file in config/root/*.json config/frontend/*.json config/backend/*.json; do
        if [ -f "$json_file" ]; then
            if ! jq empty "$json_file" 2>/dev/null; then
                print_error "Invalid JSON in $json_file"
                ((errors++))
            else
                print_status "Valid JSON: $json_file"
            fi
        fi
    done
    
    # Validate TypeScript configs
    for ts_file in config/frontend/*.ts config/backend/*.ts; do
        if [ -f "$ts_file" ]; then
            if ! npx tsc --noEmit --skipLibCheck "$ts_file" 2>/dev/null; then
                print_error "Invalid TypeScript in $ts_file"
                ((errors++))
            else
                print_status "Valid TypeScript: $ts_file"
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        print_status "All configuration files are valid"
    else
        print_error "Found $errors validation errors"
        exit 1
    fi
}

# Function to show status
show_status() {
    print_info "Configuration Status Report"
    echo "================================"
    echo ""
    
    # Check if config directory exists
    if [ ! -d "config" ]; then
        print_error "Config directory not found"
        exit 1
    fi
    
    print_info "Configuration Directory Structure:"
    tree config -I 'backup' 2>/dev/null || find config -type f | head -20
    
    echo ""
    print_info "Symbolic Links Status:"
    check_links
    
    echo ""
    print_info "Configuration File Counts:"
    echo "  Root configs: $(ls config/root/ | wc -l | tr -d ' ')"
    echo "  Frontend configs: $(ls config/frontend/ | wc -l | tr -d ' ')"
    echo "  Backend configs: $(ls config/backend/ | wc -l | tr -d ' ')"
    
    echo ""
    print_info "Recent Backups:"
    if [ -d "config/backup" ]; then
        ls -la config/backup/ | tail -5
    else
        echo "  No backups found"
    fi
}

# Main script logic
case "${1:-help}" in
    "status")
        show_status
        ;;
    "fix-links")
        fix_links
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "validate")
        validate_configs
        ;;
    "help"|*)
        show_usage
        ;;
esac 