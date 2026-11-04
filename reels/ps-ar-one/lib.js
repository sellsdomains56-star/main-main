'use strict';
// ---------------------------------------------------------------------------
// Core helpers: constants, easing, text, polylines, icons, logos.
// Everything draws into the global `ctx` and is a pure function of time.
// ---------------------------------------------------------------------------
const W = 1080, H = 1920, FPS = 60, CX = 540; let DUR = 46.72;
const C = {                      // the original palette: near-black, warm ivory, gold
  bg: '#08080A',
  ink: '#F3EFE6',
  dim: 'rgba(243,239,230,0.62)',
  mute: 'rgba(243,239,230,0.30)',
  faint: 'rgba(243,239,230,0.14)',
  gold: '#E9C47C',
  goldSoft: 'rgba(233,196,124,0.16)',
  panel: '#141417',
};

// Instagram Reels safe zone (1080x1920): the top 220 px, the bottom 450 px and a 100 px strip on the right (like / comment / share) get covered by the app's UI.
// Every caption, graphic and label stays inside SAFE (the full-bleed video and map imagery may run to the edges).
const SAFE = { x0: 130, x1: 950, y0: 300, y1: 1420, w: 820 };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  out2: x => 1 - (1 - x) ** 2,
  out3: x => 1 - (1 - x) ** 3,
  out4: x => 1 - (1 - x) ** 4,
  out5: x => 1 - (1 - x) ** 5,
  expo: x => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  in2: x => x * x,
  in3: x => x * x * x,
  inOut3: x => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  inOut2: x => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  back: x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; },
};
// eased progress between two timestamps
const ea = (t, a, b, f = E.out3) => f(prog(t, a, b));
// seeded PRNG for anything "random"
function rng(seed) { let s = seed >>> 0; return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

let ctx = null, SS = 1;
function setCtx(c, ss) { ctx = c; SS = ss; }

// ---- fonts ----------------------------------------------------------------
const TS = 1.16;   // scale for small Inter text: the graphics are drawn at ~85% in split mode
const BOLD = w => Math.max(700, w);                               // everything is bold: no light weights, no italics
const F = {
  d: (w, s) => `${BOLD(w)} ${s}px "Cairo","Inter Display","Inter",sans-serif`,   // large display sans (Arabic reel: Cairo first - Arabic + Latin digits in one family)
  t: (w, s) => `${BOLD(w)} ${+(s * TS).toFixed(1)}px "Cairo","Inter","Inter Display",sans-serif`,   // small text
  i: s => `800 ${s}px "Cairo","Inter Display","Inter",sans-serif`,
  r: s => `800 ${s}px "Cairo","Inter Display","Inter",sans-serif`,
};

// ---- text -----------------------------------------------------------------
function T(s, x, y, o = {}) {
  const { font = F.t(500, 30), color = C.ink, alpha = 1, align = 'center', sx = 1, sy = sx, rot = 0, base = 'alphabetic' } = o, ar = AR.test(s), ls = ar ? 0 : (o.ls || 0);
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(sx, sy);
  ctx.font = font; ctx.letterSpacing = ls + 'px';
  ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color; ctx.direction = ar ? 'rtl' : 'ltr';   // Arabic: right-to-left order (numbers and Latin words stay in place)
  const dx = align === 'center' ? ls / 2 : align === 'right' ? ls : 0;
  ctx.fillText(s, dx, 0);
  ctx.restore();
}
const AR = /[\u0600-\u06FF]/;                                   // Arabic letters: no letter-spacing (it would cut the joined letters apart)
function M(s, font, ls = 0) {
  if (AR.test(s)) ls = 0;
  ctx.save(); ctx.font = font; ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(s).width; ctx.restore(); return w;
}

// number with fixed-width digit cells (no jitter while counting). Returns width.
function numberStr(v, dec) { return dec ? v.toFixed(dec) : Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function drawNumber(str, finalLen, x, y, o = {}) {
  // right-aligned inside a box sized for `finalLen` characters of "0"/"." widths
  const { font = F.d(300, 300), color = C.ink, alpha = 1, ls = -6 } = o;
  ctx.save(); ctx.font = font; ctx.letterSpacing = ls + 'px';
  const w0 = ctx.measureText('0').width + 0, wd = ctx.measureText('.').width;
  ctx.restore();
  const cellW = ch => (ch === '.' || ch === ',' ? wd : w0);
  const fin = finalLen; // string of final shape e.g. "1.4" or "13"
  let total = 0; for (const ch of fin) total += cellW(ch);
  // lay out `str` right-aligned in `total`
  let cx = x + total; // right edge
  const chars = [...str];
  for (let i = chars.length - 1; i >= 0; i--) {
    const ch = chars[i]; const cw = cellW(ch); cx -= cw;
    T(ch, cx + cw / 2, y, { font, color, alpha, align: 'center', ls: 0 });
  }
  return total;
}
function numberWidth(fin, font, ls = -6) {
  ctx.save(); ctx.font = font; ctx.letterSpacing = ls + 'px';
  const w0 = ctx.measureText('0').width, wd = ctx.measureText('.').width; ctx.restore();
  let total = 0; for (const ch of fin) total += (ch === '.' || ch === ',' ? wd : w0); return total;
}

// ---- shapes ---------------------------------------------------------------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(x1, y1, x2, y2, o = {}) {
  const { color = C.faint, w = 1.5, alpha = 1, dash = null } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function dot(x, y, r, color = C.ink, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function glow(x, y, r, color = '233,196,124', a = 0.25) {
  if (a <= 0.003) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`); g.addColorStop(1, `rgba(${color},0)`);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function ring(x, y, r, o = {}) {
  const { color = C.ink, w = 2, alpha = 1, a0 = 0, a1 = Math.PI * 2, dash = null } = o;
  if (alpha <= 0.002 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.stroke(); ctx.restore();
}

// partial polyline: draws first fraction p of path length, returns head {x,y,a}
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function strokePoly(pts, p, o = {}) {
  const { color = C.ink, w = 3, alpha = 1, cap = 'round', join = 'round', close = false } = o;
  if (p <= 0 || alpha <= 0.002) return null;
  const total = polyLen(pts); let target = total * clamp(p), acc = 0;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = join;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let head = { x: pts[0][0], y: pts[0][1], a: 0 };
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= target) {
      const f = seg ? (target - acc) / seg : 0;
      const x = lerp(pts[i - 1][0], pts[i][0], f), y = lerp(pts[i - 1][1], pts[i][1], f);
      ctx.lineTo(x, y); head = { x, y, a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) };
      acc = target; break;
    }
    ctx.lineTo(pts[i][0], pts[i][1]); acc += seg; head = { x: pts[i][0], y: pts[i][1], a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) };
  }
  if (close && p >= 1) ctx.closePath();
  ctx.stroke(); ctx.restore();
  return head;
}

// ---- icons: arrays of polylines in a [-1,1] box ----------------------------
const arc = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
const rrectPts = (x, y, w, h, r = 0.1) => {
  const p = []; const c = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  c(x + w - r, y + r, -Math.PI / 2); c(x + w - r, y + h - r, 0); c(x + r, y + h - r, Math.PI / 2); c(x + r, y + r, Math.PI); p.push(p[0]); return p;
};
const ICONS = {
  drop: () => { const p = []; for (let i = 0; i <= 64; i++) { const t = (i / 64) * Math.PI * 2; p.push([0.82 * Math.sin(t) * Math.pow(Math.sin(t / 2), 1.5), -Math.cos(t) * 0.95 + 0.02]); } return [p]; },
  tag: () => [[[-0.95, 0], [-0.45, -0.55], [0.85, -0.55], [0.85, 0.55], [-0.45, 0.55], [-0.95, 0]], arc(-0.38, 0, 0.1, 0, Math.PI * 2, 20)],
  house: () => [[[-0.92, -0.05], [0, -0.92], [0.92, -0.05]], [[-0.66, -0.25], [-0.66, 0.85], [0.66, 0.85], [0.66, -0.25]], [[-0.17, 0.85], [-0.17, 0.3], [0.17, 0.3], [0.17, 0.85]]],
  chart: () => [[[-0.9, 0.62], [-0.35, 0.05], [0.05, 0.32], [0.82, -0.55]], [[0.42, -0.6], [0.84, -0.57], [0.8, -0.17]], [[-0.9, 0.9], [0.9, 0.9]]],
  building: () => [rrectPts(-0.58, -0.92, 1.16, 1.84, 0.05), [[-0.28, -0.6], [-0.28, -0.6]], [[-0.3, -0.58], [-0.1, -0.58]], [[0.1, -0.58], [0.3, -0.58]], [[-0.3, -0.2], [-0.1, -0.2]], [[0.1, -0.2], [0.3, -0.2]], [[-0.3, 0.2], [-0.1, 0.2]], [[0.1, 0.2], [0.3, 0.2]], [[-0.14, 0.92], [-0.14, 0.55], [0.14, 0.55], [0.14, 0.92]]],
  briefcase: () => [rrectPts(-0.92, -0.42, 1.84, 1.3, 0.12), [[-0.36, -0.42], [-0.36, -0.82], [0.36, -0.82], [0.36, -0.42]], [[-0.92, 0.1], [0.92, 0.1]]],
  plane: () => [[[-0.95, -0.12], [0.95, -0.92], [0.2, 0.92], [-0.1, 0.16], [-0.95, -0.12]], [[-0.1, 0.16], [0.95, -0.92]]],
  flag: () => [[[-0.3, -0.95], [-0.3, 0.8]], [[-0.3, -0.95], [0.7, -0.6], [-0.3, -0.25]], arc(0.05, 0.82, 0.55, Math.PI, Math.PI * 2, 24), [[-0.9, 0.82], [0.9, 0.82]]],
  check: () => [[[-0.6, 0.02], [-0.18, 0.5], [0.62, -0.5]]],
  bars: () => [[[-0.7, 0.8], [-0.7, 0.2]], [[-0.23, 0.8], [-0.23, -0.15]], [[0.23, 0.8], [0.23, -0.5]], [[0.7, 0.8], [0.7, -0.9]]],
  up: () => [[[0, 0.8], [0, -0.8]], [[-0.5, -0.3], [0, -0.85], [0.5, -0.3]]],
  school: () => [[[-0.95, -0.3], [0, -0.75], [0.95, -0.3], [0, 0.15], [-0.95, -0.3]], [[-0.55, -0.08], [-0.55, 0.45], [0, 0.75], [0.55, 0.45], [0.55, -0.08]], [[0.95, -0.3], [0.95, 0.4]]],
  doc: () => [[[-0.65, -0.95], [0.3, -0.95], [0.7, -0.55], [0.7, 0.95], [-0.65, 0.95], [-0.65, -0.95]], [[0.3, -0.95], [0.3, -0.55], [0.7, -0.55]], [[-0.38, -0.15], [0.42, -0.15]], [[-0.38, 0.2], [0.42, 0.2]], [[-0.38, 0.55], [0.15, 0.55]]],
  tv: () => [rrectPts(-0.95, -0.75, 1.9, 1.3, 0.12), [[0, 0.55], [0, 0.85]], [[-0.45, 0.88], [0.45, 0.88]], [[-0.35, -1.05], [0, -0.78], [0.35, -1.05]]],
  warn: () => [[[0, -0.92], [0.98, 0.82], [-0.98, 0.82], [0, -0.92]], [[0, -0.3], [0, 0.28]], [[0, 0.52], [0, 0.55]]],
  cube: () => [[[0, -0.95], [0.82, -0.5], [0.82, 0.45], [0, 0.95], [-0.82, 0.45], [-0.82, -0.5], [0, -0.95]], [[0, -0.05], [0.82, -0.5]], [[0, -0.05], [-0.82, -0.5]], [[0, -0.05], [0, 0.95]]],
};
// draw an icon centered at (x,y) with half-size s; p = draw-on progress (0..1)
function icon(name, x, y, s, o = {}) {
  const { p = 1, color = C.ink, w = 3, alpha = 1, rot = 0 } = o;
  if (p <= 0 || alpha <= 0.002) return;
  const lines = ICONS[name]();
  const lens = lines.map(polyLen); const tot = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot);
  for (let i = 0; i < lines.length; i++) {
    const a0 = acc / tot, a1 = (acc + lens[i]) / tot; acc += lens[i];
    const lp = clamp((p - a0) / Math.max(1e-6, (a1 - a0)));
    if (lp <= 0) continue;
    const pts = lines[i].map(([px, py]) => [px * s, py * s]);
    strokePoly(pts, lp, { color, w, alpha });
  }
  ctx.restore();
}

// ---- logos ----------------------------------------------------------------
// Drop official artwork into ./logos/<key>.svg|png and it replaces the wordmark
// (auto-tinted to the reel's ink colour). Until then: clean typographic marks.
const LOGO_IMG = {};
const WORDMARKS = {
  mubadala: { main: 'MUBADALA', sub: 'INVESTMENT COMPANY', mainFont: s => F.d(600, s), ls: 0.12, subLs: 0.5 },
  adia:     { main: 'ADIA', sub: 'ABU DHABI INVESTMENT AUTHORITY', mainFont: s => F.d(700, s), ls: 0.22, subLs: 0.42 },
  aldar:    { main: 'ALDAR', sub: 'PROPERTIES', mainFont: s => F.d(700, s), ls: 0.18, subLs: 0.55 },
  modon:    { main: 'MODON', sub: 'HOLDING', mainFont: s => F.d(700, s), ls: 0.18, subLs: 0.55 },
  talay:    { main: 'Talay', sub: null, mainFont: s => F.i(s * 1.12), ls: 0.01 },
  yasriva:  { main: 'YAS RIVA', sub: 'RESERVE', mainFont: s => F.d(600, s), ls: 0.2, subLs: 0.6, subScale: 0.42 },
  hudayriyat: { main: 'HUDAYRIYAT', sub: 'GOLF ESTATES', mainFont: s => F.d(600, s), ls: 0.18, subLs: 0.6, subScale: 0.4 },
};
// size ~ cap height driver; returns {w,h}
const LOGO_W = { mubadala: 8.4, adia: 4.2, modon: 6.1, talay: 1.6, yas: 3.4 };   // image width = size * factor
function logoSize(key, size, fitH) {
  const im = LOGO_IMG[key];
  if (im) {
    const asp = im.width / im.height;
    if (fitH) return { w: fitH * asp, h: fitH };
    const w = size * (LOGO_W[key] || 5); return { w, h: w / asp };
  }
  const L = WORDMARKS[key]; const w = M(L.main, L.mainFont(size), L.ls * size);
  return { w, h: size * (L.sub ? 1.55 : 1.1) };
}
let _off = null;
function logo(key, x, y, size, o = {}) {
  const { alpha = 1, reveal = 1, color = C.ink, align = 'center', shine = -1, fitH = 0 } = o;
  if (alpha <= 0.002 || reveal <= 0) return;
  const { w, h } = logoSize(key, size, fitH);
  const left = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
  const useShine = shine > 0 && shine < 1;
  let main = ctx;
  if (useShine) { // draw into an offscreen layer with the same transform so we can composite a highlight
    if (!_off || _off.width !== ctx.canvas.width) { _off = document.createElement('canvas'); _off.width = ctx.canvas.width; _off.height = ctx.canvas.height; }
    const oc = _off.getContext('2d'); oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, _off.width, _off.height);
    oc.setTransform(ctx.getTransform()); oc.globalAlpha = 1; oc.globalCompositeOperation = 'source-over';
    ctx = oc;
  }
  ctx.save(); if (!useShine) ctx.globalAlpha *= alpha;
  if (reveal < 1) { ctx.beginPath(); ctx.rect(left - 30, y - h, (w + 60) * reveal, h * 2); ctx.clip(); }
  const im = LOGO_IMG[key];
  if (im) {
    ctx.drawImage(im, left, y - h * 0.5, w, h);
  } else {
    const L = WORDMARKS[key];
    T(L.main, left + w / 2, y + size * 0.34, { font: L.mainFont(size), ls: L.ls * size, color, align: 'center' });
    if (L.sub) {
      const subSize = Math.max(30, size * (L.subScale || 0.3));
      T(L.sub, left + w / 2, y + size * 0.34 + size * (L.subScale ? 0.62 : 0.5), { font: F.t(600, subSize), ls: L.subLs * subSize, color: C.dim, align: 'center' });
    }
  }
  ctx.restore();
  if (useShine) {
    const bw = w * 0.45, cx = lerp(left - bw, left + w + bw, E.inOut2(shine));
    const g = ctx.createLinearGradient(cx - bw / 2, y - h, cx + bw / 2, y + h);
    g.addColorStop(0, 'rgba(233,196,124,0)'); g.addColorStop(0.5, 'rgba(255,236,190,0.95)'); g.addColorStop(1, 'rgba(233,196,124,0)');
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(left - 40, y - h, w + 80, h * 2); ctx.restore();
    const oc2 = ctx; ctx = main;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= alpha; ctx.drawImage(_off, 0, 0); ctx.restore();
  }
}
// load the prepared transparent logo PNGs (see prep_logos.py); typographic fallback if absent
async function loadLogos() {
  const keys = Object.keys(WORDMARKS).concat(['yas']);
  await Promise.all(keys.map(k => new Promise(res => {
    const tryExt = (exts) => {
      if (!exts.length) return res();
      const img = new Image();
      img.onload = () => { LOGO_IMG[k] = img; res(); };
      img.onerror = () => tryExt(exts.slice(1));
      img.src = `logos/${k}.${exts[0]}`;
    };
    tryExt(['png', 'svg']);
  })));
}
