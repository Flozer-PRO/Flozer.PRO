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

// Массивы названий для каждой цветовой группы
const greenTier = ['Common', 'Unusual', 'Rare'];
const redTier = ['Epic', 'Legendary', 'Mythic'];
const blackTier = ['Ultra', 'Super', 'Hyper'];

// Переменная для текущего биома (фона)
let currentBiome = 'green'; 

// Меняем биом каждые 10 секунд по кругу: зеленый -> красный -> черный
setInterval(() => {
    if (currentBiome === 'green') {
        currentBiome = 'red';
    } else if (currentBiome === 'red') {
        currentBiome = 'black';
    } else {
        currentBiome = 'green';
    }
}, 10000);

function spawnMob() {
    if (mobs.length < 10) {
        const rand = Math.random();
        let mobType;

        // Теперь шанс спавна мобов зависит от текущего цвета экрана!
        if (currentBiome === 'green') {
            const name = greenTier[Math.floor(Math.random() * greenTier.length)];
            mobType = { name: name, size: 25, color: '#2ecc71', strokeColor: null, maxHp: 3, points: 10 };
        } else if (currentBiome === 'red')
