export const config = {
  projectName: 'PentAGI',
  version: '2.0.0',
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.PENTAGI_API_KEY || 'development-key',
  baseUrl: process.env.PENTAGI_BASE_URL || 'http://localhost:8080',
  scanTimeout: Number(process.env.SCAN_TIMEOUT || 300),
  maxConcurrentScans: Number(process.env.MAX_CONCURRENT_SCANS || 5)
};
