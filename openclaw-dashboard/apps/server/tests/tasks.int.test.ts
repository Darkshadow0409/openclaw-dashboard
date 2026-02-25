import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../src/app.js';

describe('tasks api', () => {
  it('creates task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'x', priority: 'low', tags: [] });
    expect(res.status).toBe(200);
    expect(res.body.id).toBeTruthy();
  });
});
