export const config = {
  projectName: 'PentAGI',
  version: '3.0.0',
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.PENTAGI_API_KEY || 'pentagi_dev_key',
  baseUrl: process.env.PENTAGI_BASE_URL || 'http://localhost:3000',
  scanTimeout: Number(process.env.SCAN_TIMEOUT || 600),
  maxConcurrentScans: Number(process.env.MAX_CONCURRENT_SCANS || 3),
  tools: {
    nmap: process.env.NMAP_PATH || 'nmap',
    gobuster: process.env.GOBUSTER_PATH || 'gobuster',
    nuclei: process.env.NUCLEI_PATH || 'nuclei'
  }
};
