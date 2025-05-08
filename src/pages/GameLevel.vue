<template>
  <div class="game-page">
    <div class="corner-element level">Level {{ "1" }}</div>
    <div class="corner-element exit">
      <button class="exit-button" @click="goToGamePage">✕</button>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Match3Game from "@/components/Match3Game.vue";
import { useGameStore } from "@/stores/gameStore";
import { useRouter } from "vue-router";

const router = useRouter();
const gameStore = useGameStore();
const { score, movesLeft, requiredScore, columns, rows, level } =
  storeToRefs(gameStore);
const { updateScore, resetGame } = gameStore;

const goToGamePage = () => {
  router.push("/game");
};
</script>

<style scoped>
.game-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: top;
  padding: 10px;
  padding-top: 100px;
}

.corner-element {
  position: absolute;
  padding: 12px;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--tg-theme-text-color);
  background-color: var(--color-dark-accent);
  border-radius: 8px;
}

.level {
  top: 20px;
  left: 20px;
}

.exit {
  top: 20px;
  right: 20px;
}

.exit-button {
  background: none;
  border: none;
  color: var(--tg-theme-text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.exit-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.game-container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-dark-bg);
  border-radius: 8px;
  padding: 16px;
  max-width: 100%;
  height: fit-content;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.game-info-element {
  background-color: var(--color-dark-accent);
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--tg-theme-text-color);
  border-radius: 8px;
}
</style>
