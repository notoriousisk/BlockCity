import { ref } from "vue";
import { defineStore } from "pinia";

export const useGameStore = defineStore("game", () => {
  const score = ref(0);
  const movesLeft = ref(30);

  return { score, movesLeft };
});
