#!/bin/bash

echo "🐳 Building and running ScholarWeave with Docker..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start all services
echo "🏗️ Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo "✅ ScholarWeave is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3002"
echo "🗄️ Database: localhost:5432"

echo ""
echo "📝 Useful commands:"
echo "  docker-compose logs -f    # View logs"
echo "  docker-compose down       # Stop services"
echo "  docker-compose restart    # Restart services" 