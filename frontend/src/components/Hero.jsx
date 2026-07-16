import { useEffect, useRef } from 'react';
import { useLang } from '../LanguageContext';

export default function Hero() {
  const canvasRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let heartParticles = [];
    let bgParticles = [];
    let phase = 0; // 0 = forming, 1 = held, 2 = destructing
    let phaseTimer = 0;
    const HEART_COUNT = 50;
    const BG_COUNT = 20;
    const CONNECTION_DIST = 60;

    const FORM_DURATION = 40;    // frames to form
    const HOLD_DURATION = 120;   // frames to hold
    const DESTROY_DURATION = 200; // frames to destroy

    function resize() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function heartX(t) { return 16 * Math.pow(Math.sin(t), 3); }
    function heartY(t) { return 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t); }

    function createParticles() {
      heartParticles = [];
      bgParticles = [];

      const cx = canvas.width / 2;
      const cy = canvas.height / 2.4;
      const scale = Math.min(canvas.width, canvas.height) / 38;

      for (let i = 0; i < HEART_COUNT; i++) {
        const t = (i / HEART_COUNT) * Math.PI * 2;
        const baseX = cx + heartX(t) * scale;
        const baseY = cy - heartY(t) * scale;
        heartParticles.push({
          baseX, baseY,
          targetX: baseX, targetY: baseY,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          startX: Math.random() * canvas.width,
          startY: Math.random() * canvas.height,
          exitX: cx + (Math.random() - 0.5) * canvas.width * 0.8,
          exitY: cy + (Math.random() - 0.5) * canvas.height * 0.8,
          progress: 0,
          offsetA: Math.random() * Math.PI * 2,
          offsetR: 2 + Math.random() * 4,
          speed: 0.003 + Math.random() * 0.005,
          r: 1.5 + Math.random() * 1.5,
          delay: Math.random() * 0.3,
        });
      }

      for (let i = 0; i < BG_COUNT; i++) {
        bgParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 1,
        });
      }
    }

    function draw() {
      phaseTimer++;

      // Cycle through phases
      if (phase === 0 && phaseTimer > FORM_DURATION) {
        phase = 1;
        phaseTimer = 0;
      } else if (phase === 1 && phaseTimer > HOLD_DURATION) {
        phase = 2;
        phaseTimer = 0;
      } else if (phase === 2 && phaseTimer > DESTROY_DURATION) {
        phase = 0;
        phaseTimer = 0;
        // Reset particles to random start positions
        for (const p of heartParticles) {
          p.startX = Math.random() * canvas.width;
          p.startY = Math.random() * canvas.height;
          p.exitX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.8;
          p.exitY = canvas.height / 2.4 + (Math.random() - 0.5) * canvas.height * 0.8;
          p.progress = 0;
        }
      }

      for (const p of heartParticles) {
        p.offsetA += p.speed;

        if (phase === 0) {
          // Quick form
          p.progress = Math.min(1, p.progress + 0.04);
          const ease = 1 - Math.pow(1 - p.progress, 3);
          const clamped = Math.max(0, Math.min(1, (ease - p.delay) / (1 - p.delay)));
          const t = Math.max(0, clamped);
          p.x = p.startX + (p.baseX - p.startX) * t;
          p.y = p.startY + (p.baseY - p.startY) * t;
        } else if (phase === 1) {
          // Hold with gentle orbit
          p.x = p.baseX + Math.cos(p.offsetA) * p.offsetR;
          p.y = p.baseY + Math.sin(p.offsetA) * p.offsetR;
        } else {
          // Slow destruct
          p.progress = Math.min(1, p.progress + 0.006);
          const ease = 1 - Math.pow(1 - p.progress, 2);
          p.x = p.baseX + (p.exitX - p.baseX) * ease + Math.cos(p.offsetA) * p.offsetR * (1 - ease);
          p.y = p.baseY + (p.exitY - p.baseY) * ease + Math.sin(p.offsetA) * p.offsetR * (1 - ease);
        }
      }

      for (const p of bgParticles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const allParticles = [...heartParticles, ...bgParticles];

      // Draw connections first
      for (let i = 0; i < allParticles.length; i++) {
        for (let j = i + 1; j < allParticles.length; j++) {
          const p1 = allParticles[i];
          const p2 = allParticles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 206, 8, ${0.2 * (1 - dist / CONNECTION_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw dots on top
      for (const p of allParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 206, 8, 0.6)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    const onResize = () => { resize(); createParticles(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-bg" />
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-line"></div>
        <span className="hero-badge">{t('hero.badge')}</span>
        <h1>CS hub <span>(iCT)</span></h1>
        <p className="hero-tagline">
          {t('hero.tagline')}
        </p>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">500+</span>
            <span className="hero-stat-label">{t('hero.devicesFixed')}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">1,200+</span>
            <span className="hero-stat-label">{t('hero.peopleHelped')}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">98%</span>
            <span className="hero-stat-label">{t('hero.satisfaction')}</span>
          </div>
        </div>

        <div className="hero-btns">
          <a href="#how-it-works" className="btn">{t('hero.howItWorks')}</a>
          <a href="#services" className="btn btn-outline">{t('hero.ourServices')}</a>
        </div>
      </div>
    </section>
  );
}
