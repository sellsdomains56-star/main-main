/* HAVA — motion shared by every page: a curtain between pages, smooth weighted scrolling,
   headlines that rise word by word and photos that drift slower than the page. Loaded after js/site.js. */
(() => {
  const H = window.HAVA;
  const root = document.documentElement;
  const reduce = H.reduceMotion;
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* blocked */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* blocked */ } }
  };
  const ready = () => root.classList.add('is-loaded');

  /* ---------- Smooth scrolling ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -84 } });
  }
  H.scrollTo = (y, opts = {}) => {
    if (lenis) lenis.scrollTo(y, { immediate: !!opts.immediate, force: true, duration: opts.duration });
    else window.scrollTo({ top: y, behavior: opts.immediate || reduce ? 'instant' : 'smooth' });
  };
  H.lockScroll = on => { if (lenis) { if (on) lenis.stop(); else lenis.start(); } };

  /* ---------- Curtain between pages ---------- */
  document.body.insertAdjacentHTML('beforeend',
    '<div class="curtain" aria-hidden="true"><svg viewBox="0 0 40 40"><use href="#hava-mark"/></svg></div>');
  const curtain = document.body.lastElementChild;
  if (root.classList.contains('curtain-in')) {
    curtain.classList.add('covered');
    root.classList.remove('curtain-in');
    session.del('hava-curtain');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.classList.add('reveal');
      ready();
      setTimeout(() => curtain.classList.remove('covered', 'reveal'), 1100);
    }));
  } else {
    ready();
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
    setTimeout(() => { window.location.href = url.href; }, reduce ? 0 : 600);
  });
  window.addEventListener('pageshow', e => { if (e.persisted) curtain.classList.remove('cover'); });

  /* ---------- Headlines rise word by word ---------- */
  const SPLIT = '.display, .title, .big-text';
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
  H.onLang(() => {
    document.querySelectorAll(SPLIT).forEach(el => {
      split(el);
      if (reduce || watched.has(el)) return;
      watched.add(el);
      el.classList.add('rise');
      if (el.getBoundingClientRect().top < window.innerHeight && el.closest('.page-hero, .contact-page')) el.classList.add('rise-intro');
      else if (io) io.observe(el);
      else el.classList.add('in');
    });
  });

  /* ---------- Photos drift slower than the page ---------- */
  const heroes = [...document.querySelectorAll('.page-hero > img')];
  const frames = [...document.querySelectorAll('.frame:not(.spot-media) img, .fullframe > img')];
  function drift() {
    const vh = window.innerHeight;
    heroes.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      img.style.translate = `0 ${((vh / 2 - (r.top + r.height / 2)) * 0.18).toFixed(1)}px`;
    });
    frames.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      img.style.translate = `0 ${(((r.top + r.height / 2 - vh / 2) / vh) * -48).toFixed(1)}px`;
    });
  }
  if (!reduce) {
    const loop = () => { drift(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();
