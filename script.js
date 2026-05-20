const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

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
            mobType = { name: greenTier[Math.floor(Math.random() * greenTier.length)], size: 20, color: '#2ecc71', hp: 3, points: 10 };
        } else if (currentBiome === 'red') {
            mobType = { name: redTier[Math.floor(Math.random() * redTier.length)], size: 30, color: '#e74c3c', hp: 6, points: 50 };
        } else {
            mobType = { name: blackTier[Math.floor(Math.random() * blackTier.length)], size: 40, color: '#444', hp: 15, points: 200 };
        }

        // Спавним за пределами экрана
        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = Math.random() * canvas.width; y = -50; }
        else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
        else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
        else { x = -50; y = Math.random() * canvas.height; }

        mobs.push({ ...mobType, x, y, angle: Math.random() * Math.PI * 2 });
    }
}

setInterval(spawnMob, 1000);

function draw() {
    // 1. Отрисовка фона в зависимости от биома
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

        // Простая проверка столкновения лепестка с мобами
        mobs.forEach((mob, mIdx) => {
            const dist = Math.hypot(px - mob.x, py - mob.y);
            if (dist < petal.radius + mob.size) {
                mob.hp -= 0.1; // Урон
                if (mob.hp <= 0) {
                    score += mob.points;
                    scoreElement.innerText = `Score: ${Math.floor(score)}`;
                    mobs.splice(mIdx, 1);
                }
            }
        });
    });

    // 4. Игрок
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // 5. Мобы
    mobs.forEach((mob) => {
        // Движение к игроку
        const angleToPlayer = Math.atan2(player.y - mob.y, player.x - mob.x);
        mob.x += Math.cos(angleToPlayer) * 1.5;
        mob.y += Math.sin(angleToPlayer) * 1.5;

        ctx.fillStyle = mob.color;
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(mob.name, mob.x, mob.y - mob.size - 5);
    });

    requestAnimationFrame(draw);
}

draw();
