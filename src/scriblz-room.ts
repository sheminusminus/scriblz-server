import { Client, Room } from 'colyseus';
import { Dispatcher } from '@colyseus/command';

import { Dictionary } from './dictionary';
import { GameStatus, WordDirection } from './types';
import { OnJoinCommand } from './onJoin.command';
import { State } from './state';


export class ScriblzRoom extends Room<State> {
  dispatcher = new Dispatcher(this);

  maxClients = 4;

  onCreate(options) {
    console.log('ScriblzRoom created!', options);

    this.setState(new State());

    this.onMessage('start', (client, data) => {
      console.log('client started game', client.sessionId, ':', data);
      this.state.startGame();
    });

    this.onMessage('dictionary', async (client, data: { word: string }) => {
      const { word } = data;
      const result = await Dictionary.lookup(word)
      client.send('dictionary', result);
    });

    this.onMessage('play-word', async (client, data) => {
      const { word, row, col } = data;
      const letters = word.split('');
      const score = await this.state.playWord(
        client.sessionId,
        letters,
        { row: parseInt(row, 10), col: parseInt(col, 10) },
        WordDirection.horizontal,
      );
      if (score) {
        this.state.replenishLetters(client.sessionId);
        client.send('scored', { score });
        const tiles = this.state.getPlayerTiles(client.sessionId);
        client.send('tiles', { tiles });
      }
    });
  }

  onAuth(client, options, req) {
    console.log(req.headers.cookie);
    return true;
  }

  onJoin(client: Client, options) {
    const { sessionId } = client;
    const { name } = options;
    this.dispatcher.dispatch(new OnJoinCommand(), { sessionId, name });
    if (this.state.gameStatus !== GameStatus.started) {
      this.state.startGame();
    }
    const player = this.state.players[sessionId];
    const tiles = player.rack.tiles.map((tile) => tile.toJSON());
    client.send('tiles', { tiles });
  }

  onLeave(client) {
    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log('Dispose ScriblzRoom');
  }
}
