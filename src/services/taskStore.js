const tasks = new Map();

function buildFinding(target, type) {
  return {
    id: `finding_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    title: `${type.toUpperCase()} check`,
    severity: 'medium',
    target,
    summary: `Automated ${type} reconnaissance and validation completed for ${target}.`,
    recommendation: 'Review the target configuration and apply least-privilege network controls.'
  };
}

export function enqueueScan(task) {
  tasks.set(task.id, {
    ...task,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findings: []
  });
  return tasks.get(task.id);
}

export function getAllTasks() {
  return Array.from(tasks.values());
}

export function getTaskById(id) {
  return tasks.get(id) || null;
}

export async function runScanJob(taskId, target, type) {
  const task = tasks.get(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  task.status = 'running';
  task.updatedAt = new Date().toISOString();

  await new Promise((resolve) => setTimeout(resolve, 700));

  const findings = [
    buildFinding(target, type),
    {
      id: `finding_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      title: 'Service baseline',
      severity: 'low',
      target,
      summary: `Baseline scan for ${target} indicates open service surfaces requiring review.`,
      recommendation: 'Confirm the exposed service list and restrict unnecessary ports.'
    }
  ];

  task.status = 'completed';
  task.updatedAt = new Date().toISOString();
  task.completedAt = new Date().toISOString();
  task.findings = findings;
  task.summary = {
    target,
    type,
    totalFindings: findings.length,
    highestSeverity: 'medium'
  };

  return task;
}
