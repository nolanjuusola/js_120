let readline = require('readline-sync');

class Statics {
  static P1_ORDER = 1;
  static P2_ORDER = 2;
  static PLAYER_IS_HUMAN = 'human';
  static PLAYER_IS_COMPUTER = 'computer';
  static COMPUTER_EASY = 'easy';
  static COMPUTER_HARD = 'hard';
  static P1_MARKER = 'X';
  static P2_MARKER = 'O';
  static UNUSED_SQUARE = ' ';

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

  static WINNING_COMBOS = [
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


class Player {
  constructor(order) {
    this.resetScore();
    this.order = order;
    this.playerMarker = this.order === Statics.P1_ORDER ?
      Statics.P1_MARKER : Statics.P2_MARKER;
  }

  getPlayerDifficulty() {
    if (this.type === Statics.PLAYER_IS_COMPUTER) {
      let response;
      while (true) {
        console.log(`Is ${this.name} on easy mode or hard mode (e, h)?`);
        response = (readline.question()).toLowerCase();
        if (response === 'e' || response === 'h') break;
        console.log("That's not a valid choice.");
      }
      this.difficulty = response === 'e' ? Statics.COMPUTER_EASY : Statics.COMPUTER_HARD;
    }
  }

  getName(order) {
    console.log(`Enter Player ${order}'s name:`);
    this.name = readline.question();
  }

  returnName() {
    return this.name;
  }

  returnScore() {
    return this.score;
  }

  returnMarker() {
    return this.playerMarker;
  }

  returnOpponentMarker() {
    return this.returnMarker() === Statics.P1_MARKER ?
      Statics.P2_MARKER : Statics.P1_MARKER;
  }

  resetScore() {
    this.score = 0;
  }

  incrementScore() {
    this.score++;
  }

  makeMove(board) {
    console.log(`${this.returnName()}'s turn:`);
    return this.type === Statics.PLAYER_IS_HUMAN ?
      board.markSquare(this.humanChoose(board), this.order) :
      board.markSquare(this.computerMove(board), this.order);
  }

}

class Human extends Player {
  constructor(order) {
    super(order);
  }

  humanChoose(board) {
    let choice;
    let choices = board.unusedSquares();

    while (true) {
      console.log(`Make your selection: (choices are: ${Statics.joinOr(choices, ',')})`);
      choice = readline.question();
      if (choices.includes(choice)) break;
      console.log("That's not a valid choice.");
    }
    return choice;
  }
}

class Computer extends Player {
  constructor(order) {
    super(order);
  }

  chooseRandom(board) {
    let choice;
    let choices = board.unusedSquares();
    while (true) {
      choice = String(Math.floor(Math.random() * 10));
      if (choices.includes(choice)) break;
    }
    return choice;
  }

  returnCriticalSquare(marker, board) {
    for (let idx = 0; idx < Statics.WINNING_COMBOS.length; idx++) {
      let row = Statics.WINNING_COMBOS[idx];
      let square = this.determineCriticalSquare(row, marker, board);
      if (square) return square;
    }
    return null;
  }

  determineCriticalSquare(row, marker, board) {
    if (board.countMarkersInRow(row, marker) === 2) {
      let square = row.find(square => {
        return board.gameBoard[square].isUnused();
      });
      if (square) return square;
    }
    return null;
  }

  computerMove(board) {
    console.log('Making choice...(press return to coninue)');
    readline.question();
    return this.difficulty === Statics.COMPUTER_EASY ?
      this.chooseRandom(board) : this.smartComputerChoose(board);
  }

  smartComputerChoose(board) {
    return this.computerOffense(board) || this.computerDefense(board) ||
    board.isCenterOpen() || this.chooseRandom(board);
  }

  computerOffense(board) {
    return this.returnCriticalSquare(this.returnMarker(), board);
  }

  computerDefense(board) {
    return this.returnCriticalSquare(this.returnOpponentMarker(), board);
  }
}

class Square {
  constructor(marker = Statics.UNUSED_SQUARE) {
    this.marker = marker;
  }

  isUnused() {
    return this.marker === Statics.UNUSED_SQUARE;
  }

  getMarker() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  markersMatch(marker) {
    return this.getMarker() === marker;
  }
}

class Board {
  constructor() {
    this.resetBoard();
  }

  displayBoard() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.gameBoard['1'].marker}  |  ${this.gameBoard["2"].getMarker()}  |  ${this.gameBoard["3"].getMarker()}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.gameBoard["4"].getMarker()}  |  ${this.gameBoard["5"].getMarker()}  |  ${this.gameBoard["6"].getMarker()}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.gameBoard["7"].getMarker()}  |  ${this.gameBoard["8"].getMarker()}  |  ${this.gameBoard["9"].getMarker()}`);
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
      if (this.gameBoard[square].isUnused()) {
        unusedArray.push(square);
      }
    }
    return unusedArray;
  }

  isCenterOpen() {
    return this.gameBoard['5'].isUnused() ? '5' : false;
  }

  countMarkersInRow(row, marker) {
    let markers = row.filter(square => {
      return this.gameBoard[square].markersMatch(marker);
    });
    return markers.length;
  }

  isWinningRow(row, marker) {
    return this.countMarkersInRow(row, marker) === 3;
  }

  boardIsFull() {
    return this.unusedSquares().length === 0;
  }

  markSquare(square, order) {
    if (order === Statics.P1_ORDER) {
      this.gameBoard[square].setMarker(Statics.P1_MARKER);
    } else {
      this.gameBoard[square].setMarker(Statics.P2_MARKER);
    }
  }
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
    console.log(`${this.player1.returnName()}: ${this.player1.returnScore()}`);
    console.log(`${this.player2.returnName()}: ${this.player2.returnScore()}`);
    console.log(`~~~Game ${this.gameNum}~~~`);
    this.board.displayBoard();
  }

  determineGameWinner() {
    for (let idx = 0; idx < Statics.WINNING_COMBOS.length; idx++) {
      // eslint-disable-next-line max-len
      if (this.board.isWinningRow(Statics.WINNING_COMBOS[idx], Statics.P1_MARKER)) {
        return this.player1.returnName();
      // eslint-disable-next-line max-len
      } else if (this.board.isWinningRow(Statics.WINNING_COMBOS[idx], Statics.P2_MARKER)) {
        return this.player2.returnName();
      }
    }
    return null;
  }

  someoneWon() {
    return this.determineGameWinner() !== null;
  }

  displayGameWinner(winner) {
    if (winner === null) {
      console.log("It's a tie.");
    } else if (winner === this.player1.returnName()) {
      console.log(`${this.player1.returnName()} wins!`);
      this.player1.incrementScore();
    } else {
      console.log(`${this.player2.returnName()} wins!`);
      this.player2.incrementScore();
    }
  }

  isGameOver() {
    return (this.board.boardIsFull() || this.someoneWon());
  }

  isMatchOver() {
    return (this.player1.returnScore() === this.winningScore ||
      this.player2.returnScore() === this.winningScore ||
      this.gameNum > this.maxGames);
  }

  determineMatchWinner() {
    let p1Score = this.player1.returnScore();
    let p2Score = this.player2.returnScore();
    if (p1Score > p2Score) {
      console.log(`${this.player1.returnName()} is the Champion!`);
    } else if (p2Score > p1Score) {
      console.log(`${this.player2.returnName()} is the Champion!`);
    } else {
      console.log('This match has been declared a tie.');
    }
  }

  playAgain() {
    console.log('Would you like to play again (y, n)?');
    let response;

    while (true) {
      response = (readline.question()).toLowerCase();
      if (response === 'y' || response === 'n') break;
      console.log('Please choose a valid response (y, n).');
    }
    return response === 'y';
  }

  resetGame() {
    this.player1.score = 0;
    this.player2.score = 0;
    this.gameNum = 1;
    this.board.resetBoard();
  }

  goesFirst() {
    return this.gameNum % 2 === 1 ? this.player1 : this.player2;
  }

  goesSecond() {
    return this.gameNum % 2 === 1 ? this.player2 : this.player1;
  }

  nextGame() {
    readline.question('Press return to proceed');
    this.gameNum++;
  }

  playGame() {
    while (true) {
      this.scoreBoardDisplay();
      this.firstPlayer = this.goesFirst();
      this.secondPlayer = this.goesSecond();
      this.firstPlayer.makeMove(this.board);
      this.scoreBoardDisplay();
      if (this.isGameOver()) break;
      this.secondPlayer.makeMove(this.board);
      this.scoreBoardDisplay();
      if (this.isGameOver()) break;
    }
  }

  playMatch() {
    this.winningScore = this.getWinningScore();
    this.maxGames = this.winningScore * 5;
    while (true) {
      this.playGame();
      this.displayGameWinner(this.determineGameWinner());
      this.nextGame();
      if (this.isMatchOver()) break;
      this.board.resetBoard();
    }
    this.determineMatchWinner();
  }

  createPlayer(order) {
    console.log(`~~~~~~~~~CREATE PLAYER ${order}~~~~~~~~~`);
    let type = this.getType(order);
    let newPlayer = type === Statics.PLAYER_IS_HUMAN ?
      new Human(order) : new Computer(order);
    newPlayer.type = type;
    newPlayer.getName(order);
    newPlayer.getPlayerDifficulty();
    return newPlayer;
  }

  getType(order) {
    let type;
    while (true) {
      console.log(`Is Player ${order} a human or a computer (h, c)?`);
      type = (readline.question()).toLowerCase();
      if (type === 'h' || type === 'c') break;
      console.log("That's not a valid choice.");
    }
    return type === 'h' ? Statics.PLAYER_IS_HUMAN : Statics.PLAYER_IS_COMPUTER;
  }

  play() {
    this.displayWelcomeMessage();
    this.player1 = this.createPlayer(Statics.P1_ORDER);
    this.player2 = this.createPlayer(Statics.P2_ORDER);
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

