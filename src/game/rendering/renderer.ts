import type { Level, Cluster, Move } from "@/game/types";
import { getTileCoordinate } from "../core/utils";
import { tileColors } from "@/game/types";

/**
 * Draw a tile on the canvas
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  tileWidth: number,
  tileHeight: number
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, tileWidth - 4, tileHeight - 4);
}

/**
 * Render all tiles on the board
 */
export function renderTiles(
  ctx: CanvasRenderingContext2D,
  level: Level,
  gameState: number,
  animationState: number,
  animationTime: number,
  animationTimeTotal: number,
  currentMove: Move
): void {
  // Clear canvas
  ctx.clearRect(
    0,
    0,
    level.columns * level.tileWidth,
    level.rows * level.tileHeight
  );

  // Draw level background
  ctx.fillStyle = "#000000";
  ctx.fillRect(
    0,
    0,
    level.columns * level.tileWidth,
    level.rows * level.tileHeight
  );

  // Render tiles
  for (let i = 0; i < level.columns; i++) {
    for (let j = 0; j < level.rows; j++) {
      const shift = level.tiles[i][j].shift;
      const coord = getTileCoordinate(
        level,
        i,
        j,
        0,
        (animationTime / animationTimeTotal) * shift
      );

      if (level.tiles[i][j].type >= 0) {
        drawTile(
          ctx,
          coord.tilex,
          coord.tiley,
          tileColors[level.tiles[i][j].type],
          level.tileWidth,
          level.tileHeight
        );
      }

      if (
        level.selectedTile.selected &&
        level.selectedTile.column === i &&
        level.selectedTile.row === j
      ) {
        drawTile(
          ctx,
          coord.tilex,
          coord.tiley,
          "#ff0000",
          level.tileWidth,
          level.tileHeight
        );
      }
    }
  }

  if (gameState === 2 && (animationState === 2 || animationState === 3)) {
    renderSwapAnimation(
      ctx,
      level,
      currentMove,
      animationState,
      animationTime,
      animationTimeTotal
    );
  }
}

/**
 * Render swap animation
 */
export function renderSwapAnimation(
  ctx: CanvasRenderingContext2D,
  level: Level,
  currentMove: Move,
  animationState: number,
  animationTime: number,
  animationTimeTotal: number
): void {
  const shiftX = currentMove.column2 - currentMove.column1;
  const shiftY = currentMove.row2 - currentMove.row1;

  const coord1 = getTileCoordinate(
    level,
    currentMove.column1,
    currentMove.row1,
    0,
    0
  );
  const coord1Shift = getTileCoordinate(
    level,
    currentMove.column1,
    currentMove.row1,
    (animationTime / animationTimeTotal) * shiftX,
    (animationTime / animationTimeTotal) * shiftY
  );
  const col1 =
    tileColors[level.tiles[currentMove.column1][currentMove.row1].type];

  const coord2 = getTileCoordinate(
    level,
    currentMove.column2,
    currentMove.row2,
    0,
    0
  );
  const coord2Shift = getTileCoordinate(
    level,
    currentMove.column2,
    currentMove.row2,
    (animationTime / animationTimeTotal) * -shiftX,
    (animationTime / animationTimeTotal) * -shiftY
  );
  const col2 =
    tileColors[level.tiles[currentMove.column2][currentMove.row2].type];

  drawTile(
    ctx,
    coord1.tilex,
    coord1.tiley,
    "#000000",
    level.tileWidth,
    level.tileHeight
  );
  drawTile(
    ctx,
    coord2.tilex,
    coord2.tiley,
    "#000000",
    level.tileWidth,
    level.tileHeight
  );

  if (animationState === 2) {
    drawTile(
      ctx,
      coord1Shift.tilex,
      coord1Shift.tiley,
      col1,
      level.tileWidth,
      level.tileHeight
    );
    drawTile(
      ctx,
      coord2Shift.tilex,
      coord2Shift.tiley,
      col2,
      level.tileWidth,
      level.tileHeight
    );
  } else {
    drawTile(
      ctx,
      coord2Shift.tilex,
      coord2Shift.tiley,
      col2,
      level.tileWidth,
      level.tileHeight
    );
    drawTile(
      ctx,
      coord1Shift.tilex,
      coord1Shift.tiley,
      col1,
      level.tileWidth,
      level.tileHeight
    );
  }
}

/**
 * Render clusters
 */
export function renderClusters(
  ctx: CanvasRenderingContext2D,
  level: Level,
  clusters: Cluster[]
): void {
  for (const cluster of clusters) {
    const coord = getTileCoordinate(level, cluster.column, cluster.row, 0, 0);
    if (cluster.horizontal) {
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(
        coord.tilex + level.tileWidth / 2,
        coord.tiley + level.tileHeight / 2 - 4,
        (cluster.length - 1) * level.tileWidth,
        8
      );
    } else {
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(
        coord.tilex + level.tileWidth / 2 - 4,
        coord.tiley + level.tileHeight / 2,
        8,
        (cluster.length - 1) * level.tileHeight
      );
    }
  }
}

/**
 * Render available moves
 */
export function renderMoves(
  ctx: CanvasRenderingContext2D,
  level: Level,
  moves: Move[]
): void {
  ctx.lineWidth = 2;
  for (const move of moves) {
    const coord1 = getTileCoordinate(level, move.column1, move.row1, 0, 0);
    const coord2 = getTileCoordinate(level, move.column2, move.row2, 0, 0);

    // Draw hint line
    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(
      coord1.tilex + level.tileWidth / 2,
      coord1.tiley + level.tileHeight / 2
    );
    ctx.lineTo(
      coord2.tilex + level.tileWidth / 2,
      coord2.tiley + level.tileHeight / 2
    );
    ctx.stroke();

    // Draw circles at endpoints
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(
      coord1.tilex + level.tileWidth / 2,
      coord1.tiley + level.tileHeight / 2,
      4,
      0,
      2 * Math.PI
    );
    ctx.arc(
      coord2.tilex + level.tileWidth / 2,
      coord2.tiley + level.tileHeight / 2,
      4,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
