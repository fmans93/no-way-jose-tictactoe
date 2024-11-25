document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const eatSound = document.getElementById('eatSound');
    const gameOverSound = document.getElementById('gameOverSound');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    const GRID_SIZE = 20;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    
    let snake = [{ x: 10, y: 10 }];
    let direction = 'right';
    let food = null;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLoopInterval;
    let gameStarted = false;
    
    const FOOD_ITEMS = ['🌮', '🌯', '🫔', '🌶️', '🥑'];
    
    document.getElementById('highScore').textContent = highScore;
    
    function generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                type: FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)]
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }
    
    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.font = `${CELL_SIZE}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                index === 0 ? '🤠' : '🎭',
                segment.x * CELL_SIZE + CELL_SIZE / 2,
                segment.y * CELL_SIZE + CELL_SIZE / 2
            );
        });
    }
    
    function drawFood() {
        if (!food) return;
        ctx.font = `${CELL_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            food.type,
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2
        );
    }
    
    function moveSnake() {
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collisions
        if (
            head.x < 0 || head.x >= GRID_SIZE ||
            head.y < 0 || head.y >= GRID_SIZE ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver();
            return;
        }
        
        snake.unshift(head);
        
        // Check if snake ate food
        if (food && head.x === food.x && head.y === food.y) {
            eatSound.currentTime = 0;
            eatSound.play();
            score++;
            document.getElementById('score').textContent = score;
            food = generateFood();
        } else {
            snake.pop();
        }
    }
    
    function gameOver() {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
        clearInterval(gameLoopInterval);
        gameStarted = false;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press Space to Play Again', canvas.width / 2, canvas.height / 2 + 60);
    }
    
    function startGame() {
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        food = generateFood();
        score = 0;
        document.getElementById('score').textContent = score;
        gameStarted = true;
        
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        gameLoopInterval = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            moveSnake();
            drawFood();
            drawSnake();
        }, 150);
    }
    
    // Show start screen
    function showStartScreen() {
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Mexican Chase', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted && e.code === 'Space') {
            startGame();
            return;
        }
        
        if (!gameStarted) return;
        
        switch (e.code) {
            case 'ArrowUp':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') direction = 'right';
                break;
        }
    });
    
    // Mobile controls
    const controls = document.querySelectorAll('.control-button');
    controls.forEach(button => {
        button.addEventListener('click', () => {
            if (!gameStarted) {
                startGame();
                return;
            }
            
            const newDirection = button.dataset.direction;
            if (!newDirection) return;
            
            switch (newDirection) {
                case 'up':
                    if (direction !== 'down') direction = 'up';
                    break;
                case 'down':
                    if (direction !== 'up') direction = 'down';
                    break;
                case 'left':
                    if (direction !== 'right') direction = 'left';
                    break;
                case 'right':
                    if (direction !== 'left') direction = 'right';
                    break;
            }
        });
    });
    
    // Initialize
    showStartScreen();
});
