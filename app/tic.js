
const gameBoard = document.getElementById('board'),
	  gridlines = document.querySelectorAll('.gridline');


// Animate the grid lines
function drawGrid() {
	gameBoard.classList.remove('draw-grid');
	setTimeout(() => {
		gameBoard.classList.add('draw-grid');
	}, 50);
	
}

drawGrid();

// const players = {
	
// 	human: {
// 		symbol: 'x',
// 		movesPlayed: [],
//		score: 0
// 	},

// 	computer: {
// 		symbol: 'o',
// 		movesPlayed: [],
//		score: 0
// 	}
// }

// const human: {
// 	symbol: 'x',
// 	movesPlayed: [],
// 	turn: true
// };

// const computer: {
// 	symbol: 'x',
// 	movesPlayed: [],
// }

const human = 'x',
	  computer = 'o',
	  firstMove = 'player';
	  //firstMove = 'computer';

const logs = {
	player: [],
	computer: [] 
};

const symbols = {
	x: `<svg viewBox="0, 0, 100, 100" width="100" height="100" class="symbol">
			<line x1="27" y1="27" x2="73" y2="73"/>
			<line x1="73" y1="27" x2="27" y2="73"/>
		</svg>`,

	o: `<svg viewBox="0, 0, 100, 100" width="100" height="100" class="symbol ">
			<circle cx="50" cy="50" r="25"/>
		</svg>`
};

// create Array to store board data
const board = new Array(9).fill('');

// grab the cells from the DOM
const cells = document.querySelectorAll('.cell');

// Add event Listener and identifying cell data attribute
cells.forEach((cell, i) => {
	cell.dataset.cell = i;
	cell.addEventListener('click', playerMove);
});

let playerCanMove = true;

function playerMove() {

	// get the cell that was clicked
	const cell = this.dataset.cell;
	
	// do nothing if the cell is already occupied or computer is making a move
	if (board[cell] === '' && playerCanMove) {

		// disable further clicks until the computer has moved
		playerCanMove = false;
	
		// play the move
		makeMove(human, cell)
		
		// computer's turn (if game not ended)
		.then(gameOver => {
			if (!gameOver)	
				computerMove();
		});
	}
}


function computerMove() {

	// Choose a move
	const nextMove = chooseMove();

	// play the move
	makeMove(computer, nextMove)

	// player's turn (if game not ended)
	.then(gameOver => {
		if (!gameOver)
			playerCanMove = true;
	});
}



function makeMove(type, cell) {

	// add move to board data 
	board[cell] = type;

	// log the move
	const player = type === human ? 'player' : 'computer';
	logs[player].push(Number(cell));

	// render icon
	const move = cells[cell]; 
	move.innerHTML = symbols[type];
	const icon = move.querySelector('.symbol');
	
	// animate the fade-in (returns a promise)
	return animate(icon, 'fade-in')

	// check for wins or end of game after animation is complete
	.then(function checkStatus() {
		const gameWon = wins(type),
			  gameTied = gameEnded();
		
		if (gameWon)
			renderWin(gameWon, type);

		else if (gameTied) 
			renderTie();

		return gameWon || gameTied;
	});
}

function animate(el, className, animationType = "transition") {
	const eventListener = `${animationType}end`;	
	return new Promise(resolve => {
		setTimeout(() => {
			el.classList.add(className);
			el.addEventListener(eventListener, function finish() {
				el.removeEventListener(eventListener, finish);
				resolve();
			});
		}, 0);
	});
}


const winnerMessage = document.getElementById('winner');
const winningIcon = document.querySelector('.winning-icon');

function renderWin(winningLines, winner) {

	const winnerName = winner === human ? 'Human Won!' : 'Computer Won!';

	winnerMessage.innerHTML = winnerName;
	winningIcon.innerHTML = symbols[winner];

	winningLines.forEach(line => {
		line.forEach(cell => {
			cells[cell].querySelector('svg').classList.add('toCenter-' + cell);
			gameBoard.classList.add('disappear');
			result.classList.add('appear');
		});

	});
}


const resetBtn = document.getElementById('reset');
reset.addEventListener('click', resetGame);

