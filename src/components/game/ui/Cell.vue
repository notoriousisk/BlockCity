<template>
  <div
    class="game-piece"
    :class="[type, { selected: isSelected }]"
    @click="$emit('click')"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
    draggable="true"
  >
    <div class="coordinates">{{ x }},{{ y }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  type: string;
  x: number;
  y: number;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "dragstart", event: DragEvent): void;
  (e: "drop", event: DragEvent): void;
}>();

const handleDragStart = (event: DragEvent) => {
  emit("dragstart", event);
};

const handleDrop = (event: DragEvent) => {
  emit("drop", event);
};
</script>

<style scoped>
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
  display: flex;
  justify-content: center;
  align-items: center;
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

.coordinates {
  font-size: 0.6rem;
  color: rgba(0, 0, 0, 0.5);
  font-weight: bold;
  text-shadow: 0 0 2px white;
}

@media (max-width: 600px) {
  .game-piece {
    border-radius: 6px;
  }

  .coordinates {
    font-size: 0.5rem;
  }
}
</style>
