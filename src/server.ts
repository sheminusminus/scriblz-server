require('dotenv').config();

import Pusher from 'pusher';
import { Server } from 'boardgame.io/server';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import { Scriblz, Board, Bag } from './objects';
import { sendFailure, sendSuccess } from './response';


const router = Router();

// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors());

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret:  process.env.APP_SECRET,
  cluster: process.env.APP_CLUSTER,
});

const board = new Board();
const bag = new Bag();

const server = Server({
  games: [Scriblz],
});

const users = new Map();

const games = new Map();
games.set('default', {
  players: new Map(),
});

const mainChannel = 'private-scriblz';

pusher.trigger(mainChannel, 'message', {
  message: 'test',
});

router.get('/', (ctx) => {
  sendSuccess(ctx.response, { message: 'everything is good...' });
});

router.post('/pusher/auth', ({ request, response }) => {
  const socketId = request.body.socket_id;
  const channel = request.body.channel_name;
  const auth = pusher.authenticate(socketId, channel);
  console.log(`socket connected to channel: ${socketId} ${channel}`);
  response.body = JSON.stringify(auth);
  response.status = 200;
});

router.post('/scriblz/connect', ({ request, response }) => {
  const { username } = request.body;
  console.log('connection request', username);
  users.set(username, {});
  pusher.trigger(mainChannel, 'user-connected', { username });
  sendSuccess(response, { username });
});

router.get('/scriblz/board', async ({ request, response }) => {
  if (!board.isReady) {
    await board.initSpaces();
  }
  sendSuccess(response, board);
});

router.get('/scriblz/player/:id/tiles', async ({ request, response }) => {
  sendSuccess(response, board);
});

const port: string = process.env.PORT || '5000';

server.app.use(bodyParser());
server.app.use(router.routes());
server.app.use(router.allowedMethods());

server.run(parseInt(port, 10));
