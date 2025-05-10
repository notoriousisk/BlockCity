import type { Level, Cluster } from "@/game/types";
import { swapTiles } from "./board";

/**
 * Find horizontal clusters in a row
 */
export function findHorizontalClustersInRow(
  level: Level,
  row: number,
  minMatchLength: number
): Cluster[] {
  let matchLength = 1;
  const rowClusters: Cluster[] = [];

  for (let i = 0; i < level.columns; i++) {
    const checkCluster =
      i === level.columns - 1 ||
      level.tiles[i][row].type !== level.tiles[i + 1][row].type ||
      level.tiles[i][row].type === -1;

    if (!checkCluster) {
      matchLength++;
      continue;
    }

    if (matchLength >= minMatchLength) {
      rowClusters.push({
        column: i + 1 - matchLength,
        row,
        length: matchLength,
        horizontal: true,
      });
    }
    matchLength = 1;
  }
  return rowClusters;
}

/**
 * Find vertical clusters in a column
 */
export function findVerticalClustersInColumn(
  level: Level,
  column: number,
  minMatchLength: number
): Cluster[] {
  let matchLength = 1;
  const columnClusters: Cluster[] = [];

  for (let j = 0; j < level.rows; j++) {
    const checkCluster =
      j === level.rows - 1 ||
      level.tiles[column][j].type !== level.tiles[column][j + 1].type ||
      level.tiles[column][j].type === -1;

    if (!checkCluster) {
      matchLength++;
      continue;
    }

    if (matchLength >= minMatchLength) {
      columnClusters.push({
        column,
        row: j + 1 - matchLength,
        length: matchLength,
        horizontal: false,
      });
    }
    matchLength = 1;
  }
  return columnClusters;
}

/**
 * Find all clusters on the board
 */
export function findClusters(level: Level, minMatchLength: number): Cluster[] {
  const clusters: Cluster[] = [];

  // Find horizontal clusters
  for (let j = 0; j < level.rows; j++) {
    clusters.push(...findHorizontalClustersInRow(level, j, minMatchLength));
  }

  // Find vertical clusters
  for (let i = 0; i < level.columns; i++) {
    clusters.push(...findVerticalClustersInColumn(level, i, minMatchLength));
  }

  return clusters;
}

/**
 * Loop through all tiles in clusters and apply a function
 */
export function loopClusters(
  clusters: Cluster[],
  func: (index: number, column: number, row: number) => void
): void {
  clusters.forEach((cluster, index) => {
    let offset = 0;
    for (let i = 0; i < cluster.length; i++) {
      const column = cluster.column + (cluster.horizontal ? offset : 0);
      const row = cluster.row + (cluster.horizontal ? 0 : offset);
      func(index, column, row);
      offset++;
    }
  });
}

/**
 * Remove clusters and prepare for tile shifting
 */
export function removeClusters(level: Level, clusters: Cluster[]): void {
  loopClusters(clusters, (index, column, row) => {
    level.tiles[column][row].type = -1;
  });

  for (let i = 0; i < level.columns; i++) {
    let shift = 0;
    for (let j = level.rows - 1; j >= 0; j--) {
      if (level.tiles[i][j].type === -1) {
        shift++;
        level.tiles[i][j].shift = 0;
      } else {
        level.tiles[i][j].shift = shift;
      }
    }
  }
}

/**
 * Check if a move creates a match
 */
export function checkMove(
  level: Level,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minMatchLength: number
): boolean {
  // Temporarily swap tiles
  swapTiles(level, x1, y1, x2, y2);
  const clusters = findClusters(level, minMatchLength);
  // Swap back
  swapTiles(level, x1, y1, x2, y2);

  return clusters.length > 0;
}
