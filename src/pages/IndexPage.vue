<script setup lang="ts">
import AppPage from "@/components/AppPage.vue";
import CityIcon from "@/assets/city.svg";
import LogoIcon from "@/assets/logo.svg";
import { BadgeDollarSign, Zap } from "lucide-vue-next";
import { useUserStore } from "@/stores/userStore";
import { useNavbarStore } from "@/stores/navbarStore";

const userStore = useUserStore();
const navbarStore = useNavbarStore();

const goToGame = () => {
  navbarStore.setActiveTab("game");
};
</script>

<template>
  <AppPage title="Home Page" :back="false">
    <div class="game-section">
      <div class="image-container">
        <LogoIcon class="game-logo" />
        <CityIcon class="city-image" />
      </div>
      <div class="counters-row">
        <span class="money-badge">
          <BadgeDollarSign class="money-icon" />
          <span class="money-colon">:</span>
          <span class="money-amount">{{ Math.floor(userStore.balance) }}$</span>
        </span>
        <span class="energy-badge">
          <Zap class="energy-icon" />
          <span class="energy-colon">:</span>
          <span class="energy-amount"
            >{{ Math.floor(userStore.energy) }}/100</span
          >
        </span>
      </div>
      <button class="game-button" @click="goToGame">Play</button>
    </div>
  </AppPage>
</template>

<style scoped>
.game-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100vh - 140px);
  justify-content: flex-start;
  padding-top: 40px;
}

.counters-row {
  display: flex;
  flex-direction: row;
  gap: 18px;
  margin-bottom: 36px;

  align-items: center;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 999px;
  padding: 10px 28px 10px 18px;
  font-size: 1.6rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
}

.money-badge,
.energy-badge {
  display: flex;
  align-items: center;
  max-width: 220px;
}

.money-amount,
.energy-amount {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.money-badge {
  margin-bottom: 0;
}

.energy-badge {
  margin-bottom: 0;
}

.money-icon,
.energy-icon {
  width: 2.1rem;
  height: 2.1rem;
  min-width: 2.1rem;
  min-height: 2.1rem;
  stroke-width: 2.5;
}

.money-colon,
.energy-colon {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0 10px 0 2px;
  color: #1976d2;
}

.image-container {
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  align-items: center;
  justify-content: center;
  background-color: #bbdff8;
  border-radius: 32px;
  overflow: hidden;
}

.game-logo {
  width: 100%;
  max-width: 450px;
  height: auto;
  display: block;
}

.city-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.game-button {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 56px;
  background-color: #2196f3;
  color: white;
  border-radius: 999px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 1.6rem;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  margin-bottom: 32px;
  font-family: "Montserrat", "Segoe UI", Arial, sans-serif;
}

.game-button:hover {
  background-color: #1976d2;
}

.index-page__links {
  list-style: none;
  padding-left: 0;
}

.index-page__link {
  font-weight: bold;
  display: inline-flex;
  gap: 5px;
}

.index-page__link-item + .index-page__link-item {
  margin-top: 10px;
}

.index-page__link-icon {
  width: 20px;
  display: block;
}

.index-page__link-icon svg {
  display: block;
}
</style>
