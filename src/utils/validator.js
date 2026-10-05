export function validateTarget(target) {
  if (!target || typeof target !== 'string') return false;
  const trimmed = target.trim();
  if (!trimmed) return false;

  const ip = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
  const domain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?$/;
  const url = /^https?:\/\/.+/i;

  return ip.test(trimmed) || domain.test(trimmed) || url.test(trimmed);
}
