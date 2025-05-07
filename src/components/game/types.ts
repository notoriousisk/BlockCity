export const TILE_SIZE = 40; // Constant tile size in pixels

export interface Tile {
  type: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shift: number;
}

export interface Level {
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  tiles: Tile[][];
  selectedTile: { selected: boolean; column: number; row: number };
  grid: number[][];
}

export interface Cluster {
  column: number;
  row: number;
  length: number;
  horizontal: boolean;
}

export interface Move {
  column1: number;
  row1: number;
  column2: number;
  row2: number;
}

export const gameStates = { init: 0, ready: 1, resolve: 2 } as const;
export type GameState = (typeof gameStates)[keyof typeof gameStates];
