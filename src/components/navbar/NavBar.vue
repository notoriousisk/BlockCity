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
  border-top: 1px solid var(--color-border);
  /* box-shadow: 0 -2px 4px var(--color-shadow); */
  z-index: 100;
  padding: 10px 0;
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
}

.nav-item.active .icon {
  stroke: var(--color-surface);
  transform: scale(1.1);
  transition: color 0.2s, transform 0.2s;
}
</style>
