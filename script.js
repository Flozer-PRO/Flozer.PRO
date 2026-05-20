const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Переменные для игрока
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    color: '#ffcc00', 
    speed: 0.08,
    emotion: 'normal'
};

const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Настройка лепестков
const petals = [];
const petalCount = 5;
const rotationSpeed = 0.03;
let currentAngle = 0;

for (let i = 0; i < petalCount; i++) {
    petals.push({
        distance: 60, 
        radius: 10,
        baseColor: '#ffffff', 
        currentColor: '#ffffff', 
        damageTimer: 0 
    });
}

// --- СЛУШАТЕЛИ КНОПОК МЫШИ ---
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        player.emotion = 'angry';
    } else if (event.button === 2) {
        player.emotion = 'sad';
    }
});

window.addEventListener('mouseup', () => {
    player.emotion = 'normal';
});

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

const mobs = [];
let score = 0;

// Функция спавна мобов с РАЗНЫМИ РЕДКОСТЯМИ
function spawnMob() {
    if (mobs.length < 10) {
        const rand = Math.random();
        let mobType;

        if (rand < 0.6) {
            // 60% шанс — Обычный (Зеленый)
            mobType = { type: 'Common', size: 25, color: '#2ecc71', maxHp: 3 };
        } else if (rand < 0.9) {
            // 30% шанс — Редкий (Красный)
            mobType = { type: 'Rare', size: 35, color: '#e74c3c', maxHp: 6 };
        } else {
            // 10% шанс — Мифический Босс (Черный с фиолетовым)
            mobType = { type: 'Mythic', size: 55, color: '#111111', strokeColor: '#9b59b6', maxHp: 15 };
        }

        mobs.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            size: mobType.size,
            color: mobType.color,
            strokeColor: mobType.strokeColor || null,
            hp: mobType.maxHp,
            maxHp: mobType.maxHp,
            type: mobType.type
        });
    }
}

setInterval(spawnMob, 1200);

function checkCollision(circle, rect) {
    let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
    let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
    let distanceX = circle.x - closestX;
    let distanceY = circle.y - closestY;
    return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
}

// Функция для рисования крутого фона в стиле Hornex
function drawHornexGrid() {
    // Заливаем экран тёмным цветом
    ctx.fillStyle = '#161a1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем сетку
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
        // Чередуем цвета линий: зеленый и красный
        ctx.strokeStyle = (x % 100 === 0) ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.strokeStyle = (y % 100 === 0) ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function gameLoop() {
    // Рисуем Хорнекс-фон вместо простой очистки экрана
    drawHornexGrid();

    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    let targetDistance = 60; 

    if (player.emotion === 'sad') {
        targetDistance = 40; 
    } else if (player.emotion === 'angry') {
        targetDistance = 110; 
    } else {
        targetDistance = 60; 
    }

    // Рисуем тело игрока
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Координаты лица
    let leftEyeX = player.x - 8;
    let rightEyeX = player.x + 8;
    let eyeY = player.y - 4;

    if (player.emotion === 'angry') {
        // --- ЗЛЫЕ ГЛАЗА И РОТИК ---
        ctx.fillStyle = '#000000'; 
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 5, 7, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 5, 7, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x - 14, player.y - 12); ctx.lineTo(player.x - 2, player.y - 6);
        ctx.moveTo(player.x + 14, player.y - 12); ctx.lineTo(player.x + 2, player.y - 6);
        ctx.stroke();

        ctx.fillStyle = '#ffffff'; 
        ctx.beginPath();
        ctx.arc(leftEyeX + 1, eyeY + 1, 2, 0, Math.PI * 2);
        ctx.arc(rightEyeX - 1, eyeY + 1, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y + 12, 6, Math.PI, 0, false);
        ctx.stroke();

    } else if (player.emotion === 'sad') {
        // --- ГРУСТНЫЕ ГЛАЗА И РОТИК ---
        ctx.fillStyle = '#000000'; 
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x - 13, player.y - 10); ctx.lineTo(player.x - 4, player.y - 13);
        ctx.moveTo(player.x + 13, player.y - 10); ctx.lineTo(player.x + 4, player.y - 13);
        ctx.stroke();

        ctx.fillStyle = '#ffffff'; 
        ctx.beginPath();
        ctx.arc(leftEyeX - 1, eyeY + 2, 2.5, 0, Math.PI * 2);
        ctx.arc(rightEyeX + 1, eyeY + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y + 12, 6, Math.PI, 0, false);
        ctx.stroke();

    } else {
        // --- ОБЫЧНЫЕ ГЛАЗА И РОТИК ---
        ctx.fillStyle = '#000000'; 
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 6, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 6, 8, 0, 0, Math.PI * 2); 
        ctx.fill();

        ctx.fillStyle = '#ffffff'; 
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y + 6, 6, 0, Math.PI, false);
        ctx.stroke();
    }

    // --- Отрисовка лепестков ---
    currentAngle += rotationSpeed;

    petals.forEach((petal, index) => {
        petal.distance += (targetDistance - petal.distance) * 0.1;

        if (petal.damageTimer > 0) {
            petal.damageTimer--;
            petal.currentColor = '#ff3333'; 
        } else {
            petal.currentColor = petal.baseColor; 
        }

        let angle = currentAngle + (index * (Math.PI * 2 / petalCount));
        let petalX = player.x + Math.cos(angle) * petal.distance;
        let petalY = player.y + Math.sin(angle) * petal.distance;

        ctx.beginPath();
        ctx.arc(petalX, petalY, petal.radius, 0, Math.PI * 2);
        ctx.fillStyle = petal.currentColor; 
        ctx.fill();
        ctx.closePath();

        mobs.forEach((mob, mobIndex) => {
            if (checkCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
                if (petal.damageTimer === 0) {
                    petal.damageTimer = 10;
                }

                mob.hp -= 1;
                mob.x += Math.cos(angle) * 12;
                mob.y += Math.sin(angle) * 12;

                if (mob.hp <= 0) {
                    mobs.splice(mobIndex, 1);
                    
                    // Начисление очков в зависимости от редкости моба
                    if (mob.type === 'Common') score += 10;
                    if (mob.type === 'Rare') score += 25;
                    if (mob.type === 'Mythic') score += 100; // За босса много очков!
                    
                    scoreElement.innerText = "Очки: " + score;
                }
            }
        });
    });

    // Отрисовка мобов
    mobs.forEach((mob) => {
        ctx.fillStyle = mob.color;
        ctx.fillRect(mob.x, mob.y, mob.size, mob.size);
        
        // Если это Мифический моб, рисуем ему фиолетовую обводку
        if (mob.strokeColor) {
            ctx.strokeStyle = mob.strokeColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(mob.x, mob.y, mob.size, mob.size);
        }
        
        // Полоска здоровья
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x, mob.y - 10, mob.size, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x, mob.y - 10, mob.size * (mob.hp / mob.maxHp), 4);
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
