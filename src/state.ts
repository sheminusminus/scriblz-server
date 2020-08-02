import path from 'path';

import getPixels from 'get-pixels';
import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';

import { Dictionary } from './dictionary';

import {
  CENTER_SPACE,
  DOUBLE_LETTER,
  DOUBLE_WORD,
  GameStatus,
  Multiplier,
  MultiplierType,
  NORMAL_SPACE,
  SpacePosition,
  TRIPLE_LETTER,
  TRIPLE_WORD,
  WordDirection,
} from './types';

import { Dist, Points } from './letters';


const multiplierTypes = [
  CENTER_SPACE,
  DOUBLE_LETTER,
  DOUBLE_WORD,
  NORMAL_SPACE,
  TRIPLE_LETTER,
  TRIPLE_WORD,
];

const NUM_RACK_TILES = 7;
const BOARD_SIZE = 15;

const LETTERS = Object.keys(Dist);

export const getImagePixels = (path): any => {
  return new Promise((resolve, reject) => {
    getPixels(path, (err, px) => {
      if (err) {
        return reject(err);
      }

      return resolve(px);
    });
  });
};

export const convertUint8arrToInt = (arr: Uint8Array) => {
  const length = arr.length;
  const buffer = Buffer.from(arr);
  return buffer.readUIntBE(0, length);
};

export const getMultiplierForRgb = (rgb: Uint8Array): Multiplier => {
  return multiplierTypes.find((mT) => {
    return convertUint8arrToInt(mT.rgb) === convertUint8arrToInt(rgb);
  });
};

export class Tile extends Schema {
  @type('string')
  display = '';

  @type('string')
  name = '';

  @type('number')
  value = 0;
}

export class Bag extends Schema {
  @type([Tile])
  tiles = new ArraySchema<Tile>();

  constructor() {
    super();
    this.initTiles();
  }

  initTiles() {
    LETTERS.forEach((letter) => {
      const count = Dist[letter];
      for (let i = 0; i < count; i += 1) {
        const tile = new Tile();
        tile.display = letter === 'BLANK' ? '_' : letter;
        tile.name = letter;
        tile.value = Points[letter];
        this.tiles.push(tile);
      }
    });

    this.shake();
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
}

export class Mult extends Schema {
  @type('number')
  r;

  @type('number')
  g;

  @type('number')
  b;

  mult: Multiplier;

  constructor(r, g, b, mult: Multiplier) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
    this.mult = mult;
  }
}

export class Space extends Schema {
  @type('number')
  row;

  @type('number')
  col;

  @type('number')
  index;

  @type(Mult)
  multiplier;

  @type(Tile)
  tile;

  @type('string')
  name;

  constructor(row, col, index, multiplier, name) {
    super();
    this.row = row;
    this.col = col;
    this.index = index;
    this.multiplier = multiplier;
    this.name = name;
  }

  setTile(tile: Tile) {
    this.tile = tile;
  }
}

export class Board extends Schema {
  @type([Space])
  spaces = new ArraySchema<Space>();

  constructor() {
    super();
    this.initSpaces();
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
        const mult = new Mult(multiplier.rgb[0], multiplier.rgb[1], multiplier.rgb[2], multiplier);
        const idx = (r * BOARD_SIZE) + c;
        const space = new Space(r, c, idx, mult, multiplier.name);
        this.spaces.push(space);
      }
    }
  }

  getNextSpaceIndex(spaceIndex: number, dir: WordDirection): number {
    if (dir === WordDirection.horizontal) {
      return spaceIndex + 1;
    }

    return spaceIndex + BOARD_SIZE;
  }

  getNextSpaceForTile(testSpace: Space, dir: WordDirection, lastIntermediateSpaces: Space[] = []) {
    const intermediateSpaces: Space[] = [...lastIntermediateSpaces];

    if (testSpace.tile) {
      intermediateSpaces.push(testSpace);
      const nextIndex = this.getNextSpaceIndex(testSpace.index, dir);
      const nextSpace = this.spaces[nextIndex];
      return this.getNextSpaceForTile(nextSpace, dir, intermediateSpaces);
    }

    return {
      space: testSpace,
      intermediateSpaces,
    };
  }

  playWord(tiles: Tile[], pos: SpacePosition, dir: WordDirection): number {
    const allWordTiles: Tile[] = [];

    const spaceIndex: number = (pos.row * BOARD_SIZE) + pos.col;
    const space: Space = this.spaces[spaceIndex];

    if (space.tile) {
      console.log('space has tile already');
      return;
    }

    const testLength = dir === WordDirection.horizontal ? space.col : space.row;

    if (BOARD_SIZE - testLength >= tiles.length) {
      let current: Space = space;
      let wordScore = 0;
      let wordMultiplier = 1;

      tiles.forEach((tile, idx) => {
        if (current) {
          current.setTile(tile);
          let tileScore = tile.value;
          const multiplier: Mult = current.multiplier;

          if (multiplier.mult.type === MultiplierType.letter) {
            tileScore *= multiplier.mult.mult;
          } else if (multiplier.mult.type === MultiplierType.word) {
            wordMultiplier *= multiplier.mult.mult;
          }

          allWordTiles.push(tile);
          wordScore += tileScore;
          console.log(tile.display, tileScore, wordScore);

          if (idx < tiles.length - 1) {
            const spaceData = this.getNextSpaceForTile(current, dir, []);
            const { space, intermediateSpaces } = spaceData;
            allWordTiles.push(...intermediateSpaces);
            current = space;
          }
        }
      });

      wordScore *= wordMultiplier;
      console.log(wordScore);
      return wordScore;
    }

    return 0;
  }
}

