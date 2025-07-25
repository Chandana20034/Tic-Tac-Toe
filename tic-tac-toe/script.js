const gameBoard = document.querySelector('.game-board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const resetScoreButton = document.getElementById('resetScoreButton');
const historyList = document.getElementById('historyList');
const xScoreElement = document.querySelector('.x-score .score');
const oScoreElement = document.querySelector('.o-score .score');
const tiesScoreElement = document.querySelector('.ties .score');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let scores = {
    X: 0,
    O: 0,
    ties: 0
};

// Sound effects
const sounds = {
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    draw: new Audio('https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3'),
    restart: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3')
};

// Adjust sound volume
Object.values(sounds).forEach(sound => {
    sound.volume = 0.2;
});

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Game text
const gameText = {
    playerTurn: (player) => `Player ${player}'s Turn`,
    playerWins: (player) => `Player ${player} Wins!`,
    gameDraw: "Game Ended in a Draw!",
    restart: "Restart Game",
    historyWin: (player) => `Player ${player} won the game`,
    historyDraw: "Game ended in a draw",
    resetConfirm: "Are you sure you want to reset the score?",
    keyboardShortcut: "Press 'R' to restart the game"
};

function updateScoreBoard() {
    xScoreElement.textContent = scores.X;
    oScoreElement.textContent = scores.O;
    tiesScoreElement.textContent = scores.ties;
    
    // Update active player highlight
    document.querySelector('.x-score').classList.toggle('active', currentPlayer === 'X');
    document.querySelector('.o-score').classList.toggle('active', currentPlayer === 'O');
}

function addToHistory(result) {
    const historyItem = document.createElement('div');
    historyItem.className = 'list-group-item';
    const timestamp = new Date().toLocaleTimeString();
    historyItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>${result}</span>
            <small class="text-secondary">${timestamp}</small>
        </div>
    `;
    historyList.insertBefore(historyItem, historyList.firstChild);
}

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (gameState[cellIndex] !== '' || !gameActive) return;

    // Play click sound
    sounds.click.currentTime = 0;
    sounds.click.play();

    // Add click animation
    cell.style.transform = 'scale(0.9)';
    setTimeout(() => {
        cell.style.transform = 'scale(1)';
    }, 100);

    gameState[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.setAttribute('aria-label', `Cell ${cellIndex + 1} marked with ${currentPlayer}`);

    if (checkWin()) {
        gameActive = false;
        status.textContent = gameText.playerWins(currentPlayer);
        status.style.color = currentPlayer === 'X' ? '#ff0000' : '#3ea6ff';
        highlightWinningCells();
        sounds.win.play();
        scores[currentPlayer]++;
        updateScoreBoard();
        addToHistory(gameText.historyWin(currentPlayer));
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = gameText.gameDraw;
        status.style.color = '#aaaaaa';
        sounds.draw.play();
        scores.ties++;
        updateScoreBoard();
        addToHistory(gameText.historyDraw);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = gameText.playerTurn(currentPlayer);
    status.style.color = currentPlayer === 'X' ? '#ff0000' : '#3ea6ff';
    updateScoreBoard();
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function highlightWinningCells() {
    winningCombinations.forEach(combination => {
        if (combination.every(index => gameState[index] === currentPlayer)) {
            combination.forEach((index, i) => {
                setTimeout(() => {
                    cells[index].classList.add('winning');
                }, i * 150);
            });
        }
    });
}

function restartGame() {
    sounds.restart.play();
    
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = gameText.playerTurn(currentPlayer);
    status.style.color = '#ff0000';
    
    cells.forEach((cell, index) => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
        cell.setAttribute('aria-label', `Cell ${index + 1}`);
    });
    
    updateScoreBoard();
}

function resetScores() {
    if (confirm(gameText.resetConfirm)) {
        scores = { X: 0, O: 0, ties: 0 };
        updateScoreBoard();
        historyList.innerHTML = '';
        restartGame();
    }
}

// Add keyboard support
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCellClick({ target: cell });
        }
    });
});

restartButton.addEventListener('click', restartGame);
resetScoreButton.addEventListener('click', resetScores);

// Add keyboard shortcut for restart
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

// Initialize the game
updateScoreBoard();
