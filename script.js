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
    color: '#ffcc00', // Жёлтый цвет
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
        color: '#ffffff'
    });
}

// --- СЛУШАТЕЛИ КНОПОК МЫШИ (ВЕРНУЛИ ОБРАТНО) ---
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        // ЛКМ — ЗЛИТСЯ
        player.emotion = 'angry';
    } else if (event.button === 2) {
        // ПКМ — ГРУСТИТ
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
            color: '#ff3333',
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

    let targetDistance = 60; 

    if (player.emotion === 'sad') {
        targetDistance = 40; // Лепестки ближе при ПКМ (грусть)
    } else if (player.emotion === 'angry') {
        targetDistance = 110; // Лепестки дальше при ЛКМ (злость)
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
        // --- ЗЛЫЕ ГЛАЗА (ЧЁРНЫЕ С БЕЛЫМ ЗРАЧКОМ) И РОТИК ---
        ctx.fillStyle = '#000000'; // Сначала чёрный большой овал
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 5, 7, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 5, 7, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Сердитые брови
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x - 14, player.y - 12); ctx.lineTo(player.x - 2, player.y - 6);
        ctx.moveTo(player.x + 14, player.y - 12); ctx.lineTo(player.x + 2, player.y - 6);
        ctx.stroke();

        ctx.fillStyle = '#ffffff'; // Потом белый маленький зрачок
        ctx.beginPath();
        ctx.arc(leftEyeX + 1, eyeY + 1, 2, 0, Math.PI * 2);
        ctx.arc(rightEyeX - 1, eyeY + 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Чёрный злой ротик
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x - 8, player.y + 8);
        ctx.lineTo(player.x + 8, player.y + 8);
        ctx.stroke();

    } else if (player.emotion === 'sad') {
        // --- ГРУСТНЫЕ ГЛАЗА (ЧЁРНЫЕ С БЕЛЫМ ЗРАЧКОМ) И РОТИК ---
        ctx.fillStyle = '#000000'; // Чёрный большой овал
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Грустные брови
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x - 13, player.y - 10); ctx.lineTo(player.x - 4, player.y - 13);
        ctx.moveTo(player.x + 13, player.y - 10); ctx.lineTo(player.x + 4, player.y - 13);
        ctx.stroke();

        ctx.fillStyle = '#ffffff'; // Белый маленький зрачок смотрит вниз
        ctx.beginPath();
        ctx.arc(leftEyeX - 1, eyeY + 2, 2.5, 0, Math.PI * 2);
        ctx.arc(rightEyeX + 1, eyeY + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Чёрный грустный ротик
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y + 12, 6, Math.PI, 0, false);
        ctx.stroke();

    } else {
        // --- ОБЫЧНЫЕ ГЛАЗА (ЧЁРНЫЕ С БЕЛЫМ ЗРАЧКОМ) И РОТИК ---
        ctx.fillStyle = '#000000'; // Чёрный большой овал (Hornex стиль наоборот)
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 6, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff'; // Белый маленький зрачок
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Чёрный весёлый ротик
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
