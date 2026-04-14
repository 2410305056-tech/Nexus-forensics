/* ============================================
   NEXUS FORENSICS — UPGRADED JavaScript
   All Animations, Graphs, Effects & Interactions
   ============================================ */

// ─────────────────────────────────────────────
// PRELOADER WITH PERCENTAGE
// ─────────────────────────────────────────────
let preloaderProgress = 0;
const preloaderFill = document.querySelector('.preloader-bar-fill');
const preloaderPercent = document.querySelector('.preloader-percent');

const preloaderInterval = setInterval(() => {
    preloaderProgress += Math.random() * 8 + 2;
    if (preloaderProgress > 100) preloaderProgress = 100;
    if (preloaderFill) preloaderFill.style.width = preloaderProgress + '%';
    if (preloaderPercent) preloaderPercent.textContent = Math.floor(preloaderProgress) + '%';
    if (preloaderProgress >= 100) clearInterval(preloaderInterval);
}, 120);

window.addEventListener('load', () => {
    setTimeout(() => {
        if (preloaderFill) preloaderFill.style.width = '100%';
        if (preloaderPercent) preloaderPercent.textContent = '100%';
        setTimeout(() => {
            document.getElementById('preloader').classList.add('hidden');
            initRevealAnimations();
            animateCounters();
            startTerminalTyping();
            document.querySelector('.threat-ticker').classList.add('visible');
        }, 400);
    }, 1800);
});

// ─────────────────────────────────────────────
// MATRIX RAIN
// ─────────────────────────────────────────────
const matrixCanvas = document.getElementById('matrix-rain');
const matrixCtx = matrixCanvas.getContext('2d');

function resizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
}
resizeMatrix();

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
const matrixFontSize = 14;
let matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize);
let matrixDrops = Array(matrixColumns).fill(1);

function drawMatrix() {
    matrixCtx.fillStyle = 'rgba(5, 5, 10, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    matrixCtx.fillStyle = '#00ff88';
    matrixCtx.font = matrixFontSize + 'px monospace';

    for (let i = 0; i < matrixDrops.length; i++) {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize);
        if (matrixDrops[i] * matrixFontSize > matrixCanvas.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i]++;
    }
}

setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    resizeMatrix();
    matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize);
    matrixDrops = Array(matrixColumns).fill(1);
});

// ─────────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────────
const particleCanvas = document.getElementById('particle-canvas');
const pCtx = particleCanvas.getContext('2d');
let particles = [];
let mousePos = { x: -1000, y: -1000 };

function resizeParticles() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
resizeParticles();
window.addEventListener('resize', resizeParticles);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
            const force = (180 - dist) / 180;
            this.x -= dx * force * 0.008;
            this.y -= dy * force * 0.008;
        }
        if (this.x < 0 || this.x > particleCanvas.width || this.y < 0 || this.y > particleCanvas.height) this.reset();
    }
    draw() {
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
        pCtx.fill();
    }
}

for (let i = 0; i < 90; i++) particles.push(new Particle());

function drawParticleConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
                pCtx.beginPath();
                pCtx.moveTo(particles[i].x, particles[i].y);
                pCtx.lineTo(particles[j].x, particles[j].y);
                pCtx.strokeStyle = `rgba(0, 255, 136, ${(1 - dist / 130) * 0.12})`;
                pCtx.lineWidth = 0.5;
                pCtx.stroke();
            }
        }
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawParticleConnections();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ─────────────────────────────────────────────
// CURSOR TRAIL
// ─────────────────────────────────────────────
const trailCanvas = document.getElementById('cursor-trail');
const tCtx = trailCanvas.getContext('2d');
let trailPoints = [];

function resizeTrail() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
}
resizeTrail();
window.addEventListener('resize', resizeTrail);

document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    // Cursor glow
    const glow = document.getElementById('cursor-glow');
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';

    // Trail points
    trailPoints.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (trailPoints.length > 40) trailPoints.shift();
});

document.addEventListener('mouseleave', () => {
    document.getElementById('cursor-glow').style.opacity = '0';
});

function drawTrail() {
    tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = 0; i < trailPoints.length; i++) {
        const p = trailPoints[i];
        p.life -= 0.03;
        if (p.life <= 0) { trailPoints.splice(i, 1); i--; continue; }
        tCtx.beginPath();
        tCtx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2);
        tCtx.fillStyle = `rgba(0, 255, 136, ${p.life * 0.3})`;
        tCtx.fill();
    }
    requestAnimationFrame(drawTrail);
}
drawTrail();

