# PentAGI

PentAGI is a formal AI pentesting orchestration platform template designed for Linux servers and Cloudflare Worker entry points.

## Features

- Express API server with bearer auth
- Simulated scan queue and task tracking
- Scan result storage in memory
- Dashboard at `/dashboard`
- Health and status endpoints
- Cloudflare Worker forwarding layer
- One-click install script for server deployment

## Quick Start

```bash
git clone https://github.com/thatboss32693/AI-.git
cd AI-
npm install
cp .env.example .env
npm start
```

## Environment

```bash
PENTAGI_API_KEY=replace_with_secure_key
PENTAGI_BASE_URL=http://localhost:8080
NODE_ENV=production
PORT=3000
SCAN_TIMEOUT=300
MAX_CONCURRENT_SCANS=5
```

## API

### health check

```bash
curl http://localhost:3000/health
```

### status

```bash
curl -H "Authorization: Bearer replace_with_secure_key" http://localhost:3000/api/status
```

### launch scan

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Authorization: Bearer replace_with_secure_key" \
  -H "Content-Type: application/json" \
  -d '{"target":"example.com","type":"full"}'
```

### result list

```bash
curl -H "Authorization: Bearer replace_with_secure_key" http://localhost:3000/api/tasks
```

## Dashboard

Open:

```text
http://localhost:3000/dashboard
```

## Cloudflare Worker

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

## Project Structure

```text
.
├── install.sh
├── package.json
├── server.js
├── worker.js
├── wrangler.toml
├── src/
│   ├── config.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   └── index.js
│   ├── services/
│   │   └── taskStore.js
│   └── utils/
│       └── validator.js
├── .env.example
├── .gitignore
└── README.md
```

## Notes

This version is staged as a production-style pentesting control plane with an operational dashboard, scan queue, and worker-layer proxy. It is suitable as a formal foundation before connecting to real scanners or external security APIs.
