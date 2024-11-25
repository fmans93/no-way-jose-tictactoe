document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const eatSound = document.getElementById('eatSound');
    const gameOverSound = document.getElementById('gameOverSound');
    
    // Set canvas size based on screen size
    function resizeCanvas() {
        const size = Math.min(window.innerWidth - 40, window.innerHeight - 200, 600);
        canvas.width = size;
        canvas.height = size;
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (gameStarted) {
            drawMaze();
            drawCharacters();
        }
    });
    
    resizeCanvas();
    
    const CELL_SIZE = canvas.width / 20;
    const GRID_SIZE = 20;
    const PACMAN = '😀';
    const GHOST = '👻';
    const CACTUS = '🌵';
    const WALL = '🧱';
    
    let gameLoop;
    let score = 0;
    let highScore = localStorage.getItem('pacmanHighScore') || 0;
    let gameStarted = false;
    let pellets = 0;
    
    let pacman = {
        x: 1,
        y: 1,
        direction: { x: 0, y: 0 }
    };
    
    let ghosts = [
        { x: GRID_SIZE - 2, y: 1, direction: { x: -1, y: 0 } },
        { x: 1, y: GRID_SIZE - 2, direction: { x: 1, y: 0 } },
        { x: GRID_SIZE - 2, y: GRID_SIZE - 2, direction: { x: 0, y: -1 } }
    ];
    
    let maze = [];
    
    function createMaze() {
        maze = [];
        pellets = 0;
        for (let y = 0; y < GRID_SIZE; y++) {
            let row = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) {
                    row.push(WALL);
                } else if (Math.random() < 0.2 && !(x === 1 && y === 1)) {
                    row.push(WALL);
                } else if (Math.random() < 0.1 && !(x === 1 && y === 1)) {
                    row.push(CACTUS);
                } else {
                    row.push('•');
                    pellets++;
                }
            }
            maze.push(row);
        }
        maze[1][1] = '';  // Ensure starting position is clear
        pellets--;  // Account for starting position
    }
    
    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${CELL_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = maze[y][x];
                if (cell) {
                    if (cell === '•') {
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
                    } else {
                        ctx.fillText(
                            cell,
                            x * CELL_SIZE + CELL_SIZE/2,
                            y * CELL_SIZE + CELL_SIZE/2
                        );
                    }
                }
            }
        }
    }
    
    function drawCharacters() {
        // Draw Pac-Man
        ctx.font = `${CELL_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
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
    
    function moveGhosts() {
        ghosts.forEach(ghost => {
            const possibleDirections = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];
            
            // Try to move towards Pac-Man with 60% probability
            if (Math.random() < 0.6) {
                possibleDirections.sort(() => Math.random() - 0.5);
                possibleDirections.sort((a, b) => {
                    const distA = Math.abs((ghost.x + a.x) - pacman.x) + Math.abs((ghost.y + a.y) - pacman.y);
                    const distB = Math.abs((ghost.x + b.x) - pacman.x) + Math.abs((ghost.y + b.y) - pacman.y);
                    return distA - distB;
                });
            } else {
                possibleDirections.sort(() => Math.random() - 0.5);
            }
            
            for (const dir of possibleDirections) {
                const newX = ghost.x + dir.x;
                const newY = ghost.y + dir.y;
                
                if (maze[newY][newX] !== WALL && maze[newY][newX] !== CACTUS) {
                    ghost.x = newX;
                    ghost.y = newY;
                    ghost.direction = dir;
                    break;
                }
            }
        });
    }
    
    function checkCollision() {
        return ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y);
    }
    
    function updateGame() {
        if (!gameStarted) return;
        
        // Move Pac-Man
        const newX = pacman.x + pacman.direction.x;
        const newY = pacman.y + pacman.direction.y;
        
        if (maze[newY][newX] !== WALL && maze[newY][newX] !== CACTUS) {
            pacman.x = newX;
            pacman.y = newY;
            
            // Collect pellet
            if (maze[newY][newX] === '•') {
                maze[newY][newX] = '';
                score += 10;
                pellets--;
                document.getElementById('score').textContent = score;
                if (eatSound) {
                    eatSound.currentTime = 0;
                    eatSound.play().catch(() => {});
                }
                
                // Check win condition
                if (pellets === 0) {
                    gameOver(true);
                    return;
                }
            }
        }
        
        // Move ghosts every other frame
        if (Date.now() % 2 === 0) {
            moveGhosts();
        }
        
        // Check collision with ghosts
        if (checkCollision()) {
            gameOver(false);
            return;
        }
        
        // Draw everything
        drawMaze();
        drawCharacters();
        
        // Continue game loop
        requestAnimationFrame(updateGame);
    }
    
    function gameOver(won) {
        gameStarted = false;
        clearInterval(gameLoop);
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('pacmanHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
        
        if (gameOverSound && !won) {
            gameOverSound.play().catch(() => {});
        }
        
        setTimeout(() => {
            alert(won ? '¡Felicidades! You won!' : 'Game Over! ¡Inténtalo de nuevo!');
            startGame();
        }, 100);
    }
    
    function startGame() {
        // Reset game state
        score = 0;
        document.getElementById('score').textContent = score;
        document.getElementById('highScore').textContent = highScore;
        
        // Reset characters
        pacman = {
            x: 1,
            y: 1,
            direction: { x: 0, y: 0 }
        };
        
        ghosts = [
            { x: GRID_SIZE - 2, y: 1, direction: { x: -1, y: 0 } },
            { x: 1, y: GRID_SIZE - 2, direction: { x: 1, y: 0 } },
            { x: GRID_SIZE - 2, y: GRID_SIZE - 2, direction: { x: 0, y: -1 } }
        ];
        
        // Create new maze
        createMaze();
        drawMaze();
        drawCharacters();
        
        // Start game
        gameStarted = true;
        requestAnimationFrame(updateGame);
    }
    
    // Controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) {
            startGame();
            return;
        }
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                e.preventDefault();
                pacman.direction = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
                e.preventDefault();
                pacman.direction = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
                e.preventDefault();
                pacman.direction = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
                e.preventDefault();
                pacman.direction = { x: 1, y: 0 };
                break;
        }
    });
    
    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!gameStarted) {
            startGame();
            return;
        }
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                pacman.direction = { x: 1, y: 0 };
            } else {
                pacman.direction = { x: -1, y: 0 };
            }
        } else {
            if (dy > 0) {
                pacman.direction = { x: 0, y: 1 };
            } else {
                pacman.direction = { x: 0, y: -1 };
            }
        }
        
        touchStartX = touchEndX;
        touchStartY = touchEndY;
        e.preventDefault();
    });
    
    // Start screen
    drawMaze();
    drawCharacters();
});
