#!/bin/sh
set -e

echo "Applying database migrations..."

bunx drizzle-kit migrate

echo "Starting document engine..."

exec bun run .output/server/index.mjs
