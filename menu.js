document.addEventListener('DOMContentLoaded', () => {
    const menuMusic = document.getElementById('menuMusic');
    const gameCards = document.querySelectorAll('.game-card');

    // Add hover sound effect
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const hoverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
            hoverSound.volume = 0.2;
            hoverSound.play().catch(e => console.log('Audio play failed:', e));
        });
    });

    // Background music
    if (menuMusic) {
        menuMusic.volume = 0.3;
        
        // Only play music on user interaction
        document.addEventListener('click', () => {
            menuMusic.play().catch(e => console.log('Audio play failed:', e));
        }, { once: true });
    }

    // Add loading animation
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            card.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                window.location.href = card.href;
            }, 200);
        });
    });
});
