<template>
  <div class="game-grid" :style="gridStyle">
    <Cell
      v-for="(piece, index) in gameStore.board"
      :key="`${piece.x}-${piece.y}-${piece.type}`"
      :type="piece.type"
      :x="piece.x"
      :y="piece.y"
      :is-selected="gameStore.selectedPiece === index"
      @click="handlePieceClick(index)"
      @dragstart="handleDragStart($event, index)"
      @drop="handleDrop($event, index)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useGameStore } from "../../stores/gameStore";
import Cell from "./ui/Cell.vue";

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

@media (max-width: 600px) {
  .game-grid {
    gap: 2px;
    padding: 4px;
  }
}
</style>
