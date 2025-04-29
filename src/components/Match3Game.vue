<template>
  <div class="match3-game">
    <div class="game-board">
      <canvas
        ref="gameCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>
    </div>

    <div class="game-controls">
      <button class="control-button" @click="handleNewGame">New Game</button>
      <button class="control-button" @click="toggleShowMoves">
        {{ showMoves ? "Hide" : "Show" }} Moves
      </button>
      <button class="control-button" @click="toggleAiBot">
        {{ aiBot ? "Disable" : "Enable" }} AI Bot
      </button>
    </div>

    <div v-if="gameOver" class="game-over">Game Over!</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import gameConfig from "@/config/gameBoard.json";

const TILE_SIZE = 40; // Constant tile size in pixels

interface Tile {
  type: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shift: number;
}

interface Level {
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  tiles: Tile[][];
  selectedTile: { selected: boolean; column: number; row: number };
  grid: number[][];
}

interface Cluster {
  column: number;
  row: number;
  length: number;
  horizontal: boolean;
}

interface Move {
  column1: number;
  row1: number;
  column2: number;
  row2: number;
}

const emit = defineEmits<{
  (e: "update:score", value: number): void;
  (e: "reset:score"): void;
}>();

const currentLevel = ref(gameConfig.levels[0]);
const tileColors: string[] = [
  "#c0392b", // 0
  "#c0392b", // 1
  "#2980b9", // 2
  "#1abc9c", // 3
  "#f1c40f", // 4
  "#e67e22", // 5
  "#e6b0aa", // 6
];

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(currentLevel.value.columns * TILE_SIZE);
const canvasHeight = ref(currentLevel.value.rows * TILE_SIZE);

// Game state
const level: Level = {
  columns: currentLevel.value.columns,
  rows: currentLevel.value.rows,
  tileWidth: TILE_SIZE,
  tileHeight: TILE_SIZE,
  tiles: [],
  selectedTile: { selected: false, column: 0, row: 0 },
  grid: currentLevel.value.grid,
};

// Game variables
let ctx: CanvasRenderingContext2D | null = null;
let lastFrame = 0;
let drag = false;
let clusters: Cluster[] = [];
let moves: Move[] = [];
let currentMove: Move = { column1: 0, row1: 0, column2: 0, row2: 0 };
let animationState = 0;
let animationTime = 0;
const animationTimeTotal = 0.3;
const showMoves = ref(false);
const aiBot = ref(false);
const gameOver = ref(false);

const gameStates = { init: 0, ready: 1, resolve: 2 };
let gameState = gameStates.init;

// Initialize the game
const init = () => {
  if (!gameCanvas.value) return;

  // Initialize the two-dimensional tile array
  for (let i = 0; i < level.columns; i++) {
    level.tiles[i] = [];
    for (let j = 0; j < level.rows; j++) {
      level.tiles[i][j] = {
        type: 0,
        x: i * level.tileWidth,
        y: j * level.tileHeight,
        width: level.tileWidth,
        height: level.tileHeight,
        shift: 0,
      };
    }
  }

  // New game
  newGame();
};

// Main game loop
const main = (tframe: number) => {
  if (!gameCanvas.value) return;

  const dt = (tframe - lastFrame) / 1000;
  lastFrame = tframe;

  // Update and render the game
  update(dt);
  render();

  requestAnimationFrame(main);
};

// Handle AI bot moves
const handleAiBotMove = (dt: number) => {
  animationTime += dt;
  if (animationTime > animationTimeTotal) {
    findMoves();
    if (moves.length > 0) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      mouseSwap(move.column1, move.row1, move.column2, move.row2);
    }
    animationTime = 0;
  }
};

// Handle cluster resolution
const handleClusterResolution = () => {
  findClusters();
  if (clusters.length > 0) {
    let scoreToAdd = 0;
    for (const cluster of clusters) {
      scoreToAdd += currentLevel.value.scoreMultiplier * (cluster.length - 2);
    }
    emit("update:score", scoreToAdd);
    removeClusters();
    animationState = 1;
  } else {
    gameState = gameStates.ready;
    // Recalculate moves after resolution
    findMoves();
  }
  animationTime = 0;
};

