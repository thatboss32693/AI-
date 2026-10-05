import express from 'express';
import { randomUUID } from 'crypto';

import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTarget } from '../utils/validator.js';
import { enqueueScan, getAllTasks, getTaskById, runFullScan } from '../services/scanEngine.js';

const buildDashboard = () => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PentAGI Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; background: #0a0e27; color: #e5e7eb; line-height: 1.6; }
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { font-size: 32px; color: #3b82f6; }
    .subtitle { color: #93c5fd; font-size: 14px; }
    .card { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .card h2 { color: #3b82f6; margin-bottom: 16px; }
    input, select { width: 100%; padding: 10px 12px; margin-bottom: 12px; background: #0f172a; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; font-family: monospace; }
    button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-weight: bold; }
    button:hover { background: #2563eb; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .status { padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; }
    .status.queued { background: #f3f4f6; color: #1f2937; }
    .status.running { background: #fbbf24; color: #78350f; }
    .status.completed { background: #86efac; color: #15803d; }
    .status.failed { background: #fca5a5; color: #7f1d1d; }
    .task-item { background: #0f172a; padding: 12px; border-left: 3px solid #3b82f6; margin-bottom: 10px; border-radius: 4px; cursor: pointer; }
    .task-item:hover { border-left-color: #60a5fa; }
    .task-item .progress { width: 100%; height: 4px; background: #374151; border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .task-item .progress-bar { height: 100%; background: #3b82f6; width: 0%; transition: width 0.3s; }
    pre { background: #020817; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; max-height: 400px; overflow-y: auto; }
    .meta { color: #9ca3af; font-size: 12px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🛡️ PentAGI Dashboard</h1>
      <div class="subtitle">Version ${config.version} | Real-time Pentesting Engine</div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Launch Scan</h2>
        <form id="scanForm">
          <input id="target" type="text" placeholder="example.com or 1.1.1.1 or http://example.com" required />
          <select id="type">
            <option value="quick">Port Scan (Nmap)</option>
            <option value="web">Web Enum (Gobuster)</option>
            <option value="vuln">Vulnerability Scan (Nuclei)</option>
            <option value="full" selected>Full Scan (All)</option>
          </select>
          <button type="submit">🚀 Launch Scan</button>
        </form>
      </div>

      <div class="card">
        <h2>System Status</h2>
        <pre id="status">Loading...</pre>
      </div>
    </div>

    <div class="card">
      <h2>Active Scans</h2>
      <div id="tasks">No scans yet</div>
    </div>

    <div class="card">
      <h2>Scan Results</h2>
      <pre id="results">Select a scan to view results</pre>
    </div>
  </div>

  <script>
    const apiKey = '${config.apiKey}';
    let selectedTaskId = null;

    async function loadStatus() {
      try {
        const res = await fetch('/api/status', {
          headers: { Authorization: 'Bearer ' + apiKey }
        });
        const data = await res.json();
        document.getElementById('status').textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        document.getElementById('status').textContent = 'Error loading status';
      }
    }

    async function loadTasks() {
      try {
        const res = await fetch('/api/tasks', {
          headers: { Authorization: 'Bearer ' + apiKey }
        });
        const data = await res.json();
        const tasksList = document.getElementById('tasks');
        
        if (!data.tasks || data.tasks.length === 0) {
          tasksList.innerHTML = '<p style="color: #6b7280;">No scans yet</p>';
          return;
        }

        tasksList.innerHTML = data.tasks.map(task => `
          <div class="task-item" onclick="selectTask('${task.id}')">
            <div><strong>${task.target}</strong> <span class="status ${task.status}">${task.status.toUpperCase()}</span></div>
            <div class="meta">${task.type} | ${new Date(task.createdAt).toLocaleString()}</div>
            <div class="progress">
              <div class="progress-bar" style="width: ${task.progress}%"></div>
            </div>
            <div class="meta">${task.progress}% • ${task.summary ? JSON.stringify(task.summary) : 'Processing...'}</div>
          </div>
        `).join('');
      } catch (e) {
        console.error('Error loading tasks', e);
      }
    }

    async function selectTask(taskId) {
      selectedTaskId = taskId;
      try {
        const res = await fetch('/api/results/' + taskId, {
          headers: { Authorization: 'Bearer ' + apiKey }
        });
        const data = await res.json();
        document.getElementById('results').textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        document.getElementById('results').textContent = 'Error loading results';
      }
    }

    document.getElementById('scanForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const target = document.getElementById('target').value;
      const type = document.getElementById('type').value;

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey
          },
          body: JSON.stringify({ target, type })
        });

        const data = await res.json();
        document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        document.getElementById('target').value = '';
        loadTasks();
        loadStatus();
      } catch (e) {
        alert('Error launching scan: ' + e.message);
      }
    });

    loadStatus();
    loadTasks();
    setInterval(loadTasks, 2000);
    setInterval(loadStatus, 3000);
  </script>
</body>
</html>
`;

export default function createRoutes() {
  const router = express.Router();

  router.get('/dashboard', (_req, res) => {
    res.type('html').send(buildDashboard());
  });

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: config.projectName,
      version: config.version
    });
  });

  router.get('/api/status', requireAuth, async (_req, res) => {
    const tasks = getAllTasks();
    res.json({
      status: 'online',
      project: config.projectName,
      version: config.version,
      uptime: Math.floor(process.uptime()),
      activeTasks: tasks.filter(t => t.status === 'running' || t.status === 'queued').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      totalTasks: tasks.length
    });
  });

  router.get('/api/tasks', requireAuth, (_req, res) => {
    const tasks = getAllTasks();
    res.json({
      project: config.projectName,
      count: tasks.length,
      tasks: tasks.map(t => ({
        id: t.id,
        target: t.target,
        type: t.type,
        status: t.status,
        progress: t.progress,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        completedAt: t.completedAt,
        summary: t.summary
      }))
    });
  });

  router.get('/api/tasks/:taskId', requireAuth, (req, res) => {
    const task = getTaskById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  router.post('/api/scan', requireAuth, async (req, res) => {
    const { target, type = 'full' } = req.body || {};
    if (!validateTarget(target)) {
      return res.status(400).json({ error: 'Invalid target format' });
    }

    const taskId = randomUUID();
    const task = enqueueScan({ id: taskId, target, type });

    // Run scan in background
    runFullScan(taskId, target, type).catch(err => {
      console.error('[scan-error]', err);
    });

    res.status(202).json({
      id: taskId,
      target,
      type,
      status: 'queued',
      message: 'Scan enqueued and running'
    });
  });

  router.get('/api/results/:taskId', requireAuth, (req, res) => {
    const task = getTaskById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Result not found' });
    res.json(task);
  });

  router.get('/', (_req, res) => {
    res.json({
      project: config.projectName,
      version: config.version,
      description: 'Real-time pentesting orchestration platform',
      status: 'ready',
      endpoints: {
        dashboard: '/dashboard',
        health: '/health',
        status: '/api/status',
        tasks: '/api/tasks',
        scan: 'POST /api/scan',
        results: '/api/results/:taskId'
      }
    });
  });

  return router;
}
