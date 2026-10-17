'use strict';
// ---------------------------------------------------------------------------
// "Renting + Investing vs. Buying a Home" - Dubai, Jan 2003 -> Sep 2026.
// A pure function of time: window.draw(t) paints one frame of the race chart (data: chart_data.json,
// built by data/build_series.py).  Branding = Abdullah Ahli's profile picture only (top right + closing frame).
// ---------------------------------------------------------------------------
const W = 1080, H = 1920, FPS = 30;
const C = { bg: '#08080A', ink: '#F3EFE6', dim: 'rgba(243,239,230,0.68)', mute: 'rgba(243,239,230,0.36)', faint: 'rgba(243,239,230,0.10)',
            gold: '#E9C47C', rent: '#2FCB8B', eq: '#9B7BF0' };   // rent+invest = green, home equity = violet (validated pair, direct labels)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = { out3: x => 1 - (1 - x) ** 3, out4: x => 1 - (1 - x) ** 4, inOut3: x => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2), lin: x => x };
const ea = (t, a, b, f = E.out3) => f(prog(t, a, b));

// ---- timeline (seconds) ----
const T = { title: 0.20, draw0: 1.10, draw1: 24.60, end0: 27.20, end1: 28.80, dur: 31.0 };

// ---- layout (inside the Reels safe zone: x 130..950, y 300..~1420) ----
const L = { px0: 215, px1: 868, py0: 670, py1: 1130, labelRight: 950, textX: 335 };
const MON = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
const KICK = 'DUBAI  ·  2003 – 2026';
const TITLE = ['Renting + Investing', 'vs. Buying a Home'];
const SUB = ['What happened to your money', 'if you started in January 2003'];
const FOOT = ['AED 1M home, Jan 2003: 20% down + 6% fees = AED 260K',
              'Equity only: the rent saved by owning is not counted',
              'Dashed line = estimated between REIDIN index points',
              'Sources: REIDIN, Dubai Land Dept, S&P 500 total return'];

let ctx, SS = 1, D = null, IMG = {};
const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
const money = v => (v >= 1e6 ? 'AED ' + (v / 1e6).toFixed(2) + 'M' : 'AED ' + Math.round(v / 1e3) + 'K');
const axisLbl = v => (v >= 1e6 ? (v / 1e6).toFixed(v % 1e6 ? 1 : 0) + 'M' : Math.round(v / 1e3) + 'K');
function txt(s, x, y, size, weight, color, align = 'left', fam = 'Inter Display') {
  ctx.font = `${weight} ${size}px "${fam}"`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
const at = (arr, f) => { const i = Math.min(arr.length - 1, Math.floor(f)), j = Math.min(arr.length - 1, i + 1); return lerp(arr[i], arr[j], f - i); };

// ---- progress of the race: 0..1 over draw0..draw1, a touch of ease at both ends ----
function raceP(t) { const u = prog(t, T.draw0, T.draw1); const s = u * u * (3 - 2 * u); return lerp(u, s, 0.35); }
function timeOfP(p) { let a = T.draw0, b = T.draw1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (raceP(m) < p) a = m; else b = m; } return (a + b) / 2; }

// ---- captions under the date (each shows for a few seconds from the month it is about) ----
function buildCaptions() {
  const idx = k => D.months.indexOf(k);
  const caps = [{ m: '2003-01', text: 'Dubai had opened to foreign buyers in 2002', len: 3.6 },
                { m: '2008-08', text: '2008: Dubai prices peak, then fall about 30%', len: 2.9 }];
  let prev = D.equity[0] > D.renter[0] ? 'eq' : 'rn'; D.cross = [];   // lead changes, found in the data
  for (let i = 0; i < D.months.length; i++) {
    const lead = D.equity[i] > D.renter[i] ? 'eq' : 'rn';
    if (prev && lead !== prev) D.cross.push({ i, lead });
    if (prev && lead !== prev && i > 24) { caps.push({ m: D.months[i], text: `${MON[+D.months[i].slice(5) - 1]} ${D.months[i].slice(0, 4)}: ${lead === 'rn' ? 'S&P 500 pulls ahead of home equity' : 'home equity takes the lead again'}`, len: 3.0 }); }
    prev = lead;
  }
  caps.sort((a, b) => idx(a.m) - idx(b.m));
  caps.forEach(c => { c.t0 = c.m === '2003-01' ? T.draw0 + 0.15 : timeOfP(idx(c.m) / (D.months.length - 1)); });
  D.cross.forEach(c => { c.t = timeOfP((c.i - 0.5) / (D.months.length - 1)); });
  return caps;
}

