import type { Level } from "@/game/types";
import { getMouseTile } from "../core/utils";
import { canSwapTiles } from "../core/board";

export interface MouseCoords {
  x: number;
  y: number;
}

/**
 * Process mouse down event
 */
export function handleMouseDown(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  level: Level,
  dragState: { value: boolean },
  gameOver: boolean
): { valid: boolean; x: number; y: number } {
  if (!canvas || dragState.value || gameOver) {
    return { valid: false, x: 0, y: 0 };
  }

  const rect = canvas.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  const mt = getMouseTile(level, pos);
  dragState.value = true;
  return mt;
}

/**
 * Handle tile selection
 */
export function handleTileSelection(
  mt: { valid: boolean; x: number; y: number },
  level: Level,
  swapCallback: (c1: number, r1: number, c2: number, r2: number) => void
): void {
  if (!mt.valid) {
    level.selectedTile.selected = false;
    return;
  }

  if (level.selectedTile.selected) {
    if (mt.x === level.selectedTile.column && mt.y === level.selectedTile.row) {
      level.selectedTile.selected = false;
      return;
    }

    if (
      canSwapTiles(
        mt.x,
        mt.y,
        level.selectedTile.column,
        level.selectedTile.row
      )
    ) {
      swapCallback(
        mt.x,
        mt.y,
        level.selectedTile.column,
        level.selectedTile.row
      );
      return;
    }
  }

  level.selectedTile.column = mt.x;
  level.selectedTile.row = mt.y;
  level.selectedTile.selected = true;
}

/**
 * Process mouse move event
 */
export function handleMouseMove(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  level: Level,
  dragState: { value: boolean },
  gameOver: boolean,
  swapCallback: (c1: number, r1: number, c2: number, r2: number) => void
): void {
  if (!canvas || !dragState.value || gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  if (dragState.value && level.selectedTile.selected) {
    const mt = getMouseTile(level, pos);
    if (
      mt.valid &&
      canSwapTiles(
        mt.x,
        mt.y,
        level.selectedTile.column,
        level.selectedTile.row
      )
    ) {
      swapCallback(
        mt.x,
        mt.y,
        level.selectedTile.column,
        level.selectedTile.row
      );
    }
  }
}
