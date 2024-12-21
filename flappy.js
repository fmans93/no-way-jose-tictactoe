@ -19,22 +19,22 @@ document.addEventListener('DOMContentLoaded', () => {
    const donkeyImg = new Image();
    donkeyImg.onload = checkAllImagesLoaded;
    donkeyImg.onerror = () => console.error('Failed to load donkey image');
<<<<<<< HEAD
=======
    donkeyImg.src = 'images/donkey.svg';
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
    donkeyImg.src = './images/donkey.svg';
    
    const cactusImg = new Image();
    cactusImg.onload = checkAllImagesLoaded;
    cactusImg.onerror = () => console.error('Failed to load cactus image');
<<<<<<< HEAD
=======
    cactusImg.src = 'images/cactus.svg';
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
    cactusImg.src = './images/cactus.svg';
    
    const cornImg = new Image();
    cornImg.onload = checkAllImagesLoaded;
    cornImg.onerror = () => console.error('Failed to load corn image');
<<<<<<< HEAD
=======
    cornImg.src = 'images/corn.svg';
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
    cornImg.src = './images/corn.svg';
    
    const backgroundImg = new Image();
    backgroundImg.onload = checkAllImagesLoaded;
    backgroundImg.onerror = () => console.error('Failed to load background image');
<<<<<<< HEAD
=======
    backgroundImg.src = 'images/background.svg';
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
    backgroundImg.src = './images/background.svg';
    
    let gameLoop;
    let donkey = {
@ -272,16 +272,24 @@ document.addEventListener('DOMContentLoaded', () => {
    }
    
    function showStartScreen() {
<<<<<<< HEAD
=======
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
        document.getElementById('loading').style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        
<<<<<<< HEAD
=======
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
        // Draw title
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 40px Permanent Marker';
        ctx.textAlign = 'center';
<<<<<<< HEAD
        ctx.fillText('¡Burro Volador!', canvas.width/2, canvas.height/3);
        
=======
        ctx.fillText('¡Burro Volador!', canvas.width / 2, canvas.height / 2);
        ctx.fillText('¡Burro Volador!', canvas.width/2, canvas.height/3);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 40);
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
        // Draw instructions
        ctx.fillStyle = '#333';
        ctx.font = '20px Poppins';
        ctx.fillText('Press SPACE or TAP to start', canvas.width/2, canvas.height/2);
        ctx.fillText('and make the donkey jump!', canvas.width/2, canvas.height/2 + 30);
        
        // Draw donkey
        ctx.drawImage(donkeyImg, canvas.width/2 - 40, canvas.height/2 + 50, 80, 80);
    }
    
    // Controls
@ -292,9 +300,15 @@ document.addEventListener('DOMContentLoaded', () => {
        }
    });
    
<<<<<<< HEAD
=======
    canvas.addEventListener('click', jump);
>>>>>>> d0404d13adaff3429773cc538f9b44cd1dffa774
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
