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
const PAL = ['#2FCB8B', '#9B7BF0', '#E9C47C', '#F0708A', '#5CC8D6', '#B8E05A', '#E58BE6', '#F29B62', '#7FA7FF', '#7DE3B6', '#C7A6FF', '#F5D76E', '#FF8FA3', '#6FD6C8', '#D4E56B', '#E0A3F0', '#FF7A7A', '#8DE0A3', '#B9A3FF', '#FFC27A'];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const E = { out3: x => 1 - (1 - x) ** 3, out4: x => 1 - (1 - x) ** 4, inOut3: x => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2) };
const ea = (t, a, b, f = E.out3) => f(prog(t, a, b));

// ---- timeline (seconds) ----
const T = { title: 0.20, draw0: 1.10, draw1: 32.30, end0: 34.90, end1: 36.50, dur: 38.5 };   // 39 quarter steps of 0.8 s: all bars move together for half a step, then rest

// ---- layout (inside the Reels safe zone: x 130..950, y 300..~1440) ----
const L = { nameR: 378, barX: 392, barLen: 548, y0: 722, pitch: 50, bh: 40, rows: 10, k: 1, textX: 335 };
const KICK = 'DUBAI  ·  2016 – 2026';
const TITLE = ['Price per sq ft:', 'top 10 areas'];
const SUB = ['The most expensive areas,', 'quarter by quarter'];
const FOOT = ['Median price per sq ft of sampled Dubai Land Department sales',
              'Apartments, villas and townhouses; rolling 12-month median',
              'Source: Dubai Land Department transactions, via Bayut'];

let ctx, SS = 1, D = null, IMG = {};
const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
function txt(s, x, y, size, weight, color, align = 'left', fam = 'Inter Display') {
  ctx.font = `${weight} ${size}px "${fam}"`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
const fmt = v => Math.round(v).toLocaleString('en-US');

// ---- race progress: one quarter per step; in each step every bar moves to its new value / row during the first MOVE of the step, then rests ----
const MOVE = 0.50, mv = u => sm(prog(u, 0, MOVE));
const fAt = t => clamp((t - T.draw0) / (T.draw1 - T.draw0)) * (D.Q - 1);          // fractional quarter index at time t
const timeOfP = p => T.draw0 + p * (T.draw1 - T.draw0);

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
  // colours: greedy colouring - an area gets the palette colour that clashes least with the areas it shares the top 12 with (the most prominent areas choose first)
  const top = a => a.rank.filter(r => r < L.rows).length, near = (a, k) => a.rank[k] < L.rows + 2;
  const order = A.slice().sort((x, y) => top(y) - top(x)), done = [];
  for (const a of order) {
    if (top(a) === 0) { a.color = PAL[0]; continue; }
    const cost = PAL.map(() => 0);
    for (const b of done) { let c = 0; for (let k = 0; k < Q; k++) if (near(a, k) && near(b, k)) c++; if (c) cost[PAL.indexOf(b.color)] += c; }
    a.color = PAL[cost.indexOf(Math.min(...cost))]; done.push(a);
  }
  D.A = A.filter(a => top(a) > 0);                                  // only areas that ever reach the top 10 need to be drawn
}
// effective value of an area at fractional quarter index f: a quarter without data borrows its neighbour's value (so a bar never has a hole) but is scaled by
// availability (0..1), so an area grows in / shrinks away smoothly when its data starts or ends
function valueAt(a, f) {
  const k = Math.min(D.Q - 1, Math.floor(f)), j = Math.min(D.Q - 1, k + 1), u = mv(f - k);
  let v0 = a.val[k], v1 = a.val[j]; const h0 = v0 == null ? 0 : 1, h1 = v1 == null ? 0 : 1; if (!h0 && !h1) return 0;
  if (v0 == null) v0 = v1; if (v1 == null) v1 = v0;
  return lerp(v0, v1, u) * lerp(h0, h1, u);
}
// row position of an area: it slides from its rank in quarter k to its rank in quarter k+1 together with every other bar
function posAt(a, f) { const k = Math.min(D.Q - 1, Math.floor(f)), j = Math.min(D.Q - 1, k + 1); return lerp(a.rank[k], a.rank[j], mv(f - k)); }

