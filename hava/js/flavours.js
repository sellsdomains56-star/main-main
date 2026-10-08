/* Flavours page: one big can on a dark stage, lit in the flavour's colour. Drag to turn it,
   pick a flavour below, or use the arrows and arrow keys. */
(() => {
  const { FLAVOURS, drawCan, fit, geometry, onReady } = window.HAVA_CANS;
  const { t, reduceMotion } = window.HAVA;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const stage = document.getElementById('flavours');
  const canvas = document.getElementById('fl-canvas');
  const picks = [...document.querySelectorAll('.fl-pick')];
  const nameEl = document.getElementById('fl-name');
  const svEl = document.getElementById('fl-sv');
  const descEl = document.getElementById('fl-desc');
  const ghost = document.getElementById('fl-ghost');

  let selected = 0, shown = 0, rot = -0.4, vel = 0, dragging = false, lastX = 0, lastT = 0, idleUntil = 0, spin = null;
  let view = null, visible = true, raf = 0, last = 0;

  const box = () => ({ y: 0, w: view.w, h: view.h });

  function draw() {
    if (!view) return;
    view.ctx.clearRect(0, 0, view.w, view.h);
    const b = box();
    view.ctx.save();
    view.ctx.translate(0, b.y);
    drawCan(view.ctx, b.w, b.h, shown, rot, { clear: false });
    view.ctx.restore();
  }
  function drawThumbs() {
    picks.forEach((btn, i) => {
      const f = fit(btn.querySelector('canvas'));
      drawCan(f.ctx, f.w, f.h, i, 0, { shadow: 'rgba(0, 0, 0, .4)' });
    });
  }

  function renderText() {
    const fl = FLAVOURS[selected];
    nameEl.dataset.i18n = `fl.${fl.key}`;
    descEl.dataset.i18n = `fl.${fl.key}.p`;
    nameEl.textContent = t(nameEl.dataset.i18n);
    descEl.textContent = t(descEl.dataset.i18n);
    svEl.textContent = fl.svName;
    svEl.hidden = window.HAVA.lang === 'sv';
    ghost.textContent = fl.sv;
    stage.style.setProperty('--fl-glow', fl.glow);
    stage.style.setProperty('--fl-text', fl.light);
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging) {
      if (spin) {
        const p = clamp((now - spin.start) / spin.dur, 0, 1);
        rot = spin.from + (1 - Math.pow(1 - p, 3)) * Math.PI * 2 * spin.dir;
        if (p >= 0.5) shown = selected;
        if (p >= 1) spin = null;
      } else {
        rot += vel * dt;
        vel *= Math.pow(0.04, dt);
        if (!reduceMotion && now > idleUntil) rot += 0.3 * dt;
      }
    }
    draw();
    if (visible && (dragging || spin || Math.abs(vel) > 0.02 || !reduceMotion)) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function select(i, dir = 1) {
    i = (i + FLAVOURS.length) % FLAVOURS.length;
    if (i === selected) return;
    selected = i;
    picks.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    renderText();
    if (reduceMotion) shown = i;
    else spin = { start: performance.now(), dur: 900, from: rot, dir };
    kick();
  }
  picks.forEach((b, i) => b.addEventListener('click', () => select(i, i > selected ? 1 : -1)));
  document.querySelectorAll('.fl-arrow').forEach(b => b.addEventListener('click', () => {
    const step = Number(b.dataset.step);
    select(selected + step, step);
  }));
  document.addEventListener('keydown', e => {
    if (!visible || e.target.closest('input, textarea, select')) return;
    const rtl = document.documentElement.dir === 'rtl' ? -1 : 1;
    if (e.key === 'ArrowRight') select(selected + rtl, rtl);
    if (e.key === 'ArrowLeft') select(selected - rtl, -rtl);
  });

  canvas.addEventListener('pointerdown', e => {
    dragging = true; spin = null; shown = selected; vel = 0;
    lastX = e.clientX; lastT = performance.now();
    canvas.setPointerCapture(e.pointerId);
    kick();
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging || !view) return;
    const now = performance.now();
    const R = geometry(box().w, box().h).R;
    const dx = e.clientX - lastX;
    rot -= dx / R;
    vel = (-dx / R) / Math.max(0.008, (now - lastT) / 1000);
    lastX = e.clientX; lastT = now;
    kick();
  });
  const release = () => { if (!dragging) return; dragging = false; idleUntil = performance.now() + 2500; kick(); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  const resize = () => { view = fit(canvas); drawThumbs(); draw(); };
  let timer = 0;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(resize, 120); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) kick(); }).observe(stage);
  }
  window.HAVA.onLang(renderText);
  resize();
  renderText();
  onReady(() => { drawThumbs(); draw(); kick(); });
})();
