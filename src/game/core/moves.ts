import type { Level, Move } from "@/game/types";
import { checkMove } from "./clusters";

/**
 * Find all possible moves on the board
 */
export function findMoves(level: Level, minMatchLength: number): Move[] {
  const moves: Move[] = [];

  // Check horizontal swaps
  for (let j = 0; j < level.rows; j++) {
    for (let i = 0; i < level.columns - 1; i++) {
      if (checkMove(level, i, j, i + 1, j, minMatchLength)) {
        moves.push({ column1: i, row1: j, column2: i + 1, row2: j });
      }
    }
  }

  // Check vertical swaps
  for (let i = 0; i < level.columns; i++) {
    for (let j = 0; j < level.rows - 1; j++) {
      if (checkMove(level, i, j, i, j + 1, minMatchLength)) {
        moves.push({ column1: i, row1: j, column2: i, row2: j + 1 });
      }
    }
  }

  return moves;
}
