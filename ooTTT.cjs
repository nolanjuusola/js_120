/* eslint-disable max-len */
let readline = require('readline-sync');

class Player {
  constructor(order) {
    this.score = 0;
    this.order = order;
  }
  static PLAYER_ONE_ORDER = 1;
  static PLAYER_TWO_ORDER = 2;

  getPlayerDifficulty(player) {
    if (player.type === 'computer') {
      let response;
      while (true) {
        console.log(`Is ${player.name} on easy mode or hard mode (e, h)?`);
        response = readline.question();
        if (response[0].toLowerCase() === 'e' || response[0].toLowerCase() === 'h') break;
        console.log("That's not a valid choice.");
      }
      player.difficulty = response === 'e' ? 'easy' : 'hard';
    }
  }

  getName(order) {
    console.log(`Enter Player ${order}'s name:`);
    this.name = readline.question();
  }

  getType(order) {
    let type;
    while (true) {
      console.log(`Is Player ${order} a human or a computer (h, c)?`);
      type = readline.question()[0].toLowerCase();
      if (type === 'h' || type === 'c') break;
      console.log("That's not a valid choice.");
    }
    this.type = type === 'h' ? 'human' : 'computer';
  }
}

class Square {
  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  static PLAYER_ONE_MARKER = 'X';
  static PLAYER_TWO_MARKER = 'O';
  static UNUSED_SQUARE = ' ';
}

class Board {
  constructor() {
    this.resetBoard();
  }

