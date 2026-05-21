const WebSocket = require('ws');

// Запускаем сервер на порту 8080
const wss = new WebSocket.Server({ port: 8080 });

let players = {};
let mobs = [];
let nextMobId = 0;

console.log('Сервер Hornex запущен на порту 8080');

// Функция создания мобов
function spawnMob() {
    if (Object.keys(players).length === 0) return; // Если игроков нет, мобов не создаем

    if (mobs.length < 15) {
        const rand = Math.random();
        let mobType = { name: 'Common', radius: 14, color: '#2ecc71', maxHp: 3, damage: 0.5, points: 10 };

        mobs.push({
            id: nextMobId++,
            x: Math.random() * 1500 + 100,
            y: Math.random() * 1500 + 100,
            ...mobType,
            hp: mobType.maxHp
        });
    }
}

setInterval(spawnMob, 1500);

// Отправляем обновления всем игрокам 60 раз в секунду
setInterval(() => {
    const state = JSON.stringify({ type: 'update', players, mobs });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(state);
        }
    });
}, 1000 / 60);

// Логика при подключении игрока
wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    players[id] = {
        id: id,
        x: 500,
        y: 500,
        radius: 25,
        color: '#ffcc00',
        hp: 100,
        maxHp: 100,
        score: 0,
        angle: 0
    };

    // Говорим игроку его ID
    ws.send(JSON.stringify({ type: 'init', id: id }));

    // Слушаем сообщения от игрока
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Движение игрока
        if (data.type === 'move') {
            if (players[id]) {
                players[id].x += (data.mouseX - players[id].x) * 0.04;
                players[id].y += (data.mouseY - players[id].y) * 0.04;
                players[id].angle = data.angle;
            }
        }
    });

    // Если игрок закрыл вкладку
    ws.on('close', () => {
        delete players[id];
    });
});