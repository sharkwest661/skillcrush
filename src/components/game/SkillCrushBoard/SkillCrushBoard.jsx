import React, { useEffect, useCallback } from "react";
import { useLearningStore } from "../../../stores/learningStore";
import styles from "./SkillCrushBoard.module.scss";

const BOARD_SIZE = 8;

const SkillCrushBoard = () => {
  const {
    board,
    selectedCell,
    matches,
    isAnimating,
    selectCell,
    findMatches,
    processMatches,
    removeMatches,
    isMatched,
    addFloatingText,
  } = useLearningStore();

  // Check for matches after board changes
  useEffect(() => {
    if (!isAnimating && board.length > 0) {
      const currentMatches = findMatches(board);
      if (currentMatches.length > 0) {
        setTimeout(() => {
          processMatches(currentMatches);
          setTimeout(() => {
            removeMatches();
          }, 800);
        }, 300);
      }
    }
  }, [board, findMatches, processMatches, removeMatches, isAnimating]);

  // Handle cell click with animation feedback
  const handleCellClick = useCallback(
    (row, col) => {
      if (isAnimating) return;

      // Add click animation
      const cellElement = document.querySelector(`[data-cell="${row}-${col}"]`);
      if (cellElement) {
        cellElement.classList.add(styles.cellClick);
        setTimeout(() => {
          cellElement.classList.remove(styles.cellClick);
        }, 200);
      }

      // If no cell selected, select this one
      if (!selectedCell) {
        selectCell(row, col);
        return;
      }

      const [selectedRow, selectedCol] = selectedCell;

      // If clicking same cell, deselect
      if (selectedRow === row && selectedCol === col) {
        selectCell(row, col);
        return;
      }

      // Check if adjacent
      const isAdjacent =
        Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1;

      if (isAdjacent) {
        // Test swap to see if it creates matches
        const testBoard = board.map((r) => [...r]);
        const temp = testBoard[row][col];
        testBoard[row][col] = testBoard[selectedRow][selectedCol];
        testBoard[selectedRow][selectedCol] = temp;

        const testMatches = findMatches(testBoard);

        if (testMatches.length > 0) {
          // Valid move - perform swap
          selectCell(row, col);
        } else {
          // Invalid move - show feedback
          addFloatingText(
            "No matches!",
            "error",
            col * 60 + 300,
            row * 60 + 200
          );

          // Shake animation for invalid move
          if (cellElement) {
            cellElement.classList.add(styles.cellInvalid);
            setTimeout(() => {
              cellElement.classList.remove(styles.cellInvalid);
            }, 600);
          }

          // Deselect
          selectCell(selectedRow, selectedCol);
        }
      } else {
        // Select new cell
        selectCell(row, col);
      }
    },
    [isAnimating, selectedCell, selectCell, board, findMatches, addFloatingText]
  );

  // Get cell style classes
  const getCellClasses = (row, col) => {
    const classes = [styles.cell];

    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      classes.push(styles.cellSelected);
    }

    if (isMatched(row, col)) {
      classes.push(styles.cellMatched);
    }

    return classes.join(" ");
  };

  // Show loading state if board is not initialized
  if (!board || board.length === 0) {
    return (
      <div className={styles.boardContainer}>
        <div className={styles.loadingBoard}>
          <div className={styles.loadingSpinner}>🎮</div>
          <p>Initializing SkillCrush board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.boardContainer}>
      <div className={styles.board}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              data-cell={`${rowIndex}-${colIndex}`}
              className={getCellClasses(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                backgroundColor: cell?.color || "#f0f0f0",
                "--cell-row": rowIndex,
                "--cell-col": colIndex,
              }}
              disabled={isAnimating}
              title={`${cell?.skill} Skill`}
            >
              <span className={styles.cellEmoji}>{cell?.emoji}</span>
              <span className={styles.cellGlow}></span>
            </button>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <p>
          {selectedCell
            ? "🎯 Click an adjacent cell to swap and create matches!"
            : "👆 Click a skill gem to select it!"}
        </p>
        <div className={styles.instructionTips}>
          <span>💡 Match 3+ gems of the same skill to earn points</span>
          <span>🔥 Longer matches give bonus points</span>
          <span>⚡ Create combos for extra rewards</span>
        </div>
      </div>
    </div>
  );
};

export default SkillCrushBoard;
