function GameBoard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const placeMarker = (row, column, marker) => {
    const cell = board[row][column];
    return cell.addMark(marker);
  };

  const checkWinner = () => {
    const grid = board.map((row) => row.map((cell) => cell.getValue()));

    // rows
    for (let i = 0; i < 3; i++) {
      if (
        grid[i][0] !== 0 &&
        grid[i][0] === grid[i][1] &&
        grid[i][0] === grid[i][2]
      )
        return grid[i][0];
    }

    // columns
    for (let j = 0; j < 3; j++) {
      if (
        grid[0][j] !== 0 &&
        grid[0][j] === grid[1][j] &&
        grid[0][j] === grid[2][j]
      )
        return grid[0][j];
    }

    // diagonals
    if (
      grid[0][0] !== 0 &&
      grid[0][0] === grid[1][1] &&
      grid[0][0] === grid[2][2]
    )
      return grid[0][0];

    if (
      grid[0][2] !== 0 &&
      grid[0][2] === grid[1][1] &&
      grid[0][2] === grid[2][0]
    )
      return grid[0][2];

    // tie?
    const isFull = grid.flat().every((cell) => cell !== 0);
    if (isFull) return "Tie";

    return null; // game still ongoing
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, printBoard, placeMarker, checkWinner };
}

function Cell() {
  let value = 0;

  const addMark = (player) => {
    if (value !== 0) return false;
    value = player;
    return true;
  };

  const getValue = () => value;

  return { addMark, getValue };
}

function GameController(
  PlayerOneName = "Player One",
  PlayerTwoName = "Player Two"
) {
  const board = GameBoard();

  const players = [
    {
      name: PlayerOneName,
      marker: "X",
    },
    {
      name: PlayerTwoName,
      marker: "O",
    },
  ];

  let activePlayer = players[0];
  let gameOver = false;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const playRound = (row, column) => {
    if (gameOver) {
      console.log("Game is over! Restart to play again.");
      return;
    }
    console.log(
      `${getActivePlayer().name} is placing thier marker on ${(row, column)} `
    );

    board.placeMarker(row, column, getActivePlayer().marker);

    const result = board.checkWinner();
    if (result) {
      board.printBoard();
      if (result === "Tie") console.log("It's a tie!");
      else console.log(`${getActivePlayer().name} wins!`);
      gameOver = true;
      return;
    }

    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
  };
}

function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = columnIndex;
        cellButton.textContent = cell.getValue();
        if (cellButton.textContent === "0") {
          cellButton.textContent = "";
        }
        boardDiv.appendChild(cellButton);
      });
    });
  };

  function clickHandlerBoard(e) {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;

    if (!selectedColumn || !selectedRow) return;

    game.playRound(selectedRow, selectedColumn);
    updateScreen();
  }

  boardDiv.addEventListener("click", clickHandlerBoard);

  updateScreen();
}

ScreenController();
