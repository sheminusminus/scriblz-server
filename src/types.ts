import { Space } from "./state";

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

export const SpaceColor = {
  DOUBLE_LETTER: [0, 144, 255],
  TRIPLE_LETTER: [0, 222, 143],
  DOUBLE_WORD: [245, 0, 29],
  TRIPLE_WORD: [255, 200, 0],
  CENTER: [0, 0, 0],
};

export const ClientSpaceColor = {
  DOUBLE_LETTER: [14, 188, 243],
  TRIPLE_LETTER: [41, 186, 165],
  DOUBLE_WORD: [236, 86, 92],
  TRIPLE_WORD: [214, 169, 67],
  CENTER: [218, 112, 214],
};

export const DOUBLE_LETTER: Multiplier = {
  rgb: new Uint8Array(SpaceColor.DOUBLE_LETTER),
  mult: 2,
  type: MultiplierType.letter,
  name: 'Double Letter',
};

export const TRIPLE_LETTER: Multiplier = {
  rgb: new Uint8Array(SpaceColor.TRIPLE_LETTER),
  mult: 3,
  type: MultiplierType.letter,
  name: 'Triple Letter',
};

export const DOUBLE_WORD: Multiplier = {
  rgb: new Uint8Array(SpaceColor.DOUBLE_WORD),
  mult: 2,
  type: MultiplierType.word,
  name: 'Double Word',
};

export const TRIPLE_WORD: Multiplier = {
  rgb: new Uint8Array(SpaceColor.TRIPLE_WORD),
  mult: 3,
  type: MultiplierType.word,
  name: 'Triple Word',
};

export const CENTER_SPACE: Multiplier = {
  rgb: new Uint8Array(SpaceColor.CENTER),
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
