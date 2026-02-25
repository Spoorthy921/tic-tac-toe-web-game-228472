import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function getSquare(n) {
  // Squares are labeled: "Square 1" ... "Square 9", and become "Square N: X/O" after a move.
  return screen.getByRole("button", { name: new RegExp(`^Square ${n}(: .)?$`) });
}

function getStatus() {
  return screen.getByRole("status");
}

describe("Tic-Tac-Toe core gameplay", () => {
  test("renders board, initial status, and reset control", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /tic-tac-toe/i })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: /tic-tac-toe board/i })).toBeInTheDocument();

    // 9 squares exist and are initially empty/enabled (aria-disabled=false)
    for (let i = 1; i <= 9; i += 1) {
      const sq = getSquare(i);
      expect(sq).toBeInTheDocument();
      expect(sq).toHaveAttribute("aria-disabled", "false");
      expect(sq).toHaveTextContent("");
    }

    expect(getStatus()).toHaveTextContent("Next player: X");
    expect(
      screen.getByRole("button", { name: /new game \/ reset/i })
    ).toBeInTheDocument();
  });

  test("players alternate turns and status updates after each move", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getSquare(1));
    expect(getSquare(1)).toHaveTextContent("X");
    expect(getSquare(1)).toHaveAttribute("aria-disabled", "true");
    expect(getStatus()).toHaveTextContent("Next player: O");

    await user.click(getSquare(2));
    expect(getSquare(2)).toHaveTextContent("O");
    expect(getSquare(2)).toHaveAttribute("aria-disabled", "true");
    expect(getStatus()).toHaveTextContent("Next player: X");
  });

  test("prevents overwriting an occupied square (turn does not advance)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getSquare(1));
    expect(getStatus()).toHaveTextContent("Next player: O");

    // Attempt to click the already-occupied square: should stay X and turn should remain O
    await user.click(getSquare(1));
    expect(getSquare(1)).toHaveTextContent("X");
    expect(getStatus()).toHaveTextContent("Next player: O");
  });

  test("detects a win, highlights winning squares, and disables further moves", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X wins on top row: squares 1,2,3
    await user.click(getSquare(1)); // X
    await user.click(getSquare(4)); // O
    await user.click(getSquare(2)); // X
    await user.click(getSquare(5)); // O
    await user.click(getSquare(3)); // X -> win

    expect(getStatus()).toHaveTextContent("Winner: X");

    // Winning squares should have is-winning class (visual highlight)
    expect(getSquare(1)).toHaveClass("is-winning");
    expect(getSquare(2)).toHaveClass("is-winning");
    expect(getSquare(3)).toHaveClass("is-winning");

    // After win, all squares should be disabled from interaction
    for (let i = 1; i <= 9; i += 1) {
      expect(getSquare(i)).toHaveAttribute("aria-disabled", "true");
    }

    // Attempt a post-win move: should not change the board
    await user.click(getSquare(6));
    expect(getSquare(6)).toHaveTextContent("");
  });

  test("detects a draw when the board is full with no winner", async () => {
    const user = userEvent.setup();
    render(<App />);

    /**
     * Fill board with a known draw pattern:
     * X O X
     * X O O
     * O X X
     *
     * Indices (1-9): 1 2 3 / 4 5 6 / 7 8 9
     */
    const moveOrder = [1, 2, 3, 5, 4, 6, 8, 7, 9];
    for (const sq of moveOrder) {
      await user.click(getSquare(sq));
    }

    expect(getStatus()).toHaveTextContent("Draw!");

    // All squares disabled once game is over (draw)
    for (let i = 1; i <= 9; i += 1) {
      expect(getSquare(i)).toHaveAttribute("aria-disabled", "true");
    }
  });

  test("reset clears the board and restores X as the next player", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getSquare(1));
    await user.click(getSquare(2));

    expect(getSquare(1)).toHaveTextContent("X");
    expect(getSquare(2)).toHaveTextContent("O");
    expect(getStatus()).toHaveTextContent("Next player: X");

    await user.click(screen.getByRole("button", { name: /new game \/ reset/i }));

    for (let i = 1; i <= 9; i += 1) {
      expect(getSquare(i)).toHaveTextContent("");
      expect(getSquare(i)).toHaveAttribute("aria-disabled", "false");
      expect(getSquare(i)).not.toHaveClass("is-winning");
    }
    expect(getStatus()).toHaveTextContent("Next player: X");
  });
});