// ─────────────────────────────────────────────
// LIVE THREAT TICKER
// ─────────────────────────────────────────────
const threats = [
    { text: '⚠ CVE-2025-4821 — Critical RCE in Apache Struts detected', level: 'critical' },
    { text: '▲ Ransomware variant "BlackSerpent" targeting healthcare sector', level: 'critical' },
    { text: '● DDoS attack mitigated — 1.2 Tbps — Origin: Eastern Europe', level: 'high' },
    { text: '● Credential dump detected — 4.2M records — Dark web marketplace', level: 'high' },
    { text: '◆ Supply chain compromise — NPM package "event-stream-x" flagged', level: 'critical' },
    { text: '● Zero-day exploit kit active — Targeting Chrome V8 engine', level: 'critical' },
    { text: '▲ Phishing campaign — Spoofing major banking institutions', level: 'high' },
    { text: '◆ APT-41 infrastructure identified — C2 servers: 14 active nodes', level: 'critical' },
    { text: '● Crypto mining malware spread via Docker Hub images', level: 'medium' },
    { text: '▲ Insider threat detected — Unauthorized data exfiltration attempt', level: 'high' },
    { text: '● IoT botnet "Mirai-X" scanning for vulnerable devices', level: 'medium' },
    { text: '⚠ CISA Alert: Active exploitation of Fortinet VPN vulnerability', level: 'critical' },
];

function populateTicker() {
    const tickerContent = document.getElementById('ticker-content');
    let html = '';
    const doubledThreats = [...threats, ...threats];
    doubledThreats.forEach(t => {
        html += `<span class="threat-${t.level}">${t.text}</span>`;
    });
    tickerContent.innerHTML = html;
}
populateTicker();

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
const nav = document.getElementById('main-nav');
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-link');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);

    const sections = document.querySelectorAll('.section');
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
    });

    // Back to top
    document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 600);

    // Timeline fill
    updateTimelineFill();
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Back to top
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─────────────────────────────────────────────
// REVEAL ANIMATIONS
// ─────────────────────────────────────────────
function initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .stat-box').forEach(el => {
        observer.observe(el);
    });
}

// ─────────────────────────────────────────────
// COUNTER ANIMATION
// ─────────────────────────────────────────────
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                const target = parseFloat(entry.target.dataset.count);
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();
                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const val = target * ease;
                    entry.target.textContent = isDecimal ? val.toFixed(1) : Math.floor(val).toLocaleString();
                    if (progress < 1) requestAnimationFrame(update);
                }
                requestAnimationFrame(update);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

// ─────────────────────────────────────────────
// TERMINAL TYPEWRITER
// ─────────────────────────────────────────────
function startTerminalTyping() {
    const lines = [
        { type: 'prompt', text: 'root@nexus:~# scan --target disk_image_001.E01' },
        { type: 'comment', text: '// Initializing forensic scan engine...' },
        { type: 'success', text: '[OK] Engine loaded: Nexus ForensicSuite v4.2.1' },
        { type: 'comment', text: '// Analyzing file signatures...' },
        { type: 'value', text: '[FOUND] 2,847 recoverable artifacts detected' },
        { type: 'value', text: '[FOUND] 142 deleted files reconstructed' },
        { type: 'success', text: '[MATCH] SHA-256 hash verified — integrity confirmed' },
        { type: 'prompt', text: 'root@nexus:~# trace --network --depth 5' },
        { type: 'value', text: '[TRACE] 14 unique endpoints identified' },
        { type: 'value', text: '[TRACE] 3 C2 servers located — GeoIP: RU, CN, IR' },
        { type: 'warning', text: '[ALERT] Suspicious exfiltration pattern detected' },
        { type: 'warning', text: '[ALERT] 2.4GB transferred to unknown endpoint' },
        { type: 'prompt', text: 'root@nexus:~# report --generate --format pdf' },
        { type: 'success', text: '[OK] Forensic report generated — 247 pages' },
        { type: 'success', text: '[OK] Chain of custody documented' },
        { type: 'success', text: '[COMPLETE] Case NX-2025-0132 analysis finalized' },
    ];

    const terminalBody = document.getElementById('terminal-body');
    if (!terminalBody) return;
    terminalBody.innerHTML = '';

    let lineIndex = 0;

    function typeLine() {
        if (lineIndex >= lines.length) {
            lineIndex = 0;
            terminalBody.innerHTML = '';
        }

        const line = lines[lineIndex];
        const div = document.createElement('div');
        div.classList.add('t-line');

        let className = 't-cmd';
        if (line.type === 'comment') className = 't-comment';
        if (line.type === 'success') className = 't-success';
        if (line.type === 'value') className = 't-value';
        if (line.type === 'warning') className = 't-warning';
        if (line.type === 'error') className = 't-error';

        div.innerHTML = `<span class="${className}"></span>`;
        terminalBody.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        const span = div.querySelector('span');
        let charIndex = 0;

        function typeChar() {
            if (charIndex < line.text.length) {
                span.textContent += line.text[charIndex];
                charIndex++;
                terminalBody.scrollTop = terminalBody.scrollHeight;
                setTimeout(typeChar, line.type === 'prompt' ? 30 : 15);
            } else {
                lineIndex++;
                setTimeout(typeLine, line.type === 'prompt' ? 800 : 300);
            }
        }
        typeChar();
    }

    setTimeout(typeLine, 1000);
}

