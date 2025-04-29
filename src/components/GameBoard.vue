<template>
  <div class="game-grid" :style="gridStyle">
    <div
      v-for="(piece, index) in gameStore.board"
      :key="index"
      class="game-piece"
      :class="[piece.type, { selected: gameStore.selectedPiece === index }]"
      @click="handlePieceClick(index)"
      @dragstart="handleDragStart($event, index)"
      @dragover.prevent
      @drop="handleDrop($event, index)"
      draggable="true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useGameStore } from "../stores/gameStore";

const gameStore = useGameStore();

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gameStore.BOARD_SIZE}, 1fr)`,
  gridTemplateRows: `repeat(${gameStore.BOARD_SIZE}, 1fr)`,
}));

// Handle piece click
const handlePieceClick = (index: number) => {
  const points = gameStore.handlePieceClick(index);
  if (points !== null) {
    emit("match", points);
  }
};

// Handle drag and drop
const handleDragStart = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", index.toString());
  }
};

const handleDrop = (event: DragEvent, targetIndex: number) => {
  const sourceIndex = parseInt(
    event.dataTransfer?.getData("text/plain") || "0"
  );
  const points = gameStore.handleDrop(sourceIndex, targetIndex);
  if (points !== null) {
    emit("match", points);
  }
};

const emit = defineEmits<{
  (e: "match", points: number): void;
}>();

// Expose methods
defineExpose({
  initializeBoard: gameStore.initializeBoard,
});

onMounted(() => {
  gameStore.initializeBoard();
});
</script>

<style scoped>
.game-grid {
  display: grid;
  gap: 4px;
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--tg-theme-bg-color);
  padding: 8px;
  border-radius: 12px;
  touch-action: none;
}

.game-piece {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  position: relative;
  overflow: hidden;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.game-piece:hover {
  transform: scale(1.05);
}

.game-piece.selected {
  transform: scale(1.1);
  box-shadow: 0 0 10px var(--tg-theme-accent-text-color);
}

.game-piece.red {
  background-color: #ff5252;
}

.game-piece.blue {
  background-color: #4285f4;
}

.game-piece.green {
  background-color: #0f9d58;
}

.game-piece.yellow {
  background-color: #ffeb3b;
}

.game-piece.purple {
  background-color: #9c27b0;
}

@media (max-width: 600px) {
  .game-grid {
    gap: 2px;
    padding: 4px;
  }

  .game-piece {
    border-radius: 6px;
  }
}
</style>
