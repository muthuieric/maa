#!/usr/bin/env bash
# Dual Development Server Launcher: FastAPI Backend + Next.js Frontend

set -e

echo "================================================================="
echo "NenoGuard — Community Narrative Monitor (Narok & Kajiado Counties)"
echo "================================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PYTHONPATH="${ROOT_DIR}/backend/site-packages:${ROOT_DIR}"
# Backend data files live here; config.py also anchors absolute defaults,
# but an explicit CWD makes relative env overrides predictable too.
cd "${ROOT_DIR}"

# Kill anything stale on our ports (a previous Ctrl-C can leave uvicorn behind).
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT:-8000}/tcp" 2>/dev/null || true
fi

# 1. Start FastAPI backend in background
echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:${PORT:-8000}... (override with HOST/PORT)"
python3 -m uvicorn backend.app.main:app --host "${HOST:-127.0.0.1}" --port "${PORT:-8000}" --reload --reload-exclude 'backend/narratives_meta.db' --reload-exclude 'backend/narratives_docs.json' --reload-exclude 'backend/*.db' --reload-exclude 'backend/*.json' &
BACKEND_PID=$!

trap "echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM EXIT

# Wait until the backend answers before starting the frontend,
# so the UI never loads against a dead API.
echo "Waiting for backend health..."
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${PORT:-8000}/api/health" >/dev/null 2>&1; then
    echo "Backend is up."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "ERROR: backend did not answer /api/health after 60s. Check the log above." >&2
    exit 1
  fi
  sleep 1
done

# 2. Start Next.js frontend
echo "[2/2] Launching Next.js Frontend on http://localhost:3000..."
cd "${ROOT_DIR}/frontend"
npm run dev

wait $BACKEND_PID