// ---- captions under the date: every line is computed from the data (first leader, lead changes that last, what the 10th place costs then and now) ----
function buildCaptions() {
  const Q = D.Q, caps = [], lead = [], v10 = [];
  for (let k = 0; k < Q; k++) {
    const s = D.A.filter(a => a.val[k] != null).sort((x, y) => y.val[k] - x.val[k]);
    lead.push(s[0]); v10.push(s[9] ? s[9].val[k] : null);
  }
  const tq = k => timeOfP((k - 0.7) / (Q - 1));                       // a new leader is on top about two thirds of the way through the move into its quarter
  caps.push({ t0: T.draw0 + 0.25, len: 3.0, text: `${lead[0].short} starts in the lead` });
  let last = caps[0].t0;
  for (let k = 1; k < Q - 3; k++) {
    if (lead[k] !== lead[k - 1] && lead[k + 1] === lead[k] && tq(k) - last >= 3.3 && tq(k) > caps[0].t0 + 3.4) { caps.push({ t0: tq(k), len: 2.6, text: `${lead[k].short} takes the lead` }); last = tq(k); }
  }
  const e = { t0: T.draw1 - 0.6, len: T.end0 - T.draw1 + 0.6, text: `10th place: AED ${fmt(v10[0])} in 2016, AED ${fmt(v10[Q - 1])} now` };
  if (caps.length > 1 && caps[caps.length - 1].t0 + caps[caps.length - 1].len > e.t0 - 0.2) caps.pop();
  caps.push(e); return caps;
}

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

function drawRow(a, v, pos, vmax, alphaBase, leadGlow) {
  if (v <= 0.5) return;
  const al = clamp(L.rows - 0.1 - pos, 0, 1); if (al <= 0.01) return;      // a bar sliding below the last row fades out before the edge
  const y = L.y0 + pos * L.pitch, len = Math.max(6, v / vmax * L.barLen);
  ctx.globalAlpha = alphaBase * al;
  // name on the left of the bar, shrunk to fit its column
  let size = Math.round(28 * L.k); ctx.font = `800 ${size}px "Inter"`; const wmax = L.nameR - 130, w0 = ctx.measureText(a.short).width; if (w0 > wmax) size = Math.max(16, Math.floor(size * wmax / w0));
  txt(a.short, L.nameR, y + L.bh / 2 + size * 0.36, size, 800, C.ink, 'right', 'Inter');
  // bar (rounded data end); the leader gets a soft gold halo
  const rad = [0, L.bh * 0.3, L.bh * 0.3, 0];
  if (leadGlow > 0.01) { ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 22 * leadGlow; ctx.fillStyle = a.color; rr(L.barX, y, len, L.bh, rad); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = a.color; rr(L.barX, y, len, L.bh, rad); ctx.fill();
  // number inside the bar end (dark ink on the light bar)
  const vs = Math.round(29 * L.k), label = fmt(v); ctx.font = `800 ${vs}px "Inter Display"`; const lw = ctx.measureText(label).width;
  if (len > lw + 30) txt(label, L.barX + len - 14, y + L.bh / 2 + vs * 0.35, vs, 800, C.bar, 'right');
  else txt(label, L.barX + len + 12, y + L.bh / 2 + vs * 0.35, vs, 800, C.ink, 'left');
  ctx.globalAlpha = alphaBase;
}

function draw(t) {
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const Q = D.Q, f = fAt(t);
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
    const vals = D.A.map(a => valueAt(a, f)); const top = Math.max(...vals), vmax = top * 1.02;
    const pos = D.A.map(a => posAt(a, f));
    ctx.save(); ctx.beginPath(); ctx.rect(120, L.y0 - 8, 840, L.rows * L.pitch + 4); ctx.clip();
    D.A.map((a, i) => i).sort((x, y) => pos[y] - pos[x])               // lower rows first, so a climbing bar passes over the ones it overtakes
      .forEach(i => drawRow(D.A[i], vals[i], pos[i], vmax, dim * grid, clamp(1 - pos[i] * 2) * 0.8));
    ctx.restore(); ctx.globalAlpha = dim;

    // date ticker + caption
    const kq = Math.min(Q - 1, Math.floor(f)), di = mv(f - kq) > 0.5 ? Math.min(Q - 1, kq + 1) : kq;   // the quarter label flips half-way through the move
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
  const n = +q.get('layout') || 10; L.rows = n; L.pitch = 500 / n; L.bh = Math.round(L.pitch * 0.8); L.k = Math.min(1, 1.1 * 10 / n); TITLE[1] = `top ${n} areas`;   // number of bars on screen: 10 default; text scales down when more
  const cv = document.getElementById('c'); cv.width = Math.round(W * SS); cv.height = Math.round(H * SS); cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx = cv.getContext('2d');
  D = await (await fetch('chart_data.json')).json(); prep(); D.caps = buildCaptions();
  await Promise.all([700, 800].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]));
  await new Promise(res => { const im = new Image(); im.onload = () => { IMG.avatar = im; res(); }; im.onerror = () => { console.error('avatar missing'); res(); }; im.src = 'assets/avatar.png'; });
  window.draw = draw; window.prepare = async () => {}; window.READY = true;
}
boot();
