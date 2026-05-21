const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let players = {};
let mobs = [];
let currentAngle = 0;

// Это сообщение ты увидишь в cmd при запуске
console.log("====================================================");
console.log(">>> СЕРВЕР ИГРЫ УСПЕШНО ЗАПУЩЕН НА ПОРТУ 3000 <<<");
console.log("====================================================");

// Функция проверки столкновений (бывшая checkCircleCollision)
function checkCollision(c1, c2) {
    let dx = c1.x - c2.x;
    let dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy) < (c1.radius + c2.radius);
}

// Твоя функция спавна мобов со всеми шансами и группами редкости
function spawnMob() {
    if (mobs.length < 15) { // Держим на карте до 15 мобов одновременно
        const rand = Math.random();
        let mobType = {};

        if (rand < 0.55) {
            // ЗЕЛЕНАЯ ГРУППА
            const randTier = Math.random();
            if (randTier < 0.60) mobType = { name: 'Common', radius: 14, color: '#2ecc71', strokeColor: null, textColor: '#2ecc71', maxHp: 3, damage: 0.5, points: 10 };
            else if (randTier < 0.90) mobType = { name: 'Unusual', radius: 17, color: '#27ae60', strokeColor: null, textColor: '#27ae60', maxHp: 5, damage: 1, points: 15 };
            else mobType = { name: 'Rare', radius: 20, color: '#1abc9c', strokeColor: null, textColor: '#1abc9c', maxHp: 8, damage: 1.5, points: 20 };
        } else if (rand < 0.90) {
            // КРАСНАЯ ГРУППА
            const randTier = Math.random();
            if (randTier < 0.60) mobType = { name: 'Epic', radius: 24, color: '#e67e22', strokeColor: null, textColor: '#e67e22', maxHp: 12, damage: 2, points: 30 };
            else if (randTier < 0.90) mobType = { name: 'Legendary', radius: 28, color: '#e74c3c', strokeColor: null, textColor: '#e74c3c', maxHp: 18, damage: 3, points: 45 };
            else mobType = { name: 'Mythic', radius: 32, color: '#9b59b6', strokeColor: null, textColor: '#9b59b6', maxHp: 25, damage: 4, points: 60 };
        } else {
            // ЧЕРНАЯ ГРУППА
            const randTier = Math.random();
            if (randTier < 0.60) mobType = { name: 'Ultra', radius: 38, color: '#111111', strokeColor: '#ffffff', textColor: '#ffffff', maxHp: 40, damage: 6, points: 100 };
            else if (randTier < 0.90) mobType = { name: 'Super', radius: 45, color: '#111111', strokeColor: '#e74c3c', textColor: '#e74c3c', maxHp: 60, damage: 8, points: 150 };
            else mobType = { name: 'Hyper', radius: 55, color: '#111111', strokeColor: '#ffcc00', textColor: '#ffcc00', maxHp: 100, damage: 12, points: 250 };
        }

        mobs.push({
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random() * 1200 + 100,
            y: Math.random() * 800 + 100,
            radius: mobType.radius, color: mobType.color, strokeColor: mobType.strokeColor, textColor: mobType.textColor,
            hp: mobType.maxHp, maxHp: mobType.maxHp, name: mobType.name, points: mobType.points, damage: mobType.damage,
            damageTimer: 0
        });
    }
}

// Запуск спавна мобов каждую секунду
setInterval(spawnMob, 1000);

