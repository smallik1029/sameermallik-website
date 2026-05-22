// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mobileNavLinks = document.getElementById('mobileNavLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    mobileNavLinks.classList.toggle('open');
    document.getElementById('mobileNav').classList.toggle('open');
  });
  mobileNavLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNavLinks.classList.remove('open');
      document.getElementById('mobileNav').classList.remove('open');
    });
  });
}

// Highlight active left-nav item based on scroll position
const sections = document.querySelectorAll('.r-section[id]');
const navItems = document.querySelectorAll('.left-nav-item');

function highlightNav() {
  const windowHeight = window.innerHeight;
  const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
  const threshold = atBottom ? windowHeight : windowHeight * 0.45;

  let activeId = null;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < threshold) activeId = section.getAttribute('id');
  });

  navItems.forEach(a => a.classList.remove('active'));
  if (activeId) {
    const active = document.querySelector(`.left-nav-item[data-section="${activeId}"]`);
    if (active) active.classList.add('active');
  }
}

window.addEventListener('scroll', highlightNav);
highlightNav();


// Canvas mesh grid
(function () {
  const canvas = document.getElementById('meshCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CELL          = 25;    // grid spacing in px
  const WAVE_AMP      = 20;    // how much points drift
  const WAVE_SPEED    = 0.001;
  const MOUSE_RADIUS  = 200;   // px radius of cursor influence
  const MOUSE_FORCE   = 90;    // how far points get pushed
  const BASE_ALPHA    = 0.15;  // line opacity at rest
  const GLOW_ALPHA    = 0.6;   // line opacity near cursor

  let W, H, cols, rows, pts;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.ceil(W / CELL) + 2;
    rows = Math.ceil(H / CELL) + 2;
    pts = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        pts.push({ ox: c * CELL, oy: r * CELL, x: 0, y: 0, r, c });
  }

  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 0.7;

    // Update each point position
    for (const p of pts) {
      const wX = Math.sin(t * WAVE_SPEED + p.r * 0.55 + p.c * 0.38) * WAVE_AMP;
      const wY = Math.cos(t * WAVE_SPEED + p.c * 0.48 + p.r * 0.32) * WAVE_AMP;
      const dx = p.ox + wX - mouse.x;
      const dy = p.oy + wY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let px = 0, py = 0;
      if (dist < MOUSE_RADIUS && dist > 0) {
        const f = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
        px = (dx / dist) * f;
        py = (dy / dist) * f;
      }
      p.x = p.ox + wX + px;
      p.y = p.oy + wY + py;
    }

    // Draw lines, brightening near cursor
    for (const p of pts) {
      if (p.c < cols - 1) drawLine(p, pts[p.r * cols + p.c + 1]);
      if (p.r < rows - 1) drawLine(p, pts[(p.r + 1) * cols + p.c]);
    }

    requestAnimationFrame(tick);
  }

  function drawLine(a, b) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const d  = Math.hypot(mx - mouse.x, my - mouse.y);
    const glow = d < MOUSE_RADIUS ? (1 - d / MOUSE_RADIUS) : 0;
    ctx.strokeStyle = `rgba(192,57,43,${BASE_ALPHA + glow * (GLOW_ALPHA - BASE_ALPHA)})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  resize();
  requestAnimationFrame(tick);
})();

