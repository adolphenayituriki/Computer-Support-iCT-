const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://computer-support-ict.onrender.com' : 'http://localhost:3001');
export default API_BASE;

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || (import.meta.env.PROD ? 'https://computer-support-ai.onrender.com' : 'http://localhost:3002');
export { AI_API_BASE };

export async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiFetch(path, { token, method = 'GET', body, timeout = 15000 } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }, timeout);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