// ─────────────────────────────────────────────
// TIMELINE FILL ON SCROLL
// ─────────────────────────────────────────────
function updateTimelineFill() {
    const timelineSection = document.getElementById('timeline');
    const fill = document.getElementById('timeline-fill');
    if (!timelineSection || !fill) return;

    const rect = timelineSection.getBoundingClientRect();
    const sectionH = timelineSection.offsetHeight;
    const viewH = window.innerHeight;

    if (rect.top < viewH && rect.bottom > 0) {
        const progress = Math.min(Math.max((viewH - rect.top) / (sectionH + viewH), 0), 1);
        fill.style.height = (progress * 100) + '%';
    }
}

// ─────────────────────────────────────────────
// CASE FILTERS
// ─────────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const caseCards = document.querySelectorAll('.case-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        caseCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.classList.remove('filtered-out');
                card.style.animation = 'fadeInUp 0.4s ease forwards';
            } else {
                card.classList.add('filtered-out');
            }
        });
    });
});

// Fade in animation for filter
const filterStyle = document.createElement('style');
filterStyle.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(filterStyle);

// ─────────────────────────────────────────────
// TESTIMONIALS CAROUSEL
// ─────────────────────────────────────────────
const track = document.getElementById('testimonial-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsContainer = document.getElementById('carousel-dots');
let currentSlide = 0;
let totalSlides = 0;

if (track) {
    totalSlides = track.children.length;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    function goToSlide(n) {
        currentSlide = n;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        document.querySelectorAll('.carousel-dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentSlide);
        });
    }

    prevBtn.addEventListener('click', () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides));
    nextBtn.addEventListener('click', () => goToSlide((currentSlide + 1) % totalSlides));

    // Auto-advance
    setInterval(() => goToSlide((currentSlide + 1) % totalSlides), 6000);
}

// ─────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

        if (!isOpen) item.classList.add('open');
    });
});

// ─────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const btnText = btn.querySelector('.btn-text');
        const original = btnText.textContent;

        btnText.textContent = 'ENCRYPTING...';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            btnText.textContent = 'TRANSMITTING...';
            setTimeout(() => {
                btnText.textContent = '✓ TRANSMISSION COMPLETE';
                btn.style.background = 'rgba(0, 255, 136, 0.15)';
                btn.style.color = '#00ff88';
                btn.style.border = '1px solid rgba(0, 255, 136, 0.3)';

                setTimeout(() => {
                    btnText.textContent = original;
                    btn.style.pointerEvents = '';
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.border = '';
                    contactForm.reset();
                }, 3000);
            }, 1000);
        }, 800);
    });
}

// ─────────────────────────────────────────────
// CHART UTILS
// ─────────────────────────────────────────────
const C = {
    accent: '#00ff88', accentDim: 'rgba(0,255,136,0.3)', accentGlow: 'rgba(0,255,136,0.1)',
    secondary: '#00d4ff', danger: '#ff3366', warning: '#ffaa00', purple: '#8866ff',
    text: '#8888a0', grid: 'rgba(255,255,255,0.04)', bg: '#0e0e1a'
};

function getScale(el) {
    const dpr = window.devicePixelRatio || 1;
    const rect = el.getBoundingClientRect();
    el.width = rect.width * dpr;
    el.height = rect.height * dpr;
    const ctx = el.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
}

