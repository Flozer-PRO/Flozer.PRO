const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let players = {};
let mobs = [];
let currentAngle = 0;

console.log("====================================================");
console.log(">>> SERVER STARTED ON PORT 3000 <<<");
console.log("====================================================");

function checkCollision(c1, c2) {
    let dx = c1.x - c2.x;
    let dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy) < (c1.radius + c2.radius);
}

function spawnMob() {
    if (mobs.length < 15) {
        const rand = Math.random();
        let mobType = {};

        if (rand < 0.55) {
            const randTier = Math.random();
            if (randTier < 0.60) mobType = { name: 'Common', radius: 14, color: '#2ecc71', strokeColor: null, textColor: '#2ecc71', maxHp: 3, damage: 0.5, points: 10 };
            else if (randTier < 0.90) mobType = { name: 'Unusual', radius: 17, color: '#27ae60', strokeColor: null, textColor: '#27ae60', maxHp: 5, damage: 1, points: 15 };
            else mobType = { name: 'Rare', radius: 20, color: '#1abc9c', strokeColor: null, textColor: '#1abc9c', maxHp: 8, damage: 1.5, points: 20 };
        } else if (rand < 0.90) {
            const randTier = Math.random();
            if (randTier < 0.60) mobType = { name: 'Epic', radius: 24, color: '#e67e22', strokeColor: null, textColor: '#e67e22', maxHp: 12, damage: 2, points: 30 };
            else if (randTier < 0.90) mobType = { name: 'Legendary', radius: 28, color: '#e74c3c', strokeColor: null, textColor: '#e74c3c', maxHp: 18, damage: 3, points: 45 };
            else mobType = { name: 'Mythic', radius: 32, color: '#9b59b6', strokeColor: null, textColor: '#9b59b6', maxHp: 25, damage: 4, points: 60 };
        } else {
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

setInterval(spawnMob, 1000);

server.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    players[id] = {
        x: 500, y: 500, radius: 25, color: '#ffcc00', speed: 0.04, emotion: 'normal', hp: 100, maxHp: 100, score: 0,
        targetDistance: 60, petalDistance: 60,
        petals: Array.from({ length: 5 }, () => ({ radius: 10, hp: 3, maxHp: 3, isBroken: false, damageTimer: 0 }))
    };

    ws.send(JSON.stringify({ type: 'init', id: id }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const p = players[id];
        if (!p) return;

        if (data.type === 'move') {
            p.x += (data.mouseX - p.x) * p.speed;
            p.y += (data.mouseY - p.y) * p.speed;
        }

        if (data.type === 'changeEmotion') {
            p.emotion = data.emotion;
            if (p.emotion === 'sad') p.targetDistance = 40;
            else if (p.emotion === 'angry') p.targetDistance = 110;
            else p.targetDistance = 60;
        }
    });

    ws.on('close', () => { delete players[id]; });
});

setInterval(() => {
    currentAngle += 0.03;

    Object.keys(players).forEach(id => {
        const p = players[id];
        
        p.petalDistance += (p.targetDistance - p.petalDistance) * 0.1;

        p.petals.forEach(petal => {
            if (petal.damageTimer > 0) petal.damageTimer--;
            if (petal.isBroken && Math.random() < 0.003) { 
                petal.isBroken = false;
                petal.hp = petal.maxHp;
            }
        });

        p.petals.forEach((petal, index) => {
            if (petal.isBroken) return;
            let angle = currentAngle + (index * (Math.PI * 2 / p.petals.length));
            let petalX = p.x + Math.cos(angle) * p.petalDistance;
            let petalY = p.y + Math.sin(angle) * p.petalDistance;

            mobs.forEach(mob => {
                if (checkCollision({ x: petalX, y: petalY, radius: petal.radius }, mob)) {
                    if (petal.damageTimer === 0) {
                        petal.damageTimer = 10;
                        petal.hp -= 1;
                        if (petal.hp <= 0) petal.isBroken = true;
                    }
                    if (mob.damageTimer === 0) {
                        mob.damageTimer = 8;
                        mob.hp -= 1;
                        mob.x += Math.cos(angle) * 15;
                        mob.y += Math.sin(angle) * 15;
                    }
                }
            });
        });

        mobs.forEach(mob => {
            if (mob.damageTimer > 0) mob.damageTimer--;
            
            if (checkCollision(p, mob)) {
                p.hp -= mob.damage;
                
                if (p.emotion === 'angry' && mob.damageTimer === 0) {
                    mob.hp -= 1;
                    mob.damageTimer = 8;
                }

                let dx = p.x - mob.x;
                let dy = p.y - mob.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    p.x += (dx / dist) * 6;
                    p.y += (dy / dist) * 6;
                }

                if (p.hp <= 0) {
                    p.hp = p.maxHp;
                    p.score = 0;
                }
            }
        });

        mobs.forEach(mob => {
            if (mob.hp <= 0) p.score += mob.points;
        });
    });

    mobs = mobs.filter(mob => mob.hp > 0);

    const updateData = JSON.stringify({ type: 'update', players: players, mobs: mobs });
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(updateData);
        }
    });
}, 1000 / 60);
