import type { Level, Cluster, Move, GameState } from "@/game/types";
import { gameStates } from "@/game/types";
import { createLevel, reshuffleBoard, shiftTiles, swapTiles } from "./board";
import { findClusters, removeClusters } from "./clusters";
import { findMoves } from "./moves";

// Flag to track if the current match chain was initiated by a user swap
let isUserInitiatedMatchChain = false;

/**
 * Initialize a new game
 */
export function newGame(
  level: Level,
  grid: number[],
  gameState: { value: GameState },
  setReshuffling: (value: boolean) => void,
  setClusters: (clusters: Cluster[]) => void,
  setMoves: (moves: Move[]) => void
): void {
  // Reset user-initiated match flag
  isUserInitiatedMatchChain = false;

  gameState.value = gameStates.ready;
  createLevel(level, grid);
  const moves = findMoves(level, 3);
  setMoves(moves);
  const clusters = findClusters(level, 3);
  setClusters(clusters);
}

/**
 * Update game state
 */
export function updateGame(
  dt: number,
  gameState: { value: GameState },
  animationState: { value: number },
  animationTime: { value: number },
  animationTimeTotal: number,
  level: Level,
  moves: Move[],
  currentMove: Move,
  clusters: Cluster[],
  minMatchLength: number,
  colorsLimit: number,
  setReshuffling: (value: boolean) => void,
  setClusters: (clusters: Cluster[]) => void,
  setMoves: (moves: Move[]) => void,
  updateScore: (scoreToAdd: number) => void,
  decreaseMoves: () => void,
  setGameOver: (result: "success" | "failure") => void,
  scoreMultiplier: number,
  requiredScore: number,
  score: number,
  movesLeft: number,
  gameOver: boolean,
  aiBot: boolean
): void {
  if (gameOver) return;

  if (gameState.value === gameStates.ready) {
    if (moves.length <= 0) {
      console.log("No moves available, initiating reshuffle...");
      setReshuffling(true);

      // Reset user-initiated match flag for reshuffling
      isUserInitiatedMatchChain = false;

      // Reshuffle the board if no moves are available
      reshuffleBoard(level);
      const newMoves = findMoves(level, minMatchLength);
      setMoves(newMoves);
      // If still no moves after reshuffle, reshuffle again
      let reshuffleCount = 1;
      while (newMoves.length <= 0) {
        console.log(
          `No moves after reshuffle #${reshuffleCount}, reshuffling again...`
        );
        reshuffleBoard(level);
        const moreNewMoves = findMoves(level, minMatchLength);
        setMoves(moreNewMoves);
        reshuffleCount++;
      }
      console.log(
        `Board successfully reshuffled after ${reshuffleCount} attempts`
      );

      // Hide the reshuffling message after 1 second
      setTimeout(() => {
        setReshuffling(false);
      }, 1000);

      return;
    }

    if (aiBot) {
      handleAiBotMove(
        dt,
        animationTime,
        animationTimeTotal,
        level,
        moves,
        currentMove,
        gameState,
        animationState
      );
    }

    return;
  }

  if (gameState.value === gameStates.resolve) {
    animationTime.value += dt;
    if (animationTime.value <= animationTimeTotal) return;

    switch (animationState.value) {
      case 0:
        handleClusterResolution(
          level,
          clusters,
          setClusters,
          findClusters,
          minMatchLength,
          removeClusters,
          animationState,
          animationTime,
          gameState,
          updateScore,
          decreaseMoves,
          setGameOver,
          scoreMultiplier,
          requiredScore,
          score,
          movesLeft,
          findMoves,
          setMoves
        );
        break;
      case 1:
        handleTileShifting(
          level,
          colorsLimit,
          setClusters,
          findClusters,
          minMatchLength,
          animationState,
          animationTime,
          gameState,
          findMoves,
          setMoves,
          updateScore,
          setGameOver,
          scoreMultiplier,
          requiredScore,
          score,
          movesLeft
        );
        break;
      case 2:
        handleSwapAnimation(
          level,
          currentMove,
          setClusters,
          findClusters,
          minMatchLength,
          animationState,
          animationTime,
          gameState,
          findMoves,
          setMoves
        );
        break;
      case 3:
        handleRewindSwap(level, currentMove, gameState);
        break;
    }
  }
}

/**
 * Handle AI bot moves
 */
function handleAiBotMove(
  dt: number,
  animationTime: { value: number },
  animationTimeTotal: number,
  level: Level,
  moves: Move[],
  currentMove: Move,
  gameState: { value: GameState },
  animationState: { value: number }
): void {
  animationTime.value += dt;
  if (animationTime.value > animationTimeTotal) {
    if (moves.length > 0) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      currentMove.column1 = move.column1;
      currentMove.row1 = move.row1;
      currentMove.column2 = move.column2;
      currentMove.row2 = move.row2;

      // AI bot moves should also count as user-initiated for move counting purposes
      isUserInitiatedMatchChain = true;

      animationState.value = 2;
      animationTime.value = 0;
      gameState.value = gameStates.resolve;
    }
    animationTime.value = 0;
  }
}

/**
 * Handle cluster resolution
 */
