# PentAGI

PentAGI is a lightweight AI pentesting orchestration project template for local deployment and Cloudflare Worker forwarding.

## Features

- Express API server
- JWT-like bearer auth using API key
- /health, /api/status, /api/scan, /api/results/:scanId routes
- Cloudflare Worker proxy layer
- One-click install script for Linux servers

## Quick start

1. Clone the repo

```bash
git clone https://github.com/thatboss32693/AI-.git
cd AI-
```

2. Install dependencies

```bash
npm install
```

3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
PENTAGI_API_KEY=replace_with_secure_key
PENTAGI_BASE_URL=http://localhost:8080
NODE_ENV=production
PORT=3000
```

4. Start the server

```bash
npm start
```

5. Check health

```bash
curl http://localhost:3000/health
```

## API example

### status

```bash
curl -H "Authorization: Bearer replace_with_secure_key" http://localhost:3000/api/status
```

### scan

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Authorization: Bearer replace_with_secure_key" \
  -H "Content-Type: application/json" \
  -d '{"target":"example.com","type":"full"}'
```

### result

```bash
curl -H "Authorization: Bearer replace_with_secure_key" http://localhost:3000/api/results/scan_123
```

## Cloudflare Worker deployment

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

## Project structure

```text
.
├── install.sh
├── package.json
├── server.js
├── worker.js
├── wrangler.toml
├── src/
│   ├── agent/
│   │   └── PentAGI.js
│   ├── config.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   └── index.js
│   └── utils/
│       └── validator.js
└── .gitignore
```

## Notes

This is a formal project scaffold for deployment and orchestration. It is suitable for a server-based PentAGI-style control plane and a Cloudflare Worker entry layer.