const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const setAlpha = (n, a0, a1, b0, b1) => sm(prog(n, a0, a1)) * (1 - sm(prog(n, b0, b1)));   // tick set visible while its tick count n is in [a1, b0], fading at both ends
function leadSign(t) {                                              // +1 while home equity leads, -1 while the renter leads; swaps over 0.36 s at each crossing
  let s = D.equity[0] > D.renter[0] ? 1 : -1;
  for (const c of D.cross) { const to = c.lead === 'eq' ? 1 : -1, k = sm(prog(t, c.t - 0.18, c.t + 0.18)); if (t < c.t - 0.18) break; s = lerp(s, to, k); if (t < c.t + 0.18) break; s = to; }
  return s;
}
function drawGrid(f, vmax, span) {
  // y gridlines: several tick sets cross-faded by how close their tick count is to ~4
  const steps = [50e3, 100e3, 200e3, 500e3, 1e6, 2e6];
  for (const s of steps) {
    const w = setAlpha(vmax / s, 2.3, 3.0, 5.2, 6.2); if (w <= 0.02) continue;
    for (let v = s; v < vmax * 0.98; v += s) {
      const y = L.py1 - v / vmax * (L.py1 - L.py0);
      ctx.globalAlpha = w * 0.9; ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L.px0, y); ctx.lineTo(L.px1 + 8, y); ctx.stroke();
      txt(axisLbl(v), L.px0 - 14, y + 10, 28, 700, C.mute, 'right', 'Inter');
    }
  }
  ctx.globalAlpha = 1;
  // x labels: years, tick step chosen from the visible span, cross-faded the same way
  for (const s of [1, 2, 5, 10]) {
    const n = span / 12 / s; const w = setAlpha(n, 2.0, 2.7, 5.0, 5.8); if (w <= 0.02) continue;
    for (let k = 0; k * s * 12 <= f + 0.01; k++) {
      const x = L.px0 + k * s * 12 / span * (L.px1 - L.px0);
      ctx.globalAlpha = w; txt(String(2003 + k * s), x, L.py1 + 44, 28, 700, C.mute, k === 0 ? 'left' : 'center', 'Inter');
      ctx.strokeStyle = C.mute; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, L.py1); ctx.lineTo(x, L.py1 + 9); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(243,239,230,0.42)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L.px0, L.py0 - 6); ctx.lineTo(L.px0, L.py1); ctx.lineTo(L.px1 + 8, L.py1); ctx.stroke();
}

function plotLine(arr, f, X, Y, color, dashUntil) {
  const pts = []; const i0 = Math.floor(f);
  for (let i = 0; i <= i0; i++) pts.push([X(i), Y(arr[i])]);
  if (f > i0) pts.push([X(f), Y(at(arr, f))]);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = 7.5;
  ctx.shadowColor = color; ctx.shadowBlur = 14;
  const stroke = (a, b, dashed) => { if (b - a < 1) return; ctx.setLineDash(dashed ? [15, 11] : []); ctx.beginPath(); for (let i = a; i <= b; i++) i === a ? ctx.moveTo(...pts[i]) : ctx.lineTo(...pts[i]); ctx.stroke(); };
  if (dashUntil == null) stroke(0, pts.length - 1, false);
  else { const k = Math.min(dashUntil, pts.length - 1); stroke(0, k, true); if (pts.length - 1 > k) stroke(k, pts.length - 1, false); }
  ctx.setLineDash([]); ctx.shadowBlur = 0;
  return pts[pts.length - 1];
}

