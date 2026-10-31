'use strict';
// ---------------------------------------------------------------------------
// "Someone tells you Dubai property has crashed. Ask them three things" - HeyGen 3d9c25be (56.2 s, English).  60 fps.
// The roadmap style with the real page (marker on the exact words) and two honest bars: what the AED 574 bn is made of, and the off-plan share.
// His face SMALL the whole time.
// Facts (research 31 Oct 2026, scratchpad research_macro.md): Emirates 24|7, 1 Oct 2026 (survey of Dubai Land Department data): Jan-Sep 2026
// 165,018 transactions worth Dh574.12 bn; sales about Dh379.4 bn ("second highest ... after the figure achieved in 2025"); off-plan Dh183.32 bn
// from 84,090 transactions; mortgages Dh151.13 bn; gifts ("donations") Dh43.6 bn.  379.4 + 151.13 + 43.6 = 574.13.  Off-plan share calculated:
// 48% of sales value (183.32 / 379.4), 68% of sales deals (84,090 / 123,416).  Not an official DLD release.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  const DARK_PLATE = new Set([]);
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    ask: A('ask'), which1: A('which'), which2: A('which', 4), compared: A('compared'), reporting: A('reporting'), total: A('total'), m574: A('AED 574 billion'),
    sales: A('sales'), m379: A('AED 379 billion'), mortgages: A('mortgages'), gifts: A('gifts'), separate: A('separate'), those: A('those'), dont: A("don't"),
    a1: A('a', 26), owners: A('owners'), buildings: A('buildings'), other: A('other'), the3: A('the', 34.5), offplan1: A('off-plan'), high: A('high'), what: A('what', 39),
    guarantee: A('guarantee'), so: A('so', 42.5), crash: A('crash', 44), guaranteed: A('guaranteed'), compare: A('compare'), completed: A('completed'), rental: A('rental'),
    upcoming: A('upcoming'), exact: A('exact'), comment: A('comment'), CRASH: A('crash', 52), area: A('area', 53), lets: A("let's"),
  };
  const FACE_SEGS = [];
  const H0 = [0, K.reporting - 0.12], P1 = [H0[1], K.sales - 0.15], B1 = [P1[1], K.those - 0.12], R1 = [B1[1], K.a1 - 0.12], R2 = [R1[1], K.the3 - 0.12],
    P2 = [R2[1], K.high - 0.15], O1 = [P2[1], K.so - 0.1], F1 = [O1[1], K.compare - 0.12], F2 = [F1[1], K.comment - 0.12];

  // ---------------------------------------------------------------- drawing pieces
  const imgCover = (id, x, y, w, h, r, zoom = 1, fx = 0.5, fy = 0.5) => {         // image filling a rounded box (object-fit: cover), focus fx/fy
    if (!ok(id)) return; const im = IMG[id], s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * zoom, dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    ctx.save(); rr(x, y, w, h, r); ctx.clip(); ctx.drawImage(im, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh); ctx.restore();
  };
  const imgContain = (id, x, y, w, h) => { if (!ok(id)) return; const im = IMG[id], s = Math.min(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * s, dh = im.naturalHeight * s; ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); };
  const plate = (key, x, y, w, h) => {                                             // the company logo on its plate
    const dark = DARK_PLATE.has(key); rr(x, y, w, h, 16); ctx.fillStyle = dark ? '#101114' : '#FFFFFF'; ctx.fill();
    if (dark) { ctx.strokeStyle = GOLD_A + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); }
    imgContain('L_' + key, x + 16, y + 12, w - 32, h - 24);
  };
  const box = (x, y, w, h, r = 26, edge = GOLD_A + '0.32)') => {                   // a solid card (no backdrop blur: cheap at 60 fps)
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30 * SS; ctx.shadowOffsetY = 10 * SS; rr(x, y, w, h, r); ctx.fillStyle = 'rgba(19,19,23,0.96)'; ctx.fill(); ctx.restore();
    rr(x, y, w, h, r); ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke();
  };
  const pop = (t, a, d = 0.55) => ea(t, a, a + d, E.back);
  // a person: round photo, gold ring that closes as he appears, name and title under it
  const person = (t, n) => {
    const e = pop(t, n.t, 0.7); if (e <= 0.003) return; const r = n.r || 112, ap = clamp(ea(t, n.t, n.t + 0.3) * 1.2);
    ctx.save(); ctx.globalAlpha *= ap; ctx.translate(n.x, n.y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e));
    glow(0, 0, r * 2.2, '233,196,124', 0.16 * ap);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); if (ok(n.img)) ctx.drawImage(IMG[n.img], -r, -r, 2 * r, 2 * r); ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = GOLD; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ea(t, n.t + 0.1, n.t + 0.9, E.inOut2)); ctx.stroke();
    ctx.restore();
    if (n.name) { const f = F.d(800, n.small ? 26 : 40), e2 = ea(t, n.t + 0.25, n.t + 0.7, E.out4); ctx.save(); ctx.globalAlpha *= e2; ctx.translate(0, (1 - e2) * 14);
      T(n.name, n.x, n.y + r + (n.small ? 48 : 66), { font: f, ls: 1, color: '#FFFFFF', sx: fit(n.name, f, n.small ? 250 : SAFE.w, 1) });
      if (n.title) T(n.title, n.x, n.y + r + (n.small ? 80 : 106), { font: F.d(700, n.small ? 20 : 26), ls: 4, color: GOLD, sx: fit(n.title, F.d(700, 26), SAFE.w, 4) }); ctx.restore(); }
  };
  // an entity card: wide = logo plate left, text right; narrow = plate on top, text below; photo = landmark picture with the logo in a corner
  const card = (t, n) => {
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2) * (n.dim ? 1 - 0.55 * ea(t, n.dim, n.dim + 0.5) : 1); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    if (n.photo) {
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30 * SS; ctx.shadowOffsetY = 10 * SS; rr(x0, y0, w, h, 24); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
      imgCover(n.photo, x0, y0, w, h, 24, 1 + 0.06 * prog(t, n.t, n.t + 8), n.fx ?? 0.5, n.fy ?? 0.5);
      const g = ctx.createLinearGradient(0, y0 + h * 0.35, 0, y0 + h); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(1, 'rgba(8,8,10,0.92)'); ctx.save(); rr(x0, y0, w, h, 24); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h); ctx.restore();
      rr(x0, y0, w, h, 24); ctx.strokeStyle = GOLD_A + '0.45)'; ctx.lineWidth = 2; ctx.stroke();
      if (n.logo) plate(n.logo, x0 + 16, y0 + 16, Math.min(190, w * 0.48), 74);
      const f = F.d(800, n.fs || 32); T(n.title, x0 + 26, y0 + h - (n.sub ? 54 : 28), { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(n.title, f, w - 52, 1) });
      if (n.sub) T(n.sub, x0 + 26, y0 + h - 22, { font: F.d(700, 21), ls: 3, color: n.subC || GOLD, align: 'left', alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 52, 3) });
      if (n.credit) T(n.credit, x0 + w - 14, y0 + 26, { font: F.d(700, 15), ls: 1, color: 'rgba(255,255,255,0.75)', align: 'right' });
    } else if (w >= 600) {
      box(x0, y0, w, h, 26, n.edge || GOLD_A + '0.32)'); const pw = n.pw || 230, ph = h - 40; if (n.logo) plate(n.logo, x0 + 20, y0 + 20, pw, ph); else { rr(x0 + 20, y0 + 20, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x0 + 20 + pw / 2, y0 + h / 2 + 16, { font: F.d(800, 46), ls: 3, color: n.monoC || GOLD }); }
      const tx = x0 + pw + 50, mw = x0 + w - 30 - tx, f = F.d(800, n.fs || 34), lines = n.title.split('\n'), ty = y0 + h / 2 + (n.sub ? -10 : 12) - (lines.length - 1) * 21;
      lines.forEach((l, i) => T(l, tx, ty + i * 42, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(l, f, mw, 1) }));
      if (n.sub) { const e3 = ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.45, E.out4), f3 = F.d(700, 22); ctx.save(); ctx.globalAlpha *= e3; n.sub.split('\n').forEach((l, i) => T(l, tx, ty + (lines.length - 1) * 42 + 44 + i * 30, { font: f3, ls: 2, color: n.subC || GOLD, align: 'left', sx: fit(l, f3, mw, 2) })); ctx.restore(); }
    } else {
      box(x0, y0, w, h); const ph = n.ph || 86; if (n.logo) plate(n.logo, x0 + 18, y0 + 18, w - 36, ph); else { rr(x0 + 18, y0 + 18, w - 36, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x, y0 + 18 + ph / 2 + 16, { font: F.d(800, 44), ls: 4, color: GOLD }); }
      const f = F.d(800, n.fs || 30), lines = n.title.split('\n'), ty = y0 + 18 + ph + 46;
      lines.forEach((l, i) => T(l, x, ty + i * 36, { font: f, ls: 1, color: '#FFFFFF', sx: fit(l, f, w - 36, 1) }));
      if (n.sub) T(n.sub, x, ty + (lines.length - 1) * 36 + 36, { font: F.d(700, 21), ls: 3, color: GOLD, alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 36, 3) });
    }
    ctx.restore();
  };
  const tag = (t, n) => { const e = pop(t, n.t, 0.45); if (e <= 0.003) return; const { x, y, w, h } = n; ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x, y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e));
    box(-w / 2, -h / 2, w, h, h / 2, GOLD_A + '0.55)'); dot(-w / 2 + 44, 0, 24, C.goldSoft); icon(n.icon, -w / 2 + 44, 0, 13, { p: ea(t, n.t, n.t + 0.5), color: GOLD, w: 3 });
    T(n.title, -w / 2 + 84, 12, { font: F.d(800, 32), ls: 2, color: '#FFFFFF', align: 'left', sx: fit(n.title, F.d(800, 32), w - 110, 2) }); ctx.restore(); };
  // a line that draws itself with a bright head, then keeps a soft pulse running along it; label = a pill on it
  const pointAt = (pts, u) => { const L = polyLen(pts) * clamp(u); let acc = 0; for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + s >= L) { const k = s ? (L - acc) / s : 0; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } acc += s; } return pts[pts.length - 1]; };
  const edge = (t, e) => {
    const p = ea(t, e.t, e.t + (e.d || 0.55), E.inOut2); if (p <= 0.003) return; const gold = e.c !== 'w', col = gold ? GOLD : '#F3EFE6';
    ctx.save(); if (e.dim) ctx.globalAlpha *= 1 - 0.55 * ea(t, e.dim, e.dim + 0.5);
    strokePoly(e.pts, p, { color: gold ? GOLD_A + '0.25)' : WHITE_A + '0.18)', w: 12 }); strokePoly(e.pts, p, { color: col, w: 4 });
    const hd = pointAt(e.pts, p); if (p < 0.999) { glow(hd[0], hd[1], 40, gold ? '233,196,124' : '243,239,230', 0.55); dot(hd[0], hd[1], 7, '#FFFFFF'); }
    else { const u = ((t - e.t) / 1.7) % 1, q = pointAt(e.pts, u); glow(q[0], q[1], 26, gold ? '233,196,124' : '243,239,230', 0.35 * Math.sin(Math.PI * u)); dot(q[0], q[1], 4.5, gold ? '#FFF3D6' : '#FFFFFF', 0.8 * Math.sin(Math.PI * u)); }
    if (e.label) { const la = ea(t, e.lt ?? e.t + 0.25, (e.lt ?? e.t + 0.25) + 0.35, E.out4); if (la > 0.003) { const [lx, ly] = e.at || pointAt(e.pts, 0.5), f = F.d(800, 22), w = M(e.label, f, 3) + 40;
      ctx.save(); ctx.globalAlpha *= la; ctx.translate(lx, ly); ctx.scale(lerp(0.85, 1, la), lerp(0.85, 1, la)); rr(-w / 2, -21, w, 42, 21); ctx.fillStyle = gold ? '#1A1712' : '#141417'; ctx.fill(); ctx.strokeStyle = gold ? GOLD : WHITE_A + '0.6)'; ctx.lineWidth = 2; ctx.stroke();
      T(e.label, 0, 8, { font: f, ls: 3, color: gold ? GOLD : '#FFFFFF' }); ctx.restore(); } }
    ctx.restore();
  };
  // a section: nodes and edges in "world" coordinates, a camera that walks down (keys [abs t, cam y, zoom]); everything fades in/out with the section
  const SECT = [];
  const section = (T0, cam, nodes, edges) => SECT.push({ T: T0, cam, nodes, edges });
  const camAt = (keys, t) => { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++; const [ta, ya, za] = keys[i], [tb, yb, zb] = keys[Math.min(i + 1, keys.length - 1)], u = tb > ta ? E.inOut3(clamp((t - ta) / (tb - ta))) : 1; return [lerp(ya, yb, u), lerp(za ?? 1, zb ?? 1, u)]; };
  const drawSection = (t, s) => {
    const al = ea(t, s.T[0] - 0.05, s.T[0] + 0.35, E.out3) * (1 - ea(t, s.T[1] - 0.15, s.T[1] + 0.3, E.in2)); if (al <= 0.003) return;
    const [cy, z] = camAt(s.cam, t), drift = (1 - ea(t, s.T[0] - 0.05, s.T[0] + 0.6, E.out4)) * 40 - ea(t, s.T[1] - 0.15, s.T[1] + 0.3, E.in2) * 40;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(CX, 800 + drift); ctx.scale(z, z); ctx.translate(-CX, -cy);
    for (const e of s.edges) edge(t, e);
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : n.kind === 'tile' ? tile : card)(t, n);
    ctx.restore();
  };


  // a tile: a big icon in a ring, the label under it (the "what to plan" grid)
  const tile = (t, n) => {
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    box(x0, y0, w, h, 26, GOLD_A + '0.45)'); const nl = n.title.split('\n').length, tTop = y0 + h - 60 - (nl - 1) * 38, r = Math.min(46, (tTop - y0 - 18) / 2), cy = Math.min(y0 + 72, (y0 + 8 + tTop) / 2);   // two-line labels push the icon up
    glow(x, cy, 70 * r / 46, '233,196,124', 0.18); dot(x, cy, r, '#1A1712'); ring(x, cy, r, { color: GOLD, w: 3 });
    icon(n.icon, x, cy, 24 * r / 46, { p: ea(t, n.t + 0.1, n.t + 0.7), color: GOLD, w: 4 });
    const f = F.d(800, 32); n.title.split('\n').forEach((l, i, a) => T(l, x, y0 + h - 34 - (a.length - 1 - i) * 38, { font: f, ls: 1, color: '#FFFFFF', sx: fit(l, f, w - 30, 1) }));
    ctx.restore();
  };

  // ---------------------------------------------------------------- pages (marker on the exact words)
  const lineBoxes = (rects) => { const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); } return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]); };
  const page = (id, img, T, stops, marks, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, 0.92, 10]; keys[0] = [0, ...pc]; }
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = []; for (const [pi, t0, t1] of marks) { const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0; for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot }); } }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };
  page('p_574', 'e247_9m', P1, [[P1[0] + 0.1, qy('e247_9m', 0)]], [[0, K.total - 0.1, K.m574 + 0.8]]);
  page('p_off', 'e247_9m', P2, [[P2[0] + 0.1, qy('e247_9m', 2)]], [[2, K.offplan1 - 0.1, P2[1] - 0.3]]);

  // ---------------------------------------------------------------- roadmap branches
  const ST = (T) => [[T[0], 800, 1], [T[1], 812, 1.015]];
  const rows = (t, T0, items) => {                                                    // status rows: ok (teal check), no (red cross), q (amber question)
    const al = win(t, T0[0], T0[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    items.forEach(([y, a, txt, sub, kind]) => { const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -30, 0);
      const col = kind === 'ok' ? TEAL[0] : kind === 'no' ? '#E5484D' : AMBER, colL = kind === 'ok' ? TEAL[1] : kind === 'no' ? RED2 : AMBER;
      box(SAFE.x0, y, SAFE.w, 140, 28, col + '99'); const cx = SAFE.x1 - 70, cy = y + 70, p = ea(t, a + 0.15, a + 0.55);
      dot(cx, cy, 36, col + '2E'); if (kind === 'ok') icon('check', cx, cy + 2, 18, { p, color: col, w: 5 }); else if (kind === 'q') T('?', cx, cy + 16, { font: F.d(800, 46), color: AMBER, alpha: p });
      else { ctx.strokeStyle = RED2; ctx.lineWidth = 6; ctx.lineCap = 'round'; const q = 14; ctx.beginPath(); ctx.moveTo(cx - q, cy - q); ctx.lineTo(cx - q + 2 * q * clamp(p * 2), cy - q + 2 * q * clamp(p * 2)); ctx.stroke(); if (p > 0.5) { const b = clamp(p * 2 - 1); ctx.beginPath(); ctx.moveTo(cx + q, cy - q); ctx.lineTo(cx + q - 2 * q * b, cy - q + 2 * q * b); ctx.stroke(); } }
      T(txt, SAFE.x0 + 40, y + 64, { font: F.d(800, 38), color: '#FFFFFF', align: 'left', sx: fit(txt, F.d(800, 38), SAFE.w - 170) }); T(sub, SAFE.x0 + 40, y + 106, { font: F.d(700, 23), ls: 3, color: colL, align: 'left', sx: fit(sub, F.d(700, 23), SAFE.w - 170, 3) }); ctx.restore(); });
    ctx.restore();
  };
  // the claim, and three questions to ask back
  section(H0, ST(H0), [
    { kind: 'tile', x: 265, y: 960, w: 250, h: 240, icon: 'flag', title: 'WHICH\nAREA?', t: K.which1 - 0.15 },
    { kind: 'tile', x: 540, y: 960, w: 250, h: 240, icon: 'building', title: 'WHICH\nTYPE?', t: K.which2 - 0.15 },
    { kind: 'tile', x: 815, y: 960, w: 250, h: 240, icon: 'chart', title: 'COMPARED\nWITH WHEN?', t: K.compared - 0.15 },
  ], []);
  const claim = (t) => { const al = win(t, H0[0], H0[1] - 0.15); if (al <= 0.003) return; const e = ea(t, 0.1, 0.55, E.back); if (e <= 0.003) return;
    const txt = '“Dubai property has crashed!”', f = F.d(800, 44), w = Math.min(SAFE.w, M(txt, f) + 90), x0 = SAFE.x0, y0 = 640;
    ctx.save(); ctx.globalAlpha *= al * clamp(e); ctx.translate(x0, y0 + 60); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.translate(-x0, -(y0 + 60));
    rr(x0, y0, w, 120, 30); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + 40, y0 + 118); ctx.lineTo(x0 + 34, y0 + 150); ctx.lineTo(x0 + 78, y0 + 118); ctx.closePath(); ctx.fillStyle = C.panel; ctx.fill();
    T(txt, x0 + 45, y0 + 76, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 90) }); ctx.restore();
    T('ASK THEM THREE THINGS', CX, 830, { font: F.d(800, 32), ls: 4, color: GOLD, alpha: al * ea(t, K.ask - 0.1, K.ask + 0.3) }); };
  // what the AED 574 bn is made of: one stacked bar, three separate categories
  const PARTS = [['SALES', 379.4, GOLD, K.sales - 0.1, 'BELOW 2025 · 2ND-HIGHEST ON RECORD'], ['MORTGAGES', 151.13, '#E8E2D4', K.mortgages - 0.1, ''], ['GIFTS', 43.6, BLUE[0], K.gifts - 0.1, '']];
  const stack = (t) => { const al = win(t, B1[0], B1[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const X0 = SAFE.x0, BW = SAFE.w, by = 700, bh = 92, tot = 574.13, gap = 4;
    T('JAN – SEP 2026 · AED 574 BN', CX, 655, { font: F.d(800, 40), ls: 1, color: '#FFFFFF' });
    rr(X0, by, BW, bh, 18); ctx.fillStyle = '#0E0E11'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); rr(X0, by, BW, bh, 18); ctx.clip(); let x = X0;
    PARTS.forEach(([, v, col, a]) => { const w = BW * v / tot, p = ea(t, a, a + 0.7, E.inOut2); ctx.fillStyle = col; ctx.fillRect(x, by, Math.max(0, (w - gap) * p), bh); x += w; }); ctx.restore();
    PARTS.forEach(([name, v, col, a, sub], i) => { const e = ea(t, a + 0.2, a + 0.6, E.out4); if (e <= 0.003) return; const y = 860 + i * 104;
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -24, 0); rr(X0, y - 30, 40, 40, 10); ctx.fillStyle = col; ctx.fill();
      T(name, X0 + 64, y + 2, { font: F.d(800, 38), color: '#FFFFFF', align: 'left' }); T('AED ' + (v >= 100 ? v.toFixed(1) : v.toFixed(1)) + ' BN', X0 + BW, y + 2, { font: F.d(800, 38), color: '#FFFFFF', align: 'right' });
      if (sub) T(sub, X0 + 64, y + 38, { font: F.d(700, 22), ls: 3, color: GOLD, align: 'left' }); ctx.restore(); });
    const s = ea(t, K.separate - 0.1, K.separate + 0.4, E.back); if (s > 0.003) { const txt = 'SEPARATE CATEGORIES', f = F.d(800, 30), w = M(txt, f, 3) + 70; ctx.save(); ctx.globalAlpha *= clamp(s); ctx.translate(CX, 1205); ctx.scale(lerp(0.8, 1, s), lerp(0.8, 1, s));
      rr(-w / 2, -36, w, 72, 36); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: f, ls: 3, color: GOLD }); ctx.restore(); }
    ctx.restore(); };
  // activity is not the same as every price rising
  const R1rows = t => rows(t, R1, [[690, R1[0] + 0.1, 'MARKET ACTIVITY', 'SUBSTANTIAL', 'ok'], [850, K.dont - 0.1, 'EVERY PROPERTY UP IN VALUE?', 'NOT PROVEN BY TOTALS', 'no']]);
  // one market, many stories
  section(R2, ST(R2), [
    { kind: 'tag', x: CX, y: 650, w: 600, h: 84, icon: 'chart', title: 'ONE MARKET, MANY STORIES', t: R2[0] + 0.1 },
    { kind: 'tile', x: 265, y: 900, w: 250, h: 240, icon: 'tag', title: 'PRICE\nCUTS', t: K.owners - 0.2 },
    { kind: 'tile', x: 540, y: 900, w: 250, h: 240, icon: 'house', title: 'WEAKER\nRENTS', t: K.buildings - 0.2 },
    { kind: 'tile', x: 815, y: 900, w: 250, h: 240, icon: 'check', title: 'STILL\nCOMPETITIVE', t: K.other - 0.15 },
  ], []);
  const R2lab = (t) => { const al = win(t, R2[0], R2[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    [['SOME OWNERS', 265, K.owners], ['SOME BUILDINGS', 540, K.buildings], ['OTHER AREAS', 815, K.other]].forEach(([s, x, a]) => T(s, x, 1060, { font: F.d(800, 24), ls: 3, color: GOLD, alpha: ea(t, a + 0.3, a + 0.7) }));
    ctx.restore(); };
  // the off-plan share: what buyers buy, not what they will earn
  const share = (t) => { const al = win(t, O1[0], O1[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al; const X0 = SAFE.x0, BW = SAFE.w;
    [['OFF-PLAN · SHARE OF SALES VALUE', 48, 640, O1[0] + 0.05], ['OFF-PLAN · SHARE OF SALES DEALS', 68, 790, O1[0] + 0.35]].forEach(([lab, v, y, a]) => { const e = ea(t, a, a + 0.4, E.out4), p = ea(t, a + 0.15, a + 0.95, E.inOut2); if (e <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= e; T(lab, X0, y, { font: F.d(800, 27), ls: 2, color: '#FFFFFF', align: 'left', sx: fit(lab, F.d(800, 27), BW - 130, 2) }); T(Math.round(v * p) + '%', X0 + BW, y + 2, { font: F.d(800, 40), color: '#FFFFFF', align: 'right' });
      rr(X0, y + 22, BW, 44, 22); ctx.fillStyle = '#0E0E11'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.3)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.save(); rr(X0, y + 22, BW, 44, 22); ctx.clip(); ctx.fillStyle = GOLD; ctx.fillRect(X0, y + 22, BW * v / 100 * p, 44); ctx.restore(); ctx.restore(); });
    T('CALCULATED FROM THE DLD-BASED FIGURES ABOVE', CX, 920, { font: F.d(700, 20), ls: 3, color: C.dim, alpha: ea(t, O1[0] + 0.8, O1[0] + 1.2) });
    ctx.restore(); };
  const O1rows = t => rows(t, O1, [[960, K.what - 0.1, 'WHAT BUYERS ARE PURCHASING', 'THAT IS WHAT IT TELLS YOU', 'ok'], [1120, K.guarantee - 0.1, 'THEIR EVENTUAL RETURNS', 'NOT GUARANTEED', 'no']]);
  // not a crash, not a sure thing: compare the evidence in the exact location
  const F1rows = t => rows(t, F1, [[700, K.crash - 0.15, '“THE WHOLE MARKET HAS CRASHED”', 'TOO BROAD', 'no'], [860, K.guaranteed - 0.15, '“A GUARANTEED OPPORTUNITY”', 'TOO BROAD', 'no']]);
  section(F2, ST(F2), [
    { kind: 'tile', x: 265, y: 840, w: 250, h: 240, icon: 'check', title: 'COMPLETED\nSALES', t: K.completed - 0.15 },
    { kind: 'tile', x: 540, y: 840, w: 250, h: 240, icon: 'doc', title: 'RENTAL\nEVIDENCE', t: K.rental - 0.15 },
    { kind: 'tile', x: 815, y: 840, w: 250, h: 240, icon: 'building', title: 'UPCOMING\nSUPPLY', t: K.upcoming - 0.15 },
    { kind: 'tag', x: CX, y: 1080, w: 600, h: 84, icon: 'flag', title: 'IN THE EXACT LOCATION', t: K.exact - 0.15 },
  ], []);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    claim(t); stack(t); R1rows(t); R2lab(t); share(t); O1rows(t); F1rows(t);
    hudTitle(t, 'SOMEONE SAYS', 'DUBAI HAS CRASHED', 'ASK THREE THINGS', 0.15, H0[1] - 0.15, AMBER);
    hudTitle(t, 'EMIRATES 24|7 · 1 OCT 2026', 'AED 574 BILLION', 'JAN – SEP 2026 · DLD DATA', P1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'WHAT THE 574 IS MADE OF', 'SALES ≈ AED 379 BN', 'MORTGAGES & GIFTS ARE SEPARATE', B1[0] + 0.05, B1[1] - 0.15, GOLD);
    hudTitle(t, 'THOSE FIGURES SHOW', 'ACTIVITY', 'NOT THAT EVERY PRICE ROSE', R1[0] + 0.05, R1[1] - 0.15, GOLD);
    hudTitle(t, 'BIG TOTALS, AND AT THE SAME TIME', 'MANY STORIES', 'BY OWNER · BUILDING · AREA', R2[0] + 0.05, R2[1] - 0.15, GOLD);
    hudTitle(t, 'EMIRATES 24|7 · 1 OCT 2026', 'OFF-PLAN: AED 183 BN', '84,090 TRANSACTIONS', P2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'A HIGH OFF-PLAN SHARE', 'WHAT BUYERS BUY', 'NOT WHAT THEY WILL EARN', O1[0] + 0.05, O1[1] - 0.15, GOLD);
    hudTitle(t, 'BEFORE YOU CALL IT', 'A CRASH OR A SURE THING', '', F1[0] + 0.05, F1[1] - 0.15, RED2);
    hudTitle(t, 'COMPARE', 'THE EVIDENCE', 'IN THE EXACT LOCATION', F2[0] + 0.05, F2[1] - 0.15, TEAL[1]);
    srcChip(t, 'EMIRATES 24|7 · 1 OCT 2026 · SURVEY OF DLD DATA', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'EMIRATES 24|7 · 1 OCT 2026 · SURVEY OF DLD DATA', P2[0] + 0.2, P2[1] - 0.15);
    // the call to action: comment CRASH with the area you're watching
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'CRASH', send = K.CRASH + 0.4, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.05, K.comment + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.CRASH - 0.05, K.CRASH + 0.3, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.CRASH - 0.05, K.CRASH + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      { const e = ea(t, K.area - 0.15, K.area + 0.3, E.back), fc = F.d(800, 32), txt = "+ THE AREA YOU'RE WATCHING", w = M(txt, fc, 2) + 64; if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(X1 - w / 2, 960); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -36, w, 72, 36); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: fc, ls: 2, color: GOLD }); ctx.restore(); } }
      const b2 = ea(t, K.lets - 0.1, K.lets + 0.4, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'The evidence behind the headline', f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1045, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1097, 20, { p: ea(t, K.lets, K.lets + 0.4), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1111, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, P1[0], B1[0], R1[0], R2[0], P2[0], O1[0], F1[0], F2[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.m574, K.m379].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.CRASH + 0.4 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3372) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
