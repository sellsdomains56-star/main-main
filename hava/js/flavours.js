/* HAVA flavours.
   Flavours page: one screen per flavour. The stage stays put while you scroll, each new flavour wipes up
   over the last, and the list of names follows along. Click a name or a tile to jump to that flavour.
   Home: the row of flavour tiles scrolls with the arrow buttons. */
(() => {
  const H = window.HAVA;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ease = v => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

  /* ---------- Home: the row of tiles ---------- */
  const strip = document.querySelector('.fstrip');
  if (strip) {
    document.querySelectorAll('[data-strip]').forEach(btn => btn.addEventListener('click', () => {
      const rtl = document.documentElement.dir === 'rtl';
      const card = strip.firstElementChild.getBoundingClientRect().width;
      strip.scrollBy({ left: Number(btn.dataset.strip) * (rtl ? -1 : 1) * card * 2, behavior: H.reduceMotion ? 'auto' : 'smooth' });
    }));
  }

  /* ---------- Flavours page: the flavour film, silent, on a loop while it's on screen ---------- */
  const film = document.querySelector('.ffilm-video');
  if (film) {
    film.muted = true;
    film.src = window.innerWidth < 900 ? 'media/flavours-film-720.mp4' : 'media/flavours-film-1080.mp4';
    const play = () => film.play().catch(() => H.onFirstTouch(play));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { if (en.isIntersecting) play(); else film.pause(); }, { threshold: 0.2 }).observe(film);
    } else play();
  }

  /* ---------- Flavours page: the reel ---------- */
  const reel = document.getElementById('reel');
  if (!reel) return;
  const slides = [...reel.querySelectorAll('.reel-slide')];
  const keys = slides.map(s => s.id);
  const names = [...reel.querySelectorAll('.reel-names li')];
  const descs = [...reel.querySelectorAll('.reel-desc p')];
  const count = reel.querySelector('.reel-count b');
  const bar = reel.querySelector('.reel-bar span');
  const n = slides.length;
  let active = -1;

  function setActive(i) {
    if (i === active) return;
    active = i;
    names.forEach((li, k) => {
      li.classList.toggle('on', k === i);
      li.firstElementChild.setAttribute('aria-current', String(k === i));
    });
    descs.forEach((p, k) => p.classList.toggle('on', k === i));
    count.textContent = String(i + 1).padStart(2, '0');
  }

  // Where the page has to be for flavour i to fill the screen.
  function scrollFor(i) {
    const top = reel.getBoundingClientRect().top + window.scrollY;
    return top + (i / (n - 1)) * (reel.offsetHeight - window.innerHeight);
  }
  function go(i, immediate) { H.scrollTo(scrollFor(i), { immediate }); }

  function render() {
    const r = reel.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const t = clamp(-r.top / total, 0, 1) * (n - 1);
    const shown = slides.map((s, i) => (i === 0 ? 1 : ease(clamp((t - (i - 1) - 0.15) / 0.7, 0, 1))));
    slides.forEach((s, i) => {
      const v = shown[i];
      const covered = i < n - 1 && shown[i + 1] >= 1;
      s.style.visibility = v > 0 && !covered ? '' : 'hidden';
      if (i > 0) s.style.clipPath = v >= 1 ? '' : `inset(${((1 - v) * 100).toFixed(2)}% 0 0 0)`;
      if (!H.reduceMotion) s.firstElementChild.style.transform = `scale(${(1.12 - 0.12 * v).toFixed(4)})`;
    });
    bar.style.transform = `scaleX(${(t / (n - 1)).toFixed(4)})`;
    setActive(Math.min(n - 1, Math.round(t)));
  }

  names.forEach((li, i) => li.firstElementChild.addEventListener('click', () => go(i)));
  document.querySelectorAll('.ftile[data-flavour]').forEach(a => a.addEventListener('click', e => {
    const i = keys.indexOf(a.dataset.flavour);
    if (i < 0) return;
    e.preventDefault();
    e.stopPropagation(); // keep the smooth-scroll anchor handler from also jumping to the stage
    go(i);
  }));

  // Every photo's description follows the language.
  H.onLang(() => {
    slides.forEach(s => {
      const img = s.firstElementChild;
      img.alt = H.t('alt.flavour', { name: H.t(`fl.${img.dataset.fl}`) });
    });
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; render(); });
  }, { passive: true });
  window.addEventListener('resize', render);
  render();

  // flavours.html#peach opens on that flavour.
  const fromHash = keys.indexOf(decodeURIComponent(window.location.hash.slice(1)));
  if (fromHash > 0) {
    requestAnimationFrame(() => { go(fromHash, true); render(); });
  }
})();
