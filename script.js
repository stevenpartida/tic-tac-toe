/* 
Factory Function that creates and manages the state of the tic tac toe board.
Initializes board setup by creating a 3x3 array of Cell() objects. 

getBoard(): returns board array
placeMarker(): places a marker (X or O) on a specific cell if available
checkWinner(): checks for winner, tie, or ongoing game
printBoard(): logs the board state to the console
*/
function GameBoard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  // Create 3x3 board filled with Cell() objects
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  // Places a player's marker on the specified position if cell is empty
  const placeMarker = (row, column, marker) => {
    const cell = board[row][column];
    return cell.addMark(marker);
  };

  // Checks all rows, columns, and diagonals for a winner or tie
  const checkWinner = () => {
    const grid = board.map((row) => row.map((cell) => cell.getValue()));

    // Checks rows
    for (let i = 0; i < 3; i++) {
      if (
        grid[i][0] !== 0 &&
        grid[i][0] === grid[i][1] &&
        grid[i][0] === grid[i][2]
      )
        return grid[i][0];
    }

    // Checks columns
    for (let j = 0; j < 3; j++) {
      if (
        grid[0][j] !== 0 &&
        grid[0][j] === grid[1][j] &&
        grid[0][j] === grid[2][j]
      )
        return grid[0][j];
    }

    // Checks diagonals
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

    // Check for tie (board full, no winner)
    const isFull = grid.flat().every((cell) => cell !== 0);
    if (isFull) return "Tie";

    return null; // game still ongoing
  };

  // Logs the board’s current cell values to the console
  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, printBoard, placeMarker, checkWinner };
}

/* 
Factory Function representing a single cell on the board.
Stores a value (0 if empty, or a player's marker 'X'/'O').

addMark(): marks the cell with the player’s marker if it's empty
getValue(): returns the current cell value
*/
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

/* 
Factory Function that controls the game logic and state.
Handles player turns, win detection, score tracking, and game reset.

Methods:
playRound(): plays one round and checks for win/tie
getActivePlayer(): returns the player whose turn it is
setPlayerName(): updates player names
resetGame(): resets board and state for a new match
*/
function GameController(
  PlayerOneName = "Player One",
  PlayerTwoName = "Player Two"
) {
  const board = GameBoard();

  // Define player objects with names, markers, and win count
  const players = [
    {
      name: PlayerOneName,
      marker: "X",
      wins: 0,
    },
    {
      name: PlayerTwoName,
      marker: "O",
      wins: 0,
    },
  ];

  let activePlayer = players[0];
  let gameOver = false;
  let finalResult = null;

  // Switch active player after each valid move
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  // Prints the current board and player turn to the console
  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  // Executes a round: player move, win/tie check, and turn switch
  const playRound = (row, column) => {
    if (gameOver) {
      console.log("Game is over! Restart to play again.");
      return;
    }
    console.log(
      `${getActivePlayer().name} is placing their marker on (${row}, ${column})`
    );

    const movePlayed = board.placeMarker(row, column, getActivePlayer().marker);
    if (!movePlayed) {
      console.log("This spot is taken.");
      return;
    }

    const result = board.checkWinner();
    if (result) {
      board.printBoard();
      if (result === "Tie") {
        finalResult = "It's a draw!";
      } else {
        console.log(`${getActivePlayer().name} wins!`);
        activePlayer.wins++; // ✅ increment winner’s total
        finalResult = `${getActivePlayer().name} wins!`;
      }

      gameOver = true;
      return finalResult;
    }

    switchPlayerTurn();
    printNewRound();
  };

  // Updates a player’s name by index (0 or 1)
  const setPlayerName = (playerIndex, newName) => {
    if (players[playerIndex]) {
      players[playerIndex].name = newName;
      console.log(`Player ${playerIndex + 1} name changed to: ${newName}`);
    }
  };

  // Resets the game board and state variables
  const resetGame = () => {
    const currentBoard = board.getBoard();

    currentBoard.forEach((row) => {
      row.forEach((cell) => Object.assign(cell, Cell()));
    });

    gameOver = false;
    finalResult = null;
    activePlayer = players[0];

    const boardValues = currentBoard.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log("🔁 Game reset! Current board:", boardValues);
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getPlayers: () => players,
    getResult: () => finalResult,
    resetGame,
    setPlayerName,
  };
}

/* 
Module Function that handles the UI interaction and rendering logic.
Updates DOM based on game state, handles button clicks, and manages dialog inputs.

updateScreen(): updates board and UI text
clickHandlerBoard(): handles board cell clicks
clickHandlerDialog(): opens settings dialog
clickHandlerReset(): resets game board
clickHandlerSaveNames(): saves player name changes
*/
function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const playerInfoDivs = document.querySelectorAll(".player-info");
  const scoreDivs = document.querySelectorAll(".score");
  const resultDiv = document.querySelector(".result");
  const resetBtn = document.querySelector(".reset-btn");
  const settingsBtn = document.querySelector(".settings-btn");
  const dialog = document.querySelector("dialog");
  const saveNameBtn = document.querySelector(".save-btn");
  const nameInputs = document.querySelectorAll(".name-input");
  players = game.getPlayers();

  // Updates the visual board and player information
  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    result = game.getResult();
    console.log("result: ", result);

    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

    // Render each cell as a button on the board
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

    // Update player info (names and markers)
    playerInfoDivs.forEach((div, index) => {
      const player = players[index];
      div.querySelector(".player-name").textContent = player.name;
      div.querySelector(".player-marker").textContent = ` ${player.marker}`;
    });

    // Update player scores
    scoreDivs.forEach((div, index) => {
      const player = players[index];
      div.textContent = player.wins;
    });

    resultDiv.textContent = result;
  };

  // Handles clicks on board cells
  function clickHandlerBoard(e) {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;

    if (!selectedColumn || !selectedRow) return;

    game.playRound(selectedRow, selectedColumn);
    updateScreen();
  }

  // Opens settings dialog for name editing
  function clickHandlerDialog() {
    dialog.showModal();
  }

  // Resets the board and updates the screen
  function clickHandlerReset() {
    game.resetGame();
    updateScreen();
  }

  // Saves updated player names and closes the dialog
  function clickHandlerSaveNames() {
    const player1Name = nameInputs[0].value;
    const player2Name = nameInputs[1].value;

    if (player1Name) game.setPlayerName(0, player1Name);
    if (player2Name) game.setPlayerName(1, player2Name);

    updateScreen();
    dialog.close();
  }

  // Event listeners for game controls
  boardDiv.addEventListener("click", clickHandlerBoard);
  resetBtn.addEventListener("click", clickHandlerReset);
  settingsBtn.addEventListener("click", clickHandlerDialog);
  saveNameBtn.addEventListener("click", clickHandlerSaveNames);

  updateScreen();
}

// Initialize the UI and start the game
ScreenController();
