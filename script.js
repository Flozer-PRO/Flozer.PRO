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

// Изменили const на let, чтобы безопасно фильтровать убитых мобов
let mobs = [];
let score = 0;

// Массивы названий для каждой группы
const greenTier = ['Common', 'Unusual', 'Rare'];
const redTier = ['Epic', 'Legendary', 'Mythic'];
const blackTier = ['Ultra', 'Super', 'Hyper'];

function spawnMob() {
    if (mobs.length < 10) {
        const rand = Math.random();
        let mobType;

        if (rand < 0.55) {
            // ЗЕЛЕНАЯ группа
            const name = greenTier[Math.floor(Math.random() * greenTier.length)];
            mobType = { name: name, size: 25, color: '#2ecc71', strokeColor: null, maxHp: 3, points: 10 };
        } else if (rand < 0.90) {
            // КРАСНАЯ группа
            const name = redTier[Math.floor(Math.random() * redTier.length)];
            mobType = { name: name, size: 40, color: '#e74c3c', strokeColor: null, maxHp: 7, points: 30 };
        } else {
            // ЧЕРНАЯ группа
            const name = blackTier[Math.floor(Math.random() * blackTier.length)];
            mobType = { name: name, size: 60, color: '#111111', strokeColor: '#ffffff', maxHp: 20, points: 100 };
        }

        mobs.push({
            x: Math.random() * (canvas.width - 70) + 35,
            y: Math.random() * (canvas.height - 70) + 35,
            size: mobType.size,
            color: mobType.color,
            strokeColor: mobType.strokeColor,
            hp: mobType.maxHp,
            maxHp: mobType.maxHp,
            name: mobType.name,
            points: mobType.points,
            damageTimer: 0,
            isDead: false // Флаг для безопасного удаления
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

// Улучшенный динамический фон
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

        // Проверяем столкновения
        mobs.forEach((mob) => {
            if (mob.isDead) return; // Игнорируем уже убитых в этом кадре

            if (checkCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
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
                    mob.isDead = true; // Просто помечаем труп!
                    score += mob.points;
                    if (scoreElement) {
                        scoreElement.innerText = "Очки: " + score;
                    }
                }
            }
        });
    });

    // БЕЗОПАСНАЯ ОЧИСТКА: Удаляем мертвых мобов только ПОСЛЕ всех проверок
    mobs = mobs.filter(mob => !mob.isDead);

    // Отрисовка мобов
    mobs.forEach((mob) => {
        if (mob.damageTimer > 0) {
            mob.damageTimer--;
            ctx.fillStyle = '#ffffff'; 
        } else {
            ctx.fillStyle = mob.color; 
        }
        
        ctx.fillRect(mob.x, mob.y, mob.size, mob.size);
        
        if (mob.strokeColor && mob.damageTimer === 0) {
            ctx.strokeStyle = mob.strokeColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(mob.x, mob.y, mob.size, mob.size);
        }
        
        // Рисуем текст редкости
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mob.name, mob.x + mob.size / 2, mob.y - 16);

        // Полоска здоровья
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x, mob.y - 10, mob.size, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x, mob.y - 10, mob.size * (mob.hp / mob.maxHp), 4);
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
