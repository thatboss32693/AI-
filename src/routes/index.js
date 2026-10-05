import express from 'express';
import { randomUUID } from 'crypto';

import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTarget } from '../utils/validator.js';
import { enqueueScan, getAllTasks, getTaskById, runScanJob } from '../services/taskStore.js';

const buildDashboardHTML = () => `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PentAGI Dashboard</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0b1020; color: #e5e7eb; margin: 0; padding: 32px; }
      .container { max-width: 960px; margin: 0 auto; }
      .card { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
      h1 { margin-top: 0; }
      input, select, button { font-size: 16px; padding: 10px 12px; border-radius: 8px; border: 1px solid #4b5563; }
      input, select { width: 100%; margin-bottom: 12px; background: #0f172a; color: #e5e7eb; }
      button { background: #3b82f6; color: white; border: none; cursor: pointer; width: 180px; }
      .meta { color: #93c5fd; }
      pre { background: #020817; padding: 16px; border-radius: 8px; overflow: auto; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h1>PentAGI Dashboard</h1>
        <div class="meta">Project: ${config.projectName} / Version: ${config.version}</div>
      </div>

      <div class="card">
        <h2>New scan</h2>
        <form id="scanForm">
          <input id="target" type="text" placeholder="example.com or 1.1.1.1" required />
          <select id="type">
            <option value="full">full</option>
            <option value="quick">quick</option>
            <option value="recon">recon</option>
            <option value="vuln">vuln</option>
          </select>
          <button type="submit">Launch scan</button>
        </form>
      </div>

      <div class="card">
        <h2>Tasks</h2>
        <pre id="results">Loading...</pre>
      </div>
    </div>

    <script>
      async function loadTasks() {
        const res = await fetch('/api/tasks', {
          headers: { Authorization: 'Bearer ' + '${config.apiKey}' }
        });
        const data = await res.json();
        document.getElementById('results').textContent = JSON.stringify(data, null, 2);
      }

      document.getElementById('scanForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const target = document.getElementById('target').value;
        const type = document.getElementById('type').value;

        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + '${config.apiKey}'
          },
          body: JSON.stringify({ target, type })
        });

        const body = await res.json();
        document.getElementById('results').textContent = JSON.stringify(body, null, 2);
        loadTasks();
      });

      loadTasks();
    </script>
  </body>
  </html>
`;

export default function createRoutes() {
  const router = express.Router();

  router.get('/dashboard', (_req, res) => {
    res.type('html').send(buildDashboardHTML());
  });

  router.get('/health', async (_req, res) => {
    res.json({
      status: 'ok',
      service: config.projectName,
      version: config.version,
      timestamp: new Date().toISOString()
    });
  });

  router.get('/api/status', requireAuth, async (_req, res) => {
    try {
      const tasks = getAllTasks();
      res.json({
        status: 'online',
        project: config.projectName,
        version: config.version,
        uptime: process.uptime(),
        activeTasks: tasks.filter((task) => task.status === 'running' || task.status === 'queued').length,
        totalTasks: tasks.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/api/tasks', requireAuth, (_req, res) => {
    try {
      const tasks = getAllTasks();
      res.json({
        project: config.projectName,
        count: tasks.length,
        tasks
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/api/tasks/:taskId', requireAuth, (req, res) => {
    try {
      const task = getTaskById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/api/scan', requireAuth, async (req, res) => {
    try {
      const { target, type = 'full' } = req.body || {};
      if (!validateTarget(target)) {
        return res.status(400).json({ error: 'Invalid target' });
      }

      const task = enqueueScan({
        target,
        type,
        status: 'queued',
        id: randomUUID()
      });

      const result = await runScanJob(task.id, target, type);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/api/results/:scanId', requireAuth, (req, res) => {
    try {
      const task = getTaskById(req.params.scanId);
      if (!task) {
        return res.status(404).json({ error: 'Result not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/', async (_req, res) => {
    res.json({
      project: config.projectName,
      version: config.version,
      description: 'AI pentesting orchestration platform',
      status: 'ready',
      dashboard: '/dashboard'
    });
  });

  return router;
}
