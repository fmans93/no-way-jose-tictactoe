document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const jumpSound = document.getElementById('jumpSound');
    const pointSound = document.getElementById('pointSound');
    const gameOverSound = document.getElementById('gameOverSound');
    
    let imagesLoaded = 0;
    const totalImages = 4;
    
    function checkAllImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            showStartScreen();
        }
    }
    
    // Load images with error handling
    const donkeyImg = new Image();
    donkeyImg.onload = checkAllImagesLoaded;
    donkeyImg.onerror = () => console.error('Failed to load donkey image');
    donkeyImg.src = './images/donkey.svg';
    
    const cactusImg = new Image();
    cactusImg.onload = checkAllImagesLoaded;
    cactusImg.onerror = () => console.error('Failed to load cactus image');
    cactusImg.src = './images/cactus.svg';
    
    const cornImg = new Image();
    cornImg.onload = checkAllImagesLoaded;
    cornImg.onerror = () => console.error('Failed to load corn image');
    cornImg.src = './images/corn.svg';
    
    const backgroundImg = new Image();
    backgroundImg.onload = checkAllImagesLoaded;
    backgroundImg.onerror = () => console.error('Failed to load background image');
    backgroundImg.src = './images/background.svg';
    
    let gameLoop;
    let donkey = {
        x: 50,
        y: canvas.height / 2,
        width: 40,
        height: 40,
        velocity: 0,
        gravity: 0.5,
        jumpForce: -8
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
            ctx.fillStyle = '#45322E';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Draw cactus pattern
            const pattern = ctx.createPattern(cactusImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
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
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
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
        if (donkey.y < 0 || donkey.y + donkey.height > canvas.height) {
            gameOver();
            return;
        }
        
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
        ctx.font = '48px Permanent Marker';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '24px Poppins';
        ctx.fillText(`Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press Space or Tap to Restart', canvas.width / 2, canvas.height / 2 + 60);
    }
    
    function startGame() {
        gameStarted = true;
        score = 0;
        document.getElementById('score').textContent = '0';
        
        donkey = {
            x: 50,
            y: canvas.height / 2,
            width: 40,
            height: 40,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -8
        };
        
        obstacles = [];
        corns = [];
        
        function gameStep() {
            if (gameStarted) {
                updateGame();
                drawGame();
                gameLoop = requestAnimationFrame(gameStep);
            }
        }
        
        gameLoop = requestAnimationFrame(gameStep);
    }
    
    function showStartScreen() {
        document.getElementById('loading').style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        
        // Draw title
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 40px Permanent Marker';
        ctx.textAlign = 'center';
        ctx.fillText('¡Burro Volador!', canvas.width/2, canvas.height/3);
        
        // Draw instructions
        ctx.fillStyle = '#333';
        ctx.font = '20px Poppins';
        ctx.fillText('Press SPACE or TAP to start', canvas.width/2, canvas.height/2);
        ctx.fillText('and make the donkey jump!', canvas.width/2, canvas.height/2 + 30);
        
        // Draw donkey
        ctx.drawImage(donkeyImg, canvas.width/2 - 40, canvas.height/2 + 50, 80, 80);
    }
    
    // Controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    // Mobile touch controls
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });
    
    // Mouse controls
    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        jump();
    });
});
