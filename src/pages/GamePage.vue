<template>
  <AppPage title="Match-3 Game">
    <div class="game-container">
      <div class="game-header">
        <div class="score">Score: {{ score }}</div>
      </div>
      <GameBoard ref="gameBoard" @match="handleMatch" />
      <div class="game-controls">
        <button class="control-button" @click="resetGame">Reset Board</button>
        <button class="control-button" @click="restartGame">
          Restart Game
        </button>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import GameBoard from "../components/game/GameBoard.vue";
import AppPage from "@/components/AppPage.vue";

const score = ref(0);
const gameBoard = ref<InstanceType<typeof GameBoard> | null>(null);

const handleMatch = (points: number) => {
  score.value += points;
};

const resetGame = () => {
  if (gameBoard.value) {
    gameBoard.value.initializeBoard();
  }
};

const restartGame = () => {
  score.value = 0;
  resetGame();
};
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 0 16px;
}

.game-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: var(--tg-theme-bg-color);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--tg-theme-text-color);
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
}

.control-button {
  padding: 8px 24px;
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
  opacity: 0.9;
}

.control-button:active {
  opacity: 0.8;
}
</style>
