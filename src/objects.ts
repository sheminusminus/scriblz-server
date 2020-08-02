import path from 'path';

import shortId from 'shortid';

import { getImagePixels, getMultiplierForRgb } from './state';
import { MultiplierType, SpaceColor, ClientSpaceColor } from './types';
import { Dist, Points } from "./letters";

const NUM_RACK_TILES = 7;
// const NUM_FINGERS = 5;
const BOARD_SIZE = 15;

const LETTERS = Object.keys(Dist);

export class Board {
  spaces = [];

  get isReady() {
    return this.spaces.length > 0;
  }

  async initSpaces() {
    const imgPath = path.resolve(__dirname, '../assets/board.png');
    const pixels = await getImagePixels(imgPath);
    const { data, shape } = pixels;
    const [cols, rows, channels] = shape;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const start = ((r * rows) + c) * channels;
        const slice = data.slice(start, start + 3);
        const multiplier = getMultiplierForRgb(slice);
        const idx = (r * BOARD_SIZE) + c;
        let ls = 1;
        let ws = 1;
        let text = '';
        let spaceColor = null;
        if (multiplier.type === MultiplierType.word) {
          ws = multiplier.mult;
          if (ws === 2) {
            text = 'DW';
            spaceColor = ClientSpaceColor.DOUBLE_WORD;
          }  else {
            text = 'TW';
            spaceColor = ClientSpaceColor.TRIPLE_WORD;
          }
        } else if (multiplier.type === MultiplierType.letter) {
          ls = multiplier.mult;
          if (ls === 2) {
            text = 'DL';
            spaceColor = ClientSpaceColor.DOUBLE_LETTER;
          }  else {
            text = 'TL';
            spaceColor = ClientSpaceColor.TRIPLE_LETTER;
          }
        } else if (multiplier.name.includes('Center')) {
          text = '⭑';
          spaceColor = ClientSpaceColor.CENTER;
        }
        const space = {
          row: r,
          col: c,
          index: idx,
          ls,
          ws,
          name: multiplier.name,
          player: null,
          tile: null,
          text,
          spaceColor,
        };
        this.spaces.push(space);
      }
    }
  }

  toJson() {
    return {
      spaces: this.spaces,
    };
  }
}

export class Bag {
  tiles = [];

  constructor() {
    this.initTiles();
    this.shake();
  }

  getRemainingLetters() {
    const dist = {};
    this.tiles.forEach((tile) => {
      let nextVal = 1;
      if (dist[tile.name]) {
        nextVal = dist[tile.name] + 1;
      }
      dist[tile.name] = nextVal;
    });
    return dist;
  }

  initTiles() {
    LETTERS.forEach((letter) => {
      const count = Dist[letter];
      for (let i = 0; i < count; i += 1) {
        const tile = {
          id: shortId.generate(),
          display: letter === 'BLANK' ? '_' : letter,
          name: letter,
          value: Points[letter],
        };
        this.tiles.push(tile);
      }
    });
  }

  shake() {
    for (let i = this.tiles.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * i);
      const temp = this.tiles[i];
      this.tiles[i] = this.tiles[j];
      this.tiles[j] = temp;
    }
  }

  randomTile() {
    const rando = Math.floor(Math.random() * this.tiles.length);
    const picked = this.tiles.splice(rando, 1);
    return picked[0];
  }

  toJson() {
    return {
      tiles: this.tiles,
      remainingLetters: this.getRemainingLetters(),
    };
  }
}

// export class Finger {
//   id = null;
//   position = { x: 0, y: 0 };
//
//   constructor(id, position) {
//     this.id = id;
//     this.position = position;
//   }
//
//   setPosition = (pos) => {
//     this.position = pos;
//   };
// }

// export const MoveFingerSystem = (entities, { touches }) => {
//   touches.filter(t => t.type === "move").forEach(t => {
//     let finger = entities[t.id];
//     if (finger && finger.position) {
//       finger.position = [
//         finger.position[0] + t.delta.pageX,
//         finger.position[1] + t.delta.pageY
//       ];
//     }
//   });
//
//   return entities;
// };

export class Player {
  username = '';
  gameScores = [];
  score = 0;
  rack = [];

