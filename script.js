const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// === ПОДКЛЮЧЕНИЕ К СЕРВЕРУ ===
const socket = new WebSocket('ws://localhost:8080');

let myId = null;
let players = {};
let mobs = [];
let score = 0;
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let currentAngle = 0;

// Отправка координат мыши на сервер при движении
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    sendClientUpdate();
});

// Отправка эмоций на сервер при кликах мыши
window.addEventListener('mousedown', (event) => {
    let emotion = 'normal';
    if (event.button === 0) emotion = 'angry'; // ЛКМ — злой
    else if (event.button === 2) emotion = 'sad'; // ПКМ — грустный
    
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'changeEmotion', emotion: emotion }));
    }
});

window.addEventListener('mouseup', () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'changeEmotion', emotion: 'normal' }));
    }
});

// Блокируем стандартное меню мыши по правой кнопке
window.addEventListener('contextmenu', (event) => event.preventDefault());

function sendClientUpdate() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', mouseX: mouse.x, mouseY: mouse.y }));
    }
}

// === ПРИЕМ ДАННЫХ ОТ СЕРВЕРА ===
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
        myId = data.id; // Получаем наш личный ID от сервера
    }

    if (data.type === 'update') {
        players = data.players; // Обновляем список всех игроков на карте
        mobs = data.mobs;       // Обновляем список мобов
        
        // Обновляем счетчик очков на экране
        if (players[myId]) {
            score = players[myId].score;
            if (scoreElement) scoreElement.innerText = "Очки: " + score;
        }
    }
};

// === ДИНАМИЧЕСКИЙ ФОН (Твой оригинальный дизайн) ===
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

    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.strokeStyle = (x % 100 === 0) ? gridColor1 : gridColor2;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.strokeStyle = (y % 100 === 0) ? gridColor1 : gridColor2;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
}

// === ОТРИСОВКА ЛИЦА (Твоя графика эмоций) ===
function drawFace(x, y, emotion) {
    let leftEyeX = x - 8;
    let rightEyeX = x + 8;
    let eyeY = y - 4;

    if (emotion === 'angry') {
        ctx.fillStyle = '#000000'; ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 5, 7, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 5, 7, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(x - 14, y - 12); ctx.lineTo(x - 2, y - 6);
        ctx.moveTo(x + 14, y - 12); ctx.lineTo(x + 2, y - 6);
        ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath();
        ctx.arc(leftEyeX + 1, eyeY + 1, 2, 0, Math.PI * 2);
        ctx.arc(rightEyeX - 1, eyeY + 1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(x, y + 12, 6, Math.PI, 0, false); ctx.stroke();
    } else if (emotion === 'sad') {
        ctx.fillStyle = '#000000'; ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(x - 13, y - 10); ctx.lineTo(x - 4, y - 13);
        ctx.moveTo(x + 13, y - 10); ctx.lineTo(x + 4, y - 13);
        ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath();
        ctx.arc(leftEyeX - 1, eyeY + 2, 2.5, 0, Math.PI * 2);
        ctx.arc(rightEyeX + 1, eyeY + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(x, y + 12, 6, Math.PI, 0, false); ctx.stroke();
    } else {
        ctx.fillStyle = '#000000'; ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 6, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 6, 8, 0, 0, Math.PI * 2); 
        ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.arc(x, y + 6, 6, 0, Math.PI, false); ctx.stroke();
    }
}

// === ГЛАВНЫЙ ЦИКЛ РЕНДЕРА ИГРЫ ===
function gameLoop() {
    drawHornexGrid();

    currentAngle += 0.03; // Вращение лепестков синхронно с сервером

    // 1. Рисуем всех сетевых игроков
    Object.keys(players).forEach(id => {
        const p = players[id];

        // Отрисовка тела круглого персонажа
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();

        // Отрисовка глаз и рта
        drawFace(p.x, p.y, p.emotion);

        // Отрисовка лепестков вокруг игрока
        p.petals.forEach((petal, index) => {
            if (petal.isBroken) return; // Если сломан на сервере — не рисуем

            let angle = currentAngle + (index * (Math.PI * 2 / p.petals.length));
            let petalX = p.x + Math.cos(angle) * p.petalDistance;
            let petalY = p.y + Math.sin(angle) * p.petalDistance;

            ctx.beginPath();
            ctx.arc(petalX, petalY, petal.radius, 0, Math.PI * 2);
            ctx.fillStyle = petal.damageTimer > 0 ? '#ff3333' : '#ffffff'; // Мигает красным при уроне
            ctx.fill();
            ctx.closePath();

            // Маленькая полоска здоровья лепестка
            const pHealthWidth = petal.radius * 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(petalX - petal.radius, petalY + petal.radius + 3, pHealthWidth, 3);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(petalX - petal.radius, petalY + petal.radius + 3, pHealthWidth * (petal.hp / petal.maxHp), 3);
        });

        // Основная полоска здоровья над головой игрока
        const pBarWidth = 50;
        const pBarX = p.x - pBarWidth / 2;
        const pBarY = p.y - p.radius - 20;
        ctx.fillStyle = '#374151';
        ctx.fillRect(pBarX, pBarY, pBarWidth, 6);
        if (p.hp > 0) {
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(pBarX, pBarY, pBarWidth * (p.hp / p.maxHp), 6);
        }
    });

    // 2. Рисуем всех сетевых мобов
    mobs.forEach((mob) => {
        ctx.fillStyle = mob.damageTimer > 0 ? '#ffffff' : mob.color; // Белая вспышка от удара
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        
        // Если у моба есть обводка (для черной группы)
        if (mob.strokeColor && mob.damageTimer === 0) {
            ctx.strokeStyle = mob.strokeColor; ctx.lineWidth = 4; ctx.beginPath();
            ctx.arc(mob.x, mob.y, mob.radius - 2, 0, Math.PI * 2); ctx.stroke();
        }
        
        // Текст редкости над мобом
        ctx.fillStyle = mob.textColor; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText(mob.name, mob.x, mob.y - mob.radius - 12);

        // Полоска здоровья моба
        const barWidth = mob.radius * 2;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x - mob.radius, mob.y - mob.radius - 6, barWidth, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(mob.x - mob.radius, mob.y - mob.radius - 6, barWidth * (mob.hp / mob.maxHp), 4);
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
