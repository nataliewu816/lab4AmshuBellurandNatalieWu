import { useState } from "react";

/**
 * Computes the winner of a Tic Tac Toe board.
 * @param {Array<string|null>} squares - 9-element array of null | 'X' | 'O'
 * @returns {string|null} 'X', 'O', or null if no winner
 */
function computeWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

/**
 * A single pink square button on the board.
 * @param {{ value: string|null, onClick: Function }} props
 */
function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

/**
 * Main Board component with:
 * - Turn tracking (X always starts)
 * - Score tracking for X and O
 * - Winner detection via computeWinner
 * - New Game button (preserves scores)
 */
export default function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const winner = computeWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  const gameOver = winner || isDraw;

  let status;
  if (winner) status = `Player ${winner} wins!`;
  else if (isDraw) status = "It's a tie!";
  else status = `Its your turn, Player ${xIsNext ? "X" : "O"}.`;

  /**
   * Handles a square click, updates board and checks for winner.
   * @param {number} index - Index of clicked square (0-8)
   */
  function handleClick(index) {
    if (squares[index] || gameOver) return;

    const next = squares.slice();
    next[index] = xIsNext ? "X" : "O";

    const w = computeWinner(next);
    if (w) setScores((s) => ({ ...s, [w]: s[w] + 1 }));

    setSquares(next);
    setXIsNext(!xIsNext);
  }

  /** Resets the board without clearing scores. */
  function handleNewGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  return (
    <div className="game">
      <h1 className="title">Tic Tac Toe</h1>

      <p className="scoreboard">
        X Wins: <strong>{scores.X}</strong>
        &nbsp;|&nbsp; O Wins: <strong>{scores.O}</strong>
      </p>

      <p className="status">{status}</p>

      <div className="board">
        {squares.map((val, i) => (
          <Square key={i} value={val} onClick={() => handleClick(i)} />
        ))}
      </div>

      <button className="btn-new-game" onClick={handleNewGame}>
        New Game
      </button>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #74c0e8;
          min-height: 100vh;
          font-family: Arial, sans-serif;
        }

        .game {
          background: #74c0e8;
          min-height: 100vh;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .title {
          font-size: 4rem;
          font-weight: 900;
          color: #000;
          margin-bottom: 0.3rem;
        }

        .scoreboard {
          font-size: 1rem;
          color: #111;
          margin-bottom: 1rem;
          text-align: center;
        }

        .status {
          font-size: 1.2rem;
          font-weight: 700;
          color: #000;
          margin-bottom: 1rem;
          width: 100%;
          max-width: 460px;
          text-align: left;
        }

        .board {
          display: grid;
          grid-template-columns: repeat(3, 150px);
          grid-template-rows: repeat(3, 150px);
          border: 4px solid #000;
        }

        .square {
          width: 150px;
          height: 150px;
          background: #ffb3be;
          border: 3px solid #000;
          font-size: 3rem;
          font-weight: 900;
          color: #000;
          cursor: pointer;
          transition: background 0.1s;
        }

        .square:hover { background: #f89aa8; }

        .btn-new-game {
          margin-top: 1.5rem;
          padding: 0.8rem 2rem;
          background: #f5a000;
          color: #000;
          border: none;
          border-radius: 10px;
          font-size: 1.5rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-new-game:hover { background: #d48c00; }
      `}</style>
    </div>
  );
}