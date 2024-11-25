document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('[data-cell]');
    const status = document.getElementById('status');
    const restartButton = document.getElementById('restartButton');
    const winSound = document.getElementById('winSound');
    const moveSound = document.getElementById('moveSound');
    let currentPlayer = '🌮';
    let gameActive = true;
    let gameState = ['', '', '', '', '', '', '', '', ''];

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        confettiContainer.innerHTML = '';
        const colors = ['#ff6b6b', '#ffd93d', '#2ecc71', '#ff9642'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 4000);
    }

    function handleCellClick(e) {
        const cell = e.target;
        const index = Array.from(cells).indexOf(cell);

        if (gameState[index] !== '' || !gameActive) return;

        gameState[index] = currentPlayer;
        cell.classList.add(currentPlayer === '🌮' ? 'taco' : 'jalapeno');
        moveSound.currentTime = 0;
        moveSound.play();

        if (checkWin()) {
            gameActive = false;
            status.textContent = `¡${currentPlayer} Gana!`;
            status.style.color = currentPlayer === '🌮' ? '#ff6b6b' : '#6e8efb';
            winSound.play();
            createConfetti();
            highlightWinningCells();
            return;
        }

        if (checkDraw()) {
            gameActive = false;
            status.textContent = "¡Empate!";
            status.style.color = '#666';
            return;
        }

        currentPlayer = currentPlayer === '🌮' ? '🌶️' : '🌮';
        status.textContent = `${currentPlayer}'s Turn`;
    }

    function highlightWinningCells() {
        winningCombinations.forEach(combination => {
            if (combination.every(index => gameState[index] === currentPlayer)) {
                combination.forEach(index => {
                    cells[index].classList.add('winner-cell');
                });
            }
        });
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

    function restartGame() {
        currentPlayer = '🌮';
        gameActive = true;
        gameState = ['', '', '', '', '', '', '', '', ''];
        status.textContent = "🌮's Turn";
        status.style.color = '#666';
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taco', 'jalapeno', 'winner-cell');
        });
        document.querySelector('.confetti-container').innerHTML = '';
    }

    // Add touch feedback for mobile devices
    function addTouchFeedback(element) {
        element.addEventListener('touchstart', () => {
            element.style.opacity = '0.8';
        });
        element.addEventListener('touchend', () => {
            element.style.opacity = '1';
        });
    }

    // Event Listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        addTouchFeedback(cell);
    });

    restartButton.addEventListener('click', restartGame);
    addTouchFeedback(restartButton);

    // Initialize the game
    restartGame();
});
