/**
 * Cloudflare Worker entry for PentAGI
 */

const API_KEY = 'replace_with_secure_key';
const BACKEND_URL = 'http://localhost:8080';

async function forwardRequest(request, path, init = {}) {
  const url = `${BACKEND_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${API_KEY}`
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    try {
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      if (path === '/api/status' && request.method === 'GET') {
        const response = await forwardRequest(request, path, { method: 'GET' });
        return response;
      }

      if (path === '/api/scan' && request.method === 'POST') {
        const body = await request.text();
        const response = await forwardRequest(request, path, {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response;
      }

      if (path.startsWith('/api/results/') && request.method === 'GET') {
        const response = await forwardRequest(request, path, { method: 'GET' });
        return response;
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
