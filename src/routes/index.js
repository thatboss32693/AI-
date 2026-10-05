import express from 'express';

import { config } from '../config.js';
import PentAGI from '../agent/PentAGI.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTarget } from '../utils/validator.js';

const pentagi = new PentAGI({
  apiKey: config.apiKey,
  baseUrl: config.baseUrl
});

export default function createRoutes() {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    res.json({ status: 'ok', service: 'pentagi' });
  });

  router.get('/api/status', requireAuth, async (_req, res) => {
    try {
      const status = await pentagi.getStatus();
      res.json(status);
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

      const result = await pentagi.runScan({ target, type });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/api/results/:scanId', requireAuth, async (req, res) => {
    try {
      const scan = await pentagi.getScan(req.params.scanId);
      res.json(scan);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/', async (_req, res) => {
    res.json({
      project: 'PentAGI',
      version: '1.0.0',
      description: 'AI pentesting orchestration platform',
      status: 'ready'
    });
  });

  return router;
}
