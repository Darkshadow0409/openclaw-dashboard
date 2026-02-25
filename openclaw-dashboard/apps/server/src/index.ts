import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { app } from './app.js';
import { state } from './store.js';

const port = Number(process.env.PORT || 4000);
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'snapshot', data: state }));
});

setInterval(() => {
  state.overview.tokenUsage.used += Math.floor(Math.random() * 10);
  const payload = JSON.stringify({ type: 'overview', data: state.overview });
  wss.clients.forEach((c) => c.send(payload));
}, 4000);

server.listen(port, () => console.log(`server on ${port}`));