// Handle tile shifting
const handleTileShifting = () => {
  shiftTiles();
  animationState = 0;
  animationTime = 0;
  findClusters();
  if (clusters.length <= 0) {
    gameState = gameStates.ready;
    // Recalculate moves after shifting
    findMoves();
  }
};

// Handle swap animation
const handleSwapAnimation = () => {
  swap(
    currentMove.column1,
    currentMove.row1,
    currentMove.column2,
    currentMove.row2
  );
  findClusters();
  if (clusters.length > 0) {
    animationState = 0;
    animationTime = 0;
    gameState = gameStates.resolve;
  } else {
    animationState = 3;
    animationTime = 0;
  }
  findMoves();
  findClusters();
};

// Handle rewind swap
const handleRewindSwap = () => {
  swap(
    currentMove.column1,
    currentMove.row1,
    currentMove.column2,
    currentMove.row2
  );
  gameState = gameStates.ready;
};

// Update game state
const update = (dt: number) => {
  if (gameState === gameStates.ready) {
    if (moves.length <= 0) {
      gameOver.value = true;
      return;
    }
    if (aiBot.value) {
      handleAiBotMove(dt);
    }
    return;
  }

  if (gameState === gameStates.resolve) {
    animationTime += dt;
    if (animationTime <= animationTimeTotal) return;

    switch (animationState) {
      case 0:
        handleClusterResolution();
        break;
      case 1:
        handleTileShifting();
        break;
      case 2:
        handleSwapAnimation();
        break;
      case 3:
        handleRewindSwap();
        break;
    }
  }
};

// Render the game
const render = () => {
  if (!ctx || !gameCanvas.value) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Draw level background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Render tiles
  renderTiles();

  // Render clusters
  renderClusters();

  // Render moves
  if (showMoves.value && gameState === gameStates.ready) {
    renderMoves();
  }
};

// Render swap animation
const renderSwapAnimation = () => {
  if (!ctx) return;

  const shiftX = currentMove.column2 - currentMove.column1;
  const shiftY = currentMove.row2 - currentMove.row1;

  const coord1 = getTileCoordinate(currentMove.column1, currentMove.row1, 0, 0);
  const coord1Shift = getTileCoordinate(
    currentMove.column1,
    currentMove.row1,
    (animationTime / animationTimeTotal) * shiftX,
    (animationTime / animationTimeTotal) * shiftY
  );
  const col1 =
    tileColors[level.tiles[currentMove.column1][currentMove.row1].type];

  const coord2 = getTileCoordinate(currentMove.column2, currentMove.row2, 0, 0);
  const coord2Shift = getTileCoordinate(
    currentMove.column2,
    currentMove.row2,
    (animationTime / animationTimeTotal) * -shiftX,
    (animationTime / animationTimeTotal) * -shiftY
  );
  const col2 =
    tileColors[level.tiles[currentMove.column2][currentMove.row2].type];

  drawTile(coord1.tilex, coord1.tiley, "#000000");
  drawTile(coord2.tilex, coord2.tiley, "#000000");

  if (animationState === 2) {
    drawTile(coord1Shift.tilex, coord1Shift.tiley, col1);
    drawTile(coord2Shift.tilex, coord2Shift.tiley, col2);
  } else {
    drawTile(coord2Shift.tilex, coord2Shift.tiley, col2);
    drawTile(coord1Shift.tilex, coord1Shift.tiley, col1);
  }
};

// Render tiles
const renderTiles = () => {
  if (!ctx) return;

  for (let i = 0; i < level.columns; i++) {
    for (let j = 0; j < level.rows; j++) {
      const shift = level.tiles[i][j].shift;
      const coord = getTileCoordinate(
        i,
        j,
        0,
        (animationTime / animationTimeTotal) * shift
      );

      if (level.tiles[i][j].type >= 0) {
        drawTile(coord.tilex, coord.tiley, tileColors[level.tiles[i][j].type]);
      }

      if (
        level.selectedTile.selected &&
        level.selectedTile.column === i &&
        level.selectedTile.row === j
      ) {
        drawTile(coord.tilex, coord.tiley, "#ff0000");
      }
    }
  }

  if (
    gameState === gameStates.resolve &&
    (animationState === 2 || animationState === 3)
  ) {
    renderSwapAnimation();
  }
};