// ─── LINE CHART ───
function drawLineChart() {
    const el = document.getElementById('chart-line');
    if (!el) return;
    const { ctx, w, h } = getScale(el);
    const pad = { top: 20, right: 30, bottom: 40, left: 50 };
    const cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const resolved = [45,52,48,61,55,67,72,69,78,85,82,93];
    const active = [12,15,18,14,20,22,19,25,21,18,23,20];
    const maxVal = 105;

    let progress = 0;
    function animate() {
        progress += 0.018;
        if (progress > 1) progress = 1;
        ctx.clearRect(0, 0, w, h);

        // Grid + labels
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + (cH / 5) * i;
            ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
            ctx.fillStyle = C.text; ctx.font = '10px "Share Tech Mono"'; ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), pad.left - 8, y + 4);
        }
        months.forEach((m, i) => {
            ctx.fillStyle = C.text; ctx.font = '10px "Share Tech Mono"'; ctx.textAlign = 'center';
            ctx.fillText(m, pad.left + (cW / 11) * i, h - pad.bottom + 18);
        });

        function line(data, color, glow) {
            const pts = Math.floor(data.length * progress);
            // Area
            ctx.beginPath(); ctx.moveTo(pad.left, pad.top + cH);
            for (let i = 0; i <= pts && i < data.length; i++) {
                ctx.lineTo(pad.left + (cW / 11) * i, pad.top + cH - (data[i] / maxVal) * cH);
            }
            const lastX = pad.left + (cW / 11) * Math.min(pts, data.length - 1);
            ctx.lineTo(lastX, pad.top + cH); ctx.closePath();
            const gr = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
            gr.addColorStop(0, glow); gr.addColorStop(1, 'transparent');
            ctx.fillStyle = gr; ctx.fill();
            // Line
            ctx.beginPath();
            for (let i = 0; i <= pts && i < data.length; i++) {
                const x = pad.left + (cW / 11) * i, y = pad.top + cH - (data[i] / maxVal) * cH;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = color; ctx.lineWidth = 2;
            ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
            // Dots
            for (let i = 0; i <= pts && i < data.length; i++) {
                const x = pad.left + (cW / 11) * i, y = pad.top + cH - (data[i] / maxVal) * cH;
                ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
            }
        }

        line(resolved, C.accent, C.accentGlow);
        line(active, C.secondary, 'rgba(0,212,255,0.05)');
        if (progress < 1) requestAnimationFrame(animate);
    }
    animate();
}

// ─── DONUT CHART ───
function drawDonutChart() {
    const el = document.getElementById('chart-donut');
    if (!el) return;
    const { ctx, w, h } = getScale(el);
    const data = [
        { label: 'Cybercrime', value: 35, color: '#00ff88' },
        { label: 'Fraud', value: 25, color: '#00d4ff' },
        { label: 'Espionage', value: 18, color: '#ff3366' },
        { label: 'Ransomware', value: 15, color: '#ffaa00' },
        { label: 'Other', value: 7, color: '#8866ff' }
    ];
    const cx = w / 2, cy = h / 2 - 10;
    const outerR = Math.min(w, h) * 0.35, innerR = outerR * 0.6;
    const total = data.reduce((s, d) => s + d.value, 0);

    let ap = 0;
    function animate() {
        ap += 0.02; if (ap > 1) ap = 1;
        ctx.clearRect(0, 0, w, h);
        let start = -Math.PI / 2;
        const target = ap * Math.PI * 2;

        data.forEach((item) => {
            const slice = (item.value / total) * Math.PI * 2;
            const end = Math.min(start + slice, -Math.PI / 2 + target);
            if (start < -Math.PI / 2 + target) {
                ctx.beginPath();
                ctx.arc(cx, cy, outerR, start, end);
                ctx.arc(cx, cy, innerR, end, start, true);
                ctx.closePath();
                ctx.fillStyle = item.color;
                ctx.shadowColor = item.color; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;

                if (ap >= 1) {
                    const mid = start + slice / 2;
                    const lR = outerR + 22;
                    ctx.fillStyle = C.text; ctx.font = '10px "Share Tech Mono"';
                    ctx.textAlign = mid > Math.PI / 2 || mid < -Math.PI / 2 ? 'right' : 'left';
                    ctx.fillText(`${item.label} ${item.value}%`, cx + Math.cos(mid) * lR, cy + Math.sin(mid) * lR);
                }
            }
            start += slice;
        });

        ctx.fillStyle = '#e8e8f0'; ctx.font = 'bold 26px "Orbitron"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(total * ap), cx, cy - 6);
        ctx.fillStyle = C.text; ctx.font = '9px "Share Tech Mono"';
        ctx.fillText('TOTAL CASES', cx, cy + 16);
        if (ap < 1) requestAnimationFrame(animate);
    }
    animate();
}

