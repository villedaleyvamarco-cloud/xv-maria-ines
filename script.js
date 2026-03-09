// =============================================
// PRELOADER — PANTALLA DE CARGA ELEGANTE
// Controla la animación de entrada, la barra de progreso,
// las partículas propias y la transición de salida.
// =============================================
(function initPreloader() {
    const preloader = document.getElementById('preloader');
    const bar       = document.getElementById('preloaderBar');
    if (!preloader || !bar) return;

    // ── Partículas propias del preloader ──────────────────
    const canvas = document.getElementById('preloaderCanvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;

    if (canvas && ctx) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        const COUNT  = 50;
        // Mismo estilo que la sección timer: estrellas y destellos dorados
        const COLORS = [
            'rgba(247, 237, 200, ',
            'rgba(201, 169, 110, ',
            'rgba(255, 248, 228, ',
            'rgba(232, 213, 163, ',
        ];

        function spawnP(scattered) {
            return {
                x:         Math.random() * canvas.width,
                y:         scattered ? Math.random() * canvas.height : canvas.height + 10,
                vy:        -(0.1 + Math.random() * 0.25),
                vx:        (Math.random() - 0.5) * 0.15,
                size:      0.8 + Math.random() * 2.5,
                type:      Math.random() > 0.5 ? 'dot' : 'cross',
                color:     COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha:     0.2  + Math.random() * 0.55,
                alphaDir:  1,
                alphaSpd:  0.004 + Math.random() * 0.008,
                alphaMin:  0.05,
                alphaMax:  0.65,
                rot:       Math.random() * Math.PI * 2,
                rotSpd:    (Math.random() - 0.5) * 0.012,
            };
        }

        const particles = Array.from({ length: COUNT }, () => spawnP(true));
        let animating = true;

        function loopParticles() {
            if (!animating) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.y += p.vy; p.x += p.vx; p.rot += p.rotSpd;
                p.alpha += p.alphaSpd * p.alphaDir;
                if (p.alpha >= p.alphaMax) { p.alpha = p.alphaMax; p.alphaDir = -1; }
                if (p.alpha <= p.alphaMin) { p.alpha = p.alphaMin; p.alphaDir =  1; }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);

                if (p.type === 'dot') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fillStyle   = p.color + p.alpha + ')';
                    ctx.shadowColor = p.color + p.alpha + ')';
                    ctx.shadowBlur  = p.size * 4;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    const arm = p.size * 2.2;
                    ctx.strokeStyle = p.color + p.alpha + ')';
                    ctx.shadowColor = p.color + (p.alpha * 0.6) + ')';
                    ctx.shadowBlur  = p.size * 4;
                    ctx.lineWidth   = 0.7;
                    ctx.lineCap     = 'round';
                    ctx.beginPath();
                    ctx.moveTo(0, -arm); ctx.lineTo(0, arm);
                    ctx.moveTo(-arm * 0.45, 0); ctx.lineTo(arm * 0.45, 0);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
                ctx.restore();

                if (p.y < -15 || p.x < -15 || p.x > canvas.width + 15) {
                    particles[i] = spawnP(false);
                }
            });

            requestAnimationFrame(loopParticles);
        }
        loopParticles();

        // Detener partículas cuando el preloader ya salió
        preloader.addEventListener('transitionend', () => { animating = false; }, { once: true });
    }

    // ── Progreso simulado ─────────────────────────────────
    // Avanza rápido al principio y se detiene cerca del 85%
    // esperando el evento 'load' real de la página.
    let progress   = 0;
    let rafProgress = null;

    function advanceBar(target, speed) {
        if (rafProgress) cancelAnimationFrame(rafProgress);
        function step() {
            if (progress < target) {
                progress += speed;
                if (progress > target) progress = target;
                bar.style.width = progress + '%';
                rafProgress = requestAnimationFrame(step);
            }
        }
        step();
    }

    // Fase 1: llegar al 70% rápido (carga inicial de recursos)
    advanceBar(70, 0.9);

    // Fase 2: cuando el DOM está listo, avanzar al 85%
    document.addEventListener('DOMContentLoaded', () => {
        advanceBar(85, 0.4);
    });

    // ── Función que dispara la salida del preloader ────────
    function dismissPreloader() {
        // Completar barra al 100%
        advanceBar(100, 1.2);

        // Pequeña pausa elegante antes de la transición de salida
        setTimeout(() => {
            preloader.classList.add('preloader--exit');
            document.body.classList.remove('is-loading');

            // Eliminar del DOM después de que termine la transición CSS (0.9s)
            setTimeout(() => {
                preloader.remove();
            }, 950);
        }, 380);
    }

    // Fase 3: cuando TODA la página cargó (video, imágenes, fuentes)
    if (document.readyState === 'complete') {
        // Ya cargó antes de que este script corriera
        setTimeout(dismissPreloader, 600);
    } else {
        window.addEventListener('load', () => {
            // Dale un mínimo de 1.8 segundos para apreciar el preloader
            // 🎨 CAMBIAR DURACIÓN MÍNIMA: modifica el 1800 (en milisegundos)
            const minTime = 1800;
            const elapsed = performance.now();
            const remaining = Math.max(0, minTime - elapsed);
            setTimeout(dismissPreloader, remaining);
        });
    }

    // Fallback: si algo falla, forzar salida a los 5 segundos
    setTimeout(dismissPreloader, 5000);
})();

