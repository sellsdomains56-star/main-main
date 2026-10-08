/* HAVA — shared script for every page: header, footer, languages, film grain and reveals.
   Each page sets <body data-page="..."> and loads js/i18n.js before this file. */
(() => {
  const I18N = window.HAVA_I18N;
  const page = document.body.dataset.page || 'home';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ } }
  };
  const NAV = [
    ['products.html', 'nav.products', 'products', 'Products'],
    ['flavours.html', 'nav.flavours', 'flavours', 'Flavours'],
    ['source.html', 'nav.source', 'source', 'The source'],
    ['story.html', 'story.eyebrow', 'story', 'Our story'],
    ['contact.html', 'nav.contact', 'contact', 'Contact']
  ];

  /* ---------- Shared drawings ---------- */
  document.body.insertAdjacentHTML('afterbegin', `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="hava-wordmark" viewBox="0 0 264 84">
    <g fill="none" stroke="currentColor" stroke-width="4.2">
      <path d="M4 8V64M44 8V64M4 36H44M70 64L95 8L120 64M140 8L165 64L190 8M210 64L235 8L260 64"/>
      <path d="M4 79H260" stroke-width="2.4"/>
    </g>
  </symbol>
  <symbol id="hava-mark" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <path d="M13.5 26.5L20 12.5L26.5 26.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </symbol>
</svg>`);

  /* ---------- Header and footer ---------- */
  const navLinks = NAV.map(([href, key, id, text]) =>
    `<a href="${href}" data-i18n="${key}"${id === page ? ' aria-current="page"' : ''}>${text}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
<header class="site-header">
  <div class="bar">
    <a class="brand" href="index.html" aria-label="HAVA"><svg viewBox="0 0 264 84" aria-hidden="true"><use href="#hava-wordmark"/></svg></a>
    <nav class="nav" aria-label="Main">${navLinks}</nav>
    <div class="lang">
      <button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" data-i18n-attr="aria-label:lang.label" aria-label="Language">
        <svg viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c2 2 2.8 4 2.8 6.5S10 12.5 8 14.5M8 1.5C6 3.5 5.2 5.5 5.2 8S6 12.5 8 14.5"/></g></svg>
        <span class="lang-code">EN</span>
      </button>
      <ul class="lang-menu lang-list" hidden></ul>
    </div>
  </div>
</header>
<div class="grain" aria-hidden="true"></div>`);

  const footerCta = page === 'contact' ? '' : `
  <div class="wrap footer-cta">
    <span class="eyebrow" data-i18n="contact.eyebrow">Contact</span>
    <h2 class="display" data-i18n="contact.title">Bring HAVA to your table</h2>
    <a class="btn btn-gold arrow" href="contact.html" data-i18n="nav.contact">Contact</a>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', `
