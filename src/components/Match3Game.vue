<template>
  <div class="match3-game">
    <div class="game-board">
      <canvas
        ref="gameCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>
      <div v-if="gameOver" class="game-board-overlay"></div>
    </div>

    <div class="game-controls">
      <button class="control-button" @click="handleNewGame">New Game</button>
      <button
        class="control-button"
        @click="toggleShowMoves"
        :disabled="gameOver"
      >
        {{ showMoves ? "Hide" : "Show" }} Moves
      </button>
      <button class="control-button" @click="toggleAiBot" :disabled="gameOver">
        {{ aiBot ? "Disable" : "Enable" }} AI Bot
      </button>
    </div>

    <div v-if="isReshuffling" class="game-message reshuffling">
      Reshuffling...
    </div>
    <div v-if="gameOver" class="game-message game-over">
      {{ gameResult === "success" ? "Level Complete!" : "Game Over!" }}
      <div class="game-message-details">
        {{
          gameResult === "success"
            ? "You reached the target score!"
            : "No moves left!"
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "@/stores/gameStore";
import { TILE_SIZE, gameStates } from "@/components/game/types";
import type { Level, Cluster } from "@/components/game/types";

const gameStore = useGameStore();
const {
  gameOver,
  gameResult,
  isReshuffling,
  showMoves,
  aiBot,
  gameState,
  animationState,
  animationTime,
  drag,
  clusters,
  moves,
  currentMove,
  level,
  currentLevel,
} = storeToRefs(gameStore);

const tileColors: string[] = [
  "#ea554e",
  "#a34eea",
  "#4E95EA",
  "#5BD3AA",
  "#e3ea4e",
  "#eaa34e",
  "#e6b0aa",
];

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(currentLevel.value.columns * TILE_SIZE);
const canvasHeight = ref(currentLevel.value.rows * TILE_SIZE);

// Game variables
let ctx: CanvasRenderingContext2D | null = null;
let lastFrame = 0;
const animationTimeTotal = 0.3;

// Initialize the game
const init = () => {
  if (!gameCanvas.value) return;

  // Initialize the two-dimensional tile array
  const newLevel: Level = {
    columns: currentLevel.value.columns,
    rows: currentLevel.value.rows,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles: [],
    selectedTile: { selected: false, column: 0, row: 0 },
    grid: currentLevel.value.grid,
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

  gameStore.setLevel(newLevel);

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
  animationTime.value += dt;
  if (animationTime.value > animationTimeTotal) {
    findMoves();
    if (moves.value.length > 0) {
      const move = moves.value[Math.floor(Math.random() * moves.value.length)];
      mouseSwap(move.column1, move.row1, move.column2, move.row2);
    }
    animationTime.value = 0;
  }
};

// Handle cluster resolution
const handleClusterResolution = () => {
  findClusters();
  if (clusters.value.length > 0) {
    let scoreToAdd = 0;
    for (const cluster of clusters.value) {
      scoreToAdd += currentLevel.value.scoreMultiplier * (cluster.length - 2);
    }
    gameStore.updateScore(scoreToAdd);

    // Decrease moves left only when a match is successful
    gameStore.decreaseMoves();

    // Check if required score is reached
    if (gameStore.score >= currentLevel.value.requiredScore) {
      gameStore.setGameOver("success");
      return;
    }

    // Check if out of moves
    if (gameStore.movesLeft <= 0) {
      gameStore.setGameOver("failure");
      return;
    }

    removeClusters();
    animationState.value = 1;
  } else {
    gameState.value = gameStates.ready;
    // Recalculate moves after resolution
    findMoves();
  }
  animationTime.value = 0;
};

// Handle tile shifting
const handleTileShifting = () => {
  shiftTiles();
  animationState.value = 0;
  animationTime.value = 0;
  findClusters();
  if (clusters.value.length <= 0) {
    gameState.value = gameStates.ready;
    // Recalculate moves after shifting
    findMoves();
  }
};

// Handle swap animation
const handleSwapAnimation = () => {
  swap(
    currentMove.value.column1,
    currentMove.value.row1,
    currentMove.value.column2,
    currentMove.value.row2
  );
  findClusters();
  if (clusters.value.length > 0) {
    animationState.value = 0;
    animationTime.value = 0;
    gameState.value = gameStates.resolve;
  } else {
    animationState.value = 3;
    animationTime.value = 0;
  }
  findMoves();
  findClusters();
};

// Handle rewind swap
const handleRewindSwap = () => {
  swap(
    currentMove.value.column1,
    currentMove.value.row1,
    currentMove.value.column2,
    currentMove.value.row2
  );
  gameState.value = gameStates.ready;
};

// Reshuffle board while maintaining tile color distribution
const reshuffleBoard = () => {
  console.log("Starting board reshuffle...");

  // Collect all tile types
  const allTiles: number[] = [];
  for (let i = 0; i < level.value.columns; i++) {
    for (let j = 0; j < level.value.rows; j++) {
      if (level.value.tiles[i][j].type !== -1) {
        allTiles.push(level.value.tiles[i][j].type);
      }
    }
  }

  console.log("Current tile distribution:", allTiles);

  // Shuffle the array
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }

  console.log("Shuffled tile distribution:", allTiles);

  // Redistribute tiles
  let tileIndex = 0;
  for (let i = 0; i < level.value.columns; i++) {
    for (let j = 0; j < level.value.rows; j++) {
      if (level.value.tiles[i][j].type !== -1) {
        level.value.tiles[i][j].type = allTiles[tileIndex++];
      }
    }
  }

  console.log("Board reshuffled successfully");
};

// Update game state
const update = (dt: number) => {
  if (gameOver.value) return; // Stop all game updates if game is over

  if (gameState.value === gameStates.ready) {
    if (moves.value.length <= 0) {
      console.log("No moves available, initiating reshuffle...");
      gameStore.setReshuffling(true);
      // Reshuffle the board if no moves are available
      reshuffleBoard();
      findMoves();
      // If still no moves after reshuffle, reshuffle again
      let reshuffleCount = 1;
      while (moves.value.length <= 0) {
        console.log(
          `No moves after reshuffle #${reshuffleCount}, reshuffling again...`
        );
        reshuffleBoard();
        findMoves();
        reshuffleCount++;
      }
      console.log(
        `Board successfully reshuffled after ${reshuffleCount} attempts`
      );

      // Hide the reshuffling message after 1 second
      setTimeout(() => {
        gameStore.setReshuffling(false);
      }, 1000);

      return;
    }
    if (aiBot.value) {
      handleAiBotMove(dt);
    }
    return;
  }

  if (gameState.value === gameStates.resolve) {
    animationTime.value += dt;
    if (animationTime.value <= animationTimeTotal) return;

    switch (animationState.value) {
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
  if (showMoves.value && gameState.value === gameStates.ready) {
    renderMoves();
  }
};

// Render swap animation
const renderSwapAnimation = () => {
  if (!ctx) return;

  const shiftX = currentMove.value.column2 - currentMove.value.column1;
  const shiftY = currentMove.value.row2 - currentMove.value.row1;

  const coord1 = getTileCoordinate(
    currentMove.value.column1,
    currentMove.value.row1,
    0,
    0
  );
  const coord1Shift = getTileCoordinate(
    currentMove.value.column1,
    currentMove.value.row1,
    (animationTime.value / animationTimeTotal) * shiftX,
    (animationTime.value / animationTimeTotal) * shiftY
  );
  const col1 =
    tileColors[
      level.value.tiles[currentMove.value.column1][currentMove.value.row1].type
    ];

  const coord2 = getTileCoordinate(
    currentMove.value.column2,
    currentMove.value.row2,
    0,
    0
  );
  const coord2Shift = getTileCoordinate(
    currentMove.value.column2,
    currentMove.value.row2,
    (animationTime.value / animationTimeTotal) * -shiftX,
    (animationTime.value / animationTimeTotal) * -shiftY
  );
  const col2 =
    tileColors[
      level.value.tiles[currentMove.value.column2][currentMove.value.row2].type
    ];

  drawTile(coord1.tilex, coord1.tiley, "#000000");
  drawTile(coord2.tilex, coord2.tiley, "#000000");

  if (animationState.value === 2) {
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

  for (let i = 0; i < level.value.columns; i++) {
    for (let j = 0; j < level.value.rows; j++) {
      const shift = level.value.tiles[i][j].shift;
      const coord = getTileCoordinate(
        i,
        j,
        0,
        (animationTime.value / animationTimeTotal) * shift
      );

      if (level.value.tiles[i][j].type >= 0) {
        drawTile(
          coord.tilex,
          coord.tiley,
          tileColors[level.value.tiles[i][j].type]
        );
      }

      if (
        level.value.selectedTile.selected &&
        level.value.selectedTile.column === i &&
        level.value.selectedTile.row === j
      ) {
        drawTile(coord.tilex, coord.tiley, "#ff0000");
      }
    }
  }

  if (
    gameState.value === gameStates.resolve &&
    (animationState.value === 2 || animationState.value === 3)
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
  const tileX = (column + columnOffset) * level.value.tileWidth;
  const tileY = (row + rowOffset) * level.value.tileHeight;
  return { tilex: tileX, tiley: tileY };
};

// Draw tile
const drawTile = (x: number, y: number, color: string) => {
  if (!ctx) return;
  ctx.fillStyle = color;
  ctx.fillRect(
    x + 2,
    y + 2,
    level.value.tileWidth - 4,
    level.value.tileHeight - 4
  );
};

// Render clusters
const renderClusters = () => {
  if (!ctx) return;

  for (const cluster of clusters.value) {
    const coord = getTileCoordinate(cluster.column, cluster.row, 0, 0);
    if (cluster.horizontal) {
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(
        coord.tilex + level.value.tileWidth / 2,
        coord.tiley + level.value.tileHeight / 2 - 4,
        (cluster.length - 1) * level.value.tileWidth,
        8
      );
    } else {
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(
        coord.tilex + level.value.tileWidth / 2 - 4,
        coord.tiley + level.value.tileHeight / 2,
        8,
        (cluster.length - 1) * level.value.tileHeight
      );
    }
  }
};

// Render moves
const renderMoves = () => {
  if (!ctx) return;

  ctx.lineWidth = 2;
  for (const move of moves.value) {
    const coord1 = getTileCoordinate(move.column1, move.row1, 0, 0);
    const coord2 = getTileCoordinate(move.column2, move.row2, 0, 0);

    // Draw hint line
    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(
      coord1.tilex + level.value.tileWidth / 2,
      coord1.tiley + level.value.tileHeight / 2
    );
    ctx.lineTo(
      coord2.tilex + level.value.tileWidth / 2,
      coord2.tiley + level.value.tileHeight / 2
    );
    ctx.stroke();

    // Draw circles at endpoints
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(
      coord1.tilex + level.value.tileWidth / 2,
      coord1.tiley + level.value.tileHeight / 2,
      4,
      0,
      2 * Math.PI
    );
    ctx.arc(
      coord2.tilex + level.value.tileWidth / 2,
      coord2.tiley + level.value.tileHeight / 2,
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
  for (let i = 0; i < level.value.columns; i++) {
    level.value.tiles[i] = [];
    for (let j = 0; j < level.value.rows; j++) {
      level.value.tiles[i][j] = {
        type: currentLevel.value.grid[j][i],
        x: i * level.value.tileWidth,
        y: j * level.value.tileHeight,
        width: level.value.tileWidth,
        height: level.value.tileHeight,
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
  gameStore.resetGame();
  gameState.value = gameStates.ready;
  createLevel();
  findMoves();
  findClusters();
};

// Find horizontal clusters in a row
const findHorizontalClustersInRow = (row: number, minMatchLength: number) => {
  let matchLength = 1;
  const rowClusters: Cluster[] = [];

  for (let i = 0; i < level.value.columns; i++) {
    const checkCluster =
      i === level.value.columns - 1 ||
      level.value.tiles[i][row].type !== level.value.tiles[i + 1][row].type ||
      level.value.tiles[i][row].type === -1;

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

  for (let j = 0; j < level.value.rows; j++) {
    const checkCluster =
      j === level.value.rows - 1 ||
      level.value.tiles[column][j].type !==
        level.value.tiles[column][j + 1].type ||
      level.value.tiles[column][j].type === -1;

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
  clusters.value = [];
  const minMatchLength = currentLevel.value.minMatchLength;

  // Find horizontal clusters
  for (let j = 0; j < level.value.rows; j++) {
    clusters.value.push(...findHorizontalClustersInRow(j, minMatchLength));
  }

  // Find vertical clusters
  for (let i = 0; i < level.value.columns; i++) {
    clusters.value.push(...findVerticalClustersInColumn(i, minMatchLength));
  }
};

// Check if a move creates a match
const checkMove = (x1: number, y1: number, x2: number, y2: number): boolean => {
  // Temporarily swap tiles
  swap(x1, y1, x2, y2);
  findClusters();
  // Swap back
  swap(x1, y1, x2, y2);

  return clusters.value.length > 0;
};

// Find moves
const findMoves = () => {
  moves.value = [];
  clusters.value = [];

  // Check horizontal swaps
  for (let j = 0; j < level.value.rows; j++) {
    for (let i = 0; i < level.value.columns - 1; i++) {
      if (checkMove(i, j, i + 1, j)) {
        moves.value.push({ column1: i, row1: j, column2: i + 1, row2: j });
      }
    }
  }

  // Check vertical swaps
  for (let i = 0; i < level.value.columns; i++) {
    for (let j = 0; j < level.value.rows - 1; j++) {
      if (checkMove(i, j, i, j + 1)) {
        moves.value.push({ column1: i, row1: j, column2: i, row2: j + 1 });
      }
    }
  }

  // Clear any clusters found during move checking
  clusters.value = [];
};

// Loop clusters
const loopClusters = (
  func: (index: number, column: number, row: number) => void
) => {
  clusters.value.forEach((cluster, index) => {
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
    level.value.tiles[column][row].type = -1;
  });

  for (let i = 0; i < level.value.columns; i++) {
    let shift = 0;
    for (let j = level.value.rows - 1; j >= 0; j--) {
      if (level.value.tiles[i][j].type === -1) {
        shift++;
        level.value.tiles[i][j].shift = 0;
      } else {
        level.value.tiles[i][j].shift = shift;
      }
    }
  }
};

// Shift tiles
const shiftTiles = () => {
  for (let i = 0; i < level.value.columns; i++) {
    for (let j = level.value.rows - 1; j >= 0; j--) {
      if (level.value.tiles[i][j].type === -1) {
        level.value.tiles[i][j].type = getRandomTile();
      } else {
        const shift = level.value.tiles[i][j].shift;
        if (shift > 0) {
          swap(i, j, i, j + shift);
        }
      }
      level.value.tiles[i][j].shift = 0;
    }
  }
};

// Get mouse tile
const getMouseTile = (pos: { x: number; y: number }) => {
  const tx = Math.floor(pos.x / level.value.tileWidth);
  const ty = Math.floor(pos.y / level.value.tileHeight);

  if (tx >= 0 && tx < level.value.columns && ty >= 0 && ty < level.value.rows) {
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
  const typeSwap = level.value.tiles[x1][y1].type;
  level.value.tiles[x1][y1].type = level.value.tiles[x2][y2].type;
  level.value.tiles[x2][y2].type = typeSwap;
};

// Mouse swap
const mouseSwap = (c1: number, r1: number, c2: number, r2: number) => {
  if (gameOver.value) return; // Prevent moves when game is over

  currentMove.value = { column1: c1, row1: r1, column2: c2, row2: r2 };
  level.value.selectedTile.selected = false;
  animationState.value = 2;
  animationTime.value = 0;
  gameState.value = gameStates.resolve;
};

// Update button handlers
const handleNewGame = () => {
  newGame();
};

const toggleShowMoves = () => {
  gameStore.toggleShowMoves();
  // Force a moves check when enabling
  if (showMoves.value) {
    findMoves();
  }
};

const toggleAiBot = () => {
  gameStore.toggleAiBot();
};

// Mouse event handlers
const onMouseMove = (e: MouseEvent) => {
  if (!gameCanvas.value || drag.value || gameOver.value) return;
  const rect = gameCanvas.value.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  if (drag.value && level.value.selectedTile.selected) {
    const mt = getMouseTile(pos);
    if (
      mt.valid &&
      canSwap(
        mt.x,
        mt.y,
        level.value.selectedTile.column,
        level.value.selectedTile.row
      )
    ) {
      mouseSwap(
        mt.x,
        mt.y,
        level.value.selectedTile.column,
        level.value.selectedTile.row
      );
    }
  }
};

// Handle tile selection
const handleTileSelection = (mt: { valid: boolean; x: number; y: number }) => {
  if (!mt.valid) {
    level.value.selectedTile.selected = false;
    return;
  }

  if (level.value.selectedTile.selected) {
    if (
      mt.x === level.value.selectedTile.column &&
      mt.y === level.value.selectedTile.row
    ) {
      level.value.selectedTile.selected = false;
      return;
    }

    if (
      canSwap(
        mt.x,
        mt.y,
        level.value.selectedTile.column,
        level.value.selectedTile.row
      )
    ) {
      mouseSwap(
        mt.x,
        mt.y,
        level.value.selectedTile.column,
        level.value.selectedTile.row
      );
      return;
    }
  }

  level.value.selectedTile.column = mt.x;
  level.value.selectedTile.row = mt.y;
  level.value.selectedTile.selected = true;
};

const onMouseDown = (e: MouseEvent) => {
  if (!gameCanvas.value || drag.value || gameOver.value) return;

  const rect = gameCanvas.value.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  const mt = getMouseTile(pos);
  handleTileSelection(mt);
  drag.value = true;
};

const onMouseUp = () => {
  drag.value = false;
};

const onMouseOut = () => {
  drag.value = false;
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

.game-message {
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
  z-index: 1000;
}

.reshuffling {
  background-color: rgba(0, 0, 0, 0.8);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.game-message-details {
  font-size: 16px;
  margin-top: 8px;
  opacity: 0.8;
}

.game-over {
  background-color: rgba(0, 0, 0, 0.9);
  padding: 24px;
}

.game-board-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-button:disabled:hover {
  opacity: 0.5;
}
</style>
