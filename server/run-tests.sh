#!/bin/bash
set -e

# Start test database
sudo docker rm -f shopex-test-db 2>/dev/null || true
sudo docker run -d --name shopex-test-db \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpassword \
  -e POSTGRES_DB=testdb \
  -p 5433:5432 \
  --tmpfs /var/lib/postgresql/data \
  postgres:15-alpine

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
until sudo docker exec shopex-test-db pg_isready -U testuser; do
  sleep 1
done

# Set test environment variables
export DATABASE_URL="postgresql://testuser:testpassword@localhost:5433/testdb?schema=public"
export JWT_SECRET="test-jwt-secret-12345"
export NODE_ENV="test"

# Push schema to test database
npx prisma db push --accept-data-loss

# Run tests
set +e
npm run test:runner
TEST_EXIT_CODE=$?
set -e

# Teardown database
sudo docker rm -f shopex-test-db

# Exit with test runner's exit code
exit $TEST_EXIT_CODE
