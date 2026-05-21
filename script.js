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
    speed: 0.04, 
    emotion: 'normal',
    hp: 100,
    maxHp: 100
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

// Массив мобов
let mobs = [];
let score = 0;

function spawnMob() {
    if (mobs.length < 10) {
        const rand = Math.random();
        let mobType = {};

        if (rand < 0.55) {
            // ЗЕЛЕНАЯ ГРУППА (Hornex ранги)
            const randTier = Math.random();
            if (randTier < 0.60) {
                mobType = { name: 'Common', radius: 14, color: '#2ecc71', strokeColor: null, maxHp: 3, damage: 0.5, points: 10 };
            } else if (randTier < 0.90) {
                mobType = { name: 'Unusual', radius: 17, color: '#27ae60', strokeColor: null, maxHp: 5, damage: 1, points: 15 };
            } else {
                mobType = { name: 'Rare', radius: 20, color: '#1abc9c', strokeColor: null, maxHp: 8, damage: 1.5, points: 20 };
            }
        } else if (rand < 0.90) {
            // КРАСНАЯ ГРУППА (Hornex ранги)
            const randTier = Math.random();
            if (randTier < 0.60) {
                mobType = { name: 'Epic', radius: 24, color: '#e67e22', strokeColor: null, maxHp: 12, damage: 2, points: 30 };
            } else if (randTier < 0.90) {
                mobType = { name: 'Legendary', radius: 28, color: '#e74c3c', strokeColor: null, maxHp: 18, damage: 3, points: 45 };
            } else {
                mobType = { name: 'Mythic', radius: 32, color: '#9b59b6', strokeColor: null, maxHp: 25, damage: 4, points: 60 };
            }
        } else {
            // ЧЕРНАЯ ГРУППА (Hornex Боссы)
            const randTier = Math.random();
            if (randTier < 0.60) {
                mobType = { name: 'Ultra', radius: 38, color: '#111111', strokeColor: '#ffffff', maxHp: 40, damage: 6, points: 100 };
            } else if (randTier < 0.90) {
                mobType = { name: 'Super', radius: 45, color: '#111111', strokeColor: '#e74c3c', maxHp: 60, damage: 8, points: 150 };
            } else {
                mobType = { name: 'Hyper', radius: 55, color: '#111111', strokeColor: '#ffcc00', maxHp: 100, damage: 12, points: 250 };
            }
        }

        mobs.push({
            x: Math.random() * (canvas.width - 150) + 75,
            y: Math.random() * (canvas.height - 150) + 75,
            radius: mobType.radius, 
            color: mobType.color,
            strokeColor: mobType.strokeColor,
            hp: mobType.maxHp,
            maxHp: mobType.maxHp,
            name: mobType.name,
            points: mobType.points,
            damage: mobType.damage, 
            damageTimer: 0,
            isDead: false
        });
    }
}

setInterval(spawnMob, 1200);

// Функция проверки коллизии круг-круг
function checkCircleCollision(circle1, circle2) {
    let dx = circle1.x - circle2.x;
    let dy = circle1.y - circle2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (circle1.radius + circle2.radius);
}

// Функция перезапуска игры при смерти
function restartGame() {
    player.hp = player.maxHp;
    score = 0;
    if (scoreElement) scoreElement.innerText = "Очки: " + score;
    mobs = [];
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}

// Динамический фон
function drawHornexGrid() {
    let bgColor = '#142217';       
    let gridColor1 = 'rgba(46, 204, 113, 0.25)'; 
    let gridColor2 = 'rgba(46, 204, 113, 0.1)';

    if (score >= 100 && score < 300) {
        bgColor = '#221414';       
        gridColor1 = 'rgba(231, 76, 60, 0.25)';
        gridColor2 = 'rgba(231, 76, 60, 0.1)';
    } else if (score >= 300) {
        bgColor = '#0b0c10';       
        gridColor1 = 'rgba(255, 255, 255, 0.2)';
        gridColor2 = 'rgba(155, 89, 182, 0.15)'; 
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.strokeStyle = (x % 100 === 0) ? gridColor1 : gridColor2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.strokeStyle = (y % 100 === 0) ? gridColor1 : gridColor2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function gameLoop() {
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

    let leftEyeX = player.x - 8;
    let rightEyeX = player.x + 8;
    let eyeY = player.y - 4;

    if (player.emotion === 'angry') {
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

        mobs.forEach((mob) => {
            if (mob.isDead) return;

            if (checkCircleCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
                if (petal.damageTimer === 0) {
                    petal.damageTimer = 10;
                }

                if (mob.damageTimer === 0) {
                    mob.damageTimer = 8;
                }

                mob.hp -= 1; 
                mob.x += Math.cos(angle) * 12;
                mob.y += Math.sin(angle) * 12;

                if (mob.hp <= 0) {
                    mob.isDead = true; 
                    score += mob.points;
                    if (scoreElement) {
                        scoreElement.innerText = "Очки: " + score;
                    }
                }
            }
        });
    });

    // --- СТОЛКНОВЕНИЕ ТЕЛА ИГРОКА С МОБАМИ ---
    mobs.forEach((mob) => {
        if (mob.isDead) return;

        if (checkCircleCollision({ x: player.x, y: player.y, radius: player.radius }, mob)) {
            player.hp -= mob.damage; 
            
            if (player.emotion === 'angry') {
                mob.hp -= 1; 
                if (mob.damageTimer === 0) {
                    mob.damageTimer = 8; 
                }
            }

            let dx = player.x - mob.x;
            let dy = player.y - mob.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                player.x += (dx / dist) * 6; // Чуть сильнее отталкивание от крупных мобов
                player.y += (dy / dist) * 6;
            }

            if (mob.hp <= 0) {
                mob.isDead = true; 
                score += mob.points;
                if (scoreElement) {
                    scoreElement.innerText = "Очки: " + score;
                }
            }

            if (player.hp <= 0) {
                alert("Вы погибли! Игра перезапустится.");
                restartGame();
            }
        }
    });

    mobs = mobs.filter(mob => !mob.isDead);

    // Отрисовка мобов
    mobs.forEach((mob) => {
        if (mob.damageTimer > 0) {
            mob.damageTimer--;
            ctx.fillStyle = '#ffffff'; 
        } else {
            ctx.fillStyle = mob.color; 
        }
        
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        
        // Кастомная жирная обводка для черных боссов (Ultra, Super, Hyper)
        if (mob.strokeColor && mob.damageTimer === 0) {
            ctx.strokeStyle = mob.strokeColor;
            ctx.lineWidth = 4; // Сделали обводку толще
            ctx.beginPath();
            ctx.arc(mob.x, mob.y, mob.radius - 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mob.name, mob.x, mob.y - mob.radius - 12);

        // Полоска здоровья моба (адаптируется под размер моба)
        const barWidth = mob.radius * 2;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x - mob.radius, mob.y - mob.radius - 6, barWidth, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x - mob.radius, mob.y - mob.radius - 6, barWidth * (mob.hp / mob.maxHp), 4);
    });

    // Полоска здоровья игрока
    const pBarWidth = 50;
    const pBarHeight = 6;
    const pBarX = player.x - pBarWidth / 2;
    const pBarY = player.y - player.radius - 20;

    ctx.fillStyle = '#374151';
    ctx.fillRect(pBarX, pBarY, pBarWidth, pBarHeight);

    if (player.hp > 0) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(pBarX, pBarY, pBarWidth * (player.hp / player.maxHp), pBarHeight);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
