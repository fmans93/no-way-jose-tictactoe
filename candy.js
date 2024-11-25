document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const matchSound = document.getElementById('matchSound');
    const gameOverSound = document.getElementById('gameOverSound');
    
    const BOARD_SIZE = 8;
    const CANDIES = [
        'http://localhost:8000/images/taco.svg',
        'http://localhost:8000/images/burrito.svg',
        'http://localhost:8000/images/chili.svg',
        'http://localhost:8000/images/tamale.svg',
        'http://localhost:8000/images/avocado.svg',
        'http://localhost:8000/images/cookie.svg'
    ];
    
    let board = [];
    let score = 0;
    let moves = 30;
    let selectedCell = null;
    let highScore = localStorage.getItem('candyHighScore') || 0;
    
    document.getElementById('highScore').textContent = highScore;
    
    function createBoard() {
        gameBoard.innerHTML = '';
        board = [];
        
        for (let i = 0; i < BOARD_SIZE; i++) {
            const row = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                const candy = getRandomCandy();
                const img = document.createElement('img');
                img.src = candy;
                img.style.width = '100%';
                img.style.height = '100%';
                cell.appendChild(img);
                row.push(candy);
                
                cell.addEventListener('click', () => handleCellClick(cell));
                gameBoard.appendChild(cell);
            }
            board.push(row);
        }
    }
    
    function getRandomCandy() {
        return CANDIES[Math.floor(Math.random() * CANDIES.length)];
    }
    
    function handleCellClick(cell) {
        if (moves <= 0) return;
        
        if (!selectedCell) {
            selectedCell = cell;
            cell.classList.add('selected');
        } else {
            const row1 = parseInt(selectedCell.dataset.row);
            const col1 = parseInt(selectedCell.dataset.col);
            const row2 = parseInt(cell.dataset.row);
            const col2 = parseInt(cell.dataset.col);
            
            if (isAdjacent(row1, col1, row2, col2)) {
                swapCandies(row1, col1, row2, col2);
                moves--;
                document.getElementById('moves').textContent = moves;
                
                if (moves <= 0) {
                    gameOver();
                }
            }
            
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
    }
    
    function isAdjacent(row1, col1, row2, col2) {
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    }
    
    function swapCandies(row1, col1, row2, col2) {
        const temp = board[row1][col1];
        board[row1][col1] = board[row2][col2];
        board[row2][col2] = temp;
        
        updateBoard();
        
        if (!checkMatches()) {
            // Swap back if no matches
            board[row1][col1] = board[row2][col2];
            board[row2][col2] = temp;
            updateBoard();
        }
    }
    
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const img = cell.querySelector('img');
            if (img) {
                img.src = board[row][col];
            } else {
                const newImg = document.createElement('img');
                newImg.src = board[row][col];
                newImg.style.width = '100%';
                newImg.style.height = '100%';
                cell.appendChild(newImg);
            }
        });
    }
    
    function checkMatches() {
        let hasMatches = false;
        
        // Check rows
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE - 2; j++) {
                if (board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2]) {
                    hasMatches = true;
                    score += 30;
                    matchSound.currentTime = 0;
                    matchSound.play();
                    
                    // Remove matched candies
                    for (let k = 0; k < 3; k++) {
                        board[i][j + k] = getRandomCandy();
                    }
                }
            }
        }
        
        // Check columns
        for (let j = 0; j < BOARD_SIZE; j++) {
            for (let i = 0; i < BOARD_SIZE - 2; i++) {
                if (board[i][j] === board[i + 1][j] && board[i][j] === board[i + 2][j]) {
                    hasMatches = true;
                    score += 30;
                    matchSound.currentTime = 0;
                    matchSound.play();
                    
                    // Remove matched candies
                    for (let k = 0; k < 3; k++) {
                        board[i + k][j] = getRandomCandy();
                    }
                }
            }
        }
        
        if (hasMatches) {
            document.getElementById('score').textContent = score;
            updateBoard();
            
            // Check for cascading matches
            setTimeout(() => {
                checkMatches();
            }, 300);
        }
        
        return hasMatches;
    }
    
    function gameOver() {
        gameOverSound.play();
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('candyHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
        
        setTimeout(() => {
            alert(`¡Game Over! Final Score: ${score}`);
        }, 500);
    }
    
    function newGame() {
        score = 0;
        moves = 30;
        document.getElementById('score').textContent = score;
        document.getElementById('moves').textContent = moves;
        createBoard();
    }
    
    document.getElementById('newGameButton').addEventListener('click', newGame);
    
    // Initialize game
    createBoard();
});