function handleClusterResolution(
  level: Level,
  clusters: Cluster[],
  setClusters: (clusters: Cluster[]) => void,
  findClustersFunc: (level: Level, minMatchLength: number) => Cluster[],
  minMatchLength: number,
  removeClustersFunc: (level: Level, clusters: Cluster[]) => void,
  animationState: { value: number },
  animationTime: { value: number },
  gameState: { value: GameState },
  updateScore: (scoreToAdd: number) => void,
  decreaseMoves: () => void,
  setGameOver: (result: "success" | "failure") => void,
  scoreMultiplier: number,
  requiredScore: number,
  score: number,
  movesLeft: number,
  findMovesFunc: (level: Level, minMatchLength: number) => Move[],
  setMoves: (moves: Move[]) => void
): void {
  const newClusters = findClustersFunc(level, minMatchLength);
  setClusters(newClusters);

  if (newClusters.length > 0) {
    // There are still matches to process
    let scoreToAdd = 0;
    for (const cluster of newClusters) {
      scoreToAdd += scoreMultiplier * (cluster.length - 2);
    }

    // Add score before checking for win condition
    updateScore(scoreToAdd);

    // Check if we've reached the target score with this match
    if (score + scoreToAdd >= requiredScore) {
      // Target score reached, player wins even if out of moves
      setGameOver("success");
      return;
    }

    // Only decrease moves if this is a user-initiated match chain
    // and it's the first match in the chain
    if (isUserInitiatedMatchChain) {
      decreaseMoves();
      // Set the flag to false so we don't decrease moves again for cascade matches
      isUserInitiatedMatchChain = false;
    }

    // Remove clusters and prepare for next animation step
    removeClustersFunc(level, newClusters);
    animationState.value = 1;
  } else {
    // No more clusters - now we can check if the game is over

    // Check if required score is reached
    if (score >= requiredScore) {
      setGameOver("success");
      return;
    }

    // Only now check if out of moves - after all cascades are processed
    if (movesLeft <= 0) {
      setGameOver("failure");
      return;
    }

    gameState.value = gameStates.ready;
    // Recalculate moves after resolution
    const newMoves = findMovesFunc(level, minMatchLength);
    setMoves(newMoves);
  }
  animationTime.value = 0;
}

/**
 * Handle tile shifting
 */
function handleTileShifting(
  level: Level,
  colorsLimit: number,
  setClusters: (clusters: Cluster[]) => void,
  findClustersFunc: (level: Level, minMatchLength: number) => Cluster[],
  minMatchLength: number,
  animationState: { value: number },
  animationTime: { value: number },
  gameState: { value: GameState },
  findMovesFunc: (level: Level, minMatchLength: number) => Move[],
  setMoves: (moves: Move[]) => void,
  updateScore: (scoreToAdd: number) => void,
  setGameOver: (result: "success" | "failure") => void,
  scoreMultiplier: number,
  requiredScore: number,
  score: number,
  movesLeft: number
): void {
  shiftTiles(level, colorsLimit);
  animationState.value = 0;
  animationTime.value = 0;

  const newClusters = findClustersFunc(level, minMatchLength);
  setClusters(newClusters);

  if (newClusters.length <= 0) {
    // No more clusters forming - check for win/loss condition

    // Check if required score is reached
    if (score >= requiredScore) {
      setGameOver("success");
      return;
    }

    // Check if out of moves only when cascades are done
    if (movesLeft <= 0) {
      setGameOver("failure");
      return;
    }

    gameState.value = gameStates.ready;
    // Recalculate moves after shifting
    const newMoves = findMovesFunc(level, minMatchLength);
    setMoves(newMoves);
  }
}

/**
 * Handle swap animation
 */
function handleSwapAnimation(
  level: Level,
  currentMove: Move,
  setClusters: (clusters: Cluster[]) => void,
  findClustersFunc: (level: Level, minMatchLength: number) => Cluster[],
  minMatchLength: number,
  animationState: { value: number },
  animationTime: { value: number },
  gameState: { value: GameState },
  findMovesFunc: (level: Level, minMatchLength: number) => Move[],
  setMoves: (moves: Move[]) => void
): void {
  swapTiles(
    level,
    currentMove.column1,
    currentMove.row1,
    currentMove.column2,
    currentMove.row2
  );

  const newClusters = findClustersFunc(level, minMatchLength);
  setClusters(newClusters);

  if (newClusters.length > 0) {
    // Set flag to true as this is a user-initiated match
    isUserInitiatedMatchChain = true;

    animationState.value = 0;
    animationTime.value = 0;
    gameState.value = gameStates.resolve;
  } else {
    animationState.value = 3;
    animationTime.value = 0;
  }

  const newMoves = findMovesFunc(level, minMatchLength);
  setMoves(newMoves);
}

/**
 * Handle rewind swap
 */
function handleRewindSwap(
  level: Level,
  currentMove: Move,
  gameState: { value: GameState }
): void {
  swapTiles(
    level,
    currentMove.column1,
    currentMove.row1,
    currentMove.column2,
    currentMove.row2
  );
  gameState.value = gameStates.ready;
}
