#!/bin/bash

# Database setup script for ScholarWeave
echo "🚀 Setting up ScholarWeave database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL containers
echo "📦 Starting PostgreSQL containers..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is accessible
echo "🔍 Checking database connection..."
until docker-compose exec -T postgres pg_isready -U postgres -d scholar_weave; do
    echo "⏳ Database is not ready yet. Waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed the database (if seed script exists)
if [ -f "src/database/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed
fi

echo "🎉 Database setup complete!"
echo ""
echo "📊 Database Information:"
echo "   - Host: localhost"
echo "   - Port: 5432"
echo "   - Database: scholar_weave"
echo "   - Username: postgres"
echo "   - Password: postgres"
echo ""
echo "🔗 Connection URL: postgresql://postgres:postgres@localhost:5432/scholar_weave" 