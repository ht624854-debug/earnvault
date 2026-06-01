#!/bin/bash
# EarnVault VPS Update Script
# Run this on your VPS to update to the latest code

set -e

cd /root/earnvault

echo "=== Fetching latest code ==="
git fetch origin
git reset --hard origin/main

echo "=== Installing dependencies ==="
npm install

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Pushing database schema ==="
npx prisma db push

echo "=== Seeding database (safe - only adds missing data) ==="
npx prisma db seed || echo "Seed skipped or failed (non-critical)"

echo "=== Building project ==="
npm run build

echo "=== Restarting PM2 ==="
pm2 restart earnvault || pm2 restart 0

echo "=== Update complete! ==="
echo "Check status: pm2 status"
echo "Check logs: pm2 logs earnvault"