function resetGame() {
	
	// reset the DOM
	result.classList.remove('appear');
	winningIcon.innerHTML = '';
	gameBoard.classList.remove('disappear');
	cells.forEach(cell => cell.innerHTML = '');

	//reset the data
	board.fill('');
	console.log('board', board);
	logs.player = [], logs.computer = [];

	playerCanMove = true;
	drawGrid();
}


function renderTie() {
	console.log('Game Tied!!!')
}

function gameEnded() {
	return logs.player.length + logs.computer.length === 9;
}

// The AI stuff

function chooseMove() {
	
	// An array of the best possible moves (at least, according to the AI)
	let optimalMoves;

	// If the human plays first, AI needs to respond carefully 
	// to avoid a forced loss
	if (firstMove === 'player' && logs.player.length === 1) {
		optimalMoves = respondToInitialMove(logs.player[0]);
	
	} else {
		optimalMoves = console.log('winningMoves(computer)') || winningMoves(computer) ||
					   //console.log('winningMoves(human)') || winningMoves(human) ||
					   //console.log('forkingMoves(computer)') || forkingMoves(computer) ||
					   //console.log('forcedBlocks()') || forcedBlocks() ||
					   //console.log('forkingMoves(human)') || forkingMoves(human) ||
					   //console.log('center') || centerMove() ||
					   console.log('emptyCells()') || emptyCells();
	}

	return randomElement(optimalMoves);
}

function respondToInitialMove(move) {

	// if player's first move is the center, computer must choose a corner
	if (move === center)
		return corners;

	// if player's first move is a corner, computer must choose the center
	else if (isCorner(move))
		return [center];

	// An edge opening must be answered either with a center mark, 
	// a corner mark next to the X, or an edge mark opposite the X
	else return [
			center, 
			...cornerInSameLine(move),
			oppositeEdge(move)
		];

}


const winningLines = [
	// horizontal lines
	[0, 1, 2], [3, 4, 5], [6, 7, 8],

	// vertical rows
	[0, 3, 6], [1, 4, 7], [2, 5, 8],

	// diagonals
	[0, 4, 8], [2, 4, 6]
];

const corners = [0, 2, 6, 8],
	  edges = [1, 3, 5, 7],
	  center = 4;

// Useful helper functions
function isCorner(cell) {
	return corners.includes(cell);
}

function isEdge(cell) {
	return edges.includes(cell);
}

function oppositeEdge(edge) {
	return {1:7, 7:1, 3:5, 5:3}[edge];
}

function centerMove() {
	if (logs.computer.length !== 0)  
	return board[center] === "" ? [center] : false;
}

function cornerInSameLine(cell) {
	return winningLines.filter(line => {
		return line.includes(cell) && !line.includes(center);
	})[0].filter(move => move !== cell);
}

function randomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function emptyCells(currentBoard = board) {
	return currentBoard.reduce((empties, cell, i) => {
		return cell === '' ? [...empties, i] : empties;
	}, []);
}

function wins(type, currentBoard = board) {
	const wins = winningLines.filter(line => {
		return line.every(cell => currentBoard[cell] === type);
	});
	return wins.length ? wins : false;
}

function testMoves(player, test, currentBoard = board, moves = emptyCells(currentBoard)) {
	const possibleMoves = moves.filter(move => {
		const boardStatus = [...currentBoard];
		boardStatus[move] = player;
		return test.call(null, player, boardStatus);
	});
	return possibleMoves.length ? possibleMoves : false; 
}

function winningMoves(player, currentBoard = board) {
	return testMoves(player, wins, currentBoard);
}

function forkingMoves(player, currentBoard = board) {
	return testMoves(player, function(player, currentBoard) {
		return winningMoves(player, currentBoard).length > 1;
	});
}

function forcedBlocks(player = computer, currentBoard = board) {
	const opponentForks = forkingMoves(human, currentBoard) || [];
	//console.log(opponentForks);
	if (opponentForks.length === 0)
		return false;
	const moves = testMoves(player, function(player, currentBoard) {
		const move = winningMoves(player, currentBoard);
		console.log('move', move);
		if (move)
			return !opponentForks.includes(...move);
	});
	console.log('moves', moves);
	return moves.length ? moves : false;
}

// function lookAheadForForks(player = computer, currentBoard = board) {
// 	return testMoves(player, function(player, currentBoard) {
// 		return forkingMoves(player, currentBoard);
// 	});
// }


//computerMove();