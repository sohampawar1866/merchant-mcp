#!/usr/bin/env bash
set -e

echo "=== AgenticCheckout Multi-Platform Desktop App Builder ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Build frontend assets
echo "▶ Building frontend Vite assets..."
cd frontend
npm install
npm run build
cd ..

TARGET="${1:-host}"

case "$TARGET" in
  mac|darwin)
    echo "▶ Building for macOS (ARM64 & AMD64)..."
    wails build -platform darwin/arm64 -o AgenticCheckout-mac-arm64
    wails build -platform darwin/amd64 -o AgenticCheckout-mac-amd64 || echo "ℹ️ Note: Intel Mac build skipped if cross-cgo not configured"
    ;;
  windows|win)
    echo "▶ Building for Windows (x86_64)..."
    wails build -platform windows/amd64 -o AgenticCheckout-windows-amd64.exe || echo "ℹ️ Note: Requires mingw-w64 for Windows cross-compilation from non-Windows host"
    ;;
  linux)
    echo "▶ Building for Linux (x86_64)..."
    wails build -platform linux/amd64 -o AgenticCheckout-linux-amd64 || echo "ℹ️ Note: Requires Linux GTK/WebKit dev libraries for cross-compilation"
    ;;
  all)
    echo "▶ Building for all platforms..."
    wails build -platform darwin/arm64 -o AgenticCheckout-mac-arm64 || true
    wails build -platform darwin/amd64 -o AgenticCheckout-mac-amd64 || true
    wails build -platform windows/amd64 -o AgenticCheckout-windows-amd64.exe || true
    wails build -platform linux/amd64 -o AgenticCheckout-linux-amd64 || true
    ;;
  host|*)
    echo "▶ Building for current host platform ($(uname -s)/$(uname -m))..."
    wails build
    ;;
esac

# Summary
echo ""
echo "=== Build Complete ==="
if [ -d "build/bin" ]; then
  ls -lh build/bin/
fi
