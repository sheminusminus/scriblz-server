export enum MultiplierType {
  none = 0,
  letter,
  word,
}

export interface Multiplier {
  rgb: Uint8Array;
  mult: number;
  type: MultiplierType;
  name: string;
}

export const NORMAL_SPACE: Multiplier = {
  rgb: new Uint8Array([255, 255, 255]),
  mult: 0,
  type: MultiplierType.none,
  name: 'Normal',
};

export const DOUBLE_LETTER: Multiplier = {
  rgb: new Uint8Array([0, 144, 255]),
  mult: 2,
  type: MultiplierType.letter,
  name: 'Double Letter',
};

export const TRIPLE_LETTER: Multiplier = {
  rgb: new Uint8Array([0, 222, 143]),
  mult: 3,
  type: MultiplierType.letter,
  name: 'Triple Letter',
};

export const DOUBLE_WORD: Multiplier = {
  rgb: new Uint8Array([245, 0, 29]),
  mult: 2,
  type: MultiplierType.word,
  name: 'Double Word',
};

export const TRIPLE_WORD: Multiplier = {
  rgb: new Uint8Array([255, 200, 0]),
  mult: 3,
  type: MultiplierType.word,
  name: 'Triple Word',
};

export const CENTER_SPACE: Multiplier = {
  rgb: new Uint8Array([0, 0, 0]),
  mult: 0,
  type: MultiplierType.none,
  name: 'Center Space',
};

export enum GameStatus {
  notStarted = 0,
  started,
}

export interface SpacePosition {
  row: number;
  col: number;
}

export enum WordDirection {
  vertical = 0,
  horizontal,
}