// ─── BAR CHART ───
function drawBarChart() {
    const el = document.getElementById('chart-bar');
    if (!el) return;
    const { ctx, w, h } = getScale(el);
    const pad = { top: 20, right: 20, bottom: 40, left: 40 };
    const cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
    const data = [
        { label: 'Jan', value: 23 }, { label: 'Feb', value: 31 },
        { label: 'Mar', value: 28 }, { label: 'Apr', value: 45 },
        { label: 'May', value: 38 }, { label: 'Jun', value: 52 },
        { label: 'Jul', value: 47 }, { label: 'Aug', value: 56 }
    ];
    const maxVal = 66;
    const barW = cW / data.length * 0.6;

    let ap = 0;
    function animate() {
        ap += 0.025; if (ap > 1) ap = 1;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (cH / 4) * i;
            ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
            ctx.fillStyle = C.text; ctx.font = '10px "Share Tech Mono"'; ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 8, y + 4);
        }
        data.forEach((item, i) => {
            const x = pad.left + (cW / data.length) * i + (cW / data.length * 0.4) / 2;
            const barH = (item.value / maxVal) * cH * ap;
            const y = pad.top + cH - barH;
            const gr = ctx.createLinearGradient(0, y, 0, pad.top + cH);
            gr.addColorStop(0, C.accent); gr.addColorStop(1, 'rgba(0,255,136,0.15)');
            ctx.fillStyle = gr; ctx.shadowColor = C.accent; ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = C.text; ctx.font = '10px "Share Tech Mono"'; ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barW / 2, h - pad.bottom + 16);
            if (ap >= 0.9) { ctx.fillStyle = C.accent; ctx.font = '10px "Orbitron"'; ctx.fillText(item.value, x + barW / 2, y - 8); }
        });
        if (ap < 1) requestAnimationFrame(animate);
    }
    animate();
}

// ─── RADAR CHART ───
function drawRadarChart() {
    const el = document.getElementById('chart-radar');
    if (!el) return;
    const { ctx, w, h } = getScale(el);
    const labels = ['Malware','Phishing','Ransomware','DDoS','Insider','Zero-day'];
    const data = [85, 72, 68, 55, 78, 62];
    const cx = w / 2, cy = h / 2, radius = Math.min(w, h) * 0.35;
    const sides = labels.length;

    let ap = 0;
    function animate() {
        ap += 0.02; if (ap > 1) ap = 1;
        ctx.clearRect(0, 0, w, h);
        for (let ring = 1; ring <= 5; ring++) {
            const r = (radius / 5) * ring;
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const method = i === 0 ? 'moveTo' : 'lineTo';
                ctx[method](cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            }
            ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5; ctx.stroke();
        }
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5; ctx.stroke();
            ctx.fillStyle = C.text; ctx.font = '10px "Share Tech Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(labels[i], cx + Math.cos(angle) * (radius + 20), cy + Math.sin(angle) * (radius + 20));
        }
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const idx = i % sides;
            const angle = (Math.PI * 2 / sides) * idx - Math.PI / 2;
            const r = (data[idx] / 100) * radius * ap;
            const method = i === 0 ? 'moveTo' : 'lineTo';
            ctx[method](cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gr.addColorStop(0, 'rgba(0,255,136,0.12)'); gr.addColorStop(1, 'rgba(0,255,136,0.02)');
        ctx.fillStyle = gr; ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.shadowColor = C.accent; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
            const r = (data[i] / 100) * radius * ap;
            ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 4, 0, Math.PI * 2);
            ctx.fillStyle = C.accent; ctx.fill();
        }
        if (ap < 1) requestAnimationFrame(animate);
    }
    animate();
}

