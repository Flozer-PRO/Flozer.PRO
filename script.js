const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Растягиваем канвас на весь экран браузера
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Объект игрока (Твой Flozer)
const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 25,
    color: '#3b82f6', // Синий цвет основы
    angle: 0          // Текущий угол поворота лепестков
};

// Список твоих лепестков (базовый набор)
const petals = [
    { color: '#ef4444', size: 10, distance: 65 }, // Красный (Урон)
    { color: '#10b981', size: 10, distance: 65 }, // Зеленый (Здоровье)
    { color: '#f59e0b', size: 10, distance: 65 }, // Желтый (Скорость)
    { color: '#a855f7', size: 10, distance: 65 }  // Фиолетовый (Мистический)
];

// Плавное следование за мышкой (интерполяция)
const mouse = { x: player.x, y: player.y };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Главный игровой цикл (вызывается примерно 60 раз в секунду)
function gameLoop() {
    // Очищаем экран перед каждым новым кадром
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Сетка на заднем фоне для ощущения движения
    drawGrid();

    // Плавное перемещение игрока к курсору мыши
    player.x += (mouse.x - player.x) * 0.1;
    player.y += (mouse.y - player.y) * 0.1;

    // Рисуем центральный круг игрока
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // Сбрасываем свечение для других объектов

    // Увеличиваем угол, чтобы лепестки крутились
    player.angle += 0.025;

    // Рисуем лепестки вокруг игрока
    petals.forEach((petal, index) => {
        // Равномерно распределяем лепестки по кругу в зависимости от их количества
        const petalAngle = player.angle + (index * (Math.PI * 2 / petals.length));
        
        // Математический расчет координат x и y для каждого лепестка
        const petalX = player.x + petal.distance * Math.cos(petalAngle);
        const petalY = player.y + petal.distance * Math.sin(petalAngle);

        ctx.beginPath();
        ctx.arc(petalX, petalY, petal.size, 0, Math.PI * 2);
        ctx.fillStyle = petal.color;
        ctx.fill();
        ctx.closePath();
    });

    // Запрашиваем следующий кадр анимации
    requestAnimationFrame(gameLoop);
}

// Функция для отрисовки фоновой сетки
function drawGrid() {
    ctx.strokeStyle = '#232323';
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Запускаем игру!
gameLoop();