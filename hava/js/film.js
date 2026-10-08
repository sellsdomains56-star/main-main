/* HAVA home film: the film fills the first screen and plays with its sound.
   Browsers only let a page play sound after the visitor clicks, taps or presses a key. If the first
   play with sound is refused, the film plays silently and starts again with sound at that first touch.
   As you scroll on, the film tilts back in 3D and dims into the page. */
(() => {
  const FILM = { large: 'media/hava-film-1080.mp4', small: 'media/hava-film-720.mp4' };

  const { reduceMotion } = window.HAVA;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ease = v => 1 - Math.pow(1 - v, 3);
  const film = document.getElementById('film');
  const plane = film.querySelector('.film-plane');
  const dim = film.querySelector('.film-dim');
  const video = film.querySelector('.film-video');
  const hint = document.getElementById('film-hint');
  const ACTIVATION = ['click', 'keydown', 'touchend'];
  let soundOn = false, titleTimer = 0;

  const showTitle = on => film.classList.toggle('title-on', on);
  const showHint = on => { hint.hidden = !on; film.classList.toggle('hint-on', on); };
  // The title stays for a moment, then leaves the screen to the film.
  const rolling = () => { clearTimeout(titleTimer); titleTimer = setTimeout(() => showTitle(false), 2600); };

  function start() {
    video.muted = false;
    video.play()
      .then(() => { soundOn = true; showHint(false); stopListening(); rolling(); })
      .catch(() => {
        video.muted = true;
        video.play().then(rolling).catch(() => {});
        showHint(true);
      });
  }
  function withSound() {
    if (soundOn) return;
    soundOn = true;
    showHint(false);
    video.muted = false;
    video.currentTime = 0;
    showTitle(true);
    video.play()
      .then(() => { stopListening(); rolling(); })
      .catch(() => { soundOn = false; video.muted = true; showHint(true); });
  }
  const stopListening = () => ACTIVATION.forEach(t => window.removeEventListener(t, withSound, true));
  ACTIVATION.forEach(t => window.addEventListener(t, withSound, true));

  // Click the film after it ends to watch it again.
  film.addEventListener('click', () => {
    if (!video.ended) return;
    video.currentTime = 0;
    video.play().then(rolling).catch(() => {});
  });

  // Pause when the film is off screen, carry on when it comes back.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!video.ended && video.currentTime > 0) video.play().catch(() => {});
    }, { threshold: 0.15 }).observe(film.querySelector('.film-sticky'));
  }

  // 3D: the film tilts back and dims as the page moves on.
  function render() {
    const r = film.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0 || r.bottom < 0) return;
    const e = ease(clamp(-r.top / total, 0, 1));
    plane.style.transform = `scale(${(1 - 0.18 * e).toFixed(4)}) rotateX(${(10 * e).toFixed(2)}deg)`;
    plane.style.borderRadius = `${(28 * e).toFixed(1)}px`;
    dim.style.opacity = (0.6 * e).toFixed(3);
  }
  if (!reduceMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; render(); });
    }, { passive: true });
    render();
  }

  video.src = window.innerWidth < 900 ? FILM.small : FILM.large;
  start();
})();
