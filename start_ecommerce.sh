#!/bin/bash

#───────────────────────────────────────────────────
# ShopEx — One-Click Startup Script
#───────────────────────────────────────────────────

PROJECT_DIR="/home/mostafa/Work/ecommerce-website"
SESSION_NAME="shopex"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo -e "${CYAN}${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║       🛒  ShopEx Platform Launcher    ║${NC}"
echo -e "${CYAN}${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

#───── Step 1: Kill old processes ─────
echo -e "${YELLOW}[1/5]${NC} 🧹 Cleaning up old processes..."
fuser -k 3000/tcp 2>/dev/null
fuser -k 5000/tcp 2>/dev/null
fuser -k 8000/tcp 2>/dev/null
tmux kill-session -t "$SESSION_NAME" 2>/dev/null
sleep 1
echo -e "      ${GREEN}✓ Ports 3000, 5000, 8000 freed${NC}"

#───── Step 2: Start databases ─────
echo -e "${YELLOW}[2/5]${NC} 🐘 Starting PostgreSQL & Redis..."
sudo systemctl start postgresql 2>/dev/null
sudo systemctl start redis 2>/dev/null
echo -e "      ${GREEN}✓ Databases started${NC}"

#───── Step 3: Setup Python venv if needed ─────
echo -e "${YELLOW}[3/5]${NC} 🐍 Checking Python AI environment..."
PYTHON_AI_DIR="$PROJECT_DIR/python-ai"
if [ ! -d "$PYTHON_AI_DIR/venv" ]; then
    echo -e "      Creating Python virtual environment..."
    python3 -m venv "$PYTHON_AI_DIR/venv"
    source "$PYTHON_AI_DIR/venv/bin/activate"
    pip install -q -r "$PYTHON_AI_DIR/requirements.txt" 2>/dev/null
    deactivate
    echo -e "      ${GREEN}✓ Python venv created & dependencies installed${NC}"
else
    echo -e "      ${GREEN}✓ Python venv found${NC}"
fi

#───── Step 4: Check if tmux is available ─────
if ! command -v tmux &> /dev/null; then
    echo -e "${YELLOW}[4/5]${NC} ⚠️  tmux not found — running in background mode..."

    # Backend
    cd "$PROJECT_DIR/server"
    npm run dev > /tmp/shopex-backend.log 2>&1 &
    echo -e "      ${GREEN}✓ Backend starting (port 5000)${NC}"

    # Frontend
    cd "$PROJECT_DIR/frontend"
    npm run dev > /tmp/shopex-frontend.log 2>&1 &
    echo -e "      ${GREEN}✓ Frontend starting (port 3000)${NC}"

    # Python AI
    cd "$PYTHON_AI_DIR"
    source venv/bin/activate 2>/dev/null
    uvicorn main:app --reload --port 8000 > /tmp/shopex-ai.log 2>&1 &
    echo -e "      ${GREEN}✓ Python AI starting (port 8000)${NC}"

    echo ""
    echo -e "${GREEN}${BOLD}🚀 All services launched in background!${NC}"
    echo -e "   Backend:  ${CYAN}http://localhost:5000${NC}"
    echo -e "   Frontend: ${CYAN}http://localhost:3000${NC}"
    echo -e "   AI:       ${CYAN}http://localhost:8000${NC}"
    echo ""
    echo -e "   Logs: /tmp/shopex-*.log"
    echo -e "   Stop: ${BOLD}fuser -k 3000/tcp 5000/tcp 8000/tcp${NC}"
    
    # Wait a moment then open browser
    sleep 5
    xdg-open "http://localhost:3000" 2>/dev/null
    wait
    exit 0
fi

#───── Step 5: Launch in tmux ─────
echo -e "${YELLOW}[4/5]${NC} 🖥️  Setting up tmux session '${SESSION_NAME}'..."

# Pane 0: Backend Server
tmux new-session -d -s "$SESSION_NAME" -n "ShopEx" \
    "echo -e '${GREEN}🚀 Backend Server${NC}' && cd $PROJECT_DIR/server && npm run dev; read"

# Pane 1: Frontend (vertical split)
tmux split-window -v -t "$SESSION_NAME" \
    "echo -e '${GREEN}🎨 Frontend Server${NC}' && cd $PROJECT_DIR/frontend && npm run dev; read"

# Pane 2: Python AI (horizontal split on bottom pane)
tmux split-window -h -t "$SESSION_NAME" \
    "echo -e '${GREEN}🤖 Python AI Service${NC}' && cd $PYTHON_AI_DIR && source venv/bin/activate 2>/dev/null && uvicorn main:app --reload --port 8000; read"

# Equal pane sizes
tmux select-layout -t "$SESSION_NAME" tiled

echo -e "      ${GREEN}✓ tmux session created${NC}"

#───── Step 6: Wait & open browser ─────
echo -e "${YELLOW}[5/5]${NC} 🌐 Opening browser..."
echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║          🎉 ShopEx is LIVE!           ║${NC}"
echo -e "${GREEN}${BOLD}╠═══════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║${NC}  🎨 Frontend: ${CYAN}http://localhost:3000${NC}   ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  🚀 Backend:  ${CYAN}http://localhost:5000${NC}   ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  🤖 AI:       ${CYAN}http://localhost:8000${NC}   ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}╠═══════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║${NC}  📧 Admin:    admin@shopex.com        ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  📧 Customer: customer@shopex.com     ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}║${NC}  🔑 Password: pass123                ${GREEN}${BOLD}║${NC}"
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

# Open browser after a short delay for servers to boot
(sleep 6 && xdg-open "http://localhost:3000" 2>/dev/null) &

# Attach to tmux
tmux -2 attach-session -t "$SESSION_NAME"
