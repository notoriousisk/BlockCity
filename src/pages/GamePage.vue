<template>
  <AppPage title="Match-3 Game">
    <div class="game-container">
      <div class="game-header">
        <div class="score">Score: {{ score }}</div>
        <div class="required-score">Target: {{ requiredScore }}</div>
        <div class="moves">Moves left: {{ movesLeft }}</div>
      </div>
      <div class="game-board">
        <Match3Game
          :columns="8"
          :rows="8"
          :tileSize="40"
          @update:score="updateScore"
          @reset:score="resetScore"
        />
      </div>
      <div class="game-controls">
        <button class="control-button">Restart Game</button>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import Match3Game from "@/components/Match3Game.vue";
import { useGameStore } from "@/stores/gameStore";
import { computed, ref } from "vue";
import gameConfig from "@/config/gameBoard.json";

const gameStore = useGameStore();
const score = ref(0);
const movesLeft = computed(() => gameStore.movesLeft);
const requiredScore = computed(() => gameConfig.levels[0].requiredScore);

const updateScore = (scoreToAdd: number) => {
  score.value += scoreToAdd;
};

const resetScore = () => {
  score.value = 0;
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
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--tg-theme-bg-color);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--tg-theme-text-color);
}

.required-score {
  color: var(--tg-theme-hint-color);
}

.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
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
</style>