<footer class="site-footer">${footerCta}
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <svg viewBox="0 0 264 84" role="img" aria-label="HAVA"><use href="#hava-wordmark"/></svg>
      <p data-i18n="footer.tagline">The essence of Sweden.</p>
    </div>
    <div>
      <h2 data-i18n="footer.explore">Explore</h2>
      <ul>${NAV.map(([href, key, , text]) => `<li><a href="${href}" data-i18n="${key}">${text}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 data-i18n="footer.language">Language</h2>
      <ul class="lang-list footer-langs"></ul>
    </div>
  </div>
  <div class="wrap footer-base">
    <span data-i18n="footer.rights">© 2026 HAVA. Water from Sweden.</span>
    <svg aria-hidden="true"><use href="#hava-mark"/></svg>
  </div>
  <img class="footer-band" src="assets/pattern-band.webp" width="2400" height="567" alt="" loading="lazy">
</footer>`);

  document.querySelectorAll('.lang-list').forEach(list => {
    I18N.languages.forEach(l => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.lang = l.tag;
      b.dir = l.dir;
      b.dataset.lang = l.code;
      b.textContent = l.name;
      li.appendChild(b);
      list.appendChild(li);
    });
  });

  /* ---------- Language ---------- */
  let lang = 'en';
  const listeners = [];
  const t = (key, vars) => {
    const table = I18N.strings[lang] || I18N.strings.en;
    let s = key in table ? table[key] : (key in I18N.strings.en ? I18N.strings.en[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));
    return s;
  };
  const FONT_CSS = {
    ar: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap',
    zh: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@500&display=swap'
  };
  function loadFonts(code) {
    if (!FONT_CSS[code] || document.querySelector(`link[data-font="${code}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_CSS[code];
    link.dataset.font = code;
    document.head.appendChild(link);
  }
  function setLang(code, remember) {
    const meta = I18N.languages.find(l => l.code === code) || I18N.languages[0];
    lang = meta.code;
    loadFonts(lang);
    document.documentElement.lang = meta.tag;
    document.documentElement.dir = meta.dir;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr, t(key));
      });
    });
    document.querySelectorAll('[data-size]').forEach(el => {
      el.textContent = `${el.dataset.size} ${t('unit.ml')} · ${t('range.' + el.dataset.mat)}`;
    });
    document.querySelectorAll('.lang-code').forEach(el => { el.textContent = meta.code.toUpperCase(); });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-current', String(b.dataset.lang === lang)));
    const titleKey = document.body.dataset.title;
    if (titleKey) document.title = `HAVA · ${t(titleKey)}`;
    if (remember) store.set('hava-lang', lang);
    listeners.forEach(fn => fn(lang));
  }
  window.HAVA = {
    t, store, reduceMotion,
    get lang() { return lang; },
    onLang(fn) { listeners.push(fn); },
    // js/motion.js replaces these with smooth-scrolling versions
    scrollTo(y, opts = {}) { window.scrollTo({ top: y, behavior: opts.immediate || reduceMotion ? 'instant' : 'smooth' }); },
    lockScroll() {},
    velocity() { return 0; },
    // Some browsers block autoplay (iPhone Low Power Mode); a film then starts on the visitor's first touch or scroll.
    onFirstTouch(fn) {
      ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(type => window.addEventListener(type, fn, { once: true, passive: true }));
    }
  };
  const H = window.HAVA;

  const langBtn = document.querySelector('.lang-btn');
  const langMenu = document.querySelector('.lang-menu');
  const closeLang = () => { langMenu.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); };
  langBtn.addEventListener('click', () => {
    const open = langMenu.hidden;
    langMenu.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
  });

  const header = document.querySelector('.site-header');

  // On narrow screens the links sit in a row under the logo; keep the current page in view.
  const current = document.querySelector('.nav [aria-current="page"]');
  if (current) current.scrollIntoView({ block: 'nearest', inline: 'center' });

  document.addEventListener('click', e => {
    const pick = e.target.closest('[data-lang]');
    if (pick) { setLang(pick.dataset.lang, true); closeLang(); return; }
    if (!e.target.closest('.lang')) closeLang();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLang(); });

  // The header stays clear over the opening frame and turns solid after it.
  const opening = document.querySelector('main > :first-child');
  let ticking = false;
  const updateHeader = () => {
    ticking = false;
    const limit = opening ? opening.offsetTop + opening.offsetHeight - 90 : 40;
    header.classList.toggle('solid', window.scrollY > Math.max(40, limit));
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); } }, { passive: true });
  updateHeader();

  /* ---------- Film grain ---------- */
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const g = c.getContext('2d');
    const img = g.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    document.querySelector('.grain').style.backgroundImage = `url(${c.toDataURL()})`;
  } catch (e) { /* no grain */ }

  /* ---------- Reveals: things below the first screen drift up into place ---------- */
  const revealables = [...document.querySelectorAll('[data-reveal], .frame')];
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.remove('pre'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealables.forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('pre'); io.observe(el); }
    });
  }

  /* ---------- Silent films that loop while they're on screen (the waterfall, the film on Products) ---------- */
  document.querySelectorAll('video[data-src]').forEach(v => {
    const [large, small] = v.dataset.src.split(' ');
    v.muted = true;
    v.src = small && window.innerWidth < 900 ? small : large;
    if (reduceMotion) { v.removeAttribute('autoplay'); return; }
    const play = () => v.play().catch(() => H.onFirstTouch(play));
    if (!('IntersectionObserver' in window)) { play(); return; }
    new IntersectionObserver(([en]) => { if (en.isIntersecting) play(); else v.pause(); }, { threshold: 0.15 }).observe(v);
  });

  /* ---------- Products: the size buttons switch the bottle photo ---------- */
  const pickSize = (product, size) => {
    product.querySelectorAll('[data-size-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sizePick === size)));
    product.querySelectorAll('[data-size-img]').forEach(img => img.classList.toggle('on', img.dataset.sizeImg === size));
  };
  document.querySelectorAll('[data-size-pick]').forEach(btn => btn.addEventListener('click', () => pickSize(btn.closest('.product'), btn.dataset.sizePick)));
  document.querySelectorAll('.lcard[data-pick]').forEach(card => card.addEventListener('click', () => {
    const product = document.querySelector(card.getAttribute('href'));
    if (product) pickSize(product, card.dataset.pick);
  }));

  /* ---------- From sky to bottle: the picture follows the chapter being read ---------- */
  const stage = document.querySelector('.chapter-stage');
  if (stage && 'IntersectionObserver' in window) {
    const pics = [...stage.querySelectorAll('img')];
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const i = Number(en.target.dataset.chapter);
      pics.forEach((img, k) => img.classList.toggle('on', k === i));
    }), { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.chapter').forEach(c => io.observe(c));
  }

  /* ---------- Numbered pins and their legend light up together ---------- */
  document.querySelectorAll('.legend [data-pin], .pin').forEach(el => {
    const mark = on => document.querySelectorAll(`[data-pin="${el.dataset.pin}"]`).forEach(x => x.classList.toggle('on', on));
    el.addEventListener('mouseenter', () => mark(true));
    el.addEventListener('mouseleave', () => mark(false));
  });

  /* ---------- Start in the visitor's language ---------- */
  let fromQuery = null;
  try { fromQuery = new URLSearchParams(window.location.search).get('lang'); } catch (e) { /* no query */ }
  const startLang = [fromQuery, store.get('hava-lang')].find(c => c && I18N.languages.some(l => l.code === c)) || 'en';
  const start = () => setLang(startLang, false);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
