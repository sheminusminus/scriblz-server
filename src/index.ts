import path from 'path';

import cors from 'cors';
import express from 'express';
import serveIndex from 'serve-index';
import { Server } from 'colyseus';
import { createServer } from 'http';
import { monitor } from '@colyseus/monitor';

import { ScriblzRoom } from './scriblz-room';


const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(cors());
app.use(express.json());

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app),
  express: app,
  pingInterval: 0,
});

// Define 'state_handler' room
gameServer.define('scriblz', ScriblzRoom).enableRealtimeListing();

app.use('/', serveIndex(path.join(__dirname, '../static'), { 'icons': true }))
app.use('/', express.static(path.join(__dirname, '../static')));

// attach web monitoring panel
app.use('/colyseus', monitor());

gameServer.onShutdown(() => {
  console.log('game server is going down.');
});

gameServer.listen(port);

// process.on('uncaughtException', (e) => {
//   console.log(e.stack);
//   process.exit(1);
// });

console.log(`Listening on http://localhost:${port}`);
