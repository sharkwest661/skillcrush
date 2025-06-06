import { create } from "zustand";
import { SKILL_COLORS } from "../data/skills";

const BOARD_SIZE = 8;

export const useLearningStore = create((set, get) => ({
  // Board State
  board: [],
  selectedCell: null,
  matches: [],
  isAnimating: false,
  score: 0,
  combo: 0,
  floatingTexts: [],

  // Game Session Stats
  session: {
    matchesFound: 0,
    skillPointsEarned: {},
    timeStarted: null,
    bestCombo: 0,
  },

  // Initialize board with random colors
  initializeBoard: () => {
    const newBoard = Array(BOARD_SIZE)
      .fill()
      .map(() =>
        Array(BOARD_SIZE)
          .fill()
          .map(
            () => SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)]
          )
      );

    set({
      board: newBoard,
      score: 0,
      combo: 0,
      session: {
        matchesFound: 0,
        skillPointsEarned: {},
        timeStarted: Date.now(),
        bestCombo: 0,
      },
    });
  },

  // Create a random board
  createRandomBoard: () => {
    return Array(BOARD_SIZE)
      .fill()
      .map(() =>
        Array(BOARD_SIZE)
          .fill()
          .map(
            () => SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)]
          )
      );
  },

  // Cell selection and swapping
  selectCell: (row, col) =>
    set((state) => {
      if (state.isAnimating) return state;

      if (!state.selectedCell) {
        return { selectedCell: [row, col] };
      }

      const [selectedRow, selectedCol] = state.selectedCell;

      // Check if clicking the same cell (deselect)
      if (selectedRow === row && selectedCol === col) {
        return { selectedCell: null };
      }

      // Check if adjacent
      const isAdjacent =
        Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1;

      if (isAdjacent) {
        // Perform swap and check for matches
        const newBoard = state.board.map((r) => [...r]);
        const temp = newBoard[row][col];
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = temp;

        const testMatches = get().findMatches(newBoard);

        if (testMatches.length > 0) {
          // Valid move - update board and find matches
          return {
            board: newBoard,
            selectedCell: null,
            combo: 0, // Reset combo for new move
          };
        } else {
          // Invalid move
          get().addFloatingText("No matches!", "error", 400, 300);
          return { selectedCell: null };
        }
      }

      // Select new cell if not adjacent
      return { selectedCell: [row, col] };
    }),

  // Find matches on the board
  findMatches: (currentBoard) => {
    const matches = [];

    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        if (
          currentBoard[row][col]?.id === currentBoard[row][col + 1]?.id &&
          currentBoard[row][col]?.id === currentBoard[row][col + 2]?.id
        ) {
          const matchLength = get().getMatchLength(
            currentBoard,
            row,
            col,
            0,
            1
          );
          for (let i = 0; i < matchLength; i++) {
            matches.push([row, col + i]);
          }
        }
      }
    }

    // Check vertical matches
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (
          currentBoard[row][col]?.id === currentBoard[row + 1][col]?.id &&
          currentBoard[row][col]?.id === currentBoard[row + 2][col]?.id
        ) {
          const matchLength = get().getMatchLength(
            currentBoard,
            row,
            col,
            1,
            0
          );
          for (let i = 0; i < matchLength; i++) {
            matches.push([row + i, col]);
          }
        }
      }
    }

    // Remove duplicates
    return [...new Set(matches.map((m) => `${m[0]},${m[1]}`))].map((m) =>
      m.split(",").map(Number)
    );
  },

  // Get length of a match in a specific direction
  getMatchLength: (board, startRow, startCol, rowDir, colDir) => {
    const color = board[startRow][startCol]?.id;
    let length = 1;
    let row = startRow + rowDir;
    let col = startCol + colDir;

    while (
      row >= 0 &&
      row < BOARD_SIZE &&
      col >= 0 &&
      col < BOARD_SIZE &&
      board[row][col]?.id === color
    ) {
      length++;
      row += rowDir;
      col += colDir;
    }

    return length;
  },

  // Process matches and update score
  processMatches: (matchPositions) =>
    set((state) => {
      if (matchPositions.length === 0) return state;

      const colorCounts = {};

      // Count colors in matches
      matchPositions.forEach(([row, col]) => {
        const color = state.board[row][col];
        if (color) {
          colorCounts[color.id] = (colorCounts[color.id] || 0) + 1;
        }
      });

      // Calculate score and combo
      const baseScore = matchPositions.length * 10;
      const comboBonus = state.combo * 5;
      const totalScore = baseScore + comboBonus;
      const newCombo = state.combo + 1;

      // Update session stats
      const newSession = { ...state.session };
      newSession.matchesFound += 1;
      newSession.bestCombo = Math.max(newSession.bestCombo, newCombo);

      // NEW SKILL POINT SYSTEM: 1 skill point per combo (3+ match)
      // Award 1 skill point to the most common color in the match
      if (matchPositions.length >= 3) {
        // Find the color that appears most in this match
        let mostCommonColor = null;
        let maxCount = 0;

        Object.entries(colorCounts).forEach(([colorId, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommonColor = colorId;
          }
        });

        // Award 1 skill point to the most common color
        if (mostCommonColor) {
          newSession.skillPointsEarned[mostCommonColor] =
            (newSession.skillPointsEarned[mostCommonColor] || 0) + 1;

          // Show floating text for skill point gained
          get().addFloatingText(`+1 Skill Point!`, "skill", 300, 180);
        }
      }

      // Add floating texts for visual feedback
      get().addFloatingText(`+${totalScore}`, "score", 300, 100);
      if (newCombo > 1) {
        get().addFloatingText(`${newCombo}x Combo!`, "combo", 300, 150);
      }

      return {
        matches: matchPositions,
        isAnimating: true,
        score: state.score + totalScore,
        combo: newCombo,
        session: newSession,
      };
    }),

  // Remove matches and drop new pieces
  removeMatches: () =>
    set((state) => {
      if (state.matches.length === 0) return state;

      const newBoard = state.board.map((row) => [...row]);
      const colorCounts = {};

      // Count and remove matched pieces
      state.matches.forEach(([row, col]) => {
        const color = newBoard[row][col];
        if (color) {
          colorCounts[color.id] = (colorCounts[color.id] || 0) + 1;
          newBoard[row][col] = null;
        }
      });

      // Drop existing pieces down
      for (let col = 0; col < BOARD_SIZE; col++) {
        let writeIndex = BOARD_SIZE - 1;
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          if (newBoard[row][col] !== null) {
            newBoard[writeIndex][col] = newBoard[row][col];
            if (writeIndex !== row) {
              newBoard[row][col] = null;
            }
            writeIndex--;
          }
        }

        // Fill empty spaces with new pieces
        for (let row = writeIndex; row >= 0; row--) {
          newBoard[row][col] =
            SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
        }
      }

      return {
        board: newBoard,
        matches: [],
        isAnimating: false,
      };
    }),

  // Add floating text for visual feedback
  addFloatingText: (text, type, x = 300, y = 200) =>
    set((state) => {
      const id = Date.now() + Math.random();
      const newText = {
        id,
        text,
        type,
        x: x + (Math.random() - 0.5) * 100, // Add some randomness
        y: y + (Math.random() - 0.5) * 50,
        opacity: 1,
        timestamp: Date.now(),
      };

      return {
        floatingTexts: [...state.floatingTexts, newText],
      };
    }),

  // Remove floating text
  removeFloatingText: (id) =>
    set((state) => ({
      floatingTexts: state.floatingTexts.filter((t) => t.id !== id),
    })),

  // Clean up old floating texts
  cleanupFloatingTexts: () =>
    set((state) => {
      const now = Date.now();
      return {
        floatingTexts: state.floatingTexts.filter(
          (t) => now - t.timestamp < 2000
        ),
      };
    }),

  // Check if a cell is matched
  isMatched: (row, col) => {
    return get().matches.some(([r, c]) => r === row && c === col);
  },

  // End learning session and award skill points
  endSession: () => {
    const { session } = get();
    const gameStore = window.__gameStore || (() => {}); // Will be properly injected

    // Award skill points to main game store
    Object.entries(session.skillPointsEarned).forEach(([colorId, points]) => {
      if (points > 0 && gameStore.addSkillPoints) {
        gameStore.addSkillPoints(colorId, points);
      }
    });

    // Award XP based on performance
    const sessionXP = Math.floor(session.matchesFound * 2 + session.bestCombo);
    if (gameStore.addXP && sessionXP > 0) {
      gameStore.addXP(sessionXP);
    }

    // Reset session
    set({
      session: {
        matchesFound: 0,
        skillPointsEarned: {},
        timeStarted: null,
        bestCombo: 0,
      },
    });
  },

  // Reset board and game state
  resetGame: () => {
    get().initializeBoard();
  },
}));
