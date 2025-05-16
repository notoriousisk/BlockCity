<template>
  <div class="match3-game">
    <canvas
      ref="gameCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>

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
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "@/stores/gameStore";
import { TILE_SIZE, gameStates } from "@/game/types";

// Import game modules
import { initializeBoard } from "@/game/core/board";
import {
  renderTiles,
  renderClusters,
  renderMoves,
} from "@/game/rendering/renderer";
import {
  handleMouseDown,
  handleMouseMove,
  handleTileSelection,
} from "@/game/input/input-handler";
import { newGame, updateGame } from "@/game/core/game-engine";
import { findMoves } from "@/game/core/moves";

// Define props for the component
const props = defineProps({
  levelConfig: {
    type: Object,
    required: true,
  },
});

// Define emits
const emit = defineEmits(["levelcomplete"]);

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
  score,
  movesLeft,
  requiredScore,
  minMatchLength,
  colorsLimit,
  scoreMultiplier,
} = storeToRefs(gameStore);

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(props.levelConfig.columns * TILE_SIZE || 0);
const canvasHeight = ref(props.levelConfig.rows * TILE_SIZE || 0);

// Game variables
let ctx: CanvasRenderingContext2D | null = null;
let lastFrame = 0;
const animationTimeTotal = 0.3;

// Initialize the game
const init = async () => {
  if (!gameCanvas.value) return;

  // Use the level config from props
  // Set it to the store's currentLevel
  gameStore.$patch({
    currentLevel: props.levelConfig,
    movesLeft: props.levelConfig.movesLimit,
  });

  // Update canvas dimensions
  canvasWidth.value = props.levelConfig.columns * TILE_SIZE;
  canvasHeight.value = props.levelConfig.rows * TILE_SIZE;

  // Initialize the board
  const newLevel = initializeBoard(
    props.levelConfig.columns,
    props.levelConfig.rows,
    props.levelConfig.grid
  );

  gameStore.setLevel(newLevel);

  // New game
  newGame(
    level.value,
    props.levelConfig.grid,
    gameState,
    gameStore.setReshuffling,
    gameStore.setClusters,
    gameStore.setMoves
  );
};

// Method to refresh moves
const refreshMoves = () => {
  const newMoves = findMoves(level.value, minMatchLength.value);
  gameStore.setMoves(newMoves);
};

// Watch for changes in the level config
watch(() => props.levelConfig, init, { immediate: false });

// Watch for game result changes to emit levelcomplete
watch([gameOver, gameResult], ([newGameOver, newGameResult]) => {
  if (newGameOver && newGameResult === "success") {
    emit("levelcomplete", props.levelConfig);
  }
});

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

// Update game state
const update = (dt: number) => {
  updateGame(
    dt,
    gameState,
    animationState,
    animationTime,
    animationTimeTotal,
    level.value,
    moves.value,
    currentMove.value,
    clusters.value,
    minMatchLength.value,
    colorsLimit.value,
    gameStore.setReshuffling,
    gameStore.setClusters,
    gameStore.setMoves,
    gameStore.updateScore,
    gameStore.decreaseMoves,
    gameStore.setGameOver,
    scoreMultiplier.value,
    requiredScore.value,
    score.value,
    movesLeft.value,
    gameOver.value,
    aiBot.value
  );
};

// Render the game
const render = () => {
  if (!ctx || !gameCanvas.value) return;

  // Render tiles
  renderTiles(
    ctx,
    level.value,
    gameState.value,
    animationState.value,
    animationTime.value,
    animationTimeTotal,
    currentMove.value
  );

  // Render clusters
  renderClusters(ctx, level.value, clusters.value);

  // Render moves
  if (showMoves.value && gameState.value === gameStates.ready) {
    renderMoves(ctx, level.value, moves.value);
  }
};

// Mouse swap handler
const mouseSwap = (c1: number, r1: number, c2: number, r2: number) => {
  if (gameOver.value) return; // Prevent moves when game is over

  currentMove.value = { column1: c1, row1: r1, column2: c2, row2: r2 };
  level.value.selectedTile.selected = false;
  animationState.value = 2;
  animationTime.value = 0;
  gameState.value = gameStates.resolve;
};

// Mouse event handlers
const onMouseMove = (e: MouseEvent) => {
  handleMouseMove(
    e,
    gameCanvas.value!,
    level.value,
    drag,
    gameOver.value,
    mouseSwap
  );
};

const onMouseDown = (e: MouseEvent) => {
  const mt = handleMouseDown(
    e,
    gameCanvas.value!,
    level.value,
    drag,
    gameOver.value
  );
  handleTileSelection(mt, level.value, mouseSwap);
};

const onMouseUp = () => {
  drag.value = false;
};

const onMouseOut = () => {
  drag.value = false;
};

// Expose methods to parent component
defineExpose({
  refreshMoves,
});

onMounted(async () => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext("2d");
    await init();
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

canvas {
  display: block;
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
  top: 40%;
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
</style>
