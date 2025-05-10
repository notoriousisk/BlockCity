import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Level, Cluster, Move, GameState } from "@/game/types";
import { gameStates } from "@/game/types";

export const useGameStore = defineStore("game", () => {
  // Game state
  const score = ref(0);
  const movesLeft = ref(0);
  const gameOver = ref(false);
  const gameResult = ref<"success" | "failure" | null>(null);
  const isReshuffling = ref(false);
  const showMoves = ref(false);
  const aiBot = ref(false);
  const gameState = ref<GameState>(gameStates.init);
  const animationState = ref(0);
  const animationTime = ref(0);
  const drag = ref(false);
  const clusters = ref<Cluster[]>([]);
  const moves = ref<Move[]>([]);
  const currentMove = ref<Move>({ column1: 0, row1: 0, column2: 0, row2: 0 });

  const currentLevel = ref();

  // Game level state
  const level = ref<Level>({
    columns: 0,
    rows: 0,
    tileWidth: 0,
    tileHeight: 0,
    tiles: [],
    selectedTile: { selected: false, column: 0, row: 0 },
    grid: [],
  });

  // Computed properties
  const requiredScore = computed(() => currentLevel.value?.requiredScore);
  const columns = computed(() => currentLevel.value?.columns);
  const rows = computed(() => currentLevel.value?.rows);
  const minMatchLength = computed(() => currentLevel.value?.minMatchLength);
  const colorsLimit = computed(() => currentLevel.value?.colorsLimit);
  const scoreMultiplier = computed(() => currentLevel.value?.scoreMultiplier);

  // Actions
  const resetGame = () => {
    score.value = 0;
    movesLeft.value = currentLevel.value.movesLimit;
    gameOver.value = false;
    gameResult.value = null;
    isReshuffling.value = false;
    gameState.value = gameStates.ready;
    animationState.value = 0;
    animationTime.value = 0;
    drag.value = false;
    clusters.value = [];
    moves.value = [];
    currentMove.value = { column1: 0, row1: 0, column2: 0, row2: 0 };
  };

  const updateScore = (scoreToAdd: number) => {
    score.value += scoreToAdd;
  };

  const decreaseMoves = () => {
    movesLeft.value--;
  };

  const setGameOver = (result: "success" | "failure") => {
    gameOver.value = true;
    gameResult.value = result;
  };

  const setReshuffling = (value: boolean) => {
    isReshuffling.value = value;
  };

  const setGameState = (state: GameState) => {
    gameState.value = state;
  };

  const setAnimationState = (state: number) => {
    animationState.value = state;
  };

  const setAnimationTime = (time: number) => {
    animationTime.value = time;
  };

  const setDrag = (value: boolean) => {
    drag.value = value;
  };

  const setClusters = (newClusters: Cluster[]) => {
    clusters.value = newClusters;
  };

  const setMoves = (newMoves: Move[]) => {
    moves.value = newMoves;
  };

  const setCurrentMove = (move: Move) => {
    currentMove.value = move;
  };

  const setLevel = (newLevel: Level) => {
    level.value = newLevel;
  };

  const toggleShowMoves = () => {
    showMoves.value = !showMoves.value;
  };

  const toggleAiBot = () => {
    aiBot.value = !aiBot.value;
  };

  return {
    // State
    score,
    movesLeft,
    gameOver,
    gameResult,
    isReshuffling,
    showMoves,
    aiBot,
    gameState,
    animationState,
    animationTime,
    drag,
    clusters,
    moves,
    currentMove,
    level,
    currentLevel,
    // Computed
    requiredScore,
    columns,
    rows,
    minMatchLength,
    colorsLimit,
    scoreMultiplier,
    // Actions
    resetGame,
    updateScore,
    decreaseMoves,
    setGameOver,
    setReshuffling,
    setGameState,
    setAnimationState,
    setAnimationTime,
    setDrag,
    setClusters,
    setMoves,
    setCurrentMove,
    setLevel,
    toggleShowMoves,
    toggleAiBot,
  };
});
