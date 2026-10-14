#!/usr/bin/env bash
# Dual Development Server Launcher: FastAPI Backend + Next.js Frontend

set -e

echo "================================================================="
echo "NenoGuard — Community Narrative Monitor (Narok & Kajiado Counties)"
echo "================================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PYTHONPATH="${ROOT_DIR}/backend/site-packages:${ROOT_DIR}"

# 1. Start FastAPI backend in background
echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000... (override with HOST)"
python3 -m uvicorn backend.app.main:app --host "${HOST:-127.0.0.1}" --port "${PORT:-8000}" --reload &
BACKEND_PID=$!

trap "echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM EXIT

# 2. Start Next.js frontend
echo "[2/2] Launching Next.js Frontend on http://localhost:3000..."
cd "${ROOT_DIR}/frontend"
npm run dev

wait $BACKEND_PID

