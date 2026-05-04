document.addEventListener("DOMContentLoaded", function () {

  const WIN_LINES = [
    ["one", "two", "three"],
    ["four", "five", "six"],
    ["seven", "eight", "nine"],
    ["one", "four", "seven"],
    ["two", "five", "eight"],
    ["three", "six", "nine"],
    ["one", "five", "nine"],
    ["three", "five", "seven"]
  ];

  const CELL_NAMES = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];


  let xMoves = [];
  let oMoves = [];
  let currentPlayer = "X"; // X always goes first
  let gameOver = false;
  let vsComputer = false;   // toggled by the mode button

  let scores = { X: 0, O: 0, ties: 0 };


  const turnHeading = document.querySelector("h2");
  const newGameBtn  = document.querySelector(".new_game");
  const resetBtn    = document.querySelector(".reset");

  const cellElements = {};
  CELL_NAMES.forEach(name => {
    cellElements[name] = document.querySelector("." + name);
  });


  function buildScoreboard() {
    if (document.querySelector("#scoreboard")) return;
    const board = document.createElement("div");
    board.id = "scoreboard";
    board.style.cssText = "text-align:center; font-size:1.2em; margin-bottom:6px;";
    board.innerHTML =
      "X Wins: <strong id='sx'>0</strong> &nbsp;|&nbsp; " +
      "O Wins: <strong id='so'>0</strong> &nbsp;|&nbsp; " +
      "Ties: <strong id='st'>0</strong>";
    document.querySelector("h1").after(board);
  }

  function buildModeButton() {
    if (document.querySelector("#mode-btn")) return;
    const btn = document.createElement("button");
    btn.id = "mode-btn";
    btn.textContent = "Switch to: vs Computer";
    btn.style.cssText =
      "display:block; margin:0 auto 10px; padding:10px 24px; font-size:18px;" +
      "background-color:#6a0dad; color:#fff; border:1px solid #444;" +
      "border-radius:12px; cursor:pointer;";
    btn.addEventListener("click", toggleMode);
    // Insert before the New Game button
    newGameBtn.parentNode.insertBefore(btn, newGameBtn);
  }

  function updateScoreDisplay() {
    document.getElementById("sx").textContent = scores.X;
    document.getElementById("so").textContent = scores.O;
    document.getElementById("st").textContent = scores.ties;
  }


  function toggleMode() {
    vsComputer = !vsComputer;
    const btn = document.querySelector("#mode-btn");
    btn.textContent = vsComputer ? "Switch to: 2 Players" : "Switch to: vs Computer";
    btn.style.backgroundColor = vsComputer ? "#cc0000" : "#6a0dad";
    resetAll(); // start fresh when switching modes
  }

  function checkWin(moves) {
    for (const line of WIN_LINES) {
      if (line.every(cell => moves.includes(cell))) return line;
    }
    return null;
  }

  function updateTurnMessage(msg) {
    if (msg) {
      turnHeading.innerHTML = msg;
    } else {
      const label = vsComputer
        ? (currentPlayer === "X" ? "Player (X)" : "Computer (O)")
        : "Player " + currentPlayer;
      turnHeading.innerHTML =
        'Its your turn, <span class="display_player">' + label + '</span>.';
    }
  }

  function placeMark(cellName, player) {
    const span = cellElements[cellName].querySelector(".xo");
    if (player === "X") {
      xMoves.push(cellName);
      span.textContent = "X";
      span.style.color = "#1a1aff";
    } else {
      oMoves.push(cellName);
      span.textContent = "O";
      span.style.color = "#cc0000";
    }
  }

  // Returns true if the game ended after this move
  function resolveAfterMove() {
    const moves = currentPlayer === "X" ? xMoves : oMoves;
    const winLine = checkWin(moves);

    if (winLine) {
      winLine.forEach(name => {
        cellElements[name].style.backgroundColor = "#ffd700";
      });
      scores[currentPlayer]++;
      updateScoreDisplay();
      gameOver = true;
      const winner = vsComputer && currentPlayer === "O" ? "Computer (O)" : "Player " + currentPlayer;
      updateTurnMessage("<strong>" + winner + " wins! </strong>");
      return true;
    }

    if (xMoves.length + oMoves.length === 9) {
      scores.ties++;
      updateScoreDisplay();
      gameOver = true;
      updateTurnMessage("<strong>It's a tie!</strong>");
      return true;
    }

    return false;
  }

  // AI part

  function computerMove() {
    const available = CELL_NAMES.filter(
      name => !xMoves.includes(name) && !oMoves.includes(name)
    );
    if (available.length === 0) return;

    // Pick a random available cell
    const choice = available[Math.floor(Math.random() * available.length)];
    placeMark(choice, "O");

    if (!resolveAfterMove()) {
      currentPlayer = "X";
      updateTurnMessage();
    }
  }

  // Click cells

  function handleCellClick(cellName) {
    if (gameOver) return;
    if (xMoves.includes(cellName) || oMoves.includes(cellName)) return;
    // In vs-computer mode, only allow clicks when it's X's turn
    if (vsComputer && currentPlayer !== "X") return;

    placeMark(cellName, currentPlayer);

    if (resolveAfterMove()) return; // game ended

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    if (vsComputer && currentPlayer === "O" && !gameOver) {
      updateTurnMessage(); 
      setTimeout(computerMove, 500);
    } else {
      updateTurnMessage();
    }
  }

  //Buttons

  function newGame() {
    xMoves = [];
    oMoves = [];
    currentPlayer = "X";
    gameOver = false;

    CELL_NAMES.forEach(name => {
      cellElements[name].querySelector(".xo").textContent = "";
      cellElements[name].style.backgroundColor = "";
    });

    updateTurnMessage();
  }

  function resetAll() {
    scores = { X: 0, O: 0, ties: 0 };
    updateScoreDisplay();
    newGame();
  }

  // Init

  buildScoreboard();
  buildModeButton();
  updateTurnMessage();

  CELL_NAMES.forEach(name => {
    cellElements[name].addEventListener("click", function () {
      handleCellClick(name);
    });
  });

  newGameBtn.addEventListener("click", newGame);
  resetBtn.addEventListener("click", resetAll);

});