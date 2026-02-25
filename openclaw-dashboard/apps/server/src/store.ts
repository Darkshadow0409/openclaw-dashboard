import { Instance, Reminder, Task } from '@openclaw/shared';

export const state = {
  overview: {
    activeModel: 'gpt-5.3-codex',
    provider: 'openai',
    tokenUsage: { used: 18342, limit: 100000 },
    runningAgents: 3,
    systemStatus: 'healthy',
    reasoning: true,
    tokenLimit: 100000
  },
  instances: [
    { id: 'i1', name: 'main-agent', status: 'active', cpu: 18, memory: 42, logs: ['Started', 'Heartbeat ok'] },
    { id: 'i2', name: 'news-worker', status: 'idle', cpu: 3, memory: 21, logs: ['Last run 08:00'] }
  ] as Instance[],
  tasks: [
    { id: 't1', title: 'Finalize cron setup', priority: 'high', completed: false, tags: ['ops'], dueDate: new Date(Date.now()+86400000).toISOString() }
  ] as Task[],
  reminders: [
    { id: 'r1', name: 'Daily digest', cron: '0 8 * * *', channel: 'discord', enabled: true }
  ] as Reminder[],
  logs: [] as string[],
  settings: {
    providerAuth: { openai: true, anthropic: false, gemini: false },
    plugins: { discord: true },
    theme: 'dark'
  }
};
