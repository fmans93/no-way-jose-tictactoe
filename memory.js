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
    }

    restartButton.addEventListener('click', startGame);
    startGame();
});
