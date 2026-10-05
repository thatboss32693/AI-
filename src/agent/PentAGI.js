import axios from 'axios';

class PentAGI {
  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.status = 'idle';
    this.activeScans = new Map();
  }

  async initialize() {
    this.status = 'ready';
    return {
      name: 'PentAGI',
      status: this.status,
      version: '1.0.0',
      backend: this.baseUrl
    };
  }

  async runScan({ target, type = 'full' }) {
    if (!target) {
      throw new Error('Target is required');
    }

    const scanId = `scan_${Date.now()}`;
    const payload = {
      scanId,
      target,
      type,
      createdAt: new Date().toISOString(),
      status: 'queued'
    };

    this.activeScans.set(scanId, payload);

    try {
      const response = await axios.post(`${this.baseUrl}/api/scan`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      this.activeScans.set(scanId, {
        ...payload,
        ...response.data,
        status: response.data.status || 'running'
      });

      return this.activeScans.get(scanId);
    } catch (error) {
      const fallback = {
        ...payload,
        status: 'failed',
        error: error.message
      };
      this.activeScans.set(scanId, fallback);
      return fallback;
    }
  }

  async getScan(scanId) {
    const scan = this.activeScans.get(scanId);
    if (!scan) {
      return {
        scanId,
        status: 'not_found'
      };
    }

    return scan;
  }

  async getStatus() {
    return {
      status: 'online',
      version: '1.0.0',
      uptime: process.uptime(),
      activeScans: this.activeScans.size
    };
  }
}

export default PentAGI;
