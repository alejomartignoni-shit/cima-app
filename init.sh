#!/bin/bash
set -e

echo "=== CIMA — Init ==="

# Install deps
if [ ! -d node_modules ]; then
  npm install
fi

# TypeScript check
npm run build 2>&1 | tail -5

echo ""
echo "=== OK ==="
echo "npm run dev   → dev server"
echo "npm run build → prod build"
echo "npm run lint  → ESLint"
