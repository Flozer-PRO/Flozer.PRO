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
