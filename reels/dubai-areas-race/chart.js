'use strict';
// ---------------------------------------------------------------------------
// "Price per sq ft - the 10 most expensive areas of Dubai", Q4 2016 -> Q3 2026.
// A pure function of time: window.draw(t) paints one frame of the bar race (data: chart_data.json, built by data/build_series.py).
// Bars grow from the left, the area name is on the left of each bar, rows re-rank live (whoever has the higher number moves up).
// Branding = Abdullah Ahli's profile picture only (top left, then big in the middle for the closing frame).
// ---------------------------------------------------------------------------
const W = 1080, H = 1920, FPS = 30;
const C = { bg: '#08080A', ink: '#F3EFE6', dim: 'rgba(243,239,230,0.68)', mute: 'rgba(243,239,230,0.36)', faint: 'rgba(243,239,230,0.10)', gold: '#E9C47C', bar: '#0B0B0E' };
// one fixed colour per area (colour follows the area, never its rank); every bar also carries its name, so colour is never the only cue
const PAL = ['#2FCB8B', '#9B7BF0', '#E9C47C', '#F0708A', '#5CC8D6', '#B8E05A', '#E58BE6', '#F29B62', '#7FA7FF', '#7DE3B6', '#C7A6FF', '#F5D76E', '#FF8FA3', '#6FD6C8', '#D4E56B', '#E0A3F0'];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const E = { out3: x => 1 - (1 - x) ** 3, out4: x => 1 - (1 - x) ** 4, inOut3: x => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2) };
const ea = (t, a, b, f = E.out3) => f(prog(t, a, b));

// ---- timeline (seconds) ----
const T = { title: 0.20, draw0: 1.10, draw1: 25.90, end0: 28.40, end1: 30.00, dur: 32.0 };

// ---- layout (inside the Reels safe zone: x 130..950, y 300..~1440) ----
const L = { nameR: 378, barX: 392, barLen: 548, y0: 722, pitch: 50, bh: 40, rows: 10, textX: 335 };
const KICK = 'DUBAI  ·  2016 – 2026';
const TITLE = ['Price per sq ft:', 'top 10 areas'];
const SUB = ['The most expensive areas,', 'quarter by quarter'];
const FOOT = ['Median price per sq ft of sampled Dubai Land Department sales',
              'Apartments, villas and townhouses; 25+ sales in the quarter',
              'Source: Dubai Land Department transactions, via Bayut'];

let ctx, SS = 1, D = null, IMG = {};
const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
function txt(s, x, y, size, weight, color, align = 'left', fam = 'Inter Display') {
  ctx.font = `${weight} ${size}px "${fam}"`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
const fmt = v => Math.round(v).toLocaleString('en-US');

// ---- race progress: 0..1 over draw0..draw1, a touch of ease at both ends ----
function raceP(t) { const u = prog(t, T.draw0, T.draw1); const s = u * u * (3 - 2 * u); return lerp(u, s, 0.30); }
function timeOfP(p) { let a = T.draw0, b = T.draw1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (raceP(m) < p) a = m; else b = m; } return (a + b) / 2; }

// ---- data prep: per area values per quarter (null -> no data), ranks per quarter ----
function prep() {
  const Q = D.quarters.length; D.Q = Q;
  const A = D.areas.map(a => ({ ...a }));
  for (const a of A) a.val = a.v.map(x => (x == null ? null : x));
  for (let k = 0; k < Q; k++) {
    const order = A.filter(a => a.val[k] != null).sort((x, y) => y.val[k] - x.val[k]);
    A.forEach(a => { a.rank = a.rank || new Array(Q).fill(L.rows + 2); });
    order.forEach((a, i) => { a.rank[k] = i; });
  }
  // colours: areas that spend the most quarters in the top 10 get the first (most distinct) colours
  const top = a => a.rank.filter(r => r < L.rows).length;
  A.slice().sort((x, y) => top(y) - top(x)).forEach((a, i) => { a.color = PAL[i % PAL.length]; });
  D.A = A.filter(a => top(a) > 0);                                  // only areas that ever reach the top 10 need to be drawn
}
// value of an area at fractional quarter index f (a missing quarter borrows its neighbour so a bar never grows from nothing mid-list)
function valueAt(a, f) {
  const k = Math.min(D.Q - 1, Math.floor(f)), j = Math.min(D.Q - 1, k + 1), u = sm(f - k);
  let v0 = a.val[k], v1 = a.val[j]; if (v0 == null && v1 == null) return 0; if (v0 == null) v0 = v1; if (v1 == null) v1 = v0;
  return lerp(v0, v1, u);
}
function posAt(a, f) {
  const k = Math.min(D.Q - 1, Math.floor(f)), j = Math.min(D.Q - 1, k + 1), u = sm(prog(f - k, 0.04, 0.96));
  return lerp(a.rank[k], a.rank[j], u);
}

