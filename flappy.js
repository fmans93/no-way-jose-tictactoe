document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const jumpSound = document.getElementById('jumpSound');
    const pointSound = document.getElementById('pointSound');
    const gameOverSound = document.getElementById('gameOverSound');
    
    // Load images
    const donkeyImg = new Image();
    donkeyImg.src = 'images/donkey.svg';
    
    const cactusImg = new Image();
    cactusImg.src = 'images/cactus.svg';
    
    const cornImg = new Image();
    cornImg.src = 'images/corn.svg';
    
    const backgroundImg = new Image();
    backgroundImg.src = 'images/background.svg';
    
    let gameLoop;
    let donkey = {
        x: 50,
        y: canvas.height / 2,
        width: 60,
        height: 60,
        velocity: 0,
        gravity: 0.5,
        jumpForce: -10
    };
    
    let score = 0;
    let highScore = localStorage.getItem('flappyHighScore') || 0;
    let obstacles = [];
    let corns = [];
    let gameStarted = false;
    
    document.getElementById('highScore').textContent = highScore;
    
    function jump() {
        if (!gameStarted) {
            startGame();
            return;
        }
        donkey.velocity = donkey.jumpForce;
        if (jumpSound) {
            jumpSound.currentTime = 0;
            jumpSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    function createObstacle() {
        const gap = 200;
        const minHeight = 50;
        const maxHeight = canvas.height - gap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: 80,
            height: height,
            passed: false
        });
        
        obstacles.push({
            x: canvas.width,
            y: height + gap,
            width: 80,
            height: canvas.height - height - gap,
            passed: false
        });
        
        // Add corn between obstacles
        if (Math.random() > 0.5) {
            corns.push({
                x: canvas.width + 40,
                y: height + gap / 2,
                width: 30,
                height: 30,
                collected: false
            });
        }
    }
    
    function drawDonkey() {
        ctx.save();
        ctx.translate(donkey.x + donkey.width / 2, donkey.y + donkey.height / 2);
        ctx.rotate(donkey.velocity * 0.02);
        ctx.drawImage(donkeyImg, -donkey.width / 2, -donkey.height / 2, donkey.width, donkey.height);
        ctx.restore();
    }
    
    function drawObstacles() {
        obstacles.forEach(obstacle => {
            // Draw cactus pattern
            const pattern = ctx.createPattern(cactusImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Add decorative border
            ctx.strokeStyle = '#45322E';
            ctx.lineWidth = 4;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }
    
    function drawCorns() {
        corns.forEach(corn => {
            if (!corn.collected) {
                ctx.drawImage(cornImg, corn.x, corn.y, corn.width, corn.height);
            }
        });
    }
    
    function drawBackground() {
        // Draw scrolling background
        const backgroundWidth = canvas.width;
        const backgroundHeight = canvas.height;
        ctx.drawImage(backgroundImg, 0, 0, backgroundWidth, backgroundHeight);
    }
    
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    function updateGame() {
        donkey.velocity += donkey.gravity;
        donkey.y += donkey.velocity;
        
        // Move obstacles
        obstacles.forEach(obstacle => {
            obstacle.x -= 3;
        });
        
        // Move corns
        corns.forEach(corn => {
            corn.x -= 3;
        });
        
        // Remove off-screen obstacles
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
        
        // Remove off-screen corns
        corns = corns.filter(corn => corn.x + corn.width > 0);
        
        // Create new obstacles
        if (obstacles.length === 0 || obstacles[obstacles.length - 2].x < canvas.width - 300) {
            createObstacle();
        }
        
        // Check for collisions
        for (let obstacle of obstacles) {
            if (checkCollision(donkey, obstacle)) {
                gameOver();
                return;
            }
            
            // Score points for passing obstacles
            if (!obstacle.passed && obstacle.x + obstacle.width < donkey.x) {
                obstacle.passed = true;
                score += 0.5; // Count each obstacle pair as 1 point
                document.getElementById('score').textContent = Math.floor(score);
                if (pointSound) {
                    pointSound.currentTime = 0;
                    pointSound.play().catch(e => console.log('Audio play failed:', e));
                }
            }
        }
        
        // Check for corn collection
        corns.forEach(corn => {
            if (!corn.collected && checkCollision(donkey, corn)) {
                corn.collected = true;
                score += 1;
                document.getElementById('score').textContent = Math.floor(score);
                if (pointSound) {
                    pointSound.currentTime = 0;
                    pointSound.play().catch(e => console.log('Audio play failed:', e));
                }
            }
        });
        
        // Check boundaries
        if (donkey.y < 0 || donkey.y + donkey.height > canvas.height) {
            gameOver();
            return;
        }
    }
    
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawObstacles();
        drawCorns();
        drawDonkey();
    }
    
    function gameOver() {
        if (gameOverSound) {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        cancelAnimationFrame(gameLoop);
        gameStarted = false;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
            document.getElementById('highScore').textContent = Math.floor(highScore);
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Game Over!', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Play Again', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    function startGame() {
        donkey = {
            x: 50,
            y: canvas.height / 2,
            width: 60,
            height: 60,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10
        };
        
        score = 0;
        obstacles = [];
        corns = [];
        gameStarted = true;
        document.getElementById('score').textContent = '0';
        
        function animate() {
            if (gameStarted) {
                updateGame();
                drawGame();
                gameLoop = requestAnimationFrame(animate);
            }
        }
        animate();
    }
    
    function showStartScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Burro Volador!', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    // Controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
    
    // Wait for images to load
    Promise.all([
        new Promise(resolve => donkeyImg.onload = resolve),
        new Promise(resolve => cactusImg.onload = resolve),
        new Promise(resolve => cornImg.onload = resolve),
        new Promise(resolve => backgroundImg.onload = resolve)
    ]).then(() => {
        showStartScreen();
    });
});
