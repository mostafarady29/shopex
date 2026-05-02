#!/bin/bash

echo "🛑 Stopping ShopEx services..."

# Kill tmux session
tmux kill-session -t shopex 2>/dev/null && echo "   ✓ tmux session killed"

# Kill any remaining processes on ports
fuser -k 3000/tcp 2>/dev/null && echo "   ✓ Frontend stopped (port 3000)"
fuser -k 5000/tcp 2>/dev/null && echo "   ✓ Backend stopped (port 5000)"
fuser -k 8000/tcp 2>/dev/null && echo "   ✓ Python AI stopped (port 8000)"

echo ""
echo "✅ All ShopEx services stopped."