// =============================================
// INICIALIZACIÓN DE AOS (Animaciones al scroll)
// =============================================
AOS.init({
    duration: 1000,
    once: true,
    offset: 60
});

// =============================================
// PARTÍCULAS BRILLANTES — SECCIÓN CUENTA REGRESIVA
// Estrellas y destellos dorados sobre el fondo oscuro
// 🎨 CAMBIAR CANTIDAD: Ajusta PARTICLE_COUNT
// 🎨 CAMBIAR COLORES: Modifica COLORS array
// =============================================
(function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
        const section = document.querySelector('.timer-section');
        if (!section) return;
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 🎨 CANTIDAD DE PARTÍCULAS: ajusta para más o menos densidad
    const PARTICLE_COUNT = 90;

    // 🎨 COLORES DE LAS PARTÍCULAS: tonos champagne, dorado y blanco cálido
    const COLORS = [
        'rgba(247, 237, 200, ',   // champagne
        'rgba(201, 169, 110, ',   // dorado
        'rgba(255, 248, 228, ',   // blanco cálido
        'rgba(232, 213, 163, ',   // oro pálido
        'rgba(180, 140, 80,  ',   // dorado oscuro
    ];

    // Tres tipos de partícula para variedad visual
    const TYPES = ['star', 'dot', 'cross'];

    function spawnParticle(scattered) {
        const type  = TYPES[Math.floor(Math.random() * TYPES.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            x:        Math.random() * canvas.width,
            y:        scattered ? Math.random() * canvas.height : canvas.height + 10,
            // Tamaño: estrellas más grandes, puntos pequeños
            size:     type === 'dot' ? 1 + Math.random() * 2
                    : type === 'cross' ? 3 + Math.random() * 4
                    : 2 + Math.random() * 5,
            type,
            color,
            // Velocidad de subida muy lenta — flotan
            vy:      -(0.08 + Math.random() * 0.22),
            vx:       (Math.random() - 0.5) * 0.12,
            // Parpadeo: cada partícula tiene su propio ciclo
            alpha:    0.2 + Math.random() * 0.6,
            alphaDir: Math.random() > 0.5 ? 1 : -1,
            alphaSpeed: 0.004 + Math.random() * 0.008,
            alphaMin: 0.05 + Math.random() * 0.15,
            alphaMax: 0.5  + Math.random() * 0.5,
            // Rotación para las estrellas y cruces
            rot:      Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.01,
            frame: 0,
        };
    }

    // Dibuja una estrella de 4 puntas
    function drawStar(ctx, x, y, size, rot, color, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = color + alpha + ')';
        ctx.shadowColor = color + (alpha * 0.8) + ')';
        ctx.shadowBlur  = size * 3;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x1 = Math.cos(angle) * size;
            const y1 = Math.sin(angle) * size;
            const x2 = Math.cos(angle + Math.PI / 4) * size * 0.3;
            const y2 = Math.sin(angle + Math.PI / 4) * size * 0.3;
            i === 0 ? ctx.moveTo(x1, y1) : null;
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Dibuja una cruz delgada (destellos tipo bokeh)
    function drawCross(ctx, x, y, size, rot, color, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = color + alpha + ')';
        ctx.shadowColor = color + (alpha * 0.7) + ')';
        ctx.shadowBlur  = size * 4;
        ctx.lineWidth   = 0.8;
        ctx.lineCap     = 'round';
        const arms = [size * 2.5, size * 1.2]; // brazo largo y corto
        ctx.beginPath();
        ctx.moveTo(0, -arms[0]); ctx.lineTo(0, arms[0]);
        ctx.moveTo(-arms[1], 0); ctx.lineTo(arms[1], 0);
        ctx.stroke();
        ctx.restore();
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => spawnParticle(true));

    let active = true;
    let rafId  = null;

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.frame++;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;

            // Parpadeo suave
            p.alpha += p.alphaSpeed * p.alphaDir;
            if (p.alpha >= p.alphaMax) { p.alpha = p.alphaMax; p.alphaDir = -1; }
            if (p.alpha <= p.alphaMin) { p.alpha = p.alphaMin; p.alphaDir =  1; }

            if (p.type === 'dot') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.shadowColor = p.color + p.alpha + ')';
                ctx.shadowBlur  = p.size * 3;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (p.type === 'star') {
                drawStar(ctx, p.x, p.y, p.size, p.rot, p.color, p.alpha);
            } else {
                drawCross(ctx, p.x, p.y, p.size, p.rot, p.color, p.alpha);
            }

            // Reciclar si sale de pantalla
            if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
                particles[i] = spawnParticle(false);
            }
        }

        if (active) rafId = requestAnimationFrame(loop);
    }

    loop();

    // Pausar fuera de pantalla
    const section = document.querySelector('.timer-section');
    if (section && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !active) { active = true; loop(); }
            else if (!entry.isIntersecting) {
                active = false;
                if (rafId) cancelAnimationFrame(rafId);
            }
        }, { threshold: 0.05 }).observe(section);
    }
})();



