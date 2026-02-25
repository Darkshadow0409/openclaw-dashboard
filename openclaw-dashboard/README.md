# OpenClaw Interactive Dashboard

Production-style monorepo dashboard for OpenClaw with live updates, modular architecture, and dark modern UI.

## Stack
- Frontend: React + TypeScript + Tailwind + Framer Motion + Recharts (Vite)
- Backend: Express + TypeScript + Zod + WebSocket
- Shared contracts: `packages/shared`
- Tests: Vitest + Supertest

## Folder Structure
```txt
openclaw-dashboard/
  apps/
    server/
      src/
        app.ts            # REST routes + validation + error middleware
        index.ts          # HTTP + WS live updates
        store.ts          # in-memory domain state
        utils.ts          # summarizer + API key encryption
      tests/
    web/
      src/
        App.tsx           # full tabbed dashboard UI
        lib/api.ts        # API + WS config
        lib/summarize.ts  # tested util
  packages/shared/
  .env.example
  docker-compose.yml
```

## Implemented Tabs
1. **Overview Dashboard**: active model/provider/token usage/running agents/system status/quick actions/perf chart.
2. **Agent Selection**: provider + model selection, validation response, reasoning toggle, token slider, save default flow.
3. **Instances**: list, status badges, restart/stop actions, logs preview, cpu/memory stats.
4. **Task Manager**: create/edit/complete/delete, priority and due/recurrence fields.
5. **Reminders**: cron-based reminders, daily/weekly/custom through cron, channel toggle (discord/email/none), next run preview.
6. **News & Updates Feed**: pulls RSS, summarizes server-side, source links, manual refresh.
7. **Logs & Debug**: logs + token breakdown + export logs endpoint.
8. **Settings**: provider auth status, discord plugin status, API key management (encrypted preview), theme metadata.

## API Routes
- `GET /api/overview`
- `POST /api/agent/select`
- `GET /api/instances`
- `POST /api/instances/:id/restart|stop`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST /api/reminders`
- `GET /api/news`
- `GET /api/logs`, `GET /api/logs/export`
- `GET /api/settings`, `POST /api/settings/api-keys`

## Real-time
- WebSocket endpoint: `ws://localhost:4000/ws`
- Broadcasts snapshot + periodic overview/token updates.

## Installation
```bash
npm install
cp .env.example .env
```

## Run
```bash
npm run dev
```
- Web: `http://localhost:5173`
- API: `http://localhost:4000`

## Build / Validate
```bash
npm run typecheck
npm run test
npm run build
```

## Testing Steps
1. Start app with `npm run dev`.
2. Open web UI and verify animated tab transitions.
3. In **Agent Selection**, change model/provider and save.
4. In **Instances**, restart/stop and confirm status updates.
5. In **Task Manager**, create, complete, delete tasks.
6. In **Reminders**, add cron and check next run preview.
7. In **News**, trigger manual refresh and open links.
8. In **Logs & Debug**, export logs.
9. In **Settings**, submit API key and confirm encrypted preview.

## Env Vars
- `PORT`: backend port
- `API_SECRET_KEY`: AES key seed for key encryption
- `NEWS_FEEDS`: comma-separated RSS URLs
- `VITE_API_URL`: frontend API URL
- `VITE_WS_URL`: frontend WS URL

## Notes
- Storage is in-memory by design for easy extension to DB.
- Add authentication and persistent secret vault for production hardening.
