/**
 * PERSONA 3 RELOAD x SOUL HACKERS 2 - TACTICAL INTERFACE ENGINE
 * Operator: Fierza Luthfi Avjadistia
 * Architecture: Web Audio Synth, Hexagonal Radar Canvas, Particle HUD, Dynamic Filter
 */

(function () {
  'use strict';

  // ==========================================
  // 1. WEB AUDIO API SYNTHESIZER (ATLUS SOUND FX)
  // ==========================================
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);

      if (type === 'hover') {
        // High subtle digital tick
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.025);
      } else if (type === 'click') {
        // P3R Command Select snap
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'confirm') {
        // Two-tone Persona confirm chime
        [0, 0.05].forEach((offset, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          const freq = idx === 0 ? 587.33 : 880; // D5 -> A5
          osc.frequency.setValueAtTime(freq, now + offset);

          gain.gain.setValueAtTime(0.15, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + offset);
          osc.stop(now + offset + 0.14);
        });
      } else if (type === 'switch') {
        // Soul Hackers 2 Tab slide whoosh
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  }

  // Audio Toggle UI
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      audioToggleBtn.innerHTML = audioEnabled 
        ? '<span>SFX: [ON]</span>' 
        : '<span style="opacity:0.6;">SFX: [MUTED]</span>';
      if (audioEnabled) playSound('confirm');
    });
  }

  // Attach sounds to all buttons and links
  function attachSoundTriggers() {
    const interactiveElements = document.querySelectorAll('a, button, .nav-item, .tab-btn, .skill-chip-pill, .tactical-badge, .course-tag');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => playSound('hover'));
      el.addEventListener('click', () => {
        if (el.classList.contains('btn-tactical-primary') || el.classList.contains('comm-link-btn')) {
          playSound('confirm');
        } else if (el.classList.contains('tab-btn')) {
          playSound('switch');
        } else {
          playSound('click');
        }
      });
    });
  }

  // ==========================================
  // 2. SOUL HACKERS 2 HEXAGONAL RADAR CANVAS
  // ==========================================
  const radarData = [
    { label: 'DB & ARCHIVES', val: 0.95, display: '95%' },
    { label: 'HW & NETWORK', val: 0.92, display: '92%' },
    { label: 'WEB AUTOMATION', val: 0.90, display: '90%' },
    { label: 'PROCUREMENT', val: 0.88, display: '88%' },
    { label: 'ADVANCED EXCEL', val: 0.96, display: '96%' },
    { label: 'MULTIMEDIA', val: 0.86, display: '86%' }
  ];

  function drawRadarChart() {
    const canvas = document.getElementById('skillsRadarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Handle high DPI display
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 360;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;
    const sides = radarData.length;
    const angleStep = (Math.PI * 2) / sides;

    ctx.clearRect(0, 0, size, size);

    // 1. Draw Concentric Hexagonal Grids (20%, 40%, 60%, 80%, 100%)
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach(lvl => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * lvl);
        const y = centerY + Math.sin(angle) * (radius * lvl);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = lvl === 1.0 ? '#ffffff' : 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = lvl === 1.0 ? 1.5 : 1;
      if (lvl === 0.5 || lvl === 0.75) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 2. Draw Radial Axis Spokes
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis Cross Marker
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y - 2, 4, 4);

      // Label positioning
      const labelDist = radius + 24;
      const lx = centerX + Math.cos(angle) * labelDist;
      const ly = centerY + Math.sin(angle) * labelDist;

      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(radarData[i].label, lx, ly - 6);
      ctx.font = '800 11px "Oswald", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText(radarData[i].display, lx, ly + 8);
    }

    // 3. Draw Data Polygon
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * radarData[i].val;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Data Fill & Stroke
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Data Vertex Highlight Points
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * radarData[i].val;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#060709';
      ctx.stroke();
    }
  }

  // ==========================================
  // 3. BACKGROUND CYBER CANVAS (DRIFTING DATA)
  // ==========================================
  function initCyberBackground() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      drawRadarChart();
    });

    const particles = [];
    const numParticles = 40;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 4 + 2,
        type: Math.floor(Math.random() * 3), // 0: diamond, 1: cross, 2: hex
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    function renderBg() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
        ctx.lineWidth = 1;

        if (p.type === 0) {
          // Diamond
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.closePath();
          ctx.stroke();
        } else if (p.type === 1) {
          // Plus / Cross
          ctx.beginPath();
          ctx.moveTo(p.x - p.size, p.y);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.stroke();
        } else {
          // Small square
          ctx.strokeRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      });

      requestAnimationFrame(renderBg);
    }
    renderBg();
  }

  // ==========================================
  // 4. REAL-TIME CLOCK & MOON PHASE
  // ==========================================
  function updateHUDClock() {
    const clockEl = document.getElementById('hudClock');
    const moonPhaseEl = document.getElementById('moonPhaseText');
    if (!clockEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${mins}:${secs}`;

    // Persona Dark Hour status
    if (moonPhaseEl) {
      if (hours === '00' || hours === '24') {
        moonPhaseEl.innerHTML = '<span style="color:#fff;font-weight:900;">DARK HOUR ACTIVE</span>';
      } else {
        moonPhaseEl.textContent = 'PHASE: STABLE';
      }
    }
  }

  // ==========================================
  // 5. EXPERIENCE FILTERING SYSTEM
  // ==========================================
  function initExperienceFilters() {
    const filterBtns = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.experience-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat.includes(category)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInCard 0.3s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================
  // 6. SCROLL SPY & KEYBOARD SHORTCUTS
  // ==========================================
  function initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.tactical-nav .nav-item');
    const HUD_OFFSET = 56;

    // Smooth scroll for all hash links with HUD offset
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - HUD_OFFSET;
            window.scrollTo({
              top: targetPos,
              behavior: 'smooth'
            });
            history.pushState(null, null, `#${targetId}`);
            playSound('click');
          }
        }
      });
    });

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPos = window.scrollY + 180;

      sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top + window.pageYOffset;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = sec.getAttribute('id');
        }
      });

      if (current) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
          }
        });
      }
    });

    // Keyboard Shortcuts (1-7 jump to section)
    const keyMap = {
      '1': 'dossier',
      '2': 'experience',
      '3': 'skills',
      '4': 'education',
      '5': 'organization',
      '6': 'certifications',
      '7': 'contact'
    };

    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (keyMap[e.key]) {
        const targetId = keyMap[e.key];
        const targetSec = document.getElementById(targetId);
        if (targetSec) {
          e.preventDefault();
          const targetPos = targetSec.getBoundingClientRect().top + window.pageYOffset - HUD_OFFSET;
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
          history.pushState(null, null, `#${targetId}`);
          playSound('confirm');
          showToast(`NAV: ${e.key.toUpperCase()} // ${targetId.toUpperCase()}`);
        }
      }
    });
  }

  // ==========================================
  // 7. TOAST NOTIFICATION & CLIPBOARD COPY
  // ==========================================
  function showToast(message) {
    let toast = document.getElementById('tacticalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tacticalToast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function initCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-trigger');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            playSound('confirm');
            showToast(`[SYSTEM] COPIED: ${textToCopy}`);
          }).catch(() => {
            showToast('FAILED TO COPY');
          });
        }
      });
    });
  }

  // ==========================================
  // 8. PRINT / PDF EXPORT HANDLER
  // ==========================================
  const printBtn = document.getElementById('printCvBtn');
  if (printBtn) {
    printBtn.addEventListener('click', e => {
      e.preventDefault();
      playSound('confirm');
      window.print();
    });
  }

  // ==========================================
  // INITIALIZATION ON DOM READY
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    initCyberBackground();
    drawRadarChart();
    updateHUDClock();
    setInterval(updateHUDClock, 1000);
    initExperienceFilters();
    initNavigation();
    initCopyButtons();
    attachSoundTriggers();

    console.log('%c[S.E.E.S. x AION INITIALIZED]', 'background:#000;color:#fff;font-weight:bold;font-size:14px;padding:4px;');
    console.log('Operator: Fierza Luthfi Avjadistia | Systems Online.');
  });
})();

