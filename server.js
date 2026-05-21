const WebSocket = require('wss');
const server = new WebSocket.Server({ port: 3000 });
let players = {}, mobs = [], currentAngle = 0;
console.log("=== SERVER RUNNING ON PORT 3000 ===");
function checkCollision(c1, c2) {
    let dx = c1.x - c2.x, dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy) < (c1.radius + c2.radius);
}
function spawnMob() {
    if (mobs.length >= 15) return;
    let r = Math.random(), m = { name: 'Common', radius: 14, color: '#2ecc71', strokeColor: null, textColor: '#2ecc71', hp: 3, maxHp: 3, points: 10, damage: 0.5 };
    if (r > 0.55 && r < 0.90) m = { name: 'Epic', radius: 24, color: '#e67e22', strokeColor: null, textColor: '#e67e22', hp: 12, maxHp: 12, points: 30, damage: 2 };
    else if (r >= 0.90) m = { name: 'Hyper', radius: 55, color: '#111111', strokeColor: '#ffcc00', textColor: '#ffcc00', hp: 100, maxHp: 100, points: 250, damage: 12 };
    mobs.push({ id: Math.random().toString(36).substr(2, 9), x: Math.random() * 1200 + 100, y: Math.random() * 800 + 100, radius: m.radius, color: m.color, strokeColor: m.strokeColor, textColor: m.textColor, hp: m.hp, maxHp: m.maxHp, name: m.name, points: m.points, damage: m.damage, damageTimer: 0 });
}
setInterval(spawnMob, 1000);
server.on('connection', (ws) => {
    let id = Math.random().toString(36).substr(2, 9);
    players[id] = { x: 500, y: 500, radius: 25, color: '#ffcc00', speed: 0.04, emotion: 'normal', hp: 100, maxHp: 100, score: 0, targetDistance: 60, petalDistance: 60, petals: Array.from({ length: 5 }, () => ({ radius: 10, hp: 3, maxHp: 3, isBroken: false, damageTimer: 0 })) };
    ws.send(JSON.stringify({ type: 'init', id: id }));
    ws.on('message', (msg) => {
        let data = JSON.parse(msg), p = players[id];
        if (!p) return;
        if (data.type === 'move') { p.x += (data.mouseX - p.x) * p.speed; p.y += (data.mouseY - p.y) * p.speed; }
        if (data.type === 'changeEmotion') { p.emotion = data.emotion; p.targetDistance = p.emotion === 'sad' ? 40 : (p.emotion === 'angry' ? 110 : 60); }
    });
    ws.on('close', () => { delete players[id]; });
});
setInterval(() => {
    currentAngle += 0.03;
    Object.keys(players).forEach(id => {
        let p = players[id];
        p.petalDistance += (p.targetDistance - p.petalDistance) * 0.1;
        p.petals.forEach(pt => { if (pt.damageTimer > 0) pt.damageTimer--; if (pt.isBroken && Math.random() < 0.003) { pt.isBroken = false; pt.hp = pt.maxHp; } });
        p.petals.forEach((pt, idx) => {
            if (pt.isBroken) return;
            let a = currentAngle + (idx * (Math.PI * 2 / p.petals.length)), px = p.x + Math.cos(a) * p.petalDistance, py = p.y + Math.sin(a) * p.petalDistance;
            mobs.forEach(mob => {
                if (checkCollision({ x: px, y: py, radius: pt.radius }, mob)) {
                    if (pt.damageTimer === 0) { pt.damageTimer = 10; pt.hp -= 1; if (pt.hp <= 0) pt.isBroken = true; }
                    if (mob.damageTimer === 0) { mob.damageTimer = 8; mob.hp -= 1; mob.x += Math.cos(a) * 15; mob.y += Math.sin(a) * 15; }
                }
            });
        });
        mobs.forEach(mob => {
            if (mob.damageTimer > 0) mob.damageTimer--;
            if (checkCollision(p, mob)) {
                p.hp -= mob.damage;
                if (p.emotion === 'angry' && mob.damageTimer === 0) { mob.hp -= 1; mob.damageTimer = 8; }
                let dx = p.x - mob.x, dy = p.y - mob.y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) { p.x += (dx / dist) * 6; p.y += (dy / dist) * 6; }
                if (p.hp <= 0) { p.hp = p.maxHp; p.score = 0; }
            }
        });
        mobs.forEach(mob => { if (mob.hp <= 0) p.score += mob.points; });
    });
    mobs = mobs.filter(mob => mob.hp > 0);
    let updateData = JSON.stringify({ type: 'update', players: players, mobs: mobs });
    server.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(updateData); });
}, 1000 / 60);
