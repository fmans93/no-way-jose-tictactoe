document.addEventListener('DOMContentLoaded', () => {
    const board = document.querySelector('.game-board');
    const movesDisplay = document.getElementById('moves');
    const timeDisplay = document.getElementById('time');
    const restartButton = document.getElementById('restartButton');

    const imageUrls = [
        'images/taco.svg',
        'images/chili.svg',
        'images/mask.svg',
        'images/tent.svg',
        'images/pinata.svg',
        'images/guitar.svg',
        'images/cactus.svg',
        'images/desert.svg'
    ];
    
    // Preload images with better error handling
    const preloadImages = () => {
        console.log('Starting to preload images...');
        const promises = imageUrls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Successfully loaded: ${url}`);
                    resolve(url);
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${url}`);
                    reject(`Failed to load image: ${url}`);
                };
                img.src = url;
            });
        });
        
        // Also preload the back card image
        promises.push(new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log('Successfully loaded back card image');
                resolve('images/target.svg');
            };
            img.onerror = () => {
                console.error('Failed to load back card image');
                reject('Failed to load back card image');
            };
            img.src = 'images/target.svg';
        }));

        return Promise.all(promises).catch(error => {
            console.error('Error loading images:', error);
            alert('Some game images failed to load. Please refresh the page.');
        });
    };
    
    let cards = [];
    let flippedCards = [];
    let moves = 0;
    let matches = 0;
    let timer;
    let seconds = 0;
    let canFlip = true;

    function shuffle(array) {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function createCard(imageUrl, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        // Add loading state
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${imageUrl}" alt="Card Front" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>?</text></svg>'">
                </div>
                <div class="card-back">
                    <img src="images/target.svg" alt="Card Back"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>?</text></svg>'">
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        return card;
    }

    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || 
            card.classList.contains('matched') || 
            flippedCards.length >= 2) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const match = cards[card1.dataset.index] === cards[card2.dataset.index];

        canFlip = false;
        setTimeout(() => {
            if (match) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matches++;

                if (matches === cards.length / 2) {
                    clearInterval(timer);
                    setTimeout(() => {
                        createConfetti();
                        alert(`Congratulations! You won in ${moves} moves and ${timeDisplay.textContent}!`);
                    }, 500);
                }
            } else {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }

    function updateTimer() {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        confettiContainer.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confettiContainer.appendChild(confetti);
        }
    }

    function startGame() {
        // First preload images
        preloadImages()
            .then(() => {
                board.innerHTML = '';
                flippedCards = [];
                moves = 0;
                matches = 0;
                seconds = 0;
                canFlip = true;

                movesDisplay.textContent = moves;
                timeDisplay.textContent = '0:00';
                
                if (timer) clearInterval(timer);
                timer = setInterval(updateTimer, 1000);

                cards = shuffle([...imageUrls, ...imageUrls]);
                cards.forEach((url, index) => {
                    board.appendChild(createCard(url, index));
                });
            })
            .catch(error => {
                console.error('Failed to load images:', error);
                board.innerHTML = '<div class="error">Failed to load game images. Please try refreshing the page.</div>';
            });
    }

    restartButton.addEventListener('click', startGame);
    startGame();
});
