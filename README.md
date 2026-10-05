# PentAGI 3.0

**🛡️ Professional Pentesting Orchestration Platform**

> Real-time security scanning with Nmap, Gobuster, and Nuclei integrated into a single control plane.

## ⚠️ LEGAL DISCLAIMER

**This tool is for authorized security testing only.** You are solely responsible for compliance with all applicable laws and regulations. See [DISCLAIMER.md](./DISCLAIMER.md) for full legal terms.

## Features

✅ Real-time Nmap port scanning  
✅ Web directory enumeration with Gobuster  
✅ Vulnerability detection with Nuclei  
✅ Live dashboard with progress tracking  
✅ RESTful API with authentication  
✅ Async task queue  
✅ JSON results export  
✅ Cloudflare Worker support  
✅ Production-ready on Linux  

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/thatboss32693/AI-.git
cd AI-
npm install
```

### 2. Install Scanner Tools

```bash
chmod +x scripts/install-scanner-tools.sh
sudo bash scripts/install-scanner-tools.sh
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env with your API key and settings
nano .env
```

### 4. Run

```bash
npm start
```

### 5. Access Dashboard

```
http://localhost:3000/dashboard
```

## API Usage

### System Status

```bash
curl -H "Authorization: Bearer pentagi_dev_key" \
  http://localhost:3000/api/status
```

### Start Scan

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Authorization: Bearer pentagi_dev_key" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "type": "full"
  }'
```

Response:
```json
{
  "id": "uuid-here",
  "target": "example.com",
  "type": "full",
  "status": "queued",
  "message": "Scan enqueued and running"
}
```

### Get Results

```bash
curl -H "Authorization: Bearer pentagi_dev_key" \
  http://localhost:3000/api/results/{taskId}
```

### List All Tasks

```bash
curl -H "Authorization: Bearer pentagi_dev_key" \
  http://localhost:3000/api/tasks
```

## Scan Types

| Type | Tools | Use Case |
|------|-------|----------|
| **quick** | Nmap | Fast port scan |
| **web** | Gobuster | Directory enumeration |
| **vuln** | Nuclei | Vulnerability detection |
| **full** | All tools | Complete assessment |

## Installation Methods

### Method 1: Linux Server

```bash
chmod +x install.sh
./install.sh
npm run install-tools
npm start
```

### Method 2: Docker

```bash
docker build -t pentagi:3.0 .
docker run -d -p 3000:3000 \
  -e PENTAGI_API_KEY=your_secure_key \
  -e NODE_ENV=production \
  pentagi:3.0
```

### Method 3: Systemd Service

```bash
sudo tee /etc/systemd/system/pentagi.service > /dev/null << 'EOF'
[Unit]
Description=PentAGI Pentesting Platform
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/pentagi
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable pentagi
sudo systemctl start pentagi
sudo systemctl status pentagi
```

## Environment Variables

```bash
# API Authentication
PENTAGI_API_KEY=your_secure_key_here

# Server
PORT=3000
NODE_ENV=production

# Scanning
SCAN_TIMEOUT=600          # seconds
MAX_CONCURRENT_SCANS=3    # parallel tasks

# Base URL
PENTAGI_BASE_URL=http://localhost:3000
```

## Project Structure

```
.
├── server.js              # Main server
├── package.json
├── src/
│   ├── config.js          # Configuration
│   ├── routes/
│   │   └── index.js       # API routes & dashboard
│   ├── services/
│   │   └── scanEngine.js  # Nmap, Gobuster, Nuclei
│   ├── middleware/
│   │   └── auth.js        # Bearer token auth
│   └── utils/
│       └── validator.js   # Input validation
├── scripts/
│   └── install-scanner-tools.sh
├── .env.example
├── LICENSE                # MIT
└── DISCLAIMER.md          # Legal terms
```

## Troubleshooting

### Nmap says "Permission denied"

```bash
sudo setcap cap_net_raw,cap_net_admin=eip /usr/bin/nmap
```

### Gobuster/Nuclei not found

```bash
npm run install-tools
```

### Port 3000 in use

```bash
PORT=8080 npm start
```

### Scan timeout

Increase in `.env`:
```bash
SCAN_TIMEOUT=1200
```

## Cloudflare Workers Deployment

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

Configure in `wrangler.toml`:
```toml
[env.production]
vars = { PENTAGI_BACKEND = "https://your-server.com" }
```

## Security Notes

1. **Change the default API key** in `.env`
2. **Use HTTPS** in production (nginx + Let's Encrypt)
3. **Restrict network access** to authorized IPs
4. **Log all scan activities** for compliance
5. **Only scan authorized targets** - verify ownership/permissions

## License

MIT - See LICENSE file

## Disclaimer

**See DISCLAIMER.md for full legal terms. Users are solely responsible for compliance with all laws and regulations.**

---

**Made with 🛡️ for authorized security professionals**
