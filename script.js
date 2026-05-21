const SERVER_URL = 'wss://flozer-pro.onrender.com';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

const socket = new WebSocket(SERVER_URL);
let myId = null, players = {}, mobs = [], score = 0, currentAngle = 0;
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

socket.onopen = () => {
    // Говорим серверу, что мы подключились как новый актуальный игрок
    socket.send(JSON.stringify({ type: 'join' }));
};

window.addEventListener('mousemove', (e) => { 
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', mouseX: mouse.x, mouseY: mouse.y })); 
    }
});

window.addEventListener('mousedown', (e) => { 
    let em = e.button === 0 ? 'angry' : (e.button === 2 ? 'sad' : 'normal'); 
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'changeEmotion', emotion: em })); 
    }
});

window.addEventListener('mouseup', () => { 
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'changeEmotion', emotion: 'normal' })); 
    }
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

socket.onmessage = (e) => {
    let data = JSON.parse(e.data);
    if (data.type === 'init') myId = data.id;
    if (data.type === 'update') { 
        players = data.players; 
        mobs = data.mobs; 
        if (players[myId]) { 
            score = players[myId].score; 
            if (scoreElement) scoreElement.innerText = "Очки: " + score; 
        } 
    }
};

function drawFace(x, y, em) {
    let lx = x - 8, rx = x + 8, ey = y - 4;
    ctx.fillStyle = '#000000'; ctx.beginPath();
    if (em === 'angry') {
        ctx.ellipse(lx, ey, 5, 7, -Math.PI/6, 0, Math.PI*2); ctx.ellipse(rx, ey, 5, 7, Math.PI/6, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x-14, y-12); ctx.lineTo(x-2, y-6); ctx.moveTo(x+14, y-12); ctx.lineTo(x+2, y-6); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lx+1, ey+1, 2, 0, Math.PI*2); ctx.arc(rx-1, ey+1, 2, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y+12, 6, Math.PI, 0, false); ctx.stroke();
    } else if (em === 'sad') {
        ctx.ellipse(lx, ey, 6, 7, 0, 0, Math.PI*2); ctx.ellipse(rx, ey, 6, 7, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x-13, y-10); ctx.lineTo(x-4, y-13); ctx.moveTo(x+13, y-10); ctx.lineTo(x+4, y-13); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lx-1, ey+2, 2.5, 0, Math.PI*2); ctx.arc(rx+1, ey+2, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y+12, 6, Math.PI, 0, false); ctx.stroke();
    } else {
        ctx.ellipse(lx, ey, 6, 8, 0, 0, Math.PI*2); ctx.ellipse(rx, ey, 6, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lx, ey, 3, 0, Math.PI*2); ctx.arc(rx, ey, 3, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y+6, 6, 0, Math.PI, false); ctx.stroke();
    }
}

function gameLoop() {
    let bg = '#142217', c1 = 'rgba(46,204,113,0.25)', c2 = 'rgba(46,204,113,0.1)';
    if (score >= 100 && score < 300) { bg = '#221414'; c1 = 'rgba(231,76,60,0.25)'; c2 = 'rgba(231,76,60,0.1)'; }
    else if (score >= 300) { bg = '#0b0c10'; c1 = 'rgba(255,255,255,0.2)'; c2 = 'rgba(155,89,182,0.15)'; }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let x = 0; x < canvas.width; x += 50) { ctx.strokeStyle = (x % 100 === 0) ? c1 : c2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 50) { ctx.strokeStyle = (y % 100 === 0) ? c1 : c2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    
    currentAngle += 0.03;
    
    Object.keys(players).forEach(id => {
        let p = players[id];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
        drawFace(p.x, p.y, p.emotion);
        
        p.petals.forEach((pt, idx) => {
            if (pt.isBroken) return;
            let a = currentAngle + (idx * (Math.PI * 2 / p.petals.length)), px = p.x + Math.cos(a) * p.petalDistance, py = p.y + Math.sin(a) * p.petalDistance;
            ctx.beginPath(); ctx.arc(px, py, pt.radius, 0, Math.PI * 2); ctx.fillStyle = pt.damageTimer > 0 ? '#ff3333' : '#ffffff'; ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px - pt.radius, py + pt.radius + 3, pt.radius * 2, 3);
            ctx.fillStyle = '#00ff00'; ctx.fillRect(px - pt.radius, py + pt.radius + 3, (pt.radius * 2) * (pt.hp / pt.maxHp), 3);
        });
        
        ctx.fillStyle = '#374151'; ctx.fillRect(p.x - 25, p.y - p.radius - 20, 50, 6);
        if (p.hp > 0) { ctx.fillStyle = '#4ade80'; ctx.fillRect(p.x - 25, p.y - p.radius - 20, 50 * (p.hp / p.maxHp), 6); }
    });
    
    mobs.forEach((mob) => {
        ctx.fillStyle = mob.damageTimer > 0 ? '#ffffff' : mob.color; ctx.beginPath(); ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2); ctx.fill();
        if (mob.strokeColor && mob.damageTimer === 0) { ctx.strokeStyle = mob.strokeColor; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(mob.x, mob.y, mob.radius - 2, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = mob.textColor; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText(mob.name, mob.x, mob.y - mob.radius - 12);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(mob.x - mob.radius, mob.y - mob.radius - 6, mob.radius * 2, 4);
        ctx.fillStyle = '#00ff00'; 
        ctx.fillRect(mob.x - mob.radius, mob.y - mob.radius - 6, (mob.radius * 2) * (mob.hp / mob.maxHp), 4);
    });
    
    requestAnimationFrame(gameLoop);
}
gameLoop();
