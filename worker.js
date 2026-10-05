export default {
  async fetch(request, env) {
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

    const apiKey = env.PENTAGI_API_KEY || 'development-key';
    const backend = env.PENTAGI_BACKEND || 'http://localhost:3000';

    const forward = async (targetPath, init = {}) => {
      return fetch(`${backend}${targetPath}`, {
        ...init,
        headers: {
          ...(init.headers || {}),
          Authorization: `Bearer ${apiKey}`
        }
      });
    };

    try {
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', service: 'pentagi-worker' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      if (path === '/api/status' && request.method === 'GET') {
        return await forward('/api/status', { method: 'GET' });
      }

      if (path === '/api/scan' && request.method === 'POST') {
        const body = await request.text();
        return await forward('/api/scan', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/results/') && request.method === 'GET') {
        return await forward(path, { method: 'GET' });
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
