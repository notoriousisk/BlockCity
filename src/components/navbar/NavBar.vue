<script lang="ts"></script>

<script setup lang="ts">
import { useNavbarStore } from "@/stores/navbarStore";
import { storeToRefs } from "pinia";

const navbarStore = useNavbarStore();

const { navbarTabs, setActiveTab } = navbarStore;
const { activeTab } = storeToRefs(navbarStore);
</script>

<template>
  <nav class="bottom-nav">
    <div class="nav-container">
      <button
        v-for="tab in navbarTabs"
        :key="tab.name"
        class="nav-item"
        :class="{ active: activeTab === tab.name }"
        @click="setActiveTab(tab.name)"
      >
        <component :is="tab.icon" class="icon" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  bottom: 0;
  background-color: var(--color-primary);
  box-shadow: 0 -2px 20px 0 rgba(0, 0, 0, 0.6);
  z-index: 100;
  padding: 10px 0 20px;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-light);
  background: none;
  border: none;
  outline: none;
  transition: color 0.2s, transform 0.2s;
}

.nav-item .icon {
  width: 32px;
  height: 32px;
  stroke-width: 2;
}

.nav-item.active {
  color: var(--color-surface);
  position: relative;
}

.nav-item.active::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: var(--color-surface);
  border-radius: 2px;
}

.nav-item.active .icon {
  stroke: var(--color-surface);
  transform: scale(1.1);
  transition: color 0.2s, transform 0.2s;
}
</style>
