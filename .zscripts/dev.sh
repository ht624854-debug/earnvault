#!/bin/bash
cd /home/z/my-project

# Install dependencies if needed
echo "[DEV] Installing dependencies..."
bun install

# Setup database
echo "[DEV] Setting up database..."
bun run db:push

# Generate Prisma client
echo "[DEV] Generating Prisma client..."
bun run db:generate

# Start dev server (foreground - the sandbox manages this as a background process)
echo "[DEV] Starting development server..."
exec npx next dev -p 3000