// ─── THREAT GLOBE ───
function drawThreatGlobe() {
    const el = document.getElementById('threat-globe');
    if (!el) return;
    const { ctx, w, h } = getScale(el);
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.38;

    let rotation = 0;

    const threatPoints = [];
    for (let i = 0; i < 30; i++) {
        threatPoints.push({
            lat: (Math.random() - 0.5) * Math.PI,
            lon: Math.random() * Math.PI * 2,
            size: Math.random() * 3 + 2,
            pulse: Math.random() * Math.PI * 2,
            color: ['#ff3366', '#ffaa00', '#00ff88'][Math.floor(Math.random() * 3)]
        });
    }

    const connections = [];
    for (let i = 0; i < 12; i++) {
        connections.push({
            from: Math.floor(Math.random() * threatPoints.length),
            to: Math.floor(Math.random() * threatPoints.length),
        });
    }

    function animate() {
        rotation += 0.005;
        ctx.clearRect(0, 0, w, h);

        // Globe outline
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Globe fill
        const gr = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
        gr.addColorStop(0, 'rgba(0, 255, 136, 0.03)');
        gr.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = gr;
        ctx.fill();

        // Latitude lines
        for (let i = -3; i <= 3; i++) {
            const latY = cy + (radius * i / 4);
            const latR = Math.sqrt(Math.max(0, radius * radius - (latY - cy) * (latY - cy)));
            ctx.beginPath();
            ctx.ellipse(cx, latY, latR, latR * 0.15, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Longitude lines
        for (let i = 0; i < 6; i++) {
            const angle = rotation + (Math.PI / 6) * i;
            ctx.beginPath();
            ctx.ellipse(cx, cy, Math.abs(Math.cos(angle)) * radius, radius, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Threat connections
        connections.forEach(conn => {
            const from = threatPoints[conn.from];
            const to = threatPoints[conn.to];
            const fx = cx + Math.cos(from.lat) * Math.cos(from.lon + rotation) * radius;
            const fy = cy + Math.sin(from.lat) * radius;
            const tx = cx + Math.cos(to.lat) * Math.cos(to.lon + rotation) * radius;
            const ty = cy + Math.sin(to.lat) * radius;

            const fVisible = Math.cos(from.lon + rotation) > -0.2;
            const tVisible = Math.cos(to.lon + rotation) > -0.2;

            if (fVisible && tVisible) {
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                const midX = (fx + tx) / 2, midY = (fy + ty) / 2 - 30;
                ctx.quadraticCurveTo(midX, midY, tx, ty);
                ctx.strokeStyle = 'rgba(255, 51, 102, 0.15)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        });

        // Threat points
        threatPoints.forEach(pt => {
            const x = cx + Math.cos(pt.lat) * Math.cos(pt.lon + rotation) * radius;
            const y = cy + Math.sin(pt.lat) * radius;
            const visible = Math.cos(pt.lon + rotation) > -0.2;
            const depth = (Math.cos(pt.lon + rotation) + 0.2) / 1.2;

            if (visible) {
                pt.pulse += 0.05;
                const pulseSize = pt.size + Math.sin(pt.pulse) * 1.5;

                // Glow
                ctx.beginPath();
                ctx.arc(x, y, pulseSize * 3, 0, Math.PI * 2);
                ctx.fillStyle = pt.color.replace(')', ', 0.08)').replace('rgb', 'rgba');
                ctx.fill();

                // Point
                ctx.beginPath();
                ctx.arc(x, y, pulseSize * depth, 0, Math.PI * 2);
                ctx.fillStyle = pt.color;
                ctx.globalAlpha = depth * 0.8;
                ctx.shadowColor = pt.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ─────────────────────────────────────────────
// INITIALIZE CHARTS ON SCROLL
// ─────────────────────────────────────────────
let chartsDrawn = false;
const statsSection = document.getElementById('stats');
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !chartsDrawn) {
            chartsDrawn = true;
            setTimeout(drawLineChart, 100);
            setTimeout(drawDonutChart, 300);
            setTimeout(drawBarChart, 500);
            setTimeout(drawRadarChart, 700);
            setTimeout(drawThreatGlobe, 900);
        }
    });
}, { threshold: 0.15 });
if (statsSection) chartObserver.observe(statsSection);

// Redraw on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (chartsDrawn) {
            drawLineChart(); drawDonutChart(); drawBarChart(); drawRadarChart(); drawThreatGlobe();
        }
    }, 300);
});

// ─────────────────────────────────────────────
// KEYBOARD NAVIGATION
// ─────────────────────────────────────────────
const sectionIds = ['hero','about','services','stats','cases','team','timeline','testimonials','faq','contact'];
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const scrollY = window.scrollY;
        let currentIdx = 0;
        sectionIds.forEach((id, i) => {
            const el = document.getElementById(id);
            if (el && scrollY >= el.offsetTop - 200) currentIdx = i;
        });
        const nextIdx = e.key === 'ArrowDown' ? Math.min(currentIdx + 1, sectionIds.length - 1) : Math.max(currentIdx - 1, 0);
        const target = document.getElementById(sectionIds[nextIdx]);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
});
