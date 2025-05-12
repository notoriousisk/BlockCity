<template>
  <AppPage title="Game">
    <div class="game-bg-inner">
      <button
        class="next-level-btn"
        @click="goToNextLevel"
        :disabled="!currentLevel || isLoading"
      >
        <template v-if="isLoading">Loading...</template>
        <template v-else>
          Next level {{ currentLevel?.index ?? "" }}
          <span class="energy-label">
            -{{ currentLevel?.energyCost ?? 10 }}
            <ZapIcon />
          </span>
        </template>
      </button>
    </div>
  </AppPage>
</template>
<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import { useRouter } from "vue-router";
import { Zap } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "@/stores/gameStore";
import { useUserStore } from "@/stores/userStore";
import { loadLevel } from "@/game/api";
import { useNavbarStore } from "@/stores/navbarStore";
const ZapIcon = Zap;
const router = useRouter();
const gameStore = useGameStore();
const userStore = useUserStore();
const { currentLevel } = storeToRefs(gameStore);
const { currentLevelId, energy } = storeToRefs(userStore);
const { spendEnergyAction } = userStore;
const isLoading = ref(true);

const navbarStore = useNavbarStore();

const { setActiveTab } = navbarStore;

// Fetch level config here instead of inside the Match3Game component
const fetchUserLevelConfig = async () => {
  try {
    isLoading.value = true;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Set the level config directly
    currentLevel.value = await loadLevel(currentLevelId.value);
    isLoading.value = false;
  } catch (error) {
    console.error("Error fetching level config:", error);
    isLoading.value = false;
  }
};

const goToNextLevel = async () => {
  if (currentLevel.value) {
    await spendEnergyAction(0);
    if (energy.value < currentLevel.value.energyCost) {
      setActiveTab("user");
    } else {
      // Pass the level config via router navigation
      await spendEnergyAction(currentLevel.value.energyCost);
      router.push({
        name: "GameLevel",
      });
    }
  }
};

onMounted(async () => {
  await fetchUserLevelConfig();
});
</script>
<style scoped>
/* Remove AppPage .content padding for this page */
:deep(.content) {
  padding: 0 !important;
}
:deep(.page) {
  max-width: none !important;
  margin: 0 !important;
}
html,
body,
.game-bg-inner {
  height: 100%;
  overflow: hidden;
}
body {
  overflow: hidden !important;
}
.game-bg-inner {
  background: url("@/assets/blockcity_background.webp") no-repeat top center;
  background-color: #27ba8a;
  background-size: contain;
  position: relative;
}
.next-level-btn {
  position: fixed;
  left: 50%;
  bottom: 160px;
  transform: translateX(-50%);
  padding: 20px 56px;
  font-size: 2rem;
  font-weight: bold;
  color: #fffeff;
  background: #8dcced;
  white-space: nowrap;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 24px;
}
.energy-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.2rem;
  font-weight: 600;
  margin-left: 18px;

  & > svg {
    width: 1.2em;
    height: 1.2em;
  }
}

.next-level-btn:hover {
  background: #7bc0e0;
  box-shadow: 0 12px 40px #8dccedcc, 0 2px 8px rgba(0, 0, 0, 0.15);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  z-index: 1001;
}
</style>
