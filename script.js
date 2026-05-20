// --- ИНИЦИАЛИЗАЦИЯ ХОЛСТА И НАСТРОЕК ---
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Стили для страницы, чтобы убрать прокрутку
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#111";

// Создаем интерфейс для очков
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = '#fff';
scoreElement.style.fontFamily = 'Arial, sans-serif';
scoreElement.style.fontSize = '24px';
scoreElement.style.fontWeight = 'bold';
scoreElement.innerText = "Score: 0";
document.body.appendChild(scoreElement);

// --- ИГРОВЫЕ ПЕРЕМЕННЫЕ ---
let score = 0;
let currentBiome = 'green'; // 'green', 'red', 'dark'
const particles = [];
const mobs = [];

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    color: '#f1c40f', // Желтый Hornex-игрок
    speed: 0.08,
    emotion: 'neutral'
};

const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// Управление мышью
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// --- ОБНОВЛЕННЫЕ НАСТРОЙКИ ЛЕПЕСТКОВ ---
const petals = [];
const petalCount = 5;
let currentAngle = 0;

for (let i = 0; i < petalCount; i++) {
    petals.push({
        baseDist: 65, 
        dist: 65,
        radius: 13,
        angleOffset: (i * Math.PI * 2) / petalCount,
        hitFlash: 0 // Таймер покраснения лепестка
    });
}

// --- ФУНКЦИЯ ОТРЫСОВКИ ЛИЦА HORNEX ---
function drawHornexFace(x, y, radius, emotion) {
    ctx.fillStyle = '#000';
    
    // Глаза базовые
    let eyeOffset = radius * 0.35;
    let eyeRadius = radius * 0.15;
    
    // Смещение глаз в сторону мышки для эффекта взгляда
    const angle = Math.atan2(mouse.y - y, mouse.x - x);
    const lookDist = radius * 0.1;
    const lookX = Math.cos(angle) * lookDist;
    const lookY = Math.sin(angle) * lookDist;

    // Левый и правый глаз
    ctx.beginPath();
    ctx.arc(x - eyeOffset + lookX, y - eyeOffset + lookY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(x + eyeOffset + lookX, y - eyeOffset + lookY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Рот в зависимости от эмоции
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (emotion === 'angry') {
        // Злой рот (дуга вверх)
        ctx.arc(x, y + radius * 0.4, radius * 0.2, Math.PI, 0, false);
    } else if (emotion === 'happy') {
        // Улыбка
        ctx.arc(x, y + radius * 0.2, radius * 0.3, 0, Math.PI, false);
    } else {
        // Нейтральный рот (полоска)
        ctx.moveTo(x - radius * 0.2, y + radius * 0.25);
        ctx.lineTo(x + radius * 0.2, y + radius * 0.25);
    }
    ctx.stroke();
}

// --- СПАВН ЧАСТИЦ (ВЗРЫВ) ---
function spawnExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = Math.random() * 3 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            radius: Math.random() * 4 + 2,
            color: color,
            life: 40
        });
    }
}

// --- СПАВН МОБОВ ---
function spawnMob() {
    // Спавним за пределами экрана
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) + 50;
    const x = player.x + Math.cos(angle) * dist;
    const y = player.y + Math.sin(angle) * dist;

    // Характеристики зависят от биома
    let size, hp, color;
    if (currentBiome === 'green') {
        size = Math.random() * 10 + 15;
        hp = 1;
        color = '#e67e22'; // Оранжевые жуки
    } else if (currentBiome === 'red') {
        size = Math.random() * 15 + 20;
        hp = 3;
        color = '#9b59b6'; // Фиолетовые агрессивные мобы
    } else {
        size = Math.random() * 8 + 12;
        hp = 0.5;
        color = '#34495e'; // Быстрые темные мобы
    }

    mobs.push({
        x: x, y: y,
        vx: 0, vy: 0,
        s: size,
        hp: hp,
        maxHp: hp,
        c: color,
        flash: 0
    });
}

// Интервал спавна мобов (каждые 1.5 секунды)
setInterval(() => {
    if (mobs.length < 15) spawnMob();
}, 1500);

// Переключение биомов клавишами 1, 2, 3 для тестов
window.addEventListener('keydown', (e) => {
    if (e.key === '1') currentBiome = 'green';
    if (e.key === '2') currentBiome = 'red';
    if (e.key === '3') currentBiome = 'dark';
});


// --- ГЛАВНЫЙ ЦИКЛ ---
function update() {
    // Отрисовка фона (биомы)
    ctx.fillStyle = currentBiome === 'green' ? '#27ae60' : (currentBiome === 'red' ? '#c0392b' : '#111');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for(let i=0; i<canvas.width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }

    // Движение игрока
    player.x += (mouse.x - player.x) * player.speed;
    player.y += (mouse.y - player.y) * player.speed;

    // Меняем эмоцию, если враги слишком близко
    let enemyClose = false;
    mobs.forEach(m => {
        if(Math.hypot(player.x - m.x, player.y - m.y) < 200) enemyClose = true;
    });
    player.emotion = enemyClose ? 'angry' : 'happy';

    // Вращение и логика лепестков
    currentAngle += 0.04;
    petals.forEach(p => {
        p.dist = p.baseDist + Math.sin(currentAngle * 2) * 5; // Анимация дыхания
        
        const x = player.x + Math.cos(currentAngle + p.angleOffset) * p.dist;
        const y = player.y + Math.sin(currentAngle + p.angleOffset) * p.dist;

        // ЛОГИКА ПОКРАСНЕНИЯ ЛЕПЕСТКА
        if (p.hitFlash > 0) {
            ctx.fillStyle = '#ff0000'; // Красный при ударе
            p.hitFlash--;
        } else {
            ctx.fillStyle = '#ffffff'; // Обычный белый
        }

        ctx.beginPath();
        ctx.arc(x, y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Проверка столкновения с мобами
        mobs.forEach((m, idx) => {
            const distance = Math.hypot(x - m.x, y - m.y);
            if (distance < p.radius + m.s) {
                // ПРИ СОПРИКОСНОВЕНИИ:
                m.hp -= 0.15;
                m.flash = 5;      // Моб становится красным на 5 кадров
                p.hitFlash = 5;   // Лепесток становится красным на 5 кадров
                
                if (m.hp <= 0) {
                    spawnExplosion(m.x, m.y, m.c);
                    score += 10;
                    scoreElement.innerText = "Score: " + score;
                    mobs.splice(idx, 1);
                }
            }
        });
    });

    // Игрок и лицо
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    drawHornexFace(player.x, player.y, player.radius, player.emotion);

    // Мобы
    mobs.forEach(m => {
        const angle = Math.atan2(player.y - m.y, player.x - m.x);
        m.vx += Math.cos(angle) * 0.1;
        m.vy += Math.sin(angle) * 0.1;
        m.vx *= 0.95; m.vy *= 0.95;
        m.x += m.vx; m.y += m.vy;

        // ЛОГИКА ПОКРАСНЕНИЯ МОБА
        if (m.flash > 0) {
            ctx.fillStyle = '#ff0000'; // Красный при получении урона
            m.flash--;
        } else {
            ctx.fillStyle = m.c;
        }

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.s, 0, Math.PI * 2);
        ctx.fill();

        // Полоска здоровья
        const bw = m.s * 1.5;
        ctx.fillStyle = '#333';
        ctx.fillRect(m.x - bw/2, m.y - m.s - 12, bw, 4);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(m.x - bw/2, m.y - m.s - 12, bw * (m.hp/m.maxHp), 4);
    });

    // Отрисовка частиц взрыва
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 40;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(update);
}

// Запуск игры
update();