function tipLabel(name, value, color, tipX, tipY, off, alpha) {
  const w1 = (ctx.font = '700 31px "Inter"', ctx.measureText(name).width), w2 = (ctx.font = '800 46px "Inter Display"', ctx.measureText(value).width);
  const bw = Math.max(w1, w2) + 40, bh = 106, bx = L.labelRight - bw, by = clamp(tipY + off - bh / 2, L.py0 - 36, L.py1 - bh + 6);
  ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(8,8,10,0.86)'; rr(bx, by, bw, bh, 20); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; rr(bx, by, bw, bh, 20); ctx.stroke();
  txt(name, bx + bw - 20, by + 38, 31, 700, color, 'right', 'Inter'); txt(value, bx + bw - 20, by + 88, 46, 800, C.ink, 'right');
  ctx.globalAlpha = 1;
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

function draw(t) {
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const N = D.months.length, p = raceP(t), f = p * (N - 1);
  const endK = ea(t, T.end0, T.end1, E.inOut3);                       // 0 -> 1: chart dims, his picture comes to the middle
  const dim = lerp(1, 0.13, endK);
  const tin = ea(t, T.title, T.title + 0.8);

  ctx.globalAlpha = dim;
  // ---- title block ----
  ctx.globalAlpha = dim * tin; const ty = (1 - tin) * 22;
  ctx.letterSpacing = '6px'; txt(KICK, L.textX, 372 + ty, 26, 700, C.dim, 'left', 'Inter'); ctx.letterSpacing = '0px';
  TITLE.forEach((s, i) => txt(s, L.textX, 436 + i * 62 + ty, 56, 800, C.ink));
  ctx.fillStyle = C.gold; ctx.fillRect(L.textX, 520 + ty, 120, 5);
  SUB.forEach((s, i) => txt(s, L.textX, 578 + i * 40 + ty, 31, 700, C.gold, 'left', 'Inter'));
  ctx.globalAlpha = dim;

  // ---- chart ----
  const span = Math.max(f, 9), vis = Math.min(N - 1, Math.floor(f));
  let mx = 0; for (let i = 0; i <= vis; i++) mx = Math.max(mx, D.equity[i], D.renter[i]); mx = Math.max(mx, at(D.equity, f), at(D.renter, f));
  const vmax = Math.max(340e3, mx * 1.30);
  const X = i => L.px0 + i / span * (L.px1 - L.px0), Y = v => L.py1 - v / vmax * (L.py1 - L.py0);
  const grid = ea(t, T.draw0 - 0.5, T.draw0 + 0.3);
  ctx.globalAlpha = dim * grid; txt('AED', L.px0 - 14, L.py0 - 22, 26, 700, C.mute, 'right', 'Inter'); drawGrid(f, vmax, span); ctx.globalAlpha = dim;
  if (t >= T.draw0 - 0.05) {
    ctx.save(); ctx.beginPath(); ctx.rect(L.px0 - 6, L.py0 - 50, L.px1 - L.px0 + 40, L.py1 - L.py0 + 56); ctx.clip();
    const estIdx = D.months.indexOf(D.est_until);
    const tipR = plotLine(D.renter, f, X, Y, C.rent, null);
    const tipE = plotLine(D.equity, f, X, Y, C.eq, estIdx);
    for (const [tip, col] of [[tipR, C.rent], [tipE, C.eq]]) {                // tip dots + a slow pulse once the race is over
      const pulse = t > T.draw1 ? ((t - T.draw1) * 0.9) % 1 : 0;
      if (t > T.draw1) { ctx.globalAlpha = dim * (1 - pulse) * 0.5; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tip[0], tip[1], 12 + 26 * pulse, 0, 7); ctx.stroke(); ctx.globalAlpha = dim; }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tip[0], tip[1], 12, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 3.5; ctx.stroke();
    }
    ctx.restore();
    // end labels: the higher line's label sits above its tip, the other below; they trade places smoothly when the lines cross
    const vR = at(D.renter, f), vE = at(D.equity, f), sE = leadSign(t);          // sE = +1: home equity is the higher line
    const lab = ea(t, T.draw0, T.draw0 + 0.6);
    tipLabel('Home Equity', money(vE), C.eq, tipE[0], tipE[1], -sE * 86, dim * lab);
    tipLabel('Rent + Invest', money(vR), C.rent, tipR[0], tipR[1], sE * 86, dim * lab);

    // date ticker + caption
    const di = Math.round(f), y = +D.months[di].slice(0, 4), m = +D.months[di].slice(5) - 1;
    txt(`${MON[m]} ${y}`, 540, 1252, 64, 800, C.ink, 'center');
    for (const c of D.caps) {
      const a = Math.min(prog(t, c.t0, c.t0 + 0.35), 1 - prog(t, c.t0 + c.len - 0.4, c.t0 + c.len)); if (a <= 0) continue;
      ctx.globalAlpha = dim * a; txt(c.text, 540, 1302 + (1 - a) * 6, 31, 700, C.gold, 'center', 'Inter');
    }
    ctx.globalAlpha = dim;
  }
  // ---- footnote (fine print, always on) ----
  ctx.globalAlpha = dim * 0.9 * tin;
  FOOT.forEach((s, i) => txt(s, 540, 1352 + i * 29, 24, 700, C.mute, 'center', 'Inter'));
  ctx.globalAlpha = 1;

  // ---- his picture: top left (the round bubble of every reel), then the middle for the closing frame ----
  const sc = ea(t, T.title + 0.1, T.title + 0.9, E.out4);
  const cx = lerp(215, 540, endK), cy = lerp(420, 880, endK), r = lerp(90, 215, endK), pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  if (sc > 0) avatar(cx, cy, r * sc, 0.35 * pulse, endK);
}

async function boot() {
  const q = new URLSearchParams(location.search); SS = +q.get('ss') || 1;
  const cv = document.getElementById('c'); cv.width = Math.round(W * SS); cv.height = Math.round(H * SS); cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx = cv.getContext('2d');
  D = await (await fetch('chart_data.json')).json(); D.caps = buildCaptions();
  await Promise.all([700, 800].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]));
  await new Promise(res => { const im = new Image(); im.onload = () => { IMG.avatar = im; res(); }; im.onerror = () => { console.error('avatar missing'); res(); }; im.src = 'assets/avatar.png'; });
  window.draw = draw; window.prepare = async () => {}; window.READY = true;
}
boot();
