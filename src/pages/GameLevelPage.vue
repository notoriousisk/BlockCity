<template>
  <div class="game-page" v-if="currentLevel">
    <div class="corner-element level">Level {{ currentLevel.index }}</div>
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
        v-if="currentLevel"
        :levelConfig="currentLevel"
        ref="gameRef"
        @levelcomplete="handleLevelComplete"
      />

      <div class="game-controls">
        <button class="control-button" @click="handleNewGame">New Game</button>
        <button
          class="control-button"
          @click="toggleShowMoves"
          :disabled="gameOver"
        >
          {{ showMoves ? "Hide" : "Show" }} Moves
        </button>
        <button
          class="control-button"
          @click="toggleAiBot"
          :disabled="gameOver"
        >
          {{ aiBot ? "Disable" : "Enable" }} AI Bot
        </button>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="corner-element exit">
      <button class="exit-button" @click="goToGamePage">✕</button>
    </div>
    Error loading game configuration...
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Match3Game from "@/components/Match3Game.vue";
import { useGameStore } from "@/stores/gameStore";
import { useUserStore } from "@/stores/userStore";
import { onMounted, ref } from "vue";
import { useNavbarStore } from "@/stores/navbarStore";

const gameStore = useGameStore();
const userStore = useUserStore();
const navbarStore = useNavbarStore();

const {
  score,
  movesLeft,
  requiredScore,
  currentLevel,
  gameOver,
  showMoves,
  aiBot,
} = storeToRefs(gameStore);

const { setActiveTab } = navbarStore;

// @ts-expect-error exists
if (window.Telegram) {
  // @ts-expect-error eee
  window.Telegram.WebApp.setHeaderColor("#ffffff");
}

// Type for the Match3Game component with its exposed methods
interface GameRef {
  restartGame: () => void;
  refreshMoves: () => void;
}

// Reference to the Match3Game component
const gameRef = ref<GameRef | null>(null);

const goToGamePage = () => {
  setActiveTab("game");
  gameStore.resetGame();
};

// Handler for level complete event
const handleLevelComplete = (levelConfig: { id: number; reward?: number }) => {
  // Call completeLevelAction with level id and reward
  userStore.completeLevelAction({
    id: levelConfig.id,
    reward: levelConfig.reward || 0,
  });

  // Navigate to StartGamePage after 3 seconds
  setTimeout(() => {
    goToGamePage();
  }, 3000);
};

// Button handlers
const handleNewGame = () => {
  if (gameRef.value) {
    gameRef.value.restartGame();
  }
};

const toggleShowMoves = () => {
  gameStore.toggleShowMoves();
  // Force a moves check when enabling
  if (showMoves.value && gameRef.value) {
    gameRef.value.refreshMoves();
  }
};

const toggleAiBot = () => {
  gameStore.toggleAiBot();
};

// Check if level config is available
onMounted(() => {
  if (!currentLevel.value) {
    // If no level config is available, go back to game page
    goToGamePage();
  }
});
</script>

<style scoped>
.game-page {
  position: relative;
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
  color: var(--color-light);
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
  color: var(--color-light);
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
  margin-bottom: 16px;
}

.game-info-element {
  background-color: var(--color-dark-accent);
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-light);
  border-radius: 8px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.control-button {
  padding: 8px 16px;
  background-color: var(--color-button-primary);
  color: var(--color-light);
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

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