// ---- captions under the date ----
function buildCaptions() { return (D.caps || []).map(c => ({ ...c, t0: timeOfP(D.quarters.indexOf(c.q) / (D.Q - 1)) })); }

function glow(cx, cy, r, rgb, a) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
function ring(cx, cy, r, color, w, alpha = 1) { ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.globalAlpha /= alpha; }
// his picture as the round bubble we use in every reel: gold ring, soft glow, vignette, a slow pulse ring
function avatar(cx, cy, r, pulse, big) {
  const im = IMG.avatar; if (!im || r < 2) return;
  ctx.save();
  glow(cx, cy, r * 1.9, '233,196,124', 0.10 + 0.20 * pulse + 0.25 * big);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = '#111'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, 7); ctx.clip(); ctx.drawImage(im, cx - r, cy - r, 2 * r, 2 * r);
  const g = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(1, 'rgba(8,8,10,0.38)'); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.restore();
  ring(cx, cy, r - 1, C.gold, 5 + 3 * big);
  ring(cx, cy, r + 10 + 6 * pulse, C.gold, 2.5, 0.22 + 0.5 * pulse);
  ctx.restore();
}

function drawRow(a, f, vmax, alphaBase, leadGlow) {
  const pos = posAt(a, f), v = valueAt(a, f); if (v <= 0) return;
  const vis = clamp(L.rows + 0.45 - pos) * clamp(1.6 - Math.max(0, pos - (L.rows - 1)) * 1.0 + 0.9);   // fades out as it slides below the 10th row
  const al = clamp(L.rows + 0.55 - pos, 0, 1); if (al <= 0.01) return;
  const y = L.y0 + pos * L.pitch, len = Math.max(6, v / vmax * L.barLen);
  ctx.globalAlpha = alphaBase * al;
  // name on the left of the bar, shrunk to fit its column
  let size = 28; ctx.font = `800 ${size}px "Inter"`; const wmax = L.nameR - 130, w0 = ctx.measureText(a.short).width; if (w0 > wmax) size = Math.max(21, Math.floor(size * wmax / w0));
  txt(a.short, L.nameR, y + L.bh / 2 + size * 0.36, size, 800, C.ink, 'right', 'Inter');
  // bar (rounded data end), rank-1 gets a soft gold halo
  if (leadGlow > 0.01) { ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 22 * leadGlow; ctx.fillStyle = a.color; rr(L.barX, y, len, L.bh, [0, 12, 12, 0]); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = a.color; rr(L.barX, y, len, L.bh, [0, 12, 12, 0]); ctx.fill();
  // number inside the bar end (dark ink on the light bar)
  const label = fmt(v); ctx.font = '800 29px "Inter Display"'; const lw = ctx.measureText(label).width;
  if (len > lw + 30) txt(label, L.barX + len - 14, y + L.bh / 2 + 10, 29, 800, C.bar, 'right');
  else txt(label, L.barX + len + 12, y + L.bh / 2 + 10, 29, 800, C.ink, 'left');
  ctx.globalAlpha = alphaBase;
}

function draw(t) {
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const Q = D.Q, p = raceP(t), f = p * (Q - 1);
  const endK = ea(t, T.end0, T.end1, E.inOut3);                       // 0 -> 1: chart dims, his picture comes to the middle
  const dim = lerp(1, 0.13, endK), tin = ea(t, T.title, T.title + 0.8);

  // ---- title block ----
  ctx.globalAlpha = dim * tin; const ty = (1 - tin) * 22;
  ctx.letterSpacing = '6px'; txt(KICK, L.textX, 372 + ty, 26, 700, C.dim, 'left', 'Inter'); ctx.letterSpacing = '0px';
  TITLE.forEach((s, i) => txt(s, L.textX, 436 + i * 62 + ty, 56, 800, C.ink));
  ctx.fillStyle = C.gold; ctx.fillRect(L.textX, 520 + ty, 120, 5);
  SUB.forEach((s, i) => txt(s, L.textX, 578 + i * 40 + ty, 31, 700, C.gold, 'left', 'Inter'));
  ctx.globalAlpha = dim;

  // ---- bars ----
  const grid = ea(t, T.draw0 - 0.5, T.draw0 + 0.4);
  if (grid > 0) {
    ctx.globalAlpha = dim * grid; txt('AED per sq ft', L.barX, L.y0 - 20, 26, 700, C.mute, 'left', 'Inter');
    ctx.strokeStyle = 'rgba(243,239,230,0.30)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L.barX - 1, L.y0 - 4); ctx.lineTo(L.barX - 1, L.y0 + L.rows * L.pitch - 4); ctx.stroke();
    // axis scale follows the leader so the longest bar always fills the track
    let top = 0; for (const a of D.A) top = Math.max(top, valueAt(a, f)); const vmax = top * 1.02;
    const fin = ea(t, T.draw0 - 0.1, T.draw0 + 0.9);                  // bars grow in at the start
    ctx.save(); ctx.beginPath(); ctx.rect(120, L.y0 - 8, 840, L.rows * L.pitch + 16); ctx.clip();
    const rows = D.A.map(a => ({ a, pos: posAt(a, f) })).sort((x, y) => y.pos - x.pos);   // lower rows first, so a climbing bar passes over the ones it overtakes
    for (const { a, pos } of rows) drawRow(a, f, vmax, dim * grid, clamp(1 - pos * 2) * 0.8);
    ctx.restore(); ctx.globalAlpha = dim;

    // date ticker + caption
    const di = Math.round(f);
    ctx.globalAlpha = dim * grid; txt(D.quarters[di], 540, 1300, 70, 800, C.ink, 'center');
    for (const c of D.caps) {
      const a = Math.min(prog(t, c.t0, c.t0 + 0.35), 1 - prog(t, c.t0 + c.len - 0.4, c.t0 + c.len)); if (a <= 0) continue;
      ctx.globalAlpha = dim * a; txt(c.text, 540, 1352 + (1 - a) * 6, 31, 700, C.gold, 'center', 'Inter');
    }
  }
  // ---- footnote (fine print, always on) ----
  ctx.globalAlpha = dim * 0.9 * tin;
  FOOT.forEach((s, i) => txt(s, 540, 1396 + i * 28, 23, 700, C.mute, 'center', 'Inter'));
  ctx.globalAlpha = 1;

  // ---- his picture: top left (the round bubble of every reel), then the middle for the closing frame ----
  const sc = ea(t, T.title + 0.1, T.title + 0.9, E.out4);
  const cx = lerp(215, 540, endK), cy = lerp(420, 880, endK), r = lerp(90, 215, endK), pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  if (sc > 0) avatar(cx, cy, r * sc, 0.35 * pulse, endK);
}

async function boot() {
  const q = new URLSearchParams(location.search); SS = +q.get('ss') || 1;
  const cv = document.getElementById('c'); cv.width = Math.round(W * SS); cv.height = Math.round(H * SS); cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx = cv.getContext('2d');
  D = await (await fetch('chart_data.json')).json(); prep(); D.caps = buildCaptions();
  await Promise.all([700, 800].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]));
  await new Promise(res => { const im = new Image(); im.onload = () => { IMG.avatar = im; res(); }; im.onerror = () => { console.error('avatar missing'); res(); }; im.src = 'assets/avatar.png'; });
  window.draw = draw; window.prepare = async () => {}; window.READY = true;
}
boot();
