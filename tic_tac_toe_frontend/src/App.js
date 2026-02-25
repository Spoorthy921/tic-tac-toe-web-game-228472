import React, { useMemo, useState } from "react";
import "./App.css";

const PLAYER_X = "X";
const PLAYER_O = "O";

/**
 * Returns winner info if there is a winner, otherwise null.
 * @param {Array<("X"|"O"|null)>} squares
 * @returns {{winner: "X"|"O", line: number[]} | null}
 */
function calculateWinner(squares) {
  const lines = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return { winner: v, line: [a, b, c] };
    }
  }
  return null;
}

/**
 * @param {Array<("X"|"O"|null)>} squares
 * @returns {boolean}
 */
function isBoardFull(squares) {
  return squares.every((s) => s !== null);
}

// PUBLIC_INTERFACE
function App() {
  /** squares: Array of 9 null/X/O */
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const winnerInfo = useMemo(() => calculateWinner(squares), [squares]);
  const winner = winnerInfo?.winner ?? null;
  const winningLine = winnerInfo?.line ?? [];
  const isDraw = !winner && isBoardFull(squares);

  const currentPlayer = isXNext ? PLAYER_X : PLAYER_O;

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw!";
    return `Next player: ${currentPlayer}`;
  }, [winner, isDraw, currentPlayer]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    /** Ignore clicks if game is over or square is occupied */
    if (winner || squares[index]) return;

    setSquares((prev) => {
      const next = [...prev];
      next[index] = currentPlayer;
      return next;
    });
    setIsXNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
  }

  // PUBLIC_INTERFACE
  function handleKeyDownOnSquare(e, index) {
    /** Make squares keyboard-activatable (Enter/Space) */
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSquareClick(index);
    }
  }

  return (
    <div className="App">
      <main className="ttt-page">
        <header className="ttt-header">
          <p className="ttt-kicker">Retro Arcade Edition</p>
          <h1 className="ttt-title">Tic-Tac-Toe</h1>
          <p className="ttt-subtitle">Local 2-player • X starts • First to 3-in-a-row wins</p>
        </header>

        <section className="ttt-boardWrap" aria-label="Tic-Tac-Toe game">
          <div
            className="ttt-board"
            role="grid"
            aria-label="Tic-Tac-Toe board"
            aria-describedby="game-status"
          >
            {squares.map((value, idx) => {
              const isWinning = winningLine.includes(idx);
              const isDisabled = Boolean(winner) || Boolean(value);

              return (
                <button
                  key={idx}
                  type="button"
                  className={[
                    "ttt-square",
                    value ? `is-${value}` : "",
                    isWinning ? "is-winning" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSquareClick(idx)}
                  onKeyDown={(e) => handleKeyDownOnSquare(e, idx)}
                  role="gridcell"
                  aria-label={`Square ${idx + 1}${value ? `: ${value}` : ""}`}
                  aria-disabled={isDisabled ? "true" : "false"}
                >
                  <span className="ttt-squareInner" aria-hidden="true">
                    {value ?? ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ttt-panel" aria-label="Game status and controls">
            <div className="ttt-status" id="game-status" role="status" aria-live="polite">
              {statusText}
            </div>

            <div className="ttt-controls">
              <button type="button" className="ttt-btn ttt-btnPrimary" onClick={handleReset}>
                New game / Reset
              </button>
              <div className="ttt-hint">
                Tip: Use <kbd>Tab</kbd> then <kbd>Enter</kbd>/<kbd>Space</kbd> to play.
              </div>
            </div>
          </div>
        </section>

        <footer className="ttt-footer">
          <small>Made with React • No ads • No tracking</small>
        </footer>
      </main>
    </div>
  );
}

export default App;
