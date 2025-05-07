<template>
  <AppPage title="Match-3 Game">
    <div class="game-container">
      <div class="game-header">
        <div class="game-info-element">
          <span>Score:</span>
          <span> {{ score }}</span>
        </div>
        <div class="game-info-element">Target: {{ requiredScore }}</div>
        <div class="game-info-element">
          <span>Moves:</span>
          <span>{{ movesLeft }}</span>
        </div>
      </div>
      <Match3Game
        :columns="columns"
        :rows="rows"
        :tileSize="40"
        @update:score="updateScore"
        @reset:score="resetGame"
      />
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import AppPage from "@/components/AppPage.vue";
import Match3Game from "@/components/Match3Game.vue";
import { useGameStore } from "@/stores/gameStore";

const gameStore = useGameStore();
const { score, movesLeft, requiredScore, columns, rows } =
  storeToRefs(gameStore);
const { updateScore, resetGame } = gameStore;
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-dark-bg);
  border-radius: 8px;
  padding: 16px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.game-info-element {
  background-color: var(--color-dark-accent);
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--tg-theme-text-color);
  border-radius: 8px;
  width: 160px;
}
</style>
