<template>
  <AppPage title="Game">
    <div class="game-bg-inner">
      <button class="next-level-btn" @click="goToNextLevel">
        Next level
        <span class="energy-label">
          -10
          <ZapIcon />
        </span>
      </button>
    </div>
  </AppPage>
</template>
<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import { useRouter } from "vue-router";
import { Zap } from "lucide-vue-next";

const ZapIcon = Zap;
const router = useRouter();
const goToNextLevel = () => {
  router.push({ name: "GameLevel" });
};
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
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}
body {
  overflow: hidden !important;
}
.game-bg-inner {
  min-height: 100vh;
  min-width: 100vw;
  background: url("@/assets/blockcity_background.webp") no-repeat top center;
  background-size: cover;
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
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1),
    0 4px 24px #8dcced99;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  z-index: 1000;
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
</style>
