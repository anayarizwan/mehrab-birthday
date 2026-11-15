/* =============================================================== *
 * MEHRAB'S LITTLE UNIVERSE - main.js                              *
 * ----------------------------------------------------------------*
 * The conductor. Wires up:                                        *
 *   - Loading overlay                                              *
 *   - Mobile navigation + active-link tracking                    *
 *   - Smooth scroll for nav anchors + back-to-top                 *
 *   - Reveal-on-scroll (IntersectionObserver)                     *
 *   - Hero stars / butterflies                                    *
 *   - Birthday cake interaction + confetti                        *
 *   - Friendship timeline rendering                                *
 *   - 10 reasons flip cards                                       *
 *   - Funny section rendering                                     *
 *   - Letter envelope open + typing animation                     *
 *   - Final surprise gift box + fireworks + message reveal        *
 *   - Background music player (play/pause/volume)                *
 *                                                                *
 * No external libraries required (Lucide is loaded in <head>).    *
 * =============================================================== */

(function () {
  'use strict';

  const MU = window.MehrabUniverse = window.MehrabUniverse || {};
  const C = window.MEHRAB_CONTENT || {};

  /* Helpers --------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));

  /* Re-initialise Lucide icons after injecting markup */
  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  /* ============================================================ *
   * 1. Loading overlay
   * ============================================================ */
  function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    // Small delay so the bar animation can complete gracefully
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
    }, 1700);
  }

  /* ============================================================ *
   * 2. Navigation
   * ============================================================ */
  function initNav() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!nav) return;

    // Toggle mobile menu
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        nav.classList.toggle('menu-open', open);
      });
      // Close on link click
      $$('.nav-link', navLinks).forEach(a => {
        a.addEventListener('click', () => {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          nav.classList.remove('menu-open');
        });
      });
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          nav.classList.remove('menu-open');
        }
      });
    }

    // Shrink nav on scroll
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Active link tracking via IntersectionObserver
    const links = $$('.nav-link[href^="#"]');
    const sections = links
      .map(l => document.getElementById(l.getAttribute('href').slice(1)))
      .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(l => {
              l.classList.toggle('active', l.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(s => observer.observe(s));
    }

    // Smooth scroll for in-page anchors
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.getElementById(targetId.slice(1));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================ *
   * 3. Back to top
   * ============================================================ */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const onScroll = () => {
      if (window.scrollY > 600) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================ *
   * 4. Reveal on scroll
   * ============================================================ */
  function initReveal() {
    const reveals = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('is-visible'));
      return;
    }
    // A positive bottom rootMargin means elements that are below the
    // visible area (up to 250px) are pre-revealed as the user scrolls
    // toward them. This keeps the staggered reveal effect while
    // preventing sections from looking "empty" before the user
    // scrolls a tiny bit more.
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          o.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 250px 0px' });
    reveals.forEach(el => obs.observe(el));

    // For sections whose children are revealed individually (timeline,
    // reasons, funny, memories), reveal the whole group when the
    // section scrolls into view so the user always sees content -
    // not a half-empty region.
    const groupSections = ['#story', '#reasons', '#funny', '#memories', '#surprise'];
    groupSections.forEach(sel => {
      const sec = document.querySelector(sel);
      if (!sec) return;
      const go = new IntersectionObserver((entries, o2) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            // Reveal every .reveal child inside this section.
            $$('.reveal', e.target).forEach((el, i) => {
              // small stagger
              setTimeout(() => el.classList.add('is-visible'), Math.min(i * 80, 600));
            });
            o2.unobserve(e.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
      go.observe(sec);
    });
  }

  /* ============================================================ *
   * 5. Hero - stars + butterflies + gift hint
   * ============================================================ */
  function initHero() {
    if (MU.spawnHeroStars) MU.spawnHeroStars(60);
    if (MU.spawnButterflies) MU.spawnButterflies(4);

    const heroGift = document.getElementById('heroGift');
    if (heroGift) {
      const go = () => {
        const target = document.getElementById('cake');
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      };
      heroGift.addEventListener('click', go);
      heroGift.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    }
  }

  /* ============================================================ *
   * 6. Birthday cake
   * ============================================================ */
  function initCake() {
    const candles = $$('.candle');
    const wishBtn = document.getElementById('wishBtn');
    const msg = document.getElementById('cakeMsg');

    // Tap an individual candle to blow it out
    candles.forEach(c => {
      c.addEventListener('click', () => {
        c.classList.toggle('out');
        checkAllOut();
      });
    });

    function allOut() {
      return candles.length > 0 && candles.every(c => c.classList.contains('out'));
    }
    function checkAllOut() {
      if (allOut() && msg && !msg.classList.contains('show')) {
        celebrate();
      }
    }

    function celebrate() {
      // Show wish message
      if (msg) {
        msg.textContent = C.cakeMessage || 'Make a wish, beautiful!';
        msg.classList.add('show');
      }
      // Confetti + hearts
      if (MU.launchConfetti) MU.launchConfetti(120);
      if (MU.burstAt) {
        const rect = (wishBtn || candles[0]).getBoundingClientRect();
        MU.burstAt(rect.left + rect.width / 2, rect.top);
      }
    }

    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        // Blow out all candles + trigger celebration
        candles.forEach((c, i) => {
          setTimeout(() => c.classList.add('out'), i * 120);
        });
        setTimeout(checkAllOut, candles.length * 120 + 100);
      });
    }

    // Allow re-lighting for replayability
    function relight() {
      candles.forEach(c => c.classList.remove('out'));
      if (msg) msg.classList.remove('show');
    }
    // Long-press on the wish button to relight (hidden easter egg)
    if (wishBtn) {
      let pressTimer;
      wishBtn.addEventListener('mousedown', () => {
        pressTimer = setTimeout(relight, 800);
      });
      wishBtn.addEventListener('mouseup', () => clearTimeout(pressTimer));
      wishBtn.addEventListener('mouseleave', () => clearTimeout(pressTimer));
      wishBtn.addEventListener('touchstart', () => {
        pressTimer = setTimeout(relight, 800);
      }, { passive: true });
      wishBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
  }

  /* ============================================================ *
   * 7. Timeline
   * ============================================================ */
  function renderTimeline() {
    const host = document.getElementById('timeline');
    if (!host || !C.timeline) return;
    host.innerHTML = '';
    host.className = 'memory-story-grid';

    const icons = ['sparkles', 'graduation-cap', 'message-circle-heart', 'heart-handshake', 'infinity'];

    C.timeline.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'memory-story-card reveal';
      card.style.transitionDelay = (idx * 0.08) + 's';
      const icon = icons[idx % icons.length];

      card.innerHTML = `
        <div class="memory-story-top">
          <span class="memory-story-number">0${idx + 1}</span>
          <span class="memory-story-icon"><i data-lucide="${icon}"></i></span>
        </div>
        <p class="memory-story-date">${escapeHtml(item.date)}</p>
        <h3 class="memory-story-title">${escapeHtml(item.title)}</h3>
        <p class="memory-story-description">${escapeHtml(item.desc)}</p>
        <span class="memory-story-heart">♥</span>
      `;
      host.appendChild(card);
    });
    if (window.lucide) window.lucide.createIcons();
  }

  /* ============================================================ *
   * 8. Reasons (flip cards)
   * ============================================================ */
  function renderReasons() {
    const host = document.getElementById('reasonsGrid');
    if (!host || !C.reasons) return;
    host.innerHTML = '';
    C.reasons.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'reason-card reveal';
      card.style.transitionDelay = (idx * 0.04) + 's';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Reason ${r.front}: tap to reveal`);
      card.innerHTML = `
        <div class="rc-inner">
          <div class="rc-front">
            <span class="rc-front-num">${escapeHtml(r.front)}</span>
            <span class="rc-front-icon"><i data-lucide="${escapeHtml(r.icon || 'sparkles')}"></i></span>
            <span class="rc-front-hint">tap to reveal</span>
          </div>
          <div class="rc-back">
            <p class="rc-back-text">${escapeHtml(r.text)}</p>
          </div>
        </div>
      `;
      const toggle = () => card.classList.toggle('flipped');
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
      host.appendChild(card);
    });
    refreshIcons();
  }

  /* ============================================================ *
   * 9. Funny section
   * ============================================================ */
  function renderFunny() {
    const host = document.getElementById('funnyGrid');
    if (!host || !C.funny) return;
    host.innerHTML = '';
    C.funny.forEach((f, idx) => {
      const card = document.createElement('div');
      card.className = 'funny-card reveal';
      card.style.transitionDelay = (idx * 0.07) + 's';
      card.innerHTML = `
        <span class="funny-sticker">${escapeHtml(f.sticker || 'SHHH')}</span>
        <div class="funny-emoji">${f.emoji || '😂'}</div>
        <p class="funny-text">${escapeHtml(f.text)}</p>
      `;
      host.appendChild(card);
    });
  }

  /* ============================================================ *
   * 10. Letter (envelope open + typing)
   * ============================================================ */
  function initLetter() {
    const envelope = document.getElementById('letterEnvelope');
    const paper = document.getElementById('letterPaper');
    const closeBtn = document.getElementById('letterClose');
    const greetingEl = document.getElementById('letterGreeting');
    const bodyEl = document.getElementById('letterBody');
    const sigEl = document.getElementById('letterSignature');
    if (!envelope || !C.letter) return;

    let typed = false;     // only type once per session

    function openLetter() {
      if (envelope.classList.contains('opening')) return;
      envelope.classList.add('opening');
      paper.classList.add('open');
      paper.setAttribute('aria-hidden', 'false');
      // After the fade-out, hide the envelope so the paper takes over
      // the layout space and grows naturally with its content.
      setTimeout(() => envelope.classList.add('hidden'), 500);
      // Confetti puff when the letter opens
      if (MU.launchConfetti) {
        const rect = envelope.getBoundingClientRect();
        MU.launchConfetti(60, { fromX: rect.left + rect.width / 2, unit: 'px' });
      }
      if (!typed) {
        typed = true;
        typeLetter();
      }
      // Scroll the letter into view so the user can read it from the top
      setTimeout(() => {
        if (paper.scrollIntoView) paper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600);
    }

    function closeLetter() {
      paper.classList.remove('open');
      paper.setAttribute('aria-hidden', 'true');
      envelope.classList.remove('opening', 'hidden');
      typed = false;  // allow re-typing on next open
      bodyEl.innerHTML = '';
    }

    envelope.addEventListener('click', openLetter);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLetter(); }
    });
    if (closeBtn) closeBtn.addEventListener('click', closeLetter);

    function typeLetter() {
      const L = C.letter;
      greetingEl.textContent = L.greeting || '';
      sigEl.textContent = '';
      bodyEl.innerHTML = '';

      const paragraphs = L.paragraphs || [];
      let pIndex = 0;

      function typeNextParagraph() {
        if (pIndex >= paragraphs.length) {
          // Type the signature. If the user is still reading the
          // letter (it's in their viewport), gently scroll the
          // signature into view so they don't miss the closing.
          typeInto(sigEl, L.signature || '', 12, () => {
            setTimeout(() => {
              const r = paper.getBoundingClientRect();
              const inView = r.top < window.innerHeight * 0.6 && r.bottom > 0;
              if (inView && sigEl.scrollIntoView) {
                sigEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          });
          return;
        }
        const p = document.createElement('p');
        p.className = 'typing';
        const caret = document.createElement('span');
        caret.className = 'caret';
        p.appendChild(caret);
        bodyEl.appendChild(p);
        typeInto(p, paragraphs[pIndex], 5, () => {
          p.classList.remove('typing');
          if (caret.parentNode) caret.remove();
          pIndex++;
          setTimeout(typeNextParagraph, 100);
        }, caret);
      }
      typeNextParagraph();
    }

    /**
     * Type text into an element char by char.
     * `caretEl` (optional) is moved to the end as we type so the
     * blinking caret stays at the cursor position.
     */
    function typeInto(el, text, speed, done, caretEl) {
      let i = 0;
      function step() {
        if (i >= text.length) { if (done) done(); return; }
        const ch = text[i];
        const node = document.createTextNode(ch);
        if (caretEl && caretEl.parentNode === el) {
          el.insertBefore(node, caretEl);
        } else {
          el.appendChild(node);
        }
        i++;
        const delay = (ch === '.' || ch === '!' || ch === '?') ? speed * 2
                    : (ch === ',') ? speed * 1.4
                    : speed;
        setTimeout(step, delay + Math.random() * 10);
      }
      step();
    }
  }

  /* ============================================================ *
   * 11. Final surprise
   * ============================================================ */
  function initSurprise() {
    const gift = document.getElementById('finalGift');
    const message = document.getElementById('finalMessage');
    const textEl = document.getElementById('finalMessageText');
    const replayBtn = document.getElementById('replayBtn');
    if (!gift) return;

    let opened = false;

    function openSurprise() {
      if (opened) return;
      opened = true;
      gift.classList.add('opened');

      // Fireworks + confetti + hearts
      if (MU.launchFireworks) MU.launchFireworks(8);
      if (MU.launchConfetti) MU.launchConfetti(160);
      const rect = gift.getBoundingClientRect();
      if (MU.pulseHearts) {
        MU.pulseHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
      }

      // Reveal the message
      setTimeout(() => {
        if (textEl && C.finalMessage) {
          textEl.textContent = C.finalMessage;
        }
        if (message) {
          message.classList.add('show');
          message.setAttribute('aria-hidden', 'false');
          // Scroll the message into view so the user can read it
          setTimeout(() => {
            message.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 800);
        }
      }, 600);
    }

    gift.addEventListener('click', openSurprise);
    gift.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSurprise(); }
    });

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        opened = false;
        gift.classList.remove('opened');
        if (message) {
          message.classList.remove('show');
          message.setAttribute('aria-hidden', 'true');
        }
        if (MU.launchConfetti) MU.launchConfetti(40);
        // Re-arm after a brief pause
        setTimeout(openSurprise, 700);
      });
    }
  }

  /* ============================================================ *
   * 12. Music player
   * ============================================================ */
  function initMusic() {
    const player = document.getElementById('musicPlayer');
    const btn = document.getElementById('musicToggle');
    const volume = document.getElementById('musicVolume');
    const title = document.getElementById('musicTitle');
    const audio = document.getElementById('birthdayAudio');
    if (!player || !btn || !audio) return;

    audio.loop = true;
    audio.volume = volume ? Number(volume.value) / 100 : 0.6;

    function setPlaying(state) {
      btn.classList.toggle('playing', state);
      btn.setAttribute('aria-label', state ? 'Pause birthday song' : 'Play birthday song');
      btn.innerHTML = state ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
      if (title) title.textContent = state ? 'Happy Birthday to You · vocal version' : 'Tap to play Happy Birthday';
      player.classList.toggle('is-playing', state);
      refreshIcons();
    }

    async function startMusic() {
      try {
        await audio.play();
        setPlaying(true);
      } catch (error) {
        setPlaying(false);
        if (title) title.textContent = 'Tap the music button to play the song';
        console.warn('Birthday song could not start:', error);
      }
    }

    function stopMusic() {
      audio.pause();
      setPlaying(false);
    }

    btn.addEventListener('click', () => {
      if (audio.paused) startMusic();
      else stopMusic();
    });

    // Start only after an intentional click/tap; browsers block reliable autoplay.
    ['openSurpriseBtn', 'heroGift'].forEach(id => {
      const trigger = document.getElementById(id);
      if (trigger) trigger.addEventListener('click', startMusic, { once: true });
    });

    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('ended', () => {
      if (!audio.loop) setPlaying(false);
    });

    if (volume) {
      volume.addEventListener('input', () => {
        audio.volume = Number(volume.value) / 100;
      });
    }
  }

  /* ============================================================ *
   * Util: escape HTML for safety when injecting content strings
   * ============================================================ */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ============================================================ *
   * Boot
   * ============================================================ */
  MU.init = function () {
    refreshIcons();
    initNav();
    initBackToTop();
    initHero();
    initCake();
    renderTimeline();
    renderReasons();
    renderFunny();
    initLetter();
    initSurprise();
    initMusic();
    initReveal();
    hideLoader();
    // Re-render icons after we injected any [data-lucide] elements
    refreshIcons();
  };

  // If the DOM is already loaded, init immediately
  if (document.readyState !== 'loading') {
    MU.init();
  } else {
    document.addEventListener('DOMContentLoaded', MU.init);
  }
})();