// Get tile coordinate
const getTileCoordinate = (
  column: number,
  row: number,
  columnOffset: number,
  rowOffset: number
) => {
  const tileX = (column + columnOffset) * level.tileWidth;
  const tileY = (row + rowOffset) * level.tileHeight;
  return { tilex: tileX, tiley: tileY };
};

// Draw tile
const drawTile = (x: number, y: number, color: string) => {
  if (!ctx) return;
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, level.tileWidth - 4, level.tileHeight - 4);
};

// Render clusters
const renderClusters = () => {
  if (!ctx) return;

  for (const cluster of clusters) {
    const coord = getTileCoordinate(cluster.column, cluster.row, 0, 0);
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
};

// Render moves
const renderMoves = () => {
  if (!ctx) return;

  ctx.lineWidth = 2;
  for (const move of moves) {
    const coord1 = getTileCoordinate(move.column1, move.row1, 0, 0);
    const coord2 = getTileCoordinate(move.column2, move.row2, 0, 0);

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
};

// Create level
const createLevel = () => {
  // Initialize the level with the predefined grid
  for (let i = 0; i < level.columns; i++) {
    level.tiles[i] = [];
    for (let j = 0; j < level.rows; j++) {
      level.tiles[i][j] = {
        type: currentLevel.value.grid[j][i],
        x: i * level.tileWidth,
        y: j * level.tileHeight,
        width: level.tileWidth,
        height: level.tileHeight,
        shift: 0,
      };
    }
  }
};

// Get random tile for filling gaps after matches
const getRandomTile = () => {
  return Math.floor(Math.random() * currentLevel.value.colorsLimit);
};

// New game
const newGame = () => {
  emit("reset:score");
  gameState = gameStates.ready;
  gameOver.value = false;
  createLevel();
  findMoves();
  findClusters();
};

// Find horizontal clusters in a row
const findHorizontalClustersInRow = (row: number, minMatchLength: number) => {
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
};

// Find vertical clusters in a column
const findVerticalClustersInColumn = (
  column: number,
  minMatchLength: number
) => {
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
};

// Find all clusters
const findClusters = () => {
  clusters = [];
  const minMatchLength = currentLevel.value.minMatchLength;

  // Find horizontal clusters
  for (let j = 0; j < level.rows; j++) {
    clusters.push(...findHorizontalClustersInRow(j, minMatchLength));
  }

  // Find vertical clusters
  for (let i = 0; i < level.columns; i++) {
    clusters.push(...findVerticalClustersInColumn(i, minMatchLength));
  }
};

// Check if a move creates a match
const checkMove = (x1: number, y1: number, x2: number, y2: number): boolean => {
  // Temporarily swap tiles
  swap(x1, y1, x2, y2);
  findClusters();
  // Swap back
  swap(x1, y1, x2, y2);

  return clusters.length > 0;
};

// Find moves
const findMoves = () => {
  moves = [];
  clusters = [];

  // Check horizontal swaps
  for (let j = 0; j < level.rows; j++) {
    for (let i = 0; i < level.columns - 1; i++) {
      if (checkMove(i, j, i + 1, j)) {
        moves.push({ column1: i, row1: j, column2: i + 1, row2: j });
      }
    }
  }

  // Check vertical swaps
  for (let i = 0; i < level.columns; i++) {
    for (let j = 0; j < level.rows - 1; j++) {
      if (checkMove(i, j, i, j + 1)) {
        moves.push({ column1: i, row1: j, column2: i, row2: j + 1 });
      }
    }
  }

  // Clear any clusters found during move checking
  clusters = [];
};

// Loop clusters
const loopClusters = (
  func: (index: number, column: number, row: number) => void
) => {
  clusters.forEach((cluster, index) => {
    let offset = 0;
    for (let i = 0; i < cluster.length; i++) {
      const column = cluster.column + (cluster.horizontal ? offset : 0);
      const row = cluster.row + (cluster.horizontal ? 0 : offset);
      func(index, column, row);
      offset++;
    }
  });
};

// Remove clusters
const removeClusters = () => {
  loopClusters((index, column, row) => {
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
};

// Shift tiles
const shiftTiles = () => {
  for (let i = 0; i < level.columns; i++) {
    for (let j = level.rows - 1; j >= 0; j--) {
      if (level.tiles[i][j].type === -1) {
        level.tiles[i][j].type = getRandomTile();
      } else {
        const shift = level.tiles[i][j].shift;
        if (shift > 0) {
          swap(i, j, i, j + shift);
        }
      }
      level.tiles[i][j].shift = 0;
    }
  }
};

// Get mouse tile
const getMouseTile = (pos: { x: number; y: number }) => {
  const tx = Math.floor(pos.x / level.tileWidth);
  const ty = Math.floor(pos.y / level.tileHeight);

  if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
    return { valid: true, x: tx, y: ty };
  }

  return { valid: false, x: 0, y: 0 };
};

// Check if tiles can be swapped
const canSwap = (x1: number, y1: number, x2: number, y2: number) => {
  return (
    (Math.abs(x1 - x2) === 1 && y1 === y2) ||
    (Math.abs(y1 - y2) === 1 && x1 === x2)
  );
};

// Swap tiles
const swap = (x1: number, y1: number, x2: number, y2: number) => {
  const typeSwap = level.tiles[x1][y1].type;
  level.tiles[x1][y1].type = level.tiles[x2][y2].type;
  level.tiles[x2][y2].type = typeSwap;
};

// Mouse swap
const mouseSwap = (c1: number, r1: number, c2: number, r2: number) => {
  currentMove = { column1: c1, row1: r1, column2: c2, row2: r2 };
  level.selectedTile.selected = false;
  animationState = 2;
  animationTime = 0;
  gameState = gameStates.resolve;
};

// Update button handlers
const handleNewGame = () => {
  newGame();
};

const toggleShowMoves = () => {
  showMoves.value = !showMoves.value;
  // Force a moves check when enabling
  if (showMoves.value) {
    findMoves();
  }
};

const toggleAiBot = () => {
  aiBot.value = !aiBot.value;
};

// Mouse event handlers
const onMouseMove = (e: MouseEvent) => {
  if (!gameCanvas.value) return;
  const rect = gameCanvas.value.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  if (drag && level.selectedTile.selected) {
    const mt = getMouseTile(pos);
    if (
      mt.valid &&
      canSwap(mt.x, mt.y, level.selectedTile.column, level.selectedTile.row)
    ) {
      mouseSwap(mt.x, mt.y, level.selectedTile.column, level.selectedTile.row);
    }
  }
};

// Handle tile selection
const handleTileSelection = (mt: { valid: boolean; x: number; y: number }) => {
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
      canSwap(mt.x, mt.y, level.selectedTile.column, level.selectedTile.row)
    ) {
      mouseSwap(mt.x, mt.y, level.selectedTile.column, level.selectedTile.row);
      return;
    }
  }

  level.selectedTile.column = mt.x;
  level.selectedTile.row = mt.y;
  level.selectedTile.selected = true;
};

const onMouseDown = (e: MouseEvent) => {
  if (!gameCanvas.value || drag) return;

  const rect = gameCanvas.value.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  const mt = getMouseTile(pos);
  handleTileSelection(mt);
  drag = true;
};

const onMouseUp = () => {
  drag = false;
};

const onMouseOut = () => {
  drag = false;
};

onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext("2d");
    init();
    gameCanvas.value.addEventListener("mousemove", onMouseMove);
    gameCanvas.value.addEventListener("mousedown", onMouseDown);
    gameCanvas.value.addEventListener("mouseup", onMouseUp);
    gameCanvas.value.addEventListener("mouseout", onMouseOut);
    requestAnimationFrame(main);
  }
});

onBeforeUnmount(() => {
  if (gameCanvas.value) {
    gameCanvas.value.removeEventListener("mousemove", onMouseMove);
    gameCanvas.value.removeEventListener("mousedown", onMouseDown);
    gameCanvas.value.removeEventListener("mouseup", onMouseUp);
    gameCanvas.value.removeEventListener("mouseout", onMouseOut);
  }
});
</script>

<style scoped>
.match3-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.game-board {
  position: relative;
  border: 2px solid #000;
  background-color: #f0f0f0;
}

canvas {
  display: block;
}

.game-controls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.control-button {
  padding: 8px 16px;
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.control-button:hover {
  opacity: 0.8;
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}
</style>
