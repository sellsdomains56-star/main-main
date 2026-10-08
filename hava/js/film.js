/* HAVA film (opens the Products page): it plays by itself, silently, whenever it is on screen.
   As you scroll on, the film tilts back in 3D and dims into the page. */
(() => {
  const FILM = { large: 'media/hava-film-1080.mp4?v=15', small: 'media/hava-film-720.mp4?v=15' };

  const { reduceMotion } = window.HAVA;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ease = v => 1 - Math.pow(1 - v, 3);
  const film = document.getElementById('film');
  const plane = film.querySelector('.film-plane');
  const dim = film.querySelector('.film-dim');
  const video = film.querySelector('.film-video');
  const play = () => video.play().catch(() => window.HAVA.onFirstTouch(play));

  // Click the film after it ends to watch it again.
  film.addEventListener('click', () => {
    if (!video.ended) return;
    video.currentTime = 0;
    play();
  });

  // Play while the film is on screen, pause when it leaves.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!video.ended) play();
    }, { threshold: 0.3 }).observe(film.querySelector('.film-sticky'));
  }

  // 3D: the film tilts back and dims as the page moves on.
  function render() {
    const r = film.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0 || r.bottom < 0 || r.top > window.innerHeight) return;
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

  video.muted = true;
  video.src = window.innerWidth < 900 ? FILM.small : FILM.large;
  if (!('IntersectionObserver' in window)) play();
})();
