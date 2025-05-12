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
          :class="{ 'boost-active': isShowMovesActive }"
          @click="activateBoostAction('showAvailableMoves')"
          :disabled="
            gameOver || isShowMovesActive || assets.showAvailableMoves === 0
          "
          aria-label="Show Hints"
        >
          <img :src="SmartIcon" alt="Hints" class="control-icon" />
          <span class="asset-count">{{ assets.showAvailableMoves }}</span>
          <span v-if="isShowMovesActive" class="boost-timer">{{
            showMovesSecondsLeft
          }}</span>
        </button>
        <button
          class="control-button"
          :class="{ 'boost-active': isAiAssistantActive }"
          @click="activateBoostAction('aiAssistant')"
          :disabled="
            gameOver || isAiAssistantActive || assets.aiAssistant === 0
          "
          aria-label="AI Assistant"
        >
          <img :src="RobotIcon" alt="AI Assistant" class="control-icon" />
          <span class="asset-count">{{ assets.aiAssistant }}</span>
          <span v-if="isAiAssistantActive" class="boost-timer">{{
            aiAssistantSecondsLeft
          }}</span>
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
import { onMounted, ref, computed, watch } from "vue";
import { useNavbarStore } from "@/stores/navbarStore";
import SmartIcon from "@/assets/smart.png";
import RobotIcon from "@/assets/robot.png";

const gameStore = useGameStore();
const userStore = useUserStore();
const navbarStore = useNavbarStore();

const { score, movesLeft, requiredScore, currentLevel, gameOver } =
  storeToRefs(gameStore);

const { assets, isShowMovesActive, isAiAssistantActive, activeBoosts } =
  storeToRefs(userStore);
const { updateShowMoves, updateAiBot, resetGame } = gameStore;

const { activateBoostAction, completeLevelAction } = userStore;
const { setActiveTab } = navbarStore;

// Timer for countdown
const now = ref(Date.now());
setInterval(() => (now.value = Date.now()), 500);

const showMovesSecondsLeft = computed(() => {
  const boost = activeBoosts.value?.showAvailableMoves;
  if (boost && boost.expiresAt > now.value) {
    return Math.ceil((boost.expiresAt - now.value) / 1000);
  }
  return 0;
});
const aiAssistantSecondsLeft = computed(() => {
  const boost = activeBoosts.value?.aiAssistant;
  if (boost && boost.expiresAt > now.value) {
    return Math.ceil((boost.expiresAt - now.value) / 1000);
  }
  return 0;
});

// Watch for showMoves boost
watch(isShowMovesActive, (active) => {
  if (active) {
    updateShowMoves(true);
  } else {
    updateShowMoves(false);
  }
});
// Watch for aiAssistant boost
watch(isAiAssistantActive, (active) => {
  if (active) {
    updateAiBot(true);
  } else {
    updateAiBot(false);
  }
});

// Ensure boosts are set on mount (for reloads)
onMounted(() => {
  updateShowMoves(!!isShowMovesActive.value);
  updateAiBot(!!isAiAssistantActive.value);
});

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
  resetGame();
};

// Handler for level complete event
const handleLevelComplete = (levelConfig: { id: number; reward?: number }) => {
  // Call completeLevelAction with level id and reward
  completeLevelAction({
    id: levelConfig.id,
    reward: levelConfig.reward || 0,
  });

  // Navigate to StartGamePage after 3 seconds
  setTimeout(() => {
    goToGamePage();
  }, 3000);
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: var(--color-primary-light);
  border-radius: 8px;
  border: 1.5px solid var(--color-card-border);
  box-shadow: 0 1px 4px var(--color-card-shadow);
  min-width: 44px;
  min-height: 44px;
  width: auto;
  height: 44px;
  transition: box-shadow 0.18s, background 0.18s, border 0.18s;
  cursor: pointer;
  gap: 7px;
}
.control-button:active {
  background: var(--color-primary-light);
}
.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.boost-active {
  border: 2.5px solid var(--color-primary);
  box-shadow: 0 0 8px 0 var(--color-primary-light),
    0 1px 4px var(--color-card-shadow);
  background: var(--color-primary-light);
}
.control-icon {
  width: 24px;
  height: 24px;
  display: block;
}
.asset-count {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-light);
  min-width: 18px;
  text-align: center;
  display: inline-block;
}
.boost-timer {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-left: 4px;
  min-width: 18px;
  display: inline-block;
}
</style>
