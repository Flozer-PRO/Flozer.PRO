const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Переменные для игрока (Цвет теперь всегда жёлтый)
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    color: '#ffcc00', // Всегда жёлтый цвет цветка
    speed: 0.08,
    emotion: 'normal' // normal, angry, sad
};

const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Настройка лепестков (Цвет изменён на белый)
const petals = [];
const petalCount = 5;
const rotationSpeed = 0.03;
let currentAngle = 0;

for (let i = 0; i < petalCount; i++) {
    petals.push({
        distance: 60, 
        radius: 10,
        color: '#ffffff' // Всегда белые лепестки
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
            color: '#ff3333', // Сделали мобов красными, чтобы они не сливались с жёлтым игроком
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

    // Дистанция меняется, но размер и цвет игрока теперь статичны
    let targetDistance = 60; 

    if (player.emotion === 'sad') {
        targetDistance = 40;      // Сжимаются ближе на ПКМ
    } else if (player.emotion === 'angry') {
        targetDistance = 110;     // Улетают дальше на ЛКМ
    } else {
        targetDistance = 60;      // Обычное расстояние
    }

    // Рисуем игрока (Размер всегда player.radius, без изменений)
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Рисуем чёрные глаза для хорошего контраста на жёлтом фоне
    if (player.emotion === 'angry') {
        // Злые брови / глаза
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x - 12, player.y - 8); ctx.lineTo(player.x - 4, player.y - 2);
        ctx.moveTo(player.x + 12, player.y - 8); ctx.lineTo(player.x + 4, player.y - 2);
        ctx.stroke();
    } else if (player.emotion === 'sad') {
        // Грустные точки
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(player.x - 8, player.y - 2, 3, 0, Math.PI * 2);
        ctx.arc(player.x + 8, player.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Обычные глаза
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(player.x - 8, player.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(player.x + 8, player.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Вращение лепестков
    currentAngle += rotationSpeed;

    petals.forEach((petal, index) => {
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