  displayBoard() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.gameBoard[1].marker}  |  ${this.gameBoard["2"].marker}  |  ${this.gameBoard["3"].marker}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.gameBoard["4"].marker}  |  ${this.gameBoard["5"].marker}  |  ${this.gameBoard["6"].marker}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.gameBoard["7"].marker}  |  ${this.gameBoard["8"].marker}  |  ${this.gameBoard["9"].marker}`);
    console.log("     |     |");
    console.log("");
  }

  resetBoard() {
    this.gameBoard = {};
    for (let idx = 1; idx < 10; idx++) {
      this.gameBoard[idx] = new Square();
    }
  }

  unusedSquares() {
    let unusedArray = [];
    for (let square in this.gameBoard) {
      if (this.gameBoard[square].marker === Square.UNUSED_SQUARE) {
        unusedArray.push(square);
      }
    }
    return unusedArray;
  }

  countMarkersInRow(row, marker) {
    return row.filter(square => this.gameBoard[square].marker === marker).length;
  }

  boardIsFull() {
    return this.unusedSquares().length === 0;
  }

  markSquare(square, order) {
    if (order === Player.PLAYER_ONE_ORDER) {
      this.gameBoard[square].marker = Square.PLAYER_ONE_MARKER;
    } else {
      this.gameBoard[square].marker = Square.PLAYER_TWO_MARKER;
    }
  }

  static POSSIBLE_WINNING_COMBOS = [
    [ "1", "2", "3" ],
    [ "4", "5", "6" ],
    [ "7", "8", "9" ],
    [ "1", "4", "7" ],
    [ "2", "5", "8" ],
    [ "3", "6", "9" ],
    [ "1", "5", "9" ],
    [ "3", "5", "7" ],
  ]
}

class TTTGame {

  constructor() {
    this.board = new Board();
  }

  displayWelcomeMessage() {
    console.clear();
    console.log('Welcome to the World Series of Tic Tac Toe!');
  }

  displayGoodbyeMessage() {
    console.log('Goodbye!');
  }

  getWinningScore() {
    let score;

    while (true) {
      console.log('Enter score that will determine the champion:');
      score = readline.question();
      if (!isNaN(score) && score !== '') break;
      console.log("That's not a valid score.");
    }
    return Number(score);
  }

  scoreBoardDisplay() {
    console.clear();
    console.log(`~~~~~SCORE (first to ${this.winningScore})~~~~~`);
    console.log(`${this.player1.name}: ${this.player1.score}`);
    console.log(`${this.player2.name}: ${this.player2.score}`);
    console.log(`~~~Game ${this.gameNum}~~~`);
    this.board.displayBoard();
  }

  computerChooseRandom() {
    let choice;
    let choices = this.board.unusedSquares();
    while (true) {
      choice = String(Math.floor(Math.random() * 10));
      if (choices.includes(choice)) break;
    }
    return choice;
  }

  findCriticalSquare(row) {
    return row === null ? null : row.find(square => this.board.gameBoard[square].marker === Square.UNUSED_SQUARE);
  }

  findCriticalRow(marker) {
    for (let idx = 0; idx <= 7; idx++) {
      if (this.board.countMarkersInRow(Board.POSSIBLE_WINNING_COMBOS[idx], marker) === 2 &&
      (Board.POSSIBLE_WINNING_COMBOS[idx].find(square => this.board.gameBoard[square].marker === Square.UNUSED_SQUARE) !== undefined)
      ) {
        return Board.POSSIBLE_WINNING_COMBOS[idx];
      }
    }
    return null;
  }

  computerOffense(player) {
    return player.order === Player.PLAYER_ONE_ORDER ? this.findCriticalSquare(this.findCriticalRow(Square.PLAYER_ONE_MARKER)) :
      this.findCriticalSquare(this.findCriticalRow(Square.PLAYER_TWO_MARKER));
  }

  computerDefense(player) {
    return player.order === Player.PLAYER_ONE_ORDER ? this.findCriticalSquare(this.findCriticalRow(Square.PLAYER_TWO_MARKER)) :
      this.findCriticalSquare(this.findCriticalRow(Square.PLAYER_ONE_MARKER));
  }

  isCenterOpen() {
    return this.board.gameBoard['5'].marker === Square.UNUSED_SQUARE ? '5' : false;
  }

  computerMove(player) {
    console.log('Making choice...(press return to coninue)');
    readline.question();
    return player.difficulty === 'easy' ? this.computerChooseRandom() : this.smartComputerChoose(player);
  }

  smartComputerChoose(player) {
    return this.computerOffense(player) || this.computerDefense(player) ||
    this.isCenterOpen() || this.computerChooseRandom();
  }

  static joinOr(array, separator, finalWord = 'or') {
    if (array.length === 1) {
      return array[0];
    } else if (array.length === 2) {
      return array[0] + ' ' + finalWord + ' ' + array[1];
    }
    let string = '';
    array.forEach((ele, index) => {
      if (index === array.length - 2) {
        string += (ele + " " + finalWord + ' ');
      } else if (index === array.length - 1) {
        string += (ele);
      } else {
        string += (ele + separator + ' ');
      }
    });
    return string;
  }

  humanChoose() {
    let choice;
    this.choices = this.board.unusedSquares();

    while (true) {
      console.log(`Make your selection: (choices are: ${TTTGame.joinOr(this.choices, ',')})`);
      choice = readline.question();
      if (this.choices.includes(choice)) break;
      console.log("That's not a valid choice.");
    }
    return choice;
  }

  makeMove(player) {
    console.log(`${player.name}'s turn:`);
    return player.type === 'human' ? this.board.markSquare(this.humanChoose(), player.order) : this.board.markSquare(this.computerMove(player), player.order);
  }

  someoneWon() {
    return Board.POSSIBLE_WINNING_COMBOS.some(combo => {
      return (combo.every(square => (this.board.gameBoard[square].marker === Square.PLAYER_ONE_MARKER))) ||
      (combo.every(square => (this.board.gameBoard[square].marker === Square.PLAYER_TWO_MARKER)));
    });
  }

  determineGameWinner() {
    Board.POSSIBLE_WINNING_COMBOS.forEach(combo => {
      if (combo.every(square => this.board.gameBoard[square].marker === Square.PLAYER_ONE_MARKER)) {
        console.log(`${this.player1.name} wins!`);
        this.player1.score++;
      } else if (combo.every(square => this.board.gameBoard[square].marker === Square.PLAYER_TWO_MARKER)) {
        console.log(`${this.player2.name} wins!`);
        this.player2.score++;
      }
    });
    if (!this.someoneWon()) console.log("It's a tie.");
    this.gameNum++;
    readline.question('Press Return to proceed:');
  }

  isGameOver() {
    return (this.board.boardIsFull() || this.someoneWon());
  }

  isMatchOver() {
    return (this.player1.score === this.winningScore || this.player2.score === this.winningScore || this.gameNum > this.maxGames);
  }

  determineMatchWinner() {
    if (this.player1.score > this.player2.score) {
      console.log(`${this.player1.name} is the Champion!`);
    } else if (this.player2.score > this.player1.score) {
      console.log(`${this.player2.name} is the Champion!`);
    } else {
      console.log('This match has been declared a tie.');
    }
  }

  playAgain() {
    console.log('Would you like to play again (y, n)?');
    let response;

    while (true) {
      response = readline.question();
      if (response !== '' && (response[0].toLowerCase() === 'y' || response[0].toLowerCase() === 'n')) break;
      console.log('Please choose a valid response (y, n).');
    }
    return response === 'y';
  }

  resetGame() {
    this.player1.score = 0;
    this.player2.score = 0;
    this.gameNum = 1;
  }

  goesFirst() {
    return this.gameNum % 2 === 1 ? this.player1 : this.player2;
  }

  goesSecond() {
    return this.gameNum % 2 === 1 ? this.player2 : this.player1;
  }

  playGame() {
    while (true) {
      this.scoreBoardDisplay();
      this.makeMove(this.goesFirst());
      this.scoreBoardDisplay();
      if (this.isGameOver()) break;
      this.makeMove(this.goesSecond());
      this.scoreBoardDisplay();
      if (this.isGameOver()) break;
    }
  }

  playMatch() {
    this.winningScore = this.getWinningScore();
    this.maxGames = this.winningScore * 5;
    while (true) {
      this.playGame();
      this.determineGameWinner();
      this.board.resetBoard();
      if (this.isMatchOver()) break;
    }
    this.determineMatchWinner();
  }

  createPlayer(order) {
    console.log(`~~~~~~~~~CREATE PLAYER ${order}~~~~~~~~~`);
    let newPlayer = new Player(order);
    newPlayer.getType(order);
    newPlayer.getName(order);
    newPlayer.getPlayerDifficulty(newPlayer);
    return newPlayer;
  }

  play() {
    this.displayWelcomeMessage();
    this.player1 = this.createPlayer(Player.PLAYER_ONE_ORDER);
    this.player2 = this.createPlayer(Player.PLAYER_TWO_ORDER);
    this.resetGame();
    while (true) {
      this.playMatch();
      if (!this.playAgain()) break;
      this.resetGame();
    }
    this.displayGoodbyeMessage();
  }
}


let game = new TTTGame();

game.play();