  // fingers = {};

  constructor(username) {
    this.username = username;
    // const startX = 40;
    // const incrementX = 60;
    // this.fingers = (new Array(5).fill('')).reduce((obj, _, idx) => ({
    //   ...obj,
    //   [idx + 1]: new Finger(idx + 1, { x: startX + (incrementX * idx), y: 200 }),
    // }), {});
  }

  initRackTiles(bag: Bag) {
    for (let i = 0; i < NUM_RACK_TILES; i += 1) {
      const tile = bag.randomTile();
      this.rack.push(tile);
    }
  }

  drawRackTiles(bag: Bag) {
    const count = NUM_RACK_TILES - this.rack.length;
    console.log('draw tiles', count);
    for (let i = 0; i < count; i += 1) {
      const tile = bag.randomTile();
      console.log(tile.display);
      if (tile) {
        this.rack.push(tile);
      }
    }
  }

  addScore(score: number) {
    this.score += score;
    this.gameScores.push(score);
    return this.score;
  }

  tilesToJson() {
    return this.rack;
  }
}

const board = new Board();
board.initSpaces();

const bag = new Bag();
bag.initTiles();

const drawTiles = (G, ctx) => {
  const { playerID } = ctx;
  if (!G.racks[playerID]) {
    G.racks[playerID] = [];
  }
  console.log('player rack before', G.racks[playerID]);
  const count = NUM_RACK_TILES - G.racks[playerID].length;
  for (let i = 0; i < count; i += 1) {
    const tile = G.bag.randomTile();
    console.log(tile);
    G.racks[playerID].push(tile);
  }
  console.log('player rack after', G.racks[playerID]);
};

const clickCell = (G, ctx, id) => {
  console.log('cell clicked');
  const spaces = [...G.board.spaces];

  if (spaces[id].playerId === null) {
    spaces[id].playerId = ctx.currentPlayer;
  }

  return { ...G, board: { ...G.board, spaces } };
};

// const moveFingers = (G, ctx, updates) => {
//   const { playerID } = ctx;
//   if (!G.fingers[playerID]) {
//     G.fingers[playerID] = {};
//   }
//   console.log('player fingers before', G.fingers[playerID]);
//   const startX = 40;
//   const incrementX = 60;
//   for (let i = 0; i < NUM_FINGERS; i += 1) {
//     const id = i + 1;
//     let finger = G.fingers[playerID][id];
//     if (!finger) {
//       const position = { x: startX + (incrementX * i), y: 200 };
//       finger = new Finger(id, position);
//       G.fingers[playerID][id] = finger;
//     }
//     if (updates[id]) {
//       G.fingers[playerID][id].setPosition(updates[id]);
//     }
//   }
//   console.log('player fingers after', G.fingers[playerID]);
// };

export const Scriblz = {
  name: 'Scriblz',

  setup: () => ({
    bag,
    board,
    cells: new Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    players: {},
    racks: {},
    // fingers: {},
  }),

  phases: {
    draw: {
      endIf: (G) => {
        console.log(G.racks);
        const racks: any[] = Object.values(G.racks);
        const filledRacks = racks.filter((rack) => rack.length === NUM_RACK_TILES);
        return (
          racks.length > 0
          && racks.length === filledRacks.length
        );
      },
      moves: {
        drawTiles: {
          move: drawTiles,
          client: false,
        },
        // moveFingers: {
        //   move: moveFingers,
        //   client: false,
        // },
      },
      next: 'play',
      start: true,
    },
    play: {
      moves: {
        clickCell: {
          move: clickCell,
          client: false,
        },
        // moveFingers: {
        //   move: moveFingers,
        //   client: false,
        // },
      },
    },
  },

  playerView: (G, ctx, playerID) => {
    const rack = G.racks[playerID] || [];
    return {
      bag,
      cells: G.cells,
      board,
      players: G.players,
      racks: { [playerID]: rack },
      // fingers: G.fingers,
    };
  },

  minPlayers: 1,
  maxPlayers: 1,

  turn: { moveLimit: 1 },

  endIf: (G, ctx) => {
    // if (IsVictory(G.cells)) {
    //   return ctx.currentPlayer;
    // }
    return undefined;
  },
};
