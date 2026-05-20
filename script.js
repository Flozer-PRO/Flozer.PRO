const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Настраиваем размер экрана
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
    color: '#0077ff',
    speed: 0.08
};

// Переменные для мыши
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
        distance: 60, // Дистанция от игрока
        radius: 10,   // Размер лепестка
        color: '#ff3366'
    });
}

// Переменные для мобов (желтые квадраты)
const mobs = [];
let score = 0;

function spawnMob() {
    if (mobs.length < 10) { // Максимум 10 мобов на экране одновременно
        mobs.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            size: 30,
            color: '#ffcc00',
            hp: 3 // Нужно 3 удара лепестком, чтобы уничтожить
        });
    }
}

// Спавним моба каждые 1.5 секунды
setInterval(spawnMob, 1500);

// Функция проверки столкновения окружности (лепестка) и квадрата (моба)
function checkCollision(circle, rect) {
    let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
    let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
    
    let distanceX = circle.x - closestX;
    let distanceY = circle.y - closestY;
    
    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circle.radius * circle.radius);
}

// Главный игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Плавное движение игрока к мышке
    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    // Рисуем игрока
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // Вращение лепестков
    currentAngle += rotationSpeed;

    // Просчет и отрисовка лепестков
    petals.forEach((petal, index) => {
        let angle = currentAngle + (index * (Math.PI * 2 / petalCount));
        let petalX = player.x + Math.cos(angle) * petal.distance;
        let petalY = player.y + Math.sin(angle) * petal.distance;

        // Рисуем лепесток
        ctx.beginPath();
        ctx.arc(petalX, petalY, petal.radius, 0, Math.PI * 2);
        ctx.fillStyle = petal.color;
        ctx.fill();
        ctx.closePath();

        // Проверяем удар лепестка по мобам
        mobs.forEach((mob, mobIndex) => {
            if (checkCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
                mob.hp -= 1; // Отнимаем здоровье у моба
                
                // Отталкиваем моба чуть-чуть при ударе
                mob.x += Math.cos(angle) * 10;
                mob.y += Math.sin(angle) * 10;

                // Если у моба кончилось HP, удаляем его
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
        
        // Рисуем полоску здоровья над мобом
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x, mob.y - 10, mob.size, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x, mob.y - 10, mob.size * (mob.hp / 3), 4);
    });

    requestAnimationFrame(gameLoop);
}

// Запуск игры
gameLoop();
