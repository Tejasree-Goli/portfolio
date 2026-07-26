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

document.addEventListener('DOMContentLoaded', () => {
  // Inject thief SVG into every mount point
  document.querySelectorAll('.thief-mount').forEach(el => {
    el.innerHTML = THIEF_SVG;
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
