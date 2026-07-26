// ============================================
// Shared site behavior: thief motif, nav, timeline scroll, blog filter
// ============================================

const THIEF_SVG = `
<svg class="thief-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A hooded figure, standing in for a security threat">
  <path d="M50 6 L61 21 L39 21 Z" fill="var(--ink)"/>
  <path d="M50 12 C34 12 24 27 24 42 L24 56 C13 61 8 72 8 88 L8 116 L92 116 L92 88 C92 72 87 61 76 56 L76 42 C76 27 66 12 50 12 Z" fill="var(--ink)"/>
  <circle cx="41" cy="46" r="3.2" fill="var(--amber)"/>
  <circle cx="59" cy="46" r="3.2" fill="var(--amber)"/>
  <circle cx="83" cy="92" r="15" fill="var(--coffee)" stroke="var(--ink)" stroke-width="2.5"/>
  <text x="83" y="97" font-size="15" text-anchor="middle" fill="var(--amber)" font-family="monospace">$</text>
</svg>`;

function initQuestCanvas() {
  const canvas = document.getElementById('quest-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width, height;
  const mouse = { x: null, y: null };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = Math.max(18, Math.min(50, Math.floor(width / 26)));
  const nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
  }));

  let flash = null;
  function scheduleFlash() {
    if (reduceMotion) return;
    setTimeout(() => {
      if (nodes.length) flash = { index: Math.floor(Math.random() * nodes.length), start: performance.now() };
      scheduleFlash();
    }, 2200 + Math.random() * 2400);
  }
  scheduleFlash();

  const stage = canvas.parentElement.closest('.hero') || canvas.parentElement;
  stage.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  stage.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function frame() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 118) {
          ctx.strokeStyle = `rgba(185,120,43,${0.16 * (1 - dist / 118)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.strokeStyle = `rgba(185,120,43,${0.32 * (1 - dist / 150)})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.fillStyle = 'rgba(74,51,36,0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    if (flash) {
      const elapsed = performance.now() - flash.start;
      const dur = 950;
      if (elapsed < dur && nodes[flash.index]) {
        const n = nodes[flash.index];
        const t = elapsed / dur;
        const r = 4 + t * 24;
        ctx.strokeStyle = `rgba(185,120,43,${0.6 * (1 - t)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(185,120,43,${0.9 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        flash = null;
      }
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
}

const LOG_TEMPLATES = [
  'ACCESS_REQUEST node-{n} :: verifying',
  'AUTH_TOKEN validated :: session ok',
  'ANOMALY flagged :: node-{n}',
  'ACCESS_DENIED :: unauthorized attempt',
  'SESSION rotated :: node-{n}',
  'SCAN complete :: 0 breaches',
  'IDENTITY verified :: node-{n}',
  'WATCHING :: perimeter clear',
];
function randomLogLine() {
  const t = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  return t.replace('{n}', String(Math.floor(Math.random() * 90 + 10)).padStart(2, '0'));
}

function initHudConsole() {
  const el = document.getElementById('hud-console');
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lines = [randomLogLine(), randomLogLine(), randomLogLine()];
  const render = () => {
    el.innerHTML = lines.map((l, i) => `<div class="line${i === lines.length - 1 ? ' latest' : ''}">${l}</div>`).join('');
  };
  render();
  if (!reduceMotion) {
    setInterval(() => {
      lines.push(randomLogLine());
      if (lines.length > 4) lines.shift();
      render();
    }, 2200);
  }
}

function initReticle() {
  const el = document.getElementById('quest-reticle');
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const stage = el.parentElement;

  function place() {
    const rect = stage.getBoundingClientRect();
    const x = rect.width * (0.55 + Math.random() * 0.35);
    const y = rect.height * (0.12 + Math.random() * 0.7);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 1100);
    setTimeout(place, 2600 + Math.random() * 2600);
  }
  setTimeout(place, 1800);
}

document.addEventListener('DOMContentLoaded', () => {
  initQuestCanvas();
  initHudConsole();
  initReticle();

  // Inject thief SVG into every mount point (supports a nested .thief-icon target)
  document.querySelectorAll('.thief-mount').forEach(el => {
    const target = el.querySelector('.thief-icon') || el;
    target.innerHTML = THIEF_SVG;
  });

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Timeline thief: moves down the rail as you scroll the About page
  const rail = document.querySelector('.timeline');
  const railThief = document.getElementById('thief-timeline');
  if (rail && railThief) {
    const updateThief = () => {
      const rect = rail.getBoundingClientRect();
      const viewportMid = window.innerHeight * 0.4;
      const progress = Math.min(1, Math.max(0, (viewportMid - rect.top) / rect.height));
      railThief.style.top = `${progress * (rail.offsetHeight - 40)}px`;
    };
    document.addEventListener('scroll', updateThief, { passive: true });
    window.addEventListener('resize', updateThief);
    updateThief();
  }

  // Blog filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const posts = document.querySelectorAll('.post-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      posts.forEach(post => {
        const show = filter === 'all' || post.dataset.tag === filter;
        post.classList.toggle('hidden', !show);
      });
    });
  });
});
