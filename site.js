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
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
}

document.addEventListener('DOMContentLoaded', () => {
  initQuestCanvas();

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
