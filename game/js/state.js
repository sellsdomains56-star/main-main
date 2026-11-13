// Shared mutable game state. Modules read from G at runtime (never at import time),
// which keeps the module graph free of circular-import trouble.
export const G = {
  state: 'menu',          // menu | playing | paused | ended
  time: 0,
  settings: { sens: 1.0, fov: 78, diff: 1, quality: 'high' },
  scene: null, camera: null, renderer: null,
  world: null, audio: null, player: null,
  bots: [], actors: [],
  scores: [0, 0],
  scoreLimit: 40,
  matchTime: 0,
  matchLimit: 600,
  shake: 0,
  debug: false,
};

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rnd = (a, b) => a + Math.random() * (b - a);
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export function angDiff(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
