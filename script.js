// ... (начало кода с canvas и player оставляем таким же)

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    color: '#ffcc00', 
    speed: 0.08,
    emotion: 'normal'
};

// --- НАСТРОЙКА ЛЕПЕСТКОВ ---
const petals = [];
const petalCount = 5;
const rotationSpeed = 0.03;
let currentAngle = 0;
const petalDistance = 65; // ТА САМАЯ ДАЛЬНОСТЬ (от центра игрока)

for (let i = 0; i < petalCount; i++) {
    petals.push({
        distance: petalDistance, 
        radius: 12,
        currentColor: '#ffffff'
    });
}

// --- ФУНКЦИЯ РИСОВАНИЯ ЛИЦА ---
function drawFace(x, y, radius, emotion) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Глаза
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    const eyeSize = radius * 0.15;
    const eyeOffset = radius * 0.4;
    const eyeY = y - radius * 0.1;

    if (emotion === 'normal') {
        // Просто точки-глаза
        ctx.beginPath();
        ctx.arc(x - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Спокойный рот
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.2, radius * 0.4, 0, Math.PI);
        ctx.stroke();
    } 
    else if (emotion === 'angry') {
        // Злые глаза (наклонные брови/линии)
        ctx.beginPath();
        // Левый
        ctx.moveTo(x - eyeOffset - 5, eyeY - 5);
        ctx.lineTo(x - eyeOffset + 5, eyeY + 5);
        // Правый
        ctx.moveTo(x + eyeOffset + 5, eyeY - 5);
        ctx.lineTo(x + eyeOffset - 5, eyeY + 5);
        ctx.stroke();
        // Злой рот (кривая вниз или прямая)
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 15);
        ctx.lineTo(x + 10, y + 15);
        ctx.stroke();
    } 
    else if (emotion === 'sad') {
        // Грустные глаза (ниже обычного)
        ctx.beginPath();
        ctx.arc(x - eyeOffset, eyeY + 5, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + eyeOffset, eyeY + 5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Грустный рот (дуга вверх)
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.6, radius * 0.3, Math.PI, 0);
        ctx.stroke();
    }
}

// ... (функции spawnMob и остальное)

function update() {
    // Очистка фона (выбирай цвет в зависимости от биома)
    ctx.fillStyle = currentBiome === 'black' ? '#050505' : (currentBiome === 'red' ? '#2b0000' : '#001a00');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Движение игрока
    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    // Отрисовка лепестков
    currentAngle += rotationSpeed;
    petals.forEach((petal, i) => {
        const angle = currentAngle + (i * Math.PI * 2) / petalCount;
        const px = player.x + Math.cos(angle) * petal.distance;
        const py = player.y + Math.sin(angle) * petal.distance;

        ctx.fillStyle = petal.currentColor;
        ctx.beginPath();
        ctx.arc(px, py, petal.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Тут можно добавить логику столкновения с мобами
    });

    // Отрисовка игрока
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // РИСУЕМ ЛИЦО
    drawFace(player.x, player.y, player.radius, player.emotion);

    // Отрисовка мобов и их HP (как в прошлом сообщении)
    // ...

    requestAnimationFrame(update);
}
update();
