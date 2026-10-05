import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const activeTasks = new Map();

class ScanEngine {
  async runNmapScan(target) {
    try {
      const cmd = `nmap -sV -sC -p- --open ${target} -oG -`;
      const { stdout } = await execAsync(cmd, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });
      
      const ports = [];
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('open')) {
          const match = line.match(/(\d+)\/(tcp|udp)\s+open\s+(\S+)/);
          if (match) {
            ports.push({
              port: match[1],
              protocol: match[2],
              service: match[3]
            });
          }
        }
      }
      
      return {
        type: 'nmap',
        target,
        success: true,
        data: ports,
        count: ports.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'nmap',
        target,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runGobusterScan(target) {
    try {
      const url = target.startsWith('http') ? target : `http://${target}`;
      const cmd = `timeout 60 gobuster dir -u "${url}" -w /usr/share/wordlists/dirb/common.txt -q 2>/dev/null || echo "scan_timeout"`;
      const { stdout } = await execAsync(cmd, { timeout: 65000 });
      
      const dirs = stdout
        .split('\n')
        .filter(line => line.length > 0 && !line.includes('scan_timeout'))
        .map(line => line.trim());
      
      return {
        type: 'gobuster',
        target,
        success: true,
        data: dirs,
        count: dirs.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'gobuster',
        target,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runNucleiScan(target) {
    try {
      const cmd = `timeout 120 nuclei -u "${target}" -s critical,high -json 2>/dev/null || echo ""`;
      const { stdout } = await execAsync(cmd, { timeout: 125000, maxBuffer: 10 * 1024 * 1024 });
      
      const findings = stdout
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      return {
        type: 'nuclei',
        target,
        success: true,
        data: findings,
        count: findings.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        type: 'nuclei',
        target,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

const engine = new ScanEngine();

export function enqueueScan(task) {
  const now = new Date().toISOString();
  activeTasks.set(task.id, {
    ...task,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    results: [],
    progress: 0
  });
  return activeTasks.get(task.id);
}

export function getAllTasks() {
  return Array.from(activeTasks.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getTaskById(id) {
  return activeTasks.get(id) || null;
}

export function updateTaskProgress(taskId, progress, status = null) {
  const task = activeTasks.get(taskId);
  if (task) {
    task.progress = progress;
    task.updatedAt = new Date().toISOString();
    if (status) {
      task.status = status;
    }
  }
  return task;
}

export async function runFullScan(taskId, target, scanType = 'full') {
  const task = activeTasks.get(taskId);
  if (!task) throw new Error('Task not found');

  task.status = 'running';
  task.updatedAt = new Date().toISOString();
  const results = [];

  try {
    // Nmap
    if (scanType !== 'dir') {
      updateTaskProgress(taskId, 25, 'running');
      console.log(`[scan:${taskId}] Running Nmap on ${target}`);
      const nmapResult = await engine.runNmapScan(target);
      results.push(nmapResult);
      console.log(`[scan:${taskId}] Nmap complete: ${nmapResult.count} ports found`);
    }

    // Gobuster
    if (scanType === 'full' || scanType === 'web' || scanType === 'dir') {
      updateTaskProgress(taskId, 50, 'running');
      console.log(`[scan:${taskId}] Running Gobuster on ${target}`);
      const gobusterResult = await engine.runGobusterScan(target);
      results.push(gobusterResult);
      console.log(`[scan:${taskId}] Gobuster complete: ${gobusterResult.count} directories found`);
    }

    // Nuclei
    if (scanType === 'full' || scanType === 'vuln') {
      updateTaskProgress(taskId, 75, 'running');
      console.log(`[scan:${taskId}] Running Nuclei on ${target}`);
      const nucleiResult = await engine.runNucleiScan(target);
      results.push(nucleiResult);
      console.log(`[scan:${taskId}] Nuclei complete: ${nucleiResult.count} vulnerabilities found`);
    }

    task.status = 'completed';
    task.results = results;
    task.progress = 100;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();

    const summary = {
      target,
      type: scanType,
      totalResults: results.length,
      portsFound: results.find(r => r.type === 'nmap')?.count || 0,
      directoriesFound: results.find(r => r.type === 'gobuster')?.count || 0,
      vulnerabilitiesFound: results.find(r => r.type === 'nuclei')?.count || 0
    };
    task.summary = summary;

    return task;
  } catch (error) {
    console.error(`[scan:${taskId}] Error:`, error);
    task.status = 'failed';
    task.error = error.message;
    task.updatedAt = new Date().toISOString();
    return task;
  }
}
