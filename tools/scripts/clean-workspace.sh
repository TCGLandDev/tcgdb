#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

cd "${REPO_ROOT}"

echo "Cleaning repository artifacts under ${REPO_ROOT}"

echo "Removing node_modules directories..."
find . -name "node_modules" -type d -prune -print -exec rm -rf {} +

echo "Removing dist directories..."
find . -name "dist" -type d -prune -print -exec rm -rf {} +

echo "Removing tsconfig.build.tsbuildinfo files..."
find . -name "tsconfig.build.tsbuildinfo" -type f -print -delete

echo "Clean complete."