// Логика подключений игроков
server.on('connection', (ws) => {
    // Создаем уникальный ID для каждого нового игрока
    const id = Math.random().toString(36).substr(2, 9);
    
    // Переносим настройки игрока и его 5 лепестков на сервер
    players[id] = {
        x: 500, y: 500, radius: 25, color: '#ffcc00', speed: 0.04, emotion: 'normal', hp: 100, maxHp: 100, score: 0,
        targetDistance: 60, petalDistance: 60,
        petals: Array.from({ length: 5 }, () => ({ radius: 10, hp: 3, maxHp: 3, isBroken: false, damageTimer: 0 }))
    };

    // Отправляем игроку его ID
    ws.send(JSON.stringify({ type: 'init', id: id }));

    // Слушаем команды от браузера игрока
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const p = players[id];
        if (!p) return;

        // Движение за мышкой
        if (data.type === 'move') {
            p.x += (data.mouseX - p.x) * p.speed;
            p.y += (data.mouseY - p.y) * p.speed;
        }

        // Изменение эмоций и радиуса лепестков
        if (data.type === 'changeEmotion') {
            p.emotion = data.emotion;
            if (p.emotion === 'sad') p.targetDistance = 40;       // Сжимаются
            else if (p.emotion === 'angry') p.targetDistance = 110; // Отлетают для атаки
            else p.targetDistance = 60;                          // Нормальные
        }
    });

    // Если игрок закрыл вкладку — удаляем его с сервера
    ws.on('close', () => { delete players[id]; });
});

// Главный серверный цикл (60 обновлений в секунду) — здесь считается вся математика
setInterval(() => {
    currentAngle += 0.03; // Вращение лепестков

    Object.keys(players).forEach(id => {
        const p = players[id];
        
        // Плавное изменение дистанции лепестков
        p.petalDistance += (p.targetDistance - p.petalDistance) * 0.1;

        // Восстановление сломанных лепестков (регенерация)
        p.petals.forEach(petal => {
            if (petal.damageTimer > 0) petal.damageTimer--;
            if (petal.isBroken && Math.random() < 0.003) { 
                petal.isBroken = false;
                petal.hp = petal.maxHp;
            }
        });

        // Проверка столкновений лепестков с мобами
        p.petals.forEach((petal, index) => {
            if (petal.isBroken) return;
            let angle = currentAngle + (index * (Math.PI * 2 / p.petals.length));
            let petalX = p.x + Math.cos(angle) * p.petalDistance;
            let petalY = p.y + Math.sin(angle) * p.petalDistance;

            mobs.forEach(mob => {
                if (checkCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
                    // Урон лепестку
                    if (petal.damageTimer === 0) {
                        petal.damageTimer = 10;
                        petal.hp -= 1;
                        if (petal.hp <= 0) petal.isBroken = true;
                    }
                    // Урон мобу и отталкивание моба
                    if (mob.damageTimer === 0) {
                        mob.damageTimer = 8;
                        mob.hp -= 1;
                        mob.x += Math.cos(angle) * 15;
                        mob.y += Math.sin(angle) * 15;
                    }
                }
            });
        });

        // Столкновение тела игрока с мобами
        mobs.forEach(mob => {
            if (mob.damageTimer > 0) mob.damageTimer--;
            
            if (checkCollision(p, mob)) {
                p.hp -= mob.damage; // Моб наносит урон игроку
                
                // Если игрок злой, он сам наносит урон телом
                if (p.emotion === 'angry' && mob.damageTimer === 0) {
                    mob.hp -= 1;
                    mob.damageTimer = 8;
                }

                // Отталкивание игрока от моба
                let dx = p.x - mob.x;
                let dy = p.y - mob.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    p.x += (dx / dist) * 6;
                    p.y += (dy / dist) * 6;
                }

                // Если игрок умер — обнуляем очки и лечим
                if (p.hp <= 0) {
                    p.hp = p.maxHp;
                    p.score = 0;
                }
            }
        });

        // Начисление очков за уничтожение мобов
        mobs.forEach(mob => {
            if (mob.hp <= 0) p.score += mob.points;
        });
    });

    // Удаляем мертвых мобов
    mobs = mobs.filter(mob => mob.hp > 0);

    // Рассылаем координаты всех игроков и мобов обратно в браузеры
    const updateData = JSON.stringify({ type: 'update', players: players, mobs: mobs });
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(updateData);
        }
    });
}, 1000 / 60);
