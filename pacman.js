document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const eatSound = document.getElementById('eatSound');
    const gameOverSound = document.getElementById('gameOverSound');
    const startButton = document.getElementById('startButton');
    
    // Game constants
    const GRID_SIZE = 20;
    const PACMAN = '';
    const GHOST = '';
    const CACTUS = '';
    const WALL = '';
    let CELL_SIZE;
    
    // Game state
    let gameLoop;
    let score = 0;
    let highScore = localStorage.getItem('pacmanHighScore') || 0;
    let gameStarted = false;
    let pellets = 0;
    let gameSpeed = 200;
    
    let pacman = {
        x: 1,
        y: 1,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 }
    };
    
    let ghosts = [
        { x: GRID_SIZE - 2, y: 1, direction: { x: -1, y: 0 } },
        { x: 1, y: GRID_SIZE - 2, direction: { x: 1, y: 0 } },
        { x: GRID_SIZE - 2, y: GRID_SIZE - 2, direction: { x: 0, y: -1 } }
    ];
    
    let maze = [];
    
    // Set canvas size based on screen size
    function resizeCanvas() {
        const size = Math.min(window.innerWidth - 40, window.innerHeight - 200, 600);
        canvas.width = size;
        canvas.height = size;
        CELL_SIZE = size / GRID_SIZE;
        
        if (gameStarted) {
            drawMaze();
            drawCharacters();
        } else {
            showStartScreen();
        }
    }
    
    function createMaze() {
        maze = [];
        pellets = 0;
        
        // Initialize with walls
        for (let y = 0; y < GRID_SIZE; y++) {
            let row = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) {
                    row.push(WALL);
                } else {
                    row.push('');
                    pellets++;
                }
            }
            maze.push(row);
        }
        
        // Add some random walls and cacti
        for (let y = 1; y < GRID_SIZE - 1; y++) {
            for (let x = 1; x < GRID_SIZE - 1; x++) {
                if (!(x === 1 && y === 1) && Math.random() < 0.2) {
                    maze[y][x] = Math.random() < 0.7 ? WALL : CACTUS;
                    pellets--;
                }
            }
        }
        
        // Ensure starting positions are clear
        maze[1][1] = '';
        maze[GRID_SIZE - 2][1] = '';
        maze[1][GRID_SIZE - 2] = '';
        maze[GRID_SIZE - 2][GRID_SIZE - 2] = '';
    }
    
    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${CELL_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = maze[y][x];
                if (cell === '') {
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(
                        x * CELL_SIZE + CELL_SIZE/2,
                        y * CELL_SIZE + CELL_SIZE/2,
                        CELL_SIZE/6,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                } else if (cell === WALL || cell === CACTUS) {
                    ctx.fillText(
                        cell,
                        x * CELL_SIZE + CELL_SIZE/2,
                        y * CELL_SIZE + CELL_SIZE/2
                    );
                }
            }
        }
    }
    
    function drawCharacters() {
        ctx.font = `${CELL_SIZE}px Arial`;
        
        // Draw Pac-Man
        ctx.fillText(
            PACMAN,
            pacman.x * CELL_SIZE + CELL_SIZE/2,
            pacman.y * CELL_SIZE + CELL_SIZE/2
        );
        
        // Draw Ghosts
        ghosts.forEach(ghost => {
            ctx.fillText(
                GHOST,
                ghost.x * CELL_SIZE + CELL_SIZE/2,
                ghost.y * CELL_SIZE + CELL_SIZE/2
            );
        });
    }
    
    function showStartScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = '48px Arial';
        ctx.fillText('Pac-Man', canvas.width/2, canvas.height/2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Press any key to start', canvas.width/2, canvas.height/2 + 50);
    }
    
    function isValidMove(x, y) {
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && 
               maze[y][x] !== WALL && maze[y][x] !== CACTUS;
    }
    
    function updateGame() {
        if (!gameStarted) return;
        
        // Try to move in the next direction if it's different
        if (pacman.nextDirection.x !== pacman.direction.x || 
            pacman.nextDirection.y !== pacman.direction.y) {
            if (isValidMove(
                pacman.x + pacman.nextDirection.x,
                pacman.y + pacman.nextDirection.y
            )) {
                pacman.direction = { ...pacman.nextDirection };
            }
        }
        
        // Move Pac-Man
        const newX = pacman.x + pacman.direction.x;
        const newY = pacman.y + pacman.direction.y;
        
        if (isValidMove(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;
            
            // Collect pellet
            if (maze[pacman.y][pacman.x] === '') {
                maze[pacman.y][pacman.x] = ' ';
                score += 10;
                pellets--;
                if (eatSound) eatSound.play().catch(() => {});
                
                document.getElementById('score').textContent = score;
                document.getElementById('highScore').textContent = Math.max(score, highScore);
                
                if (pellets === 0) {
                    gameOver(true);
                    return;
                }
            }
        }
        
        // Move ghosts
        ghosts.forEach(ghost => {
            const newX = ghost.x + ghost.direction.x;
            const newY = ghost.y + ghost.direction.y;
            
            if (!isValidMove(newX, newY)) {
                // Change direction
                const directions = [
                    { x: 1, y: 0 },
                    { x: -1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 0, y: -1 }
                ];
                
                const validDirections = directions.filter(dir => 
                    isValidMove(ghost.x + dir.x, ghost.y + dir.y)
                );
                
                if (validDirections.length > 0) {
                    const newDir = validDirections[Math.floor(Math.random() * validDirections.length)];
                    ghost.direction = newDir;
                }
            } else {
                ghost.x = newX;
                ghost.y = newY;
            }
        });
        
        // Check collision with ghosts
        if (ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y)) {
            gameOver(false);
            return;
        }
        
        drawMaze();
        drawCharacters();
    }
    
    function gameOver(won) {
        gameStarted = false;
        clearInterval(gameLoop);
        
        if (gameOverSound && !won) gameOverSound.play().catch(() => {});
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('pacmanHighScore', highScore);
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = won ? '#FFD700' : '#FF0000';
        ctx.font = '48px Arial';
        ctx.fillText(won ? '¡Ganaste!' : 'Game Over', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('Press any key to restart', canvas.width/2, canvas.height/2 + 40);
    }
    
    function startGame() {
        score = 0;
        gameSpeed = 200;
        gameStarted = true;
        
        pacman = {
            x: 1,
            y: 1,
            direction: { x: 0, y: 0 },
            nextDirection: { x: 0, y: 0 }
        };
        
        ghosts = [
            { x: GRID_SIZE - 2, y: 1, direction: { x: -1, y: 0 } },
            { x: 1, y: GRID_SIZE - 2, direction: { x: 1, y: 0 } },
            { x: GRID_SIZE - 2, y: GRID_SIZE - 2, direction: { x: 0, y: -1 } }
        ];
        
        createMaze();
        
        document.getElementById('score').textContent = '0';
        document.getElementById('highScore').textContent = highScore;
        
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, gameSpeed);
        
        drawMaze();
        drawCharacters();
    }
    
    // Event Listeners
    window.addEventListener('resize', resizeCanvas);
    
    // Start button
    startButton.addEventListener('click', () => {
        if (!gameStarted) {
            startGame();
        }
    });
    
    // Touch controls
    document.getElementById('upButton').addEventListener('click', () => {
        if (gameStarted) {
            pacman.nextDirection = { x: 0, y: -1 };
        }
    });
    
    document.getElementById('downButton').addEventListener('click', () => {
        if (gameStarted) {
            pacman.nextDirection = { x: 0, y: 1 };
        }
    });
    
    document.getElementById('leftButton').addEventListener('click', () => {
        if (gameStarted) {
            pacman.nextDirection = { x: -1, y: 0 };
        }
    });
    
    document.getElementById('rightButton').addEventListener('click', () => {
        if (gameStarted) {
            pacman.nextDirection = { x: 1, y: 0 };
        }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) {
            startGame();
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                pacman.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
                pacman.nextDirection = { x: 1, y: 0 };
                break;
            case 'ArrowUp':
            case 'w':
                pacman.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
                pacman.nextDirection = { x: 0, y: 1 };
                break;
        }
    });
    
    // Initialize
    resizeCanvas();
});