export class Rack extends Schema {
  @type([Tile])
  tiles = new ArraySchema<Tile>();

  addTile(tile: Tile) {
    this.tiles.push(tile);
    this.tiles = this.tiles.filter(t => Boolean(t));
    console.log('addTile', this.tiles);
  }

  removeTile(tile: Tile) {
    const idx = this.tiles.findIndex((t) => t.display === tile.display);
    if (idx >= 0) {
      this.tiles.splice(idx, 1);
    }
  }

  tilesToJson() {
    const jsonTiles = this.tiles.map((tile) => tile.toJSON());
    console.log(jsonTiles);
    return jsonTiles;
  }
}

export class Score extends Schema {
  @type('number')
  value = 0;

  constructor(value) {
    super();
    this.value = value;
  }
}

export class Player extends Schema {
  @type('string')
  name = '';

  @type('number')
  x = Math.floor(Math.random() * 400);

  @type('number')
  y = Math.floor(Math.random() * 400);

  @type('number')
  score = 0;

  @type([Score])
  gameScores = new ArraySchema<Score>();

  @type(Rack)
  rack = new Rack();

  initRackTiles(bag: Bag) {
    for (let i = 0; i < NUM_RACK_TILES; i += 1) {
      const tile = bag.randomTile();
      this.rack.addTile(tile);
    }
  }

  drawRackTiles(bag: Bag) {
    const count = NUM_RACK_TILES - this.rack.tiles.length;
    console.log('draw tiles', count);
    for (let i = 0; i < count; i += 1) {
      const tile = bag.randomTile();
      console.log(tile.display);
      if (tile) {
        this.rack.addTile(tile);
      }
    }
  }

  addScore(score: Score) {
    this.score += score.value;
    this.gameScores.push(score);
    return this.score;
  }

  tilesToJson() {
    const jsonTiles = this.rack.tilesToJson();
    console.log('player jsonTiles', jsonTiles);
    return jsonTiles;
  }
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type(Board)
  board = new Board();

  @type(Bag)
  bag = new Bag();

  @type('number')
  gameStatus = GameStatus.notStarted;

  createPlayer(id: string, name?: string) {
    this.board.spaces.forEach((space) => {
      console.log('row:', space.row, 'col:', space.col, 'mult:', space.multiplier.mult.mult, 'type:', space.multiplier.mult.name);
    })
    if (this.gameStatus === GameStatus.notStarted) {
      this.players[id] = new Player();
      this.players[id].name = name;
      this.players[id].initRackTiles(this.bag);
      console.log(this.players[id].rack.tiles.map(t => t.name));
    }
  }

  removePlayer(id: string) {
    delete this.players[id];
  }

  async playWord(id: string, letters: string[], pos: SpacePosition, dir: WordDirection): Promise<number|undefined> {
    const player: Player = this.players[id];
    const response = await Dictionary.lookup(letters.join('').toLowerCase());

    if (response.isValid) {
      const tiles: Tile[] = [];

      letters.forEach((letter) => {
        const tile = player.rack.tiles.find((tile) => tile.display === letter);

        if (tile) {
          tiles.push(tile);
          player.rack.removeTile(tile);
        }
      });

      const scoreValue = this.board.playWord(tiles, pos, dir);

      if (scoreValue) {
        const score = new Score(scoreValue);
        player.addScore(score);
        return scoreValue;
      }
    }

    return undefined;
  }

  getPlayerTiles(id: string) {
    const player: Player = this.players[id];
    return player.tilesToJson();
  }

  replenishLetters(id: string) {
    this.players[id].drawRackTiles(this.bag);
  }

  startGame() {
    this.gameStatus = GameStatus.started;
  }
}
