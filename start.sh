#!/usr/bin/env bash
# Start MockBot: Express backend + Vite dev server
set -e
cd "$(dirname "$0")"

# Kill any stale processes
kill_any() { ps -A -o pid,comm,args 2>/dev/null | grep -E "$1" | grep -v grep | awk '{print $1}' | while read -r pid; do
  if [ "$pid" != "$$" ]; then kill "$pid" 2>/dev/null || true; fi
done; }

kill_any "index.js"
kill_any "vite"

# Backend (port 3001)
(cd server && setsid node index.js > server.log 2>&1 &)
sleep 1

# Frontend (port 5173)
(cd client && setsid npx vite --host > vite.log 2>&1 &)

echo "MockBot is starting..."
echo "  Backend: http://127.0.0.1:3001/api/health"
echo "  UI:      http://127.0.0.1:5173/"

# Wait for backend
for _ in $(seq 1 20); do
  if curl -s -m 2 http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
    echo "  Backend ready ✓"
    break
  fi
  sleep 0.5
done

# Wait for frontend
for _ in $(seq 1 20); do
  if curl -s -m 2 http://127.0.0.1:5173/ >/dev/null 2>&1; then
    echo "  UI ready ✓"
    break
  fi
  sleep 0.5
done

echo "Open http://localhost:5173 in your browser. Good luck. You'll need it."