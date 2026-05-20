const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Настройки частиц урона
const particles = [];
function spawnDamageParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3 + 1,
            color: color,
            life: 30 // кадров жизни
        });
    }
}

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

// Функция для отрисовки лица игрока
function drawPlayerFace(x, y, radius, emotion) {
    ctx.strokeStyle = '#000'; // Цвет глаз и рта
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';

    // Размеры глаз и их позиция относительно центра
    const eyeOffsetX = radius * 0.35;
    const eyeOffsetY = radius * 0.2;
    const eyeRadius = radius * 0.12;

    // Отрисовка глаз в зависимости от эмоции
    if (emotion === 'normal') {
        // Обычные круглые глаза
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX, y - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Обычная улыбка
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.2, radius * 0.4, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    } else if (emotion === 'angry') {
        // Злые глаза (наклоненные линии)
        ctx.beginPath();
        // Левый глаз
        ctx.moveTo(x - eyeOffsetX - eyeRadius, y - eyeOffsetY - eyeRadius * 0.5);
        ctx.lineTo(x - eyeOffsetX + eyeRadius, y - eyeOffsetY + eyeRadius * 0.5);
        // Правый глаз
        ctx.moveTo(x + eyeOffsetX + eyeRadius, y - eyeOffsetY - eyeRadius * 0.5);
        ctx.lineTo(x + eyeOffsetX - eyeRadius, y - eyeOffsetY + eyeRadius * 0.5);
        ctx.stroke();
        ctx.closePath();

        // Рот (прямая линия или небольшой оскал)
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.3, y + radius * 0.4);
        ctx.lineTo(x + radius * 0.3, y + radius * 0.4);
        ctx.stroke();
        ctx.closePath();
    } else if (emotion === 'sad') {
        // Грустные глаза (вертикальные овалы или просто точки чуть ниже)
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y - eyeOffsetY + eyeRadius*0.5, eyeRadius, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX, y - eyeOffsetY + eyeRadius*0.5, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Перевернутая улыбка
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.6, radius * 0.4, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }
}

// Слушатели кнопок мыши
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

// Настройка лепестков
const petals = [];
const petalCount = 5;
const rotationSpeed = 0.03;
let currentAngle = 0;

for (let i = 0; i < petalCount; i++) {
    petals.push({
        distance: 60, 
        radius: 12,
        baseColor: '#ffffff', 
        currentColor: '#ffffff'
    });
}

const mobs = [];
let score = 0;
let currentBiome = 'green'; 

// Таймер смены биомов
setInterval(() => {
    if (currentBiome === 'green') currentBiome = 'red';
    else if (currentBiome === 'red') currentBiome = 'black';
    else currentBiome = 'green';
}, 10000);

const greenTier = ['Common', 'Unusual', 'Rare'];
const redTier = ['Epic', 'Legendary', 'Mythic'];
const blackTier = ['Ultra', 'Super', 'Hyper'];

function spawnMob() {
    if (mobs.length < 15) {
        let mobType;
        if (currentBiome === 'green') {
            mobType = { name: greenTier[Math.floor(Math.random() * greenTier.length)], size: 20, color: '#2ecc71', hp: 3, maxHp: 3, points: 10 };
        } else if (currentBiome === 'red') {
            mobType = { name: redTier[Math.floor(Math.random() * redTier.length)], size: 30, color: '#e74c3c', hp: 6, maxHp: 6, points: 50 };
        } else {
            mobType = { name: blackTier[Math.floor(Math.random() * blackTier.length)], size: 40, color: '#444', hp: 15, maxHp: 15, points: 200 };
        }

        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = Math.random() * canvas.width; y = -50; }
        else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
        else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
        else { x = -50; y = Math.random() * canvas.height; }

        mobs.push({ ...mobType, x, y, angle: Math.random() * Math.PI * 2, damageFlash: 0 });
    }
}

setInterval(spawnMob, 1000);

function draw() {
    // 1. Отрисовка фона
    if (currentBiome === 'green') ctx.fillStyle = '#1a2e1a';
    else if (currentBiome === 'red') ctx.fillStyle = '#2e1a1a';
    else ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Движение игрока
    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    // 3. Лепестки
    currentAngle += rotationSpeed;
    petals.forEach((petal, i) => {
        const pAngle = currentAngle + (i * Math.PI * 2) / petalCount;
        const px = player.x + Math.cos(pAngle) * petal.distance;
        const py = player.y + Math.sin(pAngle) * petal.distance;

        ctx.fillStyle = petal.currentColor;
        ctx.beginPath();
        ctx.arc(px, py, petal.radius, 0, Math.PI * 2);
        ctx.fill();

        // Столкновение и урон
        mobs.forEach((mob, mIdx) => {
            const dist = Math.hypot(px - mob.x, py - mob.y);
            if (dist < petal.radius + mob.size) {
                const damage = 0.05;
                mob.hp -= damage;
                mob.damageFlash = 5; // Моб "мигнёт" на 5 кадров

                // Анимация урона (частицы)
                if (Math.random() < 0.3) { // Спавним частицы не каждый кадр
                    spawnDamageParticles(px, py, mob.color);
                }

                if (mob.hp <= 0) {
                    score += mob.points;
                    scoreElement.innerText = `Score: ${Math.floor(score)}`;
                    mobs.splice(mIdx, 1);
                }
            }
        });
    });

    // 4. Частицы урона (отрисовка и обновление)
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.radius *= 0.97; // Уменьшение размера

        if (particle.life <= 0 || particle.radius < 0.5) {
            particles.splice(index, 1);
        } else {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 30; // Прозрачность
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    });

    // 5. Игрок и его лицо
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    // Рисуем лицо ПОВЕРХ желтого круга
    drawPlayerFace(player.x, player.y, player.radius, player.emotion);

    // 6. Мобы
    mobs.forEach((mob) => {
        // Движение к игроку
        const angleToPlayer = Math.atan2(player.y - mob.y, player.x - mob.x);
        mob.x += Math.cos(angleToPlayer) * 1.5;
        mob.y += Math.sin(angleToPlayer) * 1.5;

        // Эффект мигания при уроне
        if (mob.damageFlash > 0) {
            ctx.fillStyle = 'white'; // Мигаем белым
            mob.damageFlash--;
        } else {
            ctx.fillStyle = mob.color;
        }

        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Полоска здоровья (HP)
        const hpBarWidth = mob.size * 2;
        const hpBarHeight = 5;
        const hpRatio = mob.hp / mob.maxHp;
        
        // Фон полоски (красный)
        ctx.fillStyle = '#550000';
        ctx.fillRect(mob.x - mob.size, mob.y - mob.size - 15, hpBarWidth, hpBarHeight);
        
        // Текущее здоровье (зеленый)
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x - mob.size, mob.y - mob.size - 15, hpBarWidth * hpRatio, hpBarHeight);

        // Имя моба
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mob.name, mob.x, mob.y - mob.size - 22);
    });

    requestAnimationFrame(draw);
}

draw();
