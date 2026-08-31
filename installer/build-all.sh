#!/usr/bin/env bash
set -e

echo "=== AgenticCheckout Desktop App Builder ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Build frontend assets
echo "▶ Building frontend assets..."
cd frontend
npm install
npm run build
cd ..

# 2. Build for macOS (Native on current host)
echo "▶ Building for macOS (ARM64 & x86_64)..."
wails build -platform darwin/arm64 -o AgenticCheckout-mac-arm64
wails build -platform darwin/amd64 -o AgenticCheckout-mac-amd64 || echo "Note: Intel Mac build skipped if cross-cgo not configured"

# 3. Output summary
echo ""
echo "=== Build Complete ==="
echo "macOS App Bundle: installer/build/bin/AgenticCheckout.app"
ls -lh build/bin/
