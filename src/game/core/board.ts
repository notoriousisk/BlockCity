import { TILE_SIZE } from "@/game/types";
import type { Level } from "@/game/types";

/**
 * Initialize a new game board
 */
export function initializeBoard(
  columns: number,
  rows: number,
  grid: number[][]
): Level {
  const newLevel: Level = {
    columns,
    rows,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: [],
    selectedTile: { selected: false, column: 0, row: 0 },
    grid,
  };

  for (let i = 0; i < newLevel.columns; i++) {
    newLevel.tiles[i] = [];
    for (let j = 0; j < newLevel.rows; j++) {
      newLevel.tiles[i][j] = {
        type: 0,
        x: i * newLevel.tileWidth,
        y: j * newLevel.tileHeight,
        width: newLevel.tileWidth,
        height: newLevel.tileHeight,
        shift: 0,
      };
    }
  }

  return newLevel;
}

/**
 * Create a level with the predefined grid
 */
export function createLevel(level: Level, grid: number[][]): void {
  for (let i = 0; i < level.columns; i++) {
    level.tiles[i] = [];
    for (let j = 0; j < level.rows; j++) {
      level.tiles[i][j] = {
        type: grid[j][i],
        x: i * level.tileWidth,
        y: j * level.tileHeight,
        width: level.tileWidth,
        height: level.tileHeight,
        shift: 0,
      };
    }
  }
}

/**
 * Swap two tiles on the board
 */
export function swapTiles(
  level: Level,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  const typeSwap = level.tiles[x1][y1].type;
  level.tiles[x1][y1].type = level.tiles[x2][y2].type;
  level.tiles[x2][y2].type = typeSwap;
}

/**
 * Check if two tiles can be swapped (adjacent)
 */
export function canSwapTiles(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  return (
    (Math.abs(x1 - x2) === 1 && y1 === y2) ||
    (Math.abs(y1 - y2) === 1 && x1 === x2)
  );
}

/**
 * Reshuffle the board while maintaining tile color distribution
 */
export function reshuffleBoard(level: Level): void {
  // Collect all tile types
  const allTiles: number[] = [];
  for (let i = 0; i < level.columns; i++) {
    for (let j = 0; j < level.rows; j++) {
      if (level.tiles[i][j].type !== -1) {
        allTiles.push(level.tiles[i][j].type);
      }
    }
  }

  // Shuffle the array
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }

  // Redistribute tiles
  let tileIndex = 0;
  for (let i = 0; i < level.columns; i++) {
    for (let j = 0; j < level.rows; j++) {
      if (level.tiles[i][j].type !== -1) {
        level.tiles[i][j].type = allTiles[tileIndex++];
      }
    }
  }
}

/**
 * Get a random tile type for filling gaps
 */
export function getRandomTile(colorsLimit: number): number {
  return Math.floor(Math.random() * colorsLimit);
}

/**
 * Shift tiles down to fill gaps
 */
export function shiftTiles(level: Level, colorsLimit: number): void {
  for (let i = 0; i < level.columns; i++) {
    for (let j = level.rows - 1; j >= 0; j--) {
      if (level.tiles[i][j].type === -1) {
        level.tiles[i][j].type = getRandomTile(colorsLimit);
      } else {
        const shift = level.tiles[i][j].shift;
        if (shift > 0) {
          swapTiles(level, i, j, i, j + shift);
        }
      }
      level.tiles[i][j].shift = 0;
    }
  }
}
