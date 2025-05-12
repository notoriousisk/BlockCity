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
        <button
          class="control-button"
          @click="toggleShowMoves"
          :disabled="gameOver"
          aria-label="Show Hints"
        >
          <img :src="SmartIcon" alt="Hints" class="control-icon" />
          <span class="asset-count">{{ assets.showAvailableMoves }}</span>
        </button>
        <button
          class="control-button"
          @click="toggleAiBot"
          :disabled="gameOver"
          aria-label="AI Assistant"
        >
          <img :src="RobotIcon" alt="AI Assistant" class="control-icon" />
          <span class="asset-count">{{ assets.aiAssistant }}</span>
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
import SmartIcon from "@/assets/smart.png";
import RobotIcon from "@/assets/robot.png";

const gameStore = useGameStore();
const userStore = useUserStore();
const navbarStore = useNavbarStore();

const { score, movesLeft, requiredScore, currentLevel, gameOver, showMoves } =
  storeToRefs(gameStore);

const { assets } = storeToRefs(userStore);
const { setActiveTab } = navbarStore;

// @ts-expect-error exists
if (window.Telegram) {
  // @ts-expect-error eee
  window.Telegram.WebApp.setHeaderColor("#f9fafb");
}

// Type for the Match3Game component with its exposed methods
interface GameRef {
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
  justify-content: space-around;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  opacity: 0.8;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.asset-count {
  margin-left: 7px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-light);
  min-width: 18px;
  text-align: center;
  display: inline-block;
}
</style>
