import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { CronExpressionParser } from 'cron-parser';
import Parser from 'rss-parser';
import { state } from './store.js';
import { encryptSecret, summarize } from './utils.js';

export const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const parser = new Parser();

app.get('/api/overview', (_req, res) => res.json(state.overview));
app.post('/api/agent/select', (req, res) => {
  const schema = z.object({ provider: z.string(), model: z.string(), reasoning: z.boolean(), tokenLimit: z.number().min(1000), saveDefault: z.boolean() });
  const body = schema.parse(req.body);
  state.overview.provider = body.provider;
  state.overview.activeModel = body.model;
  state.overview.reasoning = body.reasoning;
  state.overview.tokenLimit = body.tokenLimit;
  res.json({ ok: true, valid: body.model.length > 2 });
});

app.get('/api/instances', (_req, res) => res.json(state.instances));
app.post('/api/instances/:id/:action', (req, res) => {
  const instance = state.instances.find(i => i.id === req.params.id);
  if (!instance) return res.status(404).json({ error: 'Not found' });
  if (req.params.action === 'restart') instance.status = 'active';
  if (req.params.action === 'stop') instance.status = 'idle';
  instance.logs.unshift(`${req.params.action} @ ${new Date().toISOString()}`);
  res.json(instance);
});

app.get('/api/tasks', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const data = q ? state.tasks.filter(t => t.title.toLowerCase().includes(q)) : state.tasks;
  res.json(data);
});
app.post('/api/tasks', (req, res) => {
  const schema = z.object({ title: z.string(), description: z.string().optional(), priority: z.enum(['low', 'medium', 'high']), dueDate: z.string().optional(), recurring: z.string().optional(), tags: z.array(z.string()).default([]) });
  const data = schema.parse(req.body);
  const task = { id: uuid(), completed: false, ...data };
  state.tasks.unshift(task);
  res.json(task);
});
app.put('/api/tasks/:id', (req, res) => {
  const task = state.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  Object.assign(task, req.body);
  res.json(task);
});
app.delete('/api/tasks/:id', (req, res) => {
  state.tasks = state.tasks.filter(t => t.id !== req.params.id);
  res.json({ ok: true });
});

app.get('/api/reminders', (_req, res) => {
  const reminders = state.reminders.map(r => {
    let nextRun: string | undefined;
    try {
      nextRun = CronExpressionParser.parse(r.cron).next().toDate().toISOString();
    } catch {}
    return { ...r, nextRun };
  });
  res.json(reminders);
});
app.post('/api/reminders', (req, res) => {
  const schema = z.object({ name: z.string(), cron: z.string(), channel: z.enum(['discord', 'email', 'none']), enabled: z.boolean() });
  const data = schema.parse(req.body);
  const reminder = { id: uuid(), ...data };
  state.reminders.unshift(reminder);
  res.json(reminder);
});

app.get('/api/news', async (_req, res) => {
  const sources = (process.env.NEWS_FEEDS || 'https://openai.com/news/rss.xml,https://www.anthropic.com/news/rss.xml').split(',');
  const all = await Promise.allSettled(sources.map((s) => parser.parseURL(s.trim())));
  const items = all.flatMap(r => r.status === 'fulfilled' ? r.value.items.slice(0, 3).map(i => ({ title: i.title, link: i.link, summary: summarize(i.contentSnippet || i.content || '') })) : []);
  res.json(items);
});

app.get('/api/logs', (_req, res) => res.json({ logs: state.logs, tokenBreakdown: state.overview.tokenUsage }));
app.get('/api/logs/export', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(state.logs.join('\n'));
});

app.get('/api/settings', (_req, res) => res.json(state.settings));
app.post('/api/settings/api-keys', (req, res) => {
  const key = process.env.API_SECRET_KEY || 'dev-only-key';
  const payload = z.object({ provider: z.string(), apiKey: z.string().min(8) }).parse(req.body);
  const encrypted = encryptSecret(payload.apiKey, key);
  state.logs.unshift(`API key updated for ${payload.provider}`);
  res.json({ ok: true, encryptedPreview: encrypted.slice(0, 16) + '...' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const msg = err instanceof Error ? err.message : 'Unknown error';
  res.status(400).json({ error: msg });
});
