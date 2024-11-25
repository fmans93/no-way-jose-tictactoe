document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('coloringCanvas');
    const ctx = canvas.getContext('2d');
    const colorSound = document.getElementById('colorSound');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        if (currentTemplate) {
            drawTemplate(currentTemplate);
        }
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    let currentColor = '#ff0000';
    let isDrawing = false;
    let regions = [];
    let currentTemplate = null;
    
    // Templates
    const templates = {
        sombrero: () => {
            ctx.beginPath();
            ctx.lineWidth = 2;
            
            // Brim
            ctx.ellipse(canvas.width/2, canvas.height*0.6, canvas.width*0.4, canvas.height*0.1, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // Crown
            ctx.beginPath();
            ctx.moveTo(canvas.width*0.3, canvas.height*0.6);
            ctx.quadraticCurveTo(canvas.width/2, canvas.height*0.3, canvas.width*0.7, canvas.height*0.6);
            ctx.stroke();
            
            // Decorations
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(canvas.width*0.3 + i * (canvas.width*0.1), canvas.height*0.55, canvas.width*0.02, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
        cactus: () => {
            ctx.beginPath();
            ctx.lineWidth = 2;
            
            // Main stem
            const stemWidth = canvas.width * 0.1;
            const x = canvas.width/2 - stemWidth/2;
            ctx.rect(x, canvas.height*0.3, stemWidth, canvas.height*0.5);
            ctx.stroke();
            
            // Arms
            const armWidth = canvas.width * 0.08;
            // Left arm
            ctx.beginPath();
            ctx.rect(x - armWidth, canvas.height*0.4, armWidth, canvas.height*0.2);
            ctx.stroke();
            
            // Right arm
            ctx.beginPath();
            ctx.rect(x + stemWidth, canvas.height*0.5, armWidth, canvas.height*0.2);
            ctx.stroke();
        },
        pinata: () => {
            ctx.beginPath();
            ctx.lineWidth = 2;
            
            // Body
            ctx.ellipse(canvas.width/2, canvas.height/2, canvas.width*0.3, canvas.height*0.2, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // Stripes
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(canvas.width/2 + i * (canvas.width*0.1), canvas.height*0.3);
                ctx.lineTo(canvas.width/2 + i * (canvas.width*0.1), canvas.height*0.7);
                ctx.stroke();
            }
        },
        guitar: () => {
            ctx.beginPath();
            ctx.lineWidth = 2;
            
            // Body
            ctx.ellipse(canvas.width/2, canvas.height*0.6, canvas.width*0.25, canvas.height*0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // Neck
            ctx.beginPath();
            ctx.rect(canvas.width/2 - canvas.width*0.05, canvas.height*0.2, canvas.width*0.1, canvas.height*0.4);
            ctx.stroke();
            
            // Sound hole
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height*0.6, canvas.width*0.1, 0, Math.PI * 2);
            ctx.stroke();
            
            // Strings
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(canvas.width/2 - canvas.width*0.03 + i * (canvas.width*0.012), canvas.height*0.2);
                ctx.lineTo(canvas.width/2 - canvas.width*0.03 + i * (canvas.width*0.012), canvas.height*0.8);
                ctx.stroke();
            }
        },
        maracas: () => {
            ctx.beginPath();
            ctx.lineWidth = 2;
            
            // Left maraca
            ctx.ellipse(canvas.width*0.35, canvas.height*0.3, canvas.width*0.15, canvas.height*0.1, Math.PI/4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas.width*0.4, canvas.height*0.35);
            ctx.lineTo(canvas.width*0.5, canvas.height*0.7);
            ctx.stroke();
            
            // Right maraca
            ctx.beginPath();
            ctx.ellipse(canvas.width*0.65, canvas.height*0.3, canvas.width*0.15, canvas.height*0.1, -Math.PI/4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas.width*0.6, canvas.height*0.35);
            ctx.lineTo(canvas.width*0.5, canvas.height*0.7);
            ctx.stroke();
        }
    };
    
    function drawTemplate(templateName) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        templates[templateName]();
        currentTemplate = templateName;
        createRegions();
    }
    
    window.selectTemplate = function(templateName) {
        drawTemplate(templateName);
    };
    
    function createRegions() {
        regions = [];
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const visited = new Set();
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                if (!visited.has(index) && data[index + 3] > 0) {
                    const region = floodFill(imageData, x, y, visited);
                    if (region.points.length > 10) {
                        regions.push(region);
                    }
                }
            }
        }
    }
    
    function floodFill(imageData, startX, startY, visited) {
        const points = [];
        const stack = [[startX, startY]];
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const index = (y * width + x) * 4;
            
            if (x < 0 || x >= width || y < 0 || y >= height ||
                visited.has(index) || data[index + 3] === 0) {
                continue;
            }
            
            visited.add(index);
            points.push([x, y]);
            
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        
        return { points };
    }
    
    function fillRegion(x, y) {
        for (const region of regions) {
            const inside = region.points.some(([px, py]) => 
                Math.abs(px - x) < 5 && Math.abs(py - y) < 5
            );
            
            if (inside) {
                ctx.fillStyle = currentColor;
                region.points.forEach(([px, py]) => {
                    ctx.fillRect(px, py, 1, 1);
                });
                if (colorSound) {
                    colorSound.currentTime = 0;
                    colorSound.play().catch(() => {});
                }
                break;
            }
        }
    }
    
    // Color picker
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            currentColor = option.dataset.color;
        });
    });
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        fillRegion(x, y);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        fillRegion(x, y);
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        fillRegion(x, y);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        fillRegion(x, y);
    });
    
    canvas.addEventListener('touchend', () => {
        isDrawing = false;
    });
    
    // Draw initial template
    drawTemplate('sombrero');
});
