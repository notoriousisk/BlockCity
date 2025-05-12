<template>
  <AppPage title="Home Page">
    <template #header>
      <div class="header-container">
        <LogoIcon class="game-logo" />
      </div>
    </template>
    <!-- Logo and City Card -->
    <div class="logo-card">
      <CityIcon class="city-image" />
    </div>
    <!-- Resource Bar -->
    <div class="resource-bar">
      <div class="resource-card">
        <img src="@/assets/coin.png" class="resource-bar-icon" alt="Coin" />
        <span class="resource-bar-value">{{ Math.floor(balance) }}</span>
      </div>
      <div class="resource-card">
        <img
          src="@/assets/lightning.png"
          class="resource-bar-icon"
          alt="Lightning"
        />
        <span class="resource-bar-value">{{ Math.floor(energy) }}/100</span>
      </div>
    </div>
    <!-- Play Button -->
    <div class="play-button-container">
      <button class="game-button" @click="goToGame">Play</button>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import AppPage from "@/components/AppPage.vue";
import CityIcon from "@/assets/city.svg";
import LogoIcon from "@/assets/logo.svg";
import { useUserStore } from "@/stores/userStore";
import { useNavbarStore } from "@/stores/navbarStore";

const userStore = useUserStore();
const navbarStore = useNavbarStore();

const { balance, energy } = storeToRefs(userStore);
const goToGame = () => {
  navbarStore.setActiveTab("game");
};
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;
}
.header-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0;
  background-color: #bbdff8;
}
.resource-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 32px 0;
}
.resource-card {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-card-bg);
  border-radius: 16px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 18px 24px;
  font-weight: 600;
  font-size: 1.25rem;
  gap: 12px;
  border: 1.5px solid var(--color-card-border);
}
.resource-bar-icon {
  width: 32px;
  height: 32px;
}
.resource-bar-value {
  font-size: 1.3rem;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  min-width: 0;
}

.play-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
.logo-card {
  background: var(--color-card-bg);
  border-radius: 24px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 32px 20px 20px 20px;
  margin-bottom: 32px;
  border: 1.5px solid var(--color-card-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.game-logo {
  width: 100%;
  max-width: 340px;
  height: auto;
  display: block;
}
.city-image {
  width: 100%;
  max-width: 440px;
  height: auto;
  object-fit: contain;
  display: block;
}
.game-button {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 56px;
  background-color: var(--color-button-primary);
  color: var(--color-button-text);
  border-radius: 999px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 1.6rem;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
</style>
