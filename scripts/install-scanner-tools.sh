#!/bin/bash

echo "========================================"
echo "PentAGI Scanner Tools Installation"
echo "========================================"

echo "[1/4] Updating system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq curl wget git build-essential

echo "[2/4] Installing Nmap..."
sudo apt-get install -y -qq nmap
echo "  ✓ Nmap: $(nmap -V | head -1)"

echo "[3/4] Installing Gobuster..."
if ! command -v gobuster &>/dev/null; then
  GO_VERSION="1.21.0"
  if ! command -v go &>/dev/null; then
    echo "  Installing Go..."
    cd /tmp
    wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bashrc
    export PATH=$PATH:/usr/local/go/bin
  fi
  /usr/local/go/bin/go install -v github.com/OJ/gobuster/v3@latest
  sudo ln -sf ~/go/bin/gobuster /usr/local/bin/gobuster
  echo "  ✓ Gobuster installed"
else
  echo "  ✓ Gobuster already installed"
fi

echo "[4/4] Installing Nuclei..."
if ! command -v nuclei &>/dev/null; then
  if command -v go &>/dev/null || [ -f /usr/local/go/bin/go ]; then
    export PATH=$PATH:/usr/local/go/bin
    go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
    sudo ln -sf ~/go/bin/nuclei /usr/local/bin/nuclei
  else
    echo "  Nuclei requires Go. Install Go first."
  fi
  echo "  ✓ Nuclei installed"
else
  echo "  ✓ Nuclei already installed"
fi

echo ""
echo "========================================"
echo "✓ Installation Complete!"
echo "========================================"
echo ""
