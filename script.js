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
    baseColor: '#0077ff', // Синий
    color: '#0077ff',
    speed: 0.08,
    emotion: 'normal' // normal, angry, sad
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

// Базовые настройки лепестков
for (let i = 0; i < petalCount; i++) {
    petals.push({
        distance: 60, // Текущая дистанция (будет меняться)
        radius: 10,
        color: '#ff3366'
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

function spawnMob() {
    if (mobs.length < 8) {
        mobs.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            size: 30,
            color: '#ffcc00',
            hp: 3
        });
    }
}

setInterval(spawnMob, 1500);

function checkCollision(circle, rect) {
    let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
    let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
    let distanceX = circle.x - closestX;
    let distanceY = circle.y - closestY;
    return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    // Переменная для новой дистанции лепестков
    let targetDistance = 60; 

    // Проверяем эмоцию, меняем цвет тела и дистанцию лепестков
    if (player.emotion === 'sad') {
        player.color = '#9933ff'; // Фиолетовый
        targetDistance = 40;      // Сжимаются ближе, когда грустит
    } else if (player.emotion === 'angry') {
        player.color = '#ff3333'; // Красный
        targetDistance = 110;     // Улетают дальше, когда злится
    } else {
        player.color = player.baseColor; // Обычный синий
        targetDistance = 60;      // Обычное расстояние
    }

    // Рисуем игрока
    ctx.beginPath();
    let currentRadius = player.emotion === 'sad' ? player.radius - 4 : player.radius;
    ctx.arc(player.x, player.y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Рисуем глаза
    if (player.emotion === 'angry') {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x - 12, player.y - 8); ctx.lineTo(player.x - 4, player.y - 2);
        ctx.moveTo(player.x + 12, player.y - 8); ctx.lineTo(player.x + 4, player.y - 2);
        ctx.stroke();
    } else if (player.emotion === 'sad') {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(player.x - 8, player.y - 2, 3, 0, Math.PI * 2);
        ctx.arc(player.x + 8, player.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(player.x - 8, player.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(player.x + 8, player.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Вращение лепестков
    currentAngle += rotationSpeed;

    petals.forEach((petal, index) => {
        // Плавное изменение дистанции лепестков для красоты анимации
        petal.distance += (targetDistance - petal.distance) * 0.1;

        let angle = currentAngle + (index * (Math.PI * 2 / petalCount));
        let petalX = player.x + Math.cos(angle) * petal.distance;
        let petalY = player.y + Math.sin(angle) * petal.distance;

        ctx.beginPath();
        ctx.arc(petalX, petalY, petal.radius, 0, Math.PI * 2);
        ctx.fillStyle = petal.color;
        ctx.fill();
        ctx.closePath();

        mobs.forEach((mob, mobIndex) => {
            if (checkCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
                mob.hp -= 1;
                mob.x += Math.cos(angle) * 15;
                mob.y += Math.sin(angle) * 15;

                if (mob.hp <= 0) {
                    mobs.splice(mobIndex, 1);
                    score += 10;
                    scoreElement.innerText = "Очки: " + score;
                }
            }
        });
    });

    // Отрисовка мобов
    mobs.forEach((mob) => {
        ctx.fillStyle = mob.color;
        ctx.fillRect(mob.x, mob.y, mob.size, mob.size);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x, mob.y - 10, mob.size, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x, mob.y - 10, mob.size * (mob.hp / 3), 4);
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
