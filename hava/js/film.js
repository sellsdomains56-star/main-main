/* HAVA home film: a full-screen 3D scroll film with sound.
   Scroll: the HAVA letters fly past the camera, the letterbox opens and the film plays with the scroll.
   Sound on: the film plays with sound at the speed you scroll and pauses when you stop.
   "Play with sound": the film plays at normal speed and the page scrolls along with it. */
(() => {
  // The film, in two sizes: phones get the lighter one. Set both to '' to show the photos instead.
  const SCROLL_VIDEO = { large: 'media/hava-film-1080.mp4', small: 'media/hava-film-720.mp4' };

  const { t, reduceMotion } = window.HAVA;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ease = v => 1 - Math.pow(1 - v, 3);
  const film = document.getElementById('film');
  const plane = film.querySelector('.film-plane');
  const scenes = [...film.querySelectorAll('.scene')];
  const captions = [...film.querySelectorAll('.film-captions li')];
  const glyphs = [...film.querySelectorAll('.glyph')];
  const introText = [...film.querySelectorAll('.intro-fade')];
  const intro = film.querySelector('.intro');
  const dim = film.querySelector('.intro-dim');
  const barTop = film.querySelector('.film-bar.top');
  const barBottom = film.querySelector('.film-bar.bottom');
  const progress = film.querySelector('.film-progress span');
  const hint = film.querySelector('.film-hint');
  const video = film.querySelector('.film-video');
  const playBtn = document.getElementById('film-play');
  const flavoursLink = document.getElementById('film-flavours');
  const soundBtn = document.getElementById('film-sound');
  const tools = document.getElementById('film-tools');
  const fileInput = document.getElementById('film-file');
  const note = document.getElementById('film-note');
  const errorBox = document.getElementById('film-error');

  let ready = false, soundOn = false, autoplay = false, localUrl = '';
  let lastTarget = 0, lastTick = 0, speed = 0, idleTimer = 0;
  const span = () => film.offsetHeight - window.innerHeight;
  const top = () => film.getBoundingClientRect().top + window.scrollY;
  const setLabel = (el, key) => { el.dataset.i18n = key; el.textContent = t(key); };

  function updateControls() {
    playBtn.hidden = !ready;
    flavoursLink.hidden = ready;
    soundBtn.hidden = !ready;
    setLabel(playBtn.querySelector('span'), autoplay ? 'film.pause' : 'film.play');
    setLabel(soundBtn.querySelector('.sound-label'), soundOn ? 'film.soundOn' : 'film.soundOff');
    soundBtn.setAttribute('aria-pressed', String(soundOn));
  }

  /* ---------- Loading the film ---------- */
  function useVideo(src) {
    stopAutoplay();
    ready = false;
    film.classList.remove('has-video');
    errorBox.textContent = '';
    video.muted = !soundOn;
    video.src = src;
    video.hidden = false;
    video.load();
  }
  video.addEventListener('loadedmetadata', () => {
    ready = true;
    film.classList.add('has-video');
    // Longer films get a longer scroll, so a normal scroll stays close to real time.
    film.style.height = `${Math.round(clamp(video.duration * 30, 420, 2400))}vh`;
    updateControls();
    render();
  });
  video.addEventListener('error', () => {
    if (!video.getAttribute('src')) return;
    ready = false;
    film.classList.remove('has-video');
    video.hidden = true;
    errorBox.textContent = t('film.loadError');
    updateControls();
  });
  video.addEventListener('ended', () => { if (autoplay) stopAutoplay(); });

  function loadFile(file) {
    if (!file || (file.type && !file.type.startsWith('video/'))) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    localUrl = URL.createObjectURL(file);
    useVideo(localUrl);
  }
  document.getElementById('film-load').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
  film.addEventListener('dragover', e => { e.preventDefault(); film.classList.add('drop'); });
  film.addEventListener('dragleave', e => { if (!film.contains(e.relatedTarget)) film.classList.remove('drop'); });
  film.addEventListener('drop', e => { e.preventDefault(); film.classList.remove('drop'); loadFile(e.dataTransfer.files[0]); });

  /* ---------- Sound and playback ---------- */
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    video.muted = !soundOn;
    if (soundOn) video.play().then(() => { if (!autoplay) video.pause(); }).catch(() => {}); // unlocks audio for later
    else if (!autoplay) video.pause();
    updateControls();
  });

  function startAutoplay() {
    if (!ready) return;
    autoplay = true;
    soundOn = true;
    video.muted = false;
    video.playbackRate = 1;
    const p = clamp((window.scrollY - top()) / span(), 0, 1);
    video.currentTime = p > 0.98 ? 0 : p * video.duration;
    updateControls();
    video.play().then(() => requestAnimationFrame(follow)).catch(stopAutoplay);
  }
  function follow() {
    if (!autoplay) return;
    window.scrollTo({ top: top() + (video.currentTime / video.duration) * span(), behavior: 'instant' });
    requestAnimationFrame(follow);
  }
  function stopAutoplay() {
    if (!autoplay) return;
    autoplay = false;
    video.pause();
    updateControls();
  }
  playBtn.addEventListener('click', () => (autoplay ? stopAutoplay() : startAutoplay()));
  window.addEventListener('wheel', stopAutoplay, { passive: true });
  window.addEventListener('touchstart', e => { if (!e.target.closest('#film-play, #film-sound')) stopAutoplay(); }, { passive: true });
  window.addEventListener('keydown', e => {
    if (autoplay && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key) && !e.target.closest('button')) stopAutoplay();
  });

  document.getElementById('film-discover').addEventListener('click', () => {
    window.scrollTo({ top: top() + span() * 0.27, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.getElementById('film-skip').addEventListener('click', () => {
    stopAutoplay();
    window.scrollTo({ top: top() + film.offsetHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  function scrub(p) {
    const target = p * Math.max(0, video.duration - 0.05);
    const now = performance.now();
    const dt = (now - lastTick) / 1000;
    speed = dt > 0 && dt < 0.5 ? speed * 0.6 + ((target - lastTarget) / dt) * 0.4 : 0;
    lastTarget = target;
    lastTick = now;
    if (soundOn && speed > 0.15) {
      video.playbackRate = clamp(speed, 0.5, 2);
      if (video.paused) video.play().catch(() => {});
      if (Math.abs(video.currentTime - target) > 0.35) video.currentTime = target;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { if (!autoplay) video.pause(); }, 260);
    } else {
      if (!video.paused) video.pause();
      if (Math.abs(video.currentTime - target) > 0.03) video.currentTime = target;
    }
  }

  /* ---------- The picture ---------- */
  // With the film, the captions finish early so its own end card (HAVA, Own the moment) plays clean.
  const A = 0.18;
  const B = () => (ready ? 0.6 : 0.92);
  const capWeight = (k, p) => {
    const L = (B() - A) / captions.length;
    const c = A + (k + 0.5) * L;
    if (!ready && k === captions.length - 1 && p >= c) return 1;
    return clamp(1 - (Math.abs(p - c) / L - 0.28) / 0.24, 0, 1);
  };

  function render() {
    const r = film.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (r.bottom < 0 || r.top > window.innerHeight || total <= 0) {
      if (ready && !autoplay && !video.paused) video.pause();
      return;
    }
    const p = clamp(-r.top / total, 0, 1);
    const q = ease(clamp(p / 0.14, 0, 1));
    const exit = ease(clamp((p - 0.9) / 0.1, 0, 1));

    // The HAVA letters fly apart and past the camera.
    const vw = window.innerWidth;
    glyphs.forEach((g, i) => {
      const side = i - 1.5;
      g.style.transform = `translate3d(${(side * q * vw * 0.22).toFixed(1)}px, 0, ${(q * (620 + Math.abs(side) * 260)).toFixed(1)}px)`;
      g.style.opacity = (1 - clamp((q - 0.3) / 0.6, 0, 1)).toFixed(3);
    });
    const textFade = 1 - clamp(p / 0.06, 0, 1);
    introText.forEach(el => { el.style.opacity = textFade.toFixed(3); el.style.transform = `translateY(${(-40 * (1 - textFade)).toFixed(1)}px)`; });
    intro.style.visibility = p > 0.15 ? 'hidden' : '';
    dim.style.opacity = (1 - q).toFixed(3);

    // Letterbox opens, and closes again at the very end.
    const bars = Math.max(1 - ease(clamp(p / 0.12, 0, 1)), exit);
    barTop.style.transform = `scaleY(${bars.toFixed(3)})`;
    barBottom.style.transform = `scaleY(${bars.toFixed(3)})`;

    // The camera pushes in, drifts across the scene, and the frame tilts away at the end.
    const scale = (1.16 - 0.1 * q) * (1 - 0.16 * exit);
    const drift = (p - 0.5) * 5 * (1 - exit);
    plane.style.transform = `scale(${scale.toFixed(4)}) rotateY(${drift.toFixed(2)}deg) rotateX(${(-11 * exit).toFixed(2)}deg)`;
    plane.style.borderRadius = `${(26 * exit).toFixed(1)}px`;

    const L = (B() - A) / captions.length;
    captions.forEach((li, k) => {
      const c = A + (k + 0.5) * L;
      li.style.opacity = capWeight(k, p).toFixed(3);
      li.style.transform = `translateY(${(((p - c) / L) * -44).toFixed(1)}px)`;
    });

    if (ready) {
      if (!autoplay) scrub(p);
    } else {
      scenes.forEach((img, k) => {
        const w = k === 0 ? 1 - clamp((p - 0.1) / 0.12, 0, 1) : capWeight(k - 1, p);
        const local = k === 0 ? q : clamp((p - (A + (k - 1) * L)) / L, 0, 1);
        img.style.opacity = w.toFixed(3);
        img.style.transform = `scale(${(1.12 - 0.1 * local).toFixed(4)})`;
      });
    }
    progress.style.transform = `scaleY(${p.toFixed(4)})`;
    hint.style.opacity = p < 0.02 ? 1 : 0;
  }

  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(); }); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.HAVA.onLang(updateControls);

  const filmSrc = SCROLL_VIDEO && (window.innerWidth < 900 ? SCROLL_VIDEO.small : SCROLL_VIDEO.large);
  if (filmSrc) {
    tools.hidden = true;
    useVideo(filmSrc);
  } else {
    note.hidden = false;
  }
  updateControls();
  render();
})();
