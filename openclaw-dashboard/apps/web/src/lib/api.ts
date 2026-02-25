const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const get = (p: string) => fetch(`${API}${p}`).then(r => r.json());
export const send = (p: string, method: string, body?: unknown) => fetch(`${API}${p}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }).then(r => r.json());
export const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws');
