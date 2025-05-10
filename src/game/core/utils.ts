import type { Level } from "@/game/types";

/**
 * Get tile coordinate on the canvas
 */
export function getTileCoordinate(
  level: Level,
  column: number,
  row: number,
  columnOffset: number,
  rowOffset: number
) {
  const tileX = (column + columnOffset) * level.tileWidth;
  const tileY = (row + rowOffset) * level.tileHeight;
  return { tilex: tileX, tiley: tileY };
}

/**
 * Get tile position from mouse coordinates
 */
export function getMouseTile(level: Level, pos: { x: number; y: number }) {
  const tx = Math.floor(pos.x / level.tileWidth);
  const ty = Math.floor(pos.y / level.tileHeight);

  if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
    return { valid: true, x: tx, y: ty };
  }

  return { valid: false, x: 0, y: 0 };
}
