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

// Твои лепестки (дальность 60, как была)
const petals = [];
const petalCount = 5;
const rotationSpeed = 0.03;
let currentAngle = 0;

for (let i = 0; i < petalCount; i++) {
    petals.push({
        distance: 60, 
        radius: 10,
        baseColor: '#ffffff', 
        currentColor: '#ffffff'
    });
}

// Кнопки мыши для эмоций
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) player.emotion = 'angry';
    else if (event.button === 2) player.emotion = 'sad';
});
window.addEventListener('mouseup', () => player.emotion = 'normal');
window.addEventListener('contextmenu', (e) => e.preventDefault());

const mobs = [];
let score = 0;
let currentBiome = 'green'; 

const greenTier = ['Common', 'Unusual', 'Rare'];
const redTier = ['Epic', 'Legendary', 'Mythic'];
const blackTier = ['Ultra', 'Super', 'Hyper'];

setInterval(() => {
    if (currentBiome === 'green') currentBiome = 'red';
    else if (currentBiome === 'red') currentBiome = 'black';
    else currentBiome = 'green';
}, 10000);

function spawnMob() {
    if (mobs.length < 10) {
        let mobType;
        if (currentBiome === 'green') {
            mobType = { name: greenTier[Math.floor(Math.random() * 3)], size: 25, color: '#2ecc71', hp: 3, maxHp: 3, points: 10 };
        } else if (currentBiome === 'red') {
            mobType = { name: redTier[Math.floor(Math.random() * 3)], size: 35, color: '#e74c3c', hp: 6, maxHp: 6, points: 50 };
        } else {
            mobType = { name: blackTier[Math.floor(Math.random() * 3)], size: 45, color: '#2c3e50', hp: 12, maxHp: 12, points: 200 };
        }
        mobs.push({ 
            x: Math.random() * canvas.width, 
            y: Math.random() * canvas.height, 
            ...mobType,
            flash: 0 
        });
    }
}
setInterval(spawnMob, 1500);

function draw() {
    // Фон
    ctx.fillStyle = currentBiome === 'green' ? '#1e392a' : (currentBiome === 'red' ? '#3b1a1a' : '#050505');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Движение игрока
    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    // Лепестки и Урон
    currentAngle += rotationSpeed;
    petals.forEach((petal, i) => {
        const pAngle = currentAngle + (i * Math.PI * 2) / petalCount;
        const px = player.x + Math.cos(pAngle) * petal.distance;
        const py = player.y + Math.sin(pAngle) * petal.distance;

        ctx.fillStyle = petal.currentColor;
        ctx.beginPath();
        ctx.arc(px, py, petal.radius, 0, Math.PI * 2);
        ctx.fill();

        // Проверка урона
        mobs.forEach((mob, mIdx) => {
            const d = Math.hypot(px - mob.x, py - mob.y);
            if (d < petal.radius + mob.size) {
                mob.hp -= 0.05;
                mob.flash = 3; // Анимация мигания при уроне
                if (mob.hp <= 0) {
                    score += mob.points;
                    scoreElement.innerText = `Score: ${Math.floor(score)}`;
                    mobs.splice(mIdx, 1);
                }
            }
        });
    });

    // Игрок
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // --- ГЛАЗА И РОТ (ПРЯМО ЗДЕСЬ) ---
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    // Глаза
    if (player.emotion === 'angry') {
        ctx.beginPath(); // Левый глаз (злой)
        ctx.moveTo(player.x - 15, player.y - 10); ctx.lineTo(player.x - 5, player.y - 5);
        ctx.moveTo(player.x + 15, player.y - 10); ctx.lineTo(player.x + 5, player.y - 5);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(player.x - 10, player.y - 8, 3, 0, Math.PI * 2);
        ctx.arc(player.x + 10, player.y - 8, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    // Рот
    ctx.beginPath();
    if (player.emotion === 'sad') ctx.arc(player.x, player.y + 15, 10, Math.PI, 0); // Грустный
    else if (player.emotion === 'angry') { ctx.moveTo(player.x - 10, player.y + 10); ctx.lineTo(player.x + 10, player.y + 10); } // Злой
    else ctx.arc(player.x, player.y + 5, 10, 0, Math.PI); // Веселый
    ctx.stroke();

    // Мобы и их ХП
    mobs.forEach(mob => {
        mob.x += (player.x - mob.x) * 0.01;
        mob.y += (player.y - mob.y) * 0.01;

        ctx.fillStyle = mob.flash > 0 ? 'white' : mob.color;
        if (mob.flash > 0) mob.flash--;
        
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
        ctx.fill();

        // Полоска ХП
        ctx.fillStyle = 'red';
        ctx.fillRect(mob.x - 20, mob.y - mob.size - 10, 40, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(mob.x - 20, mob.y - mob.size - 10, 40 * (mob.hp / mob.maxHp), 5);
    });

    requestAnimationFrame(draw);
}
draw();
