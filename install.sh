#!/bin/bash
set -e

APP_DIR="$HOME/pentagi"
NODE_VERSION="20"

echo "========================================="
echo "PentAGI Installation Script"
echo "========================================="

echo "[1/5] Ensuring prerequisites..."
if ! command -v curl >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y curl
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v git >/dev/null 2>&1; then
  sudo apt-get install -y git
fi

echo "[2/5] Preparing application directory..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ ! -f package.json ]; then
  echo "[3/5] Creating project scaffold..."
  cat > package.json <<'EOF'
{
  "name": "pentagi",
  "version": "1.0.0",
  "description": "PentAGI AI pentesting platform",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "NODE_ENV=development node --watch server.js"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0"
  }
}
EOF
fi

echo "[4/5] Installing dependencies..."
npm install

echo "[5/5] Creating environment file..."
if [ ! -f .env ]; then
  cat > .env <<'EOF'
PENTAGI_API_KEY=replace_with_secure_key
PENTAGI_BASE_URL=http://localhost:8080
NODE_ENV=production
PORT=3000
EOF
fi

echo ""
echo "PentAGI installation finished."
echo "Next steps:"
echo "  1. Edit .env"
echo "  2. npm start"
echo "  3. Access http://localhost:3000/health"
