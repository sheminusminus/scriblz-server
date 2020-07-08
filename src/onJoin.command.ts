import { Command } from '@colyseus/command';

import { State } from './state';


export class OnJoinCommand extends Command<State, { sessionId: string, name: string }> {
  execute(options) {
    const { name, sessionId } = options;

    this.state.createPlayer(sessionId, name);
    console.log('OnJoinCommand execute', this.state.players);
  }
}
