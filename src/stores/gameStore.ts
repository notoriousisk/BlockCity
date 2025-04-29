import { defineStore } from "pinia";
import { ref } from "vue";
import boardConfig from "../config/gameBoard.json";

interface GamePiece {
  type: string;
  x: number;
  y: number;
}

export const useGameStore = defineStore("game", () => {
  // Game state
  const score = ref(0);
  const board = ref<GamePiece[]>([]);
  const selectedPiece = ref<number | null>(null);
  const isGameOver = ref(false);

  // Constants
  const BOARD_SIZE = 8;
  const PIECE_TYPES = ["red", "blue", "green", "yellow", "purple"];
  const MATCH_POINTS = 10;

  // Initialize the game board from the JSON configuration
  const initializeBoard = () => {
    const newBoard: GamePiece[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        newBoard.push({
          type: boardConfig.board[y][x],
          x,
          y,
        });
      }
    }
    board.value = newBoard;
    // Ensure no matches exist at the start
    while (findMatches().length > 0) {
      initializeBoard();
    }
  };

  // Check if two pieces are adjacent
  const isAdjacent = (index1: number, index2: number): boolean => {
    const piece1 = board.value[index1];
    const piece2 = board.value[index2];
    return (
      (Math.abs(piece1.x - piece2.x) === 1 && piece1.y === piece2.y) ||
      (Math.abs(piece1.y - piece2.y) === 1 && piece1.x === piece2.x)
    );
  };

  // Swap two pieces
  const swapPieces = (index1: number, index2: number) => {
    console.log("Swapping pieces:", {
      index1,
      index2,
      piece1: board.value[index1],
      piece2: board.value[index2],
    });

    // Swap the pieces
    const temp = { ...board.value[index1] };
    board.value[index1] = { ...board.value[index2] };
    board.value[index2] = temp;

    // Update coordinates
    board.value[index1].x = Math.floor(index1 % BOARD_SIZE);
    board.value[index1].y = Math.floor(index1 / BOARD_SIZE);
    board.value[index2].x = Math.floor(index2 % BOARD_SIZE);
    board.value[index2].y = Math.floor(index2 / BOARD_SIZE);

    console.log("After swap:", {
      piece1: board.value[index1],
      piece2: board.value[index2],
    });
  };

  // Find all matches on the board
  const findMatches = (): number[][] => {
    console.log("Checking for matches...");
    const matches: number[][] = [];
    const visited = new Set<number>();

    // Check horizontal matches
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE - 2; x++) {
        const index = y * BOARD_SIZE + x;
        if (visited.has(index)) continue;

        const type = board.value[index].type;
        if (!type) continue; // Skip empty cells

        let matchLength = 1;
        const currentMatch = [index];

        // Check to the right
        while (
          x + matchLength < BOARD_SIZE &&
          board.value[index + matchLength].type === type
        ) {
          currentMatch.push(index + matchLength);
          matchLength++;
        }

        if (matchLength >= 3) {
          console.log("Found horizontal match:", {
            y,
            x,
            type,
            matchLength,
            indices: currentMatch,
          });
          matches.push(currentMatch);
          currentMatch.forEach((i) => visited.add(i));
        }
      }
    }

    // Check vertical matches
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE - 2; y++) {
        const index = y * BOARD_SIZE + x;
        if (visited.has(index)) continue;

        const type = board.value[index].type;
        if (!type) continue; // Skip empty cells

        let matchLength = 1;
        const currentMatch = [index];

        // Check downward
        while (
          y + matchLength < BOARD_SIZE &&
          board.value[index + matchLength * BOARD_SIZE].type === type
        ) {
          currentMatch.push(index + matchLength * BOARD_SIZE);
          matchLength++;
        }

        if (matchLength >= 3) {
          console.log("Found vertical match:", {
            x,
            y,
            type,
            matchLength,
            indices: currentMatch,
          });
          matches.push(currentMatch);
          currentMatch.forEach((i) => visited.add(i));
        }
      }
    }

    console.log("Total matches found:", matches.length);
    return matches;
  };

  // Handle matches and update the board
  const handleMatches = (matches: number[][]): number => {
    // Calculate points
    const totalPoints = matches.reduce(
      (sum, match) => sum + match.length * MATCH_POINTS,
      0
    );
    score.value += totalPoints;

    // Remove matched pieces
    const matchedIndices = new Set(matches.flat());
    matchedIndices.forEach((index) => {
      board.value[index].type = "";
    });

    // Log board state after removing matches
    console.log("Board after removing matches:");
    logBoardState();

    // Drop pieces from above
    for (let x = 0; x < BOARD_SIZE; x++) {
      let emptySpaces = 0;
      for (let y = BOARD_SIZE - 1; y >= 0; y--) {
        const index = y * BOARD_SIZE + x;
        if (board.value[index].type === "") {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          const newIndex = (y + emptySpaces) * BOARD_SIZE + x;
          // Create a new piece object with updated coordinates
          board.value[newIndex] = {
            ...board.value[index],
            x: Math.floor(newIndex % BOARD_SIZE),
            y: Math.floor(newIndex / BOARD_SIZE),
          };
          board.value[index].type = "";
        }
      }
    }

    // Log board state after dropping pieces
    console.log("Board after dropping pieces:");
    logBoardState();

    // Fill empty spaces with new pieces
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const index = y * BOARD_SIZE + x;
        if (board.value[index].type === "") {
          board.value[index] = {
            type: PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)],
            x: Math.floor(index % BOARD_SIZE),
            y: Math.floor(index / BOARD_SIZE),
          };
        }
      }
    }

    // Check for new matches after filling
    const newMatches = findMatches();
    if (newMatches.length > 0) {
      console.log("Found new matches after filling, processing...");
      return handleMatches(newMatches);
    }

    // Log final board state after filling empty spaces
    console.log("Final board state after match processing:");
    logBoardState();

    return totalPoints;
  };

  // Log the entire board state
  const logBoardState = () => {
    const boardState = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board.value[y * BOARD_SIZE + x];
        row.push({ x, y, type: piece.type });
      }
      boardState.push(row);
    }
    console.log("Current Board State:", boardState);
  };

  // Handle piece selection and swapping
  const handlePieceClick = (index: number): number | null => {
    console.log("Piece clicked:", {
      index,
      piece: board.value[index],
      selectedPiece: selectedPiece.value,
    });

    // Log the entire board state
    logBoardState();

    if (selectedPiece.value === null) {
      selectedPiece.value = index;
      return null;
    } else {
      const sourceIndex = selectedPiece.value;
      const targetIndex = index;
      selectedPiece.value = null;

      // Check if the move is valid (adjacent)
      if (isAdjacent(sourceIndex, targetIndex)) {
        console.log("Attempting swap between adjacent pieces:", {
          sourceIndex,
          targetIndex,
          sourcePiece: board.value[sourceIndex],
          targetPiece: board.value[targetIndex],
        });

        swapPieces(sourceIndex, targetIndex);
        const matches = findMatches();

        if (matches.length === 0) {
          console.log("No matches found, swapping back");
          swapPieces(sourceIndex, targetIndex);
          return null;
        } else {
          console.log("Matches found, processing...");
          return handleMatches(matches);
        }
      } else {
        console.log("Pieces are not adjacent, ignoring swap");
      }
      return null;
    }
  };

  // Handle drag and drop
  const handleDrop = (
    sourceIndex: number,
    targetIndex: number
  ): number | null => {
    console.log("Drag and drop:", {
      sourceIndex,
      targetIndex,
      sourcePiece: board.value[sourceIndex],
      targetPiece: board.value[targetIndex],
    });

    // Log the entire board state before the swap
    logBoardState();

    if (sourceIndex !== targetIndex && isAdjacent(sourceIndex, targetIndex)) {
      swapPieces(sourceIndex, targetIndex);
      const matches = findMatches();
      if (matches.length === 0) {
        console.log("No matches found in drag and drop, swapping back");
        swapPieces(sourceIndex, targetIndex);
        return null;
      } else {
        console.log("Matches found in drag and drop, processing...");
        return handleMatches(matches);
      }
    } else {
      console.log("Invalid drag and drop - pieces not adjacent or same piece");
    }
    return null;
  };

  // Reset game state
  const resetGame = () => {
    score.value = 0;
    isGameOver.value = false;
    initializeBoard();
  };

  // Future backend functions
  const saveScore = async (score: number) => {
    // TODO: Implement score saving to backend
    console.log("Saving score:", score);
  };

  const loadBoard = async () => {
    // TODO: Implement board loading from backend
    console.log("Loading board from backend");
  };

  return {
    // State
    score,
    board,
    selectedPiece,
    isGameOver,
    BOARD_SIZE,
    PIECE_TYPES,

    // Actions
    initializeBoard,
    handlePieceClick,
    handleDrop,
    resetGame,
    saveScore,
    loadBoard,
  };
});
