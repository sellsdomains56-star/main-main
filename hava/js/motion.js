/* HAVA — the cinematic layer, shared by every page:
   an opening loader where the logo draws itself, a curtain between pages, smooth weighted scrolling,
   a gold cursor, headlines that rise word by word, photos that drift, buttons that lean toward the pointer,
   and a band of giant type that runs with the scroll. Loaded after js/site.js. */
(() => {
  const H = window.HAVA;
  const root = document.documentElement;
  const reduce = H.reduceMotion;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* blocked */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* blocked */ } }
  };
  const ready = () => root.classList.add('is-loaded');

  /* ---------- Smooth scrolling ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.95, anchors: { offset: -72 } });
  }
  H.scrollTo = (y, opts = {}) => {
    if (lenis) lenis.scrollTo(y, { immediate: !!opts.immediate, force: true, duration: opts.duration });
    else window.scrollTo({ top: y, behavior: opts.immediate || reduce ? 'instant' : 'smooth' });
  };
  H.lockScroll = on => {
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  };
  H.velocity = () => (lenis ? lenis.velocity : 0);

  /* ---------- Curtain between pages ---------- */
  document.body.insertAdjacentHTML('beforeend',
    '<div class="curtain" aria-hidden="true"><svg viewBox="0 0 40 40"><use href="#hava-mark"/></svg></div>');
  const curtain = document.body.lastElementChild;
  function openCurtain() {
    curtain.classList.add('covered');
    root.classList.remove('curtain-in');
    session.del('hava-curtain');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.classList.add('reveal');
      ready();
      setTimeout(() => curtain.classList.remove('covered', 'reveal'), 1100);
    }));
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    let url;
    try { url = new URL(a.getAttribute('href'), window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin || !/\.html$/.test(url.pathname)) return;
    if (url.pathname === window.location.pathname) return;
    e.preventDefault();
    session.set('hava-curtain', '1');
    curtain.classList.add('cover');
    setTimeout(() => { window.location.href = url.href; }, reduce ? 0 : 650);
  });
  window.addEventListener('pageshow', e => { if (e.persisted) curtain.classList.remove('cover'); });

  /* ---------- Opening loader: the first page of a visit ---------- */
  const firstVisit = !session.get('hava-seen');
  session.set('hava-seen', '1');
  if (firstVisit && !reduce) {
    root.classList.remove('curtain-in');
    document.body.insertAdjacentHTML('beforeend', `
<div class="loader" aria-hidden="true">
  <div class="lp lp-top"></div><div class="lp lp-bottom"></div>
  <div class="loader-inner">
    <svg viewBox="0 0 264 84"><path class="lm" pathLength="1" d="M4 8V64M44 8V64M4 36H44M70 64L95 8L120 64M140 8L165 64L190 8M210 64L235 8L260 64"/><path class="lr" pathLength="1" d="M4 79H260"/></svg>
    <span class="loader-count">00</span>
  </div>
</div>`);
    const loader = document.body.lastElementChild;
    const count = loader.querySelector('.loader-count');
    H.lockScroll(true);
    root.style.overflow = 'hidden';
    let loaded = document.readyState === 'complete';
    window.addEventListener('load', () => { loaded = true; });
    const start = performance.now();
    let shown = 0;
    const tick = now => {
      const elapsed = now - start;
      const target = loaded ? 1 : Math.min(0.88, elapsed / 2600);
      shown += (target - shown) * 0.07;
      count.textContent = String(Math.min(99, Math.round(shown * 100))).padStart(2, '0');
      if ((shown > 0.985 && elapsed > 1600) || elapsed > 5000) {
        count.textContent = '100';
        loader.classList.add('done');
        setTimeout(() => { ready(); root.style.overflow = ''; H.lockScroll(false); }, 280);
        setTimeout(() => loader.remove(), 1500);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else if (root.classList.contains('curtain-in')) {
    openCurtain();
  } else {
    ready();
  }

  /* ---------- Headlines rise word by word ---------- */
  const SPLIT = '.display, .title, .scene-copy h2, .big-text';
  const watched = new WeakSet();
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.2 })
    : null;
  function split(el) {
    if (el.children.length && !el.dataset.split) return; // has its own markup: leave it alone
    const text = el.textContent;
    el.dataset.split = '1';
    el.textContent = '';
    let i = 0;
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      const w = document.createElement('span');
      const inner = document.createElement('span');
      w.className = 'w';
      inner.className = 'wi';
      inner.style.setProperty('--i', i++);
      inner.textContent = part;
      w.appendChild(inner);
      el.appendChild(w);
    });
  }
  function prepareHeadlines() {
    document.querySelectorAll(SPLIT).forEach(el => {
      split(el);
      if (reduce || watched.has(el)) return;
      watched.add(el);
      el.classList.add('rise');
      if (el.getBoundingClientRect().top < window.innerHeight && el.closest('.page-hero, .contact-page, .chapter')) {
        el.classList.add('rise-intro'); // plays as the page opens
      } else if (io) {
        io.observe(el);
      } else {
        el.classList.add('in');
      }
    });
  }
  H.onLang(prepareHeadlines);

  /* ---------- Photos drift slower than the page ---------- */
  const heroes = [...document.querySelectorAll('.page-hero > img')];
  const frames = [...document.querySelectorAll('.frame img, .fullframe > img')];
  function drift() {
    const vh = window.innerHeight;
    heroes.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom > 0) img.style.translate = `0 ${(Math.max(0, -r.top) * 0.28).toFixed(1)}px`;
    });
    frames.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const c = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.translate = `0 ${(c * -48).toFixed(1)}px`;
    });
  }

  /* ---------- A band of giant type that runs with the scroll ---------- */
  const bands = [...document.querySelectorAll('.marquee-track')].map(track => ({ track, x: 0, width: 0 }));
  function fillBands() {
    bands.forEach(b => {
      const phrase = H.t(b.track.dataset.key || 'footer.tagline');
      b.track.textContent = '';
      for (let i = 0; i < 6; i++) {
        const s = document.createElement('span');
        s.textContent = phrase;
        if (i % 2) s.className = 'outline';
        const m = document.createElement('span');
        m.className = 'marquee-mark';
        m.textContent = 'Λ';
        b.track.append(s, m);
      }
      b.width = b.track.scrollWidth / 2;
    });
  }
  if (bands.length) H.onLang(fillBands);

  /* ---------- One loop for the moving parts ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!reduce) {
      drift();
      const v = H.velocity();
      bands.forEach(b => {
        if (!b.width) return;
        b.x -= (40 + Math.abs(v) * 22) * dt * (v < 0 ? -1 : 1);
        if (b.x <= -b.width) b.x += b.width;
        if (b.x > 0) b.x -= b.width;
        b.track.style.transform = `translate3d(${b.x.toFixed(1)}px, 0, 0)`;
      });
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- Gold cursor and magnetic buttons (mouse only) ---------- */
  if (finePointer && !reduce) {
    root.classList.add('has-cursor');
    document.body.insertAdjacentHTML('beforeend',
      '<div class="cursor" aria-hidden="true"><span class="cursor-label"></span></div><div class="cursor-dot" aria-hidden="true"></div>');
    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    const label = ring.querySelector('.cursor-label');
    let x = -100, y = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      root.classList.remove('cursor-away');
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.add('cursor-away'));
    window.addEventListener('pointerdown', () => ring.classList.add('press'));
    window.addEventListener('pointerup', () => ring.classList.remove('press'));
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor], a, button, input, textarea, select, label');
      ring.classList.remove('hover', 'labelled', 'text');
      if (!t) return;
      if (t.matches('input, textarea, select')) { ring.classList.add('text'); return; }
      if (t.dataset.cursor) { label.textContent = H.t(t.dataset.cursor); ring.classList.add('labelled'); return; }
      ring.classList.add('hover');
    });
    const follow = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);

    document.querySelectorAll('.btn, .fl-arrow, .sound-btn, .lang-btn, .menu-btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }
})();
