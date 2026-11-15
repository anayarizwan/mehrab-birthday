/* =============================================================== *
 * MEHRAB'S LITTLE UNIVERSE - animations.js                        *
 * ----------------------------------------------------------------*
 * Pure-ES6 particle / effects engine. Uses a single canvas for     *
 * fireworks + global particles, plus DOM-based confetti and       *
 * butterflies for the pretty stuff. No external libraries.        *
 *                                                                  *
 * Exposed on window.MehrabUniverse:                                *
 *   spawnHearts(container, count)  - login floating hearts          *
 *   spawnButterflies(count)       - hero butterflies               *
 *   launchConfetti(count, opts)   - confetti burst                 *
 *   launchFireworks(n)            - canvas fireworks               *
 *   pulseHearts()                 - quick heart burst (reused)     *
 * =============================================================== */

(function () {
  'use strict';

  const MU = window.MehrabUniverse = window.MehrabUniverse || {};

  /* ---------------------------------------------------------- *
   * Floating hearts (DOM)
   * ---------------------------------------------------------- */
  const HEART_EMOJIS = ['💗', '💕', '💖', '💝', '❤️', '✨', '⭐'];

  MU.spawnHearts = function (container, count) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'float-heart-item';
      h.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      h.style.left = (Math.random() * 100) + 'vw';
      h.style.fontSize = (Math.random() * 14 + 12) + 'px';
      h.style.animationDelay = (Math.random() * 14) + 's';
      h.style.animationDuration = (Math.random() * 8 + 12) + 's';
      container.appendChild(h);
    }
  };

  /* ---------------------------------------------------------- *
   * Butterflies (DOM) in the hero
   * ---------------------------------------------------------- */
  MU.spawnButterflies = function (count) {
    const host = document.getElementById('butterflies');
    if (!host) return;
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'butterfly';
      b.style.setProperty('--bf-delay', (i * 3) + 's');
      b.style.setProperty('--bf-dur', (Math.random() * 6 + 16) + 's');
      b.style.top = (Math.random() * 60 + 20) + '%';
      b.innerHTML = '<div class="wing left"></div><div class="body"></div><div class="wing right"></div>';
      host.appendChild(b);
    }
  };

  /* ---------------------------------------------------------- *
   * Confetti (DOM) - lightweight, falls with rotation
   * ---------------------------------------------------------- */
  const CONFETTI_COLORS = ['#FFB6D5', '#A78BFA', '#FFD9A8', '#D8B4FE', '#FF8FB8', '#6D28D9', '#FCE4EC'];

  MU.launchConfetti = function (count, opts) {
    count = count || 80;
    opts = opts || {};
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const left = opts.fromX != null
        ? opts.fromX + (Math.random() - 0.5) * 200
        : Math.random() * 100;
      piece.style.left = left + (opts.unit || 'vw');
      piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      piece.style.width = (Math.random() * 6 + 6) + 'px';
      piece.style.height = (Math.random() * 8 + 10) + 'px';
      piece.style.setProperty('--cd-dur', (Math.random() * 2 + 2.5) + 's');
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      piece.style.opacity = (Math.random() * 0.5 + 0.5).toString();
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 5000);
    }
  };

  /* Quick hearts burst from a screen position */
  MU.pulseHearts = function (x, y, count) {
    count = count || 14;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('div');
      h.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      h.style.cssText = [
        'position:fixed',
        'z-index:1400',
        'pointer-events:none',
        'left:' + x + 'px',
        'top:' + y + 'px',
        'font-size:' + (Math.random() * 14 + 14) + 'px',
        'transition:transform 1.4s cubic-bezier(.22,1,.36,1), opacity 1.4s',
        'opacity:1'
      ].join(';');
      document.body.appendChild(h);
      const angle = (i / count) * Math.PI * 2;
      const dist = Math.random() * 100 + 80;
      requestAnimationFrame(() => {
        h.style.transform =
          'translate(' + Math.cos(angle) * dist + 'px,' + Math.sin(angle) * dist + 'px) scale(0.4)';
        h.style.opacity = '0';
      });
      setTimeout(() => h.remove(), 1500);
    }
  };

  /* ---------------------------------------------------------- *
   * Fireworks on canvas
   * ---------------------------------------------------------- */
  const canvas = document.getElementById('fxCanvas');
  let ctx = null, particles = [], rafId = null, lastBurstTime = 0;

  function ensureCanvas() {
    if (!canvas) canvas = document.getElementById('fxCanvas');
    if (!canvas) return false;
    if (!ctx) ctx = canvas.getContext('2d');
    resizeCanvas();
    return true;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class FwParticle {
    constructor(x, y, vx, vy, color, size) {
      this.x = x; this.y = y;
      this.vx = vx; this.vy = vy;
      this.color = color;
      this.size = Math.max(1, size || 2.5);
      this.life = 1;            // 0..1
      this.decay = Math.random() * 0.012 + 0.008;
      this.gravity = 0.03;
      this.friction = 0.985;
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 6) this.trail.shift();
      this.vx *= this.friction;
      this.vy = this.vy * this.friction + this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }
    draw(c) {
      const alpha = Math.max(0, this.life);
      // Trail
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const a = alpha * (i / this.trail.length) * 0.5;
        c.beginPath();
        c.fillStyle = this.color;
        c.globalAlpha = a;
        c.arc(t.x, t.y, this.size * (i / this.trail.length), 0, Math.PI * 2);
        c.fill();
      }
      // Head
      c.beginPath();
      c.fillStyle = this.color;
      c.globalAlpha = alpha;
      c.shadowColor = this.color;
      c.shadowBlur = 12;
      c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
      c.globalAlpha = 1;
    }
  }

  function spawnFirework(x, y) {
    const colors = [
      '#FFB6D5', '#A78BFA', '#FFD9A8', '#FF8FB8',
      '#D8B4FE', '#FFE066', '#FFFFFF'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 50 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2) * (i / count);
      const speed = Math.random() * 4 + 2.5;
      particles.push(new FwParticle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        Math.random() * 2 + 1.5
      ));
    }
  }

  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.life <= 0) particles.splice(i, 1);
    }
    if (particles.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  MU.launchFireworks = function (rounds) {
    if (!ensureCanvas()) return;
    rounds = rounds || 6;
    let i = 0;
    const next = () => {
      if (i >= rounds) return;
      const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
      const y = Math.random() * window.innerHeight * 0.5 + 80;
      spawnFirework(x, y);
      // Sometimes a second burst at the same time
      if (Math.random() > 0.6) {
        spawnFirework(
          Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
          Math.random() * window.innerHeight * 0.5 + 80
        );
      }
      if (!rafId) tick();
      i++;
      setTimeout(next, 700 + Math.random() * 500);
    };
    next();
  };

  // One-shot burst at a specific point (used by cake + gift)
  MU.burstAt = function (x, y) {
    if (!ensureCanvas()) return;
    spawnFirework(x, y);
    if (!rafId) tick();
  };

  /* Resize handler (debounced) */
  let rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resizeCanvas, 150);
  });

  /* ---------------------------------------------------------- *
   * Hero stars (DOM twinkles)
   * ---------------------------------------------------------- */
  MU.spawnHeroStars = function (count) {
    const host = document.getElementById('heroStars');
    if (!host) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      const size = Math.random() * 2 + 1;
      s.style.width = s.style.height = size + 'px';
      s.style.animationDelay = (Math.random() * 3) + 's';
      s.style.animationDuration = (Math.random() * 3 + 2) + 's';
      host.appendChild(s);
    }
  };
})();
