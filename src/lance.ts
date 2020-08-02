import path from 'path';
import express from 'express';
import socketIO from 'socket.io';
import { Lib, ServerEngine } from 'lance-gg';

import Game from './game';

const PORT = process.env.PORT || 4000;

// define routes and socket
const server = express();
server.use('/', express.static(path.join(__dirname, '../dist/')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Instances
const gameEngine = new Game({ traceLevel: Lib.Trace.TRACE_ALL });
const serverEngine = new ServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });

// start the game
serverEngine.start();
