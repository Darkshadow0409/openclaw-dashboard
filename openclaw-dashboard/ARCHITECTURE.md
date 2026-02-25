# Architecture

## Modules
- `apps/server`: API, WebSocket, validation, feed aggregation, reminder next-run computation.
- `apps/web`: UI shell, tab modules, chart rendering, API bindings.
- `packages/shared`: domain types shared by frontend/backend.

## Live Update Flow
1. Server updates internal state (token usage, instance state).
2. WebSocket broadcaster emits JSON events.
3. Frontend listener updates React state for real-time indicators.

## Security
- API keys never stored plain in responses.
- Server encrypts submitted key using `API_SECRET_KEY` derived SHA-256 AES-256-CBC.
- Helmet + CORS + validation middleware enabled.

## Error Handling
- Backend centralized error middleware catches Zod and runtime errors.
- Frontend wraps app in boundary shell (replace with class boundary in strict prod).

## Extensibility
- Replace `store.ts` in-memory state with repository adapter (Redis/Postgres).
- Add auth middleware and RBAC in `app.ts`.
- Add provider-specific model validation adapters in `/api/agent/select`.
