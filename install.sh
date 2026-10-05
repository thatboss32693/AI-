#!/bin/bash
set -e

APP_DIR="$HOME/pentagi"

echo "========================================"
echo "PentAGI Installation"
echo "========================================"

echo "[1/5] Installing Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "[2/5] Creating application directory..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "[3/5] Cloning repository..."
if [ -d .git ]; then
  git pull origin main
else
  git clone https://github.com/thatboss32693/AI-.git .
fi

echo "[4/5] Installing dependencies..."
npm install

echo "[5/5] Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  sed -i "s/pentagi_dev_key/pentagi_$(date +%s)/g" .env
  echo "  Created .env with random API key"
fi

echo ""
echo "========================================"
echo "✓ Installation Complete!"
echo "========================================"
echo "Next steps:"
echo "  1. Edit .env: nano $APP_DIR/.env"
echo "  2. Install tools: npm run install-tools"
echo "  3. Start server: npm start"
echo "  4. Open dashboard: http://localhost:3000/dashboard"
echo ""