// =============================================
// PÉTALOS DORADOS — CANVAS CONTINUO
// requestAnimationFrame: caída 100% fluida, sin pausas ni saltos.
// 🎨 CAMBIAR CANTIDAD: Ajusta PETAL_COUNT (más = más pétalos en pantalla)
// 🎨 CAMBIAR VELOCIDAD: Ajusta speed en spawnPetal (0.3 = lento, 1.0 = rápido)
// 🎨 CAMBIAR TAMAÑO: Ajusta el rango de size (ej. 14–34 para más grandes)
// =============================================
(function initPetals() {
    const container = document.getElementById('petals');
    if (!container) return;

    // Canvas sobre todo el hero
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        canvas.width  = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 🎨 PÉTALOS EN PANTALLA SIMULTÁNEAMENTE
    const PETAL_COUNT = 30;

    // Paleta champagne/dorado
    // 🎨 CAMBIAR COLORES DE LOS PÉTALOS: modifica los valores r, g, b
    const PALETTE = [
        { r: 250, g: 240, b: 205 },
        { r: 220, g: 185, b: 120 },
        { r: 205, g: 165, b: 95  },
        { r: 238, g: 218, b: 168 },
        { r: 190, g: 148, b: 88  },
        { r: 255, g: 248, b: 228 },
        { r: 175, g: 135, b: 75  },
    ];

    // Cuatro formas de pétalo con bezier curves
    const SHAPES = [
        // Pétalo de rosa clásico — amplio y redondeado
        (c, w, h) => {
            c.beginPath();
            c.moveTo(0, -h/2);
            c.bezierCurveTo( w*0.6,  -h*0.4,   w*0.55,  h*0.3,   0,  h/2);
            c.bezierCurveTo(-w*0.55,  h*0.3,  -w*0.6,  -h*0.4,   0, -h/2);
            c.closePath();
        },
        // Pétalo alargado y delgado
        (c, w, h) => {
            c.beginPath();
            c.moveTo(0, -h/2);
            c.bezierCurveTo( w*0.38, -h*0.3,   w*0.32,  h*0.35,  0,  h/2);
            c.bezierCurveTo(-w*0.32,  h*0.35, -w*0.38, -h*0.3,   0, -h/2);
            c.closePath();
        },
        // Pétalo asimétrico con curvatura lateral
        (c, w, h) => {
            c.beginPath();
            c.moveTo(0, -h/2);
            c.bezierCurveTo( w*0.7,  -h*0.35,  w*0.5,   h*0.4,   0,  h/2);
            c.bezierCurveTo(-w*0.3,   h*0.4,  -w*0.45, -h*0.4,   0, -h/2);
            c.closePath();
        },
        // Pétalo redondo con base ancha
        (c, w, h) => {
            c.beginPath();
            c.moveTo(0, -h/2);
            c.bezierCurveTo( w*0.75, -h*0.2,   w*0.6,   h*0.45,  0,  h/2);
            c.bezierCurveTo(-w*0.6,   h*0.45, -w*0.75, -h*0.2,   0, -h/2);
            c.closePath();
        },
    ];

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        const scaleY = Math.cos(p.tilt);
        ctx.rotate(p.rot);
        ctx.scale(1, scaleY < 0.15 ? 0.15 : scaleY);

        const w = p.size * 0.52, h = p.size;

        const grad = ctx.createLinearGradient(0, -h/2, 0, h/2);
        const c = p.color;
        grad.addColorStop(0,    `rgba(${Math.min(c.r+35,255)},${Math.min(c.g+28,255)},${Math.min(c.b+18,255)},${p.alpha * 0.92})`);
        grad.addColorStop(0.45, `rgba(${c.r},${c.g},${c.b},${p.alpha})`);
        grad.addColorStop(1,    `rgba(${Math.max(c.r-35,0)},${Math.max(c.g-28,0)},${Math.max(c.b-18,0)},${p.alpha * 0.45})`);

        SHAPES[p.shape](ctx, w, h);
        ctx.fillStyle = grad;
        ctx.fill();

        // Vena central sutil
        if (Math.abs(scaleY) > 0.4) {
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.42);
            ctx.quadraticCurveTo(p.size * 0.06, 0, 0, h * 0.44);
            ctx.strokeStyle = `rgba(255,248,210,${p.alpha * 0.28})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
        }

        ctx.restore();
    }

    function spawnPetal(scattered) {
        return {
            x:         Math.random() * canvas.width,
            y:         scattered ? Math.random() * canvas.height : -25,
            // 🎨 VELOCIDAD DE CAÍDA: rango de 0.38 a 0.86 (ajusta para más rápido/lento)
            speed:     0.38 + Math.random() * 0.48,
            swayAmp:   12 + Math.random() * 18,
            swayFreq:  0.006 + Math.random() * 0.01,
            swayPhase: Math.random() * Math.PI * 2,
            rot:       Math.random() * Math.PI * 2,
            rotSpeed:  (Math.random() - 0.5) * 0.014,
            tilt:      Math.random() * Math.PI * 2,
            tiltSpeed: (Math.random() - 0.5) * 0.022,
            // 🎨 TAMAÑO: 15 = mínimo, + 22 = extra aleatorio
            size:      15 + Math.random() * 22,
            shape:     Math.floor(Math.random() * SHAPES.length),
            color:     PALETTE[Math.floor(Math.random() * PALETTE.length)],
            alpha:     0.50 + Math.random() * 0.38,
            frame:     0,
        };
    }

    const petals = Array.from({ length: PETAL_COUNT }, () => spawnPetal(true));

    let active = true;
    let rafId  = null;

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const W = canvas.width, H = canvas.height;

        for (let i = 0; i < petals.length; i++) {
            const p = petals[i];
            p.frame++;
            p.y   += p.speed;
            p.x   += Math.sin(p.frame * p.swayFreq + p.swayPhase) * p.swayAmp * 0.025;
            p.rot  += p.rotSpeed;
            p.tilt += p.tiltSpeed;

            drawPetal(p);

            if (p.y > H + 35 || p.x < -60 || p.x > W + 60) {
                petals[i] = spawnPetal(false);
            }
        }

        if (active) rafId = requestAnimationFrame(loop);
    }

    loop();

    // Pausar fuera de pantalla
    const heroEl = document.querySelector('.hero');
    if (heroEl && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !active) {
                active = true;
                loop();
            } else if (!entry.isIntersecting) {
                active = false;
                if (rafId) cancelAnimationFrame(rafId);
            }
        }, { threshold: 0.05 }).observe(heroEl);
    }
})();

// =============================================
// PARTÍCULAS SUAVES — SECCIÓN DETALLES (fondo crema rosado)
// Copos/destellos rosa y dorado muy suaves, más pequeños y lentos
// =============================================
(function initDetailsParticles() {
    const canvas = document.getElementById('detailsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const el = document.querySelector('.details-section');
        if (!el) return;
        canvas.width  = el.offsetWidth;
        canvas.height = el.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 55;

    // 🎨 Partículas en tonos rosa, mauve y dorado muy suaves — armónicas con el fondo crema
    const COLORS = [
        'rgba(190, 120, 140, ',   // rosa mauve
        'rgba(201, 169, 110, ',   // dorado suave
        'rgba(220, 150, 170, ',   // rosa palo
        'rgba(180, 110, 130, ',   // mauve oscuro
        'rgba(232, 195, 170, ',   // melocotón
        'rgba(210, 160, 180, ',   // rosa grisáceo
    ];

    function spawnP(scattered) {
        return {
            x:         Math.random() * canvas.width,
            y:         scattered ? Math.random() * canvas.height : canvas.height + 10,
            vy:        -(0.06 + Math.random() * 0.14),   // muy lento
            vx:        (Math.random() - 0.5) * 0.08,
            size:      1 + Math.random() * 3.5,
            type:      Math.random() > 0.55 ? 'circle' : 'cross',
            color:     COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha:     0.15 + Math.random() * 0.35,
            alphaDir:  Math.random() > 0.5 ? 1 : -1,
            alphaSpd:  0.003 + Math.random() * 0.005,
            alphaMin:  0.05,
            alphaMax:  0.45,
            rot:       Math.random() * Math.PI * 2,
            rotSpd:    (Math.random() - 0.5) * 0.008,
        };
    }

    const particles = Array.from({ length: COUNT }, () => spawnP(true));
    let active = true, rafId = null;

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y   += p.vy;
            p.x   += p.vx;
            p.rot += p.rotSpd;
            p.alpha += p.alphaSpd * p.alphaDir;
            if (p.alpha >= p.alphaMax) { p.alpha = p.alphaMax; p.alphaDir = -1; }
            if (p.alpha <= p.alphaMin) { p.alpha = p.alphaMin; p.alphaDir =  1; }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);

            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.shadowColor = p.color + p.alpha + ')';
                ctx.shadowBlur  = p.size * 4;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                const arm = p.size * 2;
                ctx.strokeStyle = p.color + p.alpha + ')';
                ctx.shadowColor = p.color + (p.alpha * 0.6) + ')';
                ctx.shadowBlur  = p.size * 3;
                ctx.lineWidth   = 0.7;
                ctx.lineCap     = 'round';
                ctx.beginPath();
                ctx.moveTo(0, -arm); ctx.lineTo(0, arm);
                ctx.moveTo(-arm * 0.5, 0); ctx.lineTo(arm * 0.5, 0);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.restore();

            if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
                particles[i] = spawnP(false);
            }
        }
        if (active) rafId = requestAnimationFrame(loop);
    }
    loop();

    const el = document.querySelector('.details-section');
    if (el && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !active) { active = true; loop(); }
            else if (!entry.isIntersecting) { active = false; if (rafId) cancelAnimationFrame(rafId); }
        }, { threshold: 0.05 }).observe(el);
    }
})();

// =============================================
// PARTÍCULAS MUY SUAVES — SECCIÓN RSVP (fondo crema principal)
// Flores y puntos casi invisibles — barely-there, muy elegante
// =============================================
(function initRsvpParticles() {
    const canvas = document.getElementById('rsvpCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const el = document.querySelector('.final-rsvp');
        if (!el) return;
        canvas.width  = el.offsetWidth;
        canvas.height = el.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 40;

    // 🎨 Tonos muy suaves casi transparentes sobre crema
    const COLORS = [
        'rgba(158, 90, 106, ',    // rose gold primario
        'rgba(201, 169, 110, ',   // dorado
        'rgba(200, 140, 155, ',   // rosa medio
        'rgba(180, 130, 100, ',   // dorado rosado
    ];

    function spawnP(scattered) {
        return {
            x:         Math.random() * canvas.width,
            y:         scattered ? Math.random() * canvas.height : canvas.height + 10,
            vy:        -(0.05 + Math.random() * 0.1),
            vx:        (Math.random() - 0.5) * 0.07,
            size:      0.8 + Math.random() * 2.8,
            type:      Math.random() > 0.6 ? 'circle' : 'petal',
            color:     COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha:     0.08 + Math.random() * 0.18,  // muy suaves
            alphaDir:  Math.random() > 0.5 ? 1 : -1,
            alphaSpd:  0.002 + Math.random() * 0.004,
            alphaMin:  0.03,
            alphaMax:  0.25,
            rot:       Math.random() * Math.PI * 2,
            rotSpd:    (Math.random() - 0.5) * 0.006,
        };
    }

    const particles = Array.from({ length: COUNT }, () => spawnP(true));
    let active = true, rafId = null;

    function drawPetal(ctx, size, color, alpha) {
        const w = size * 0.5, h = size;
        ctx.beginPath();
        ctx.moveTo(0, -h/2);
        ctx.bezierCurveTo( w*0.9, -h*0.3,  w*0.8,  h*0.35, 0,  h/2);
        ctx.bezierCurveTo(-w*0.8,  h*0.35, -w*0.9, -h*0.3, 0, -h/2);
        ctx.closePath();
        ctx.fillStyle = color + alpha + ')';
        ctx.shadowColor = color + (alpha * 0.5) + ')';
        ctx.shadowBlur  = size * 5;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y   += p.vy;
            p.x   += p.vx;
            p.rot += p.rotSpd;
            p.alpha += p.alphaSpd * p.alphaDir;
            if (p.alpha >= p.alphaMax) { p.alpha = p.alphaMax; p.alphaDir = -1; }
            if (p.alpha <= p.alphaMin) { p.alpha = p.alphaMin; p.alphaDir =  1; }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);

            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.shadowColor = p.color + p.alpha + ')';
                ctx.shadowBlur  = p.size * 5;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                drawPetal(ctx, p.size * 2.5, p.color, p.alpha);
            }
            ctx.restore();

            if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
                particles[i] = spawnP(false);
            }
        }
        if (active) rafId = requestAnimationFrame(loop);
    }
    loop();

    const el = document.querySelector('.final-rsvp');
    if (el && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !active) { active = true; loop(); }
            else if (!entry.isIntersecting) { active = false; if (rafId) cancelAnimationFrame(rafId); }
        }, { threshold: 0.05 }).observe(el);
    }
})();


// =============================================
// CUENTA REGRESIVA
// 🗓️ CAMBIAR FECHA: Modifica el año, mes, día y hora del evento
//    Formato: new Date(AÑO, MES-1, DÍA, HORA, MINUTOS, SEGUNDOS)
//    Los meses van de 0 (enero) a 11 (diciembre)
//    Ejemplo: 19 de diciembre de 2026 a las 12:00 = new Date(2026, 11, 19, 12, 0, 0)
// =============================================
const eventDate = new Date(2026, 11, 19, 12, 0, 0).getTime();

const updateTimer = setInterval(() => {
    const now  = new Date().getTime();
    const diff = eventDate - now;

    if (diff <= 0) {
        clearInterval(updateTimer);
        document.getElementById('timer').innerHTML =
            "<h3 style='font-family:var(--font-serif);font-style:italic;color:var(--color-primary);font-size:2rem;'>¡Hoy es el gran día! 🎉</h3>";
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('days').innerText    = d < 10 ? '0' + d : d;
    document.getElementById('hours').innerText   = h < 10 ? '0' + h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;

}, 1000);

// =============================================
// MODAL: Abrir y cerrar la ventana de confirmación
// =============================================
const modal = document.getElementById('rsvpModal');

function openModal() {
    modal.classList.add('show-modal');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('show-modal');
    document.body.style.overflow = '';
}

window.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// =============================================
// ENVÍO DEL FORMULARIO A WHATSAPP
// 📱 CAMBIAR NÚMERO: Reemplaza el número de teléfono con el tuyo
//    Formato: código de país + número (sin +, sin espacios, sin guiones)
//    Ejemplo México: 521 + 55 + número = "5215512345678"
// =============================================
function sendToWhatsapp(e) {
    e.preventDefault();

    const name  = document.getElementById('guestName').value.trim();
    const count = document.getElementById('guestCount').value;

    // 📱 CAMBIAR NÚMERO DE WHATSAPP AQUÍ:
    const phoneNumber = "525559781006";

    // 🎨 CAMBIAR MENSAJE: Personaliza el texto del WhatsApp
    const message =
`¡Hola! Soy *${name}* y confirmo mi asistencia a los XV Años de Maria Inés. 🌸

👥 Número de invitados: *${count} persona${count > 1 ? 's' : ''}*

¡Muchas gracias por la invitación!`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    closeModal();

    document.getElementById('rsvpForm').reset();
}