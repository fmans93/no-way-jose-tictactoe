document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('coloringCanvas');
    const ctx = canvas.getContext('2d');
    let currentColor = '#ff4757';
    let currentTemplate = 'sombrero';
    let templateRegions = [];
    let backgroundColor = 'white';
    
    // Define regions for each template
    const templateParts = {
        sombrero: [
            { name: 'brim', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.2, h * 0.6);
                ctx.bezierCurveTo(w * 0.2, h * 0.5, w * 0.8, h * 0.5, w * 0.8, h * 0.6);
                ctx.lineTo(w * 0.8, h * 0.62);
                ctx.bezierCurveTo(w * 0.8, h * 0.72, w * 0.2, h * 0.72, w * 0.2, h * 0.62);
                ctx.closePath();
            }},
            { name: 'crown', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.35, h * 0.6);
                ctx.bezierCurveTo(w * 0.35, h * 0.3, w * 0.65, h * 0.3, w * 0.65, h * 0.6);
                ctx.lineTo(w * 0.65, h * 0.62);
                ctx.bezierCurveTo(w * 0.65, h * 0.42, w * 0.35, h * 0.42, w * 0.35, h * 0.62);
                ctx.closePath();
            }},
            { name: 'band', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.rect(w * 0.35, h * 0.44, w * 0.3, h * 0.02);
            }}
        ],
        cactus: [
            { name: 'main-body', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.45, h * 0.8);
                ctx.lineTo(w * 0.45, h * 0.3);
                ctx.quadraticCurveTo(w * 0.45, h * 0.2, w * 0.55, h * 0.2);
                ctx.quadraticCurveTo(w * 0.65, h * 0.2, w * 0.65, h * 0.3);
                ctx.lineTo(w * 0.65, h * 0.8);
                ctx.closePath();
            }},
            { name: 'left-arm', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.45, h * 0.5);
                ctx.lineTo(w * 0.3, h * 0.5);
                ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.2, h * 0.4);
                ctx.quadraticCurveTo(w * 0.2, h * 0.3, w * 0.3, h * 0.3);
                ctx.lineTo(w * 0.45, h * 0.3);
                ctx.closePath();
            }},
            { name: 'right-arm', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.65, h * 0.4);
                ctx.lineTo(w * 0.8, h * 0.4);
                ctx.quadraticCurveTo(w * 0.9, h * 0.4, w * 0.9, h * 0.3);
                ctx.quadraticCurveTo(w * 0.9, h * 0.2, w * 0.8, h * 0.2);
                ctx.lineTo(w * 0.65, h * 0.2);
                ctx.closePath();
            }}
        ],
        maracas: [
            { name: 'left-maraca', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.arc(w * 0.3, h * 0.3, w * 0.15, 0, Math.PI * 2);
                ctx.moveTo(w * 0.3, h * 0.45);
                ctx.lineTo(w * 0.4, h * 0.7);
                ctx.lineTo(w * 0.35, h * 0.7);
                ctx.lineTo(w * 0.25, h * 0.45);
                ctx.closePath();
            }},
            { name: 'right-maraca', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.arc(w * 0.7, h * 0.3, w * 0.15, 0, Math.PI * 2);
                ctx.moveTo(w * 0.7, h * 0.45);
                ctx.lineTo(w * 0.8, h * 0.7);
                ctx.lineTo(w * 0.75, h * 0.7);
                ctx.lineTo(w * 0.65, h * 0.45);
                ctx.closePath();
            }}
        ],
        pinata: [
            { name: 'body', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.3, h * 0.4);
                ctx.bezierCurveTo(w * 0.2, h * 0.5, w * 0.2, h * 0.7, w * 0.5, h * 0.8);
                ctx.bezierCurveTo(w * 0.8, h * 0.7, w * 0.8, h * 0.5, w * 0.7, h * 0.4);
                ctx.closePath();
            }},
            { name: 'tail', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.3, h * 0.4);
                ctx.bezierCurveTo(w * 0.2, h * 0.3, w * 0.15, h * 0.2, w * 0.1, h * 0.1);
                ctx.lineTo(w * 0.15, h * 0.15);
                ctx.bezierCurveTo(w * 0.2, h * 0.25, w * 0.25, h * 0.35, w * 0.3, h * 0.4);
                ctx.closePath();
            }},
            { name: 'stripes', path: (ctx, w, h) => {
                ctx.beginPath();
                for(let i = 0; i < 5; i++) {
                    ctx.moveTo(w * (0.3 + i * 0.1), h * 0.4);
                    ctx.lineTo(w * (0.35 + i * 0.1), h * 0.7);
                }
                ctx.stroke();
            }}
        ],
        taco: [
            { name: 'shell', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.2, h * 0.6);
                ctx.quadraticCurveTo(w * 0.5, h * 0.2, w * 0.8, h * 0.6);
                ctx.lineTo(w * 0.8, h * 0.62);
                ctx.quadraticCurveTo(w * 0.5, h * 0.22, w * 0.2, h * 0.62);
                ctx.closePath();
            }},
            { name: 'lettuce', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.3, h * 0.45);
                for (let i = 0; i < 8; i++) {
                    ctx.quadraticCurveTo(
                        w * (0.33 + i * 0.07), h * 0.4,
                        w * (0.35 + i * 0.07), h * 0.45
                    );
                }
                ctx.lineTo(w * 0.8, h * 0.47);
                ctx.lineTo(w * 0.3, h * 0.47);
                ctx.closePath();
            }},
            { name: 'filling', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.25, h * 0.55);
                ctx.quadraticCurveTo(w * 0.5, h * 0.35, w * 0.75, h * 0.55);
                ctx.lineTo(w * 0.75, h * 0.57);
                ctx.quadraticCurveTo(w * 0.5, h * 0.37, w * 0.25, h * 0.57);
                ctx.closePath();
            }}
        ],
        guitar: [
            { name: 'body', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.3, h * 0.4);
                ctx.bezierCurveTo(w * 0.2, h * 0.5, w * 0.2, h * 0.7, w * 0.3, h * 0.8);
                ctx.bezierCurveTo(w * 0.5, h * 0.9, w * 0.7, h * 0.8, w * 0.7, h * 0.7);
                ctx.bezierCurveTo(w * 0.8, h * 0.6, w * 0.8, h * 0.4, w * 0.7, h * 0.3);
                ctx.bezierCurveTo(w * 0.5, h * 0.2, w * 0.3, h * 0.3, w * 0.3, h * 0.4);
                ctx.closePath();
            }},
            { name: 'neck', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.moveTo(w * 0.7, h * 0.5);
                ctx.lineTo(w * 0.9, h * 0.3);
                ctx.lineTo(w * 0.85, h * 0.25);
                ctx.lineTo(w * 0.65, h * 0.45);
                ctx.closePath();
            }},
            { name: 'soundhole', path: (ctx, w, h) => {
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.55, w * 0.1, 0, Math.PI * 2);
            }}
        ]
    };
    
    function drawTemplateOutlines() {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        const parts = templateParts[currentTemplate];
        if (!parts) return;
        
        // Only create new regions if they don't exist
        if (templateRegions.length === 0) {
            parts.forEach(part => {
                templateRegions.push({
                    name: part.name,
                    path: part.path,
                    color: 'white'
                });
            });
        }
        
        // Draw outlines for all parts
        parts.forEach(part => {
            part.path(ctx, canvas.width, canvas.height);
            ctx.stroke();
        });
    }
    
    function redrawTemplate() {
        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fill all regions with their colors
        templateRegions.forEach(region => {
            ctx.fillStyle = region.color;
            region.path(ctx, canvas.width, canvas.height);
            ctx.fill();
        });
        
        // Draw outlines
        drawTemplateOutlines();
    }
    
    function isPointInPath(x, y, path) {
        path(ctx, canvas.width, canvas.height);
        return ctx.isPointInPath(x, y);
    }
    
    // Handle click/touch events
    function handleTouch(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let x, y;
        if (e.touches) {
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }
        
        // Check if clicked outside any region (background)
        let clickedRegion = false;
        for (let i = 0; i < templateRegions.length; i++) {
            if (isPointInPath(x, y, templateRegions[i].path)) {
                templateRegions[i].color = currentColor;
                clickedRegion = true;
                break;
            }
        }
        
        // If clicked outside regions, color background
        if (!clickedRegion) {
            backgroundColor = currentColor;
        }
        
        redrawTemplate();
    }
    
    // Initialize color picker
    const colors = [
        '#ff4757', '#2ed573', '#1e90ff', '#ffd700',
        '#ff6b81', '#7bed9f', '#70a1ff', '#eccc68',
        '#ff6348', '#2ecc71', '#0652DD', '#ffa502'
    ];
    
    const colorPicker = document.querySelector('.color-picker');
    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        if (color === currentColor) {
            colorOption.classList.add('selected');
        }
        colorOption.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            colorOption.classList.add('selected');
            currentColor = color;
        });
        colorPicker.appendChild(colorOption);
    });
    
    // Set up canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight);
        canvas.width = size;
        canvas.height = size;
        redrawTemplate();
    }
    
    // Template buttons
    document.querySelectorAll('.template-button').forEach(button => {
        button.addEventListener('click', () => {
            const newTemplate = button.dataset.template;
            if (newTemplate !== currentTemplate) {
                currentTemplate = newTemplate;
                templateRegions = [];
                redrawTemplate();
            }
        });
    });
    
    // Clear button
    document.getElementById('clearButton').addEventListener('click', () => {
        backgroundColor = 'white';
        templateRegions.forEach(region => {
            region.color = 'white';
        });
        redrawTemplate();
    });
    
    // Event listeners for coloring
    canvas.addEventListener('mousedown', handleTouch);
    canvas.addEventListener('touchstart', handleTouch);
    
    // Initialize canvas and draw first template
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});
