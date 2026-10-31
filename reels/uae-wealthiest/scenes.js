'use strict';
// ---------------------------------------------------------------------------
// "Five of the wealthiest people living in the UAE, using Forbes' 2026 estimates" - HeyGen 669dac00 (47.0 s, English).  60 fps.
// One real Forbes Middle East page per person (net worth + the line that describes them, marked), then all five on one bar scale.
// His face SMALL the whole time.
// Facts (research 31 Oct 2026, scratchpad research_misc.md): Forbes ME "Richest Residents in the UAE 2026" (net worth as of 1 Mar 2026, from Forbes'
// World's Billionaires 2026): Durov $6.6 B, Melnichenko & family $20.4 B, Vinod Adani $20.8 B, Changpeng Zhao $110 B; "The World's Richest Arabs 2026":
// Sajwani $15.3 B, "the UAE's richest individual on the list".  These are FIVE OF the wealthiest, not the top five (Nik Storonsky, $18.8 B, is #4 on the
// residents list).  The live Forbes pages blank themselves in a headless browser, so saved copies are captured with their own scripts off
// (shot_static.mjs).  Safe zone: x 130-950, y 300-1420.
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
    forbes: A("forbes'"), pavel: A('pavel'), d66: A('$6.6 billion,'), founder1: A('founder'), hussain: A('hussain'), d153: A('$15.3 billion,'), andrey: A('andrey'), d204: A('$20.4 billion,'),
    fortune: A('fortune'), vinod: A('vinod'), d208: A('$20.8 billion,'), older: A('older'), holdings: A('holdings'), changpeng: A('changpeng'), d110: A('$110 billion,'), binance: A('binance.'),
    technology: A('technology,'), property: A('property,'), industry: A('industry,'), finance: A('finance:'), founders: A('founders'), which: A('which'),
  };
  const FACE_SEGS = [];
  const H0 = [0, K.pavel - 0.12], P1 = [H0[1], K.hussain - 0.12], P2 = [P1[1], K.andrey - 0.12], P3 = [P2[1], K.vinod - 0.12], P4 = [P3[1], K.changpeng - 0.12],
    P5 = [P4[1], K.technology - 0.15], S1 = [P5[1], K.which - 0.12];
  //          name                          $bn    Forbes industry   time on the chart
  const PEOPLE = [['PAVEL DUROV', 6.6, 'TECHNOLOGY', K.technology], ['HUSSAIN SAJWANI', 15.3, 'PROPERTY', K.property], ['ANDREY MELNICHENKO & FAMILY', 20.4, 'INDUSTRY', K.industry],
    ['VINOD ADANI', 20.8, 'DIVERSIFIED', K.finance + 0.25], ['CHANGPENG ZHAO (CZ)', 110, 'FINANCE', K.finance]];

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
  page('p_durov', 'fme_durov', P1, [[P1[0] + 0.1, (qy('fme_durov', 0) + qy('fme_durov', 1)) / 2]], [[0, K.d66 - 0.15, K.d66 + 0.9], [1, K.founder1 - 0.1, P1[1] - 0.3]]);
  page('p_saj', 'fme_arabs', P2, [[P2[0] + 0.1, qy('fme_arabs', 0)]], [[0, P2[0] + 0.3, P2[1] - 0.6]]);
  page('p_mel', 'fme_melnichenko', P3, [[P3[0] + 0.1, (qy('fme_melnichenko', 0) + qy('fme_melnichenko', 1)) / 2]], [[0, K.d204 - 0.15, K.d204 + 0.9], [1, K.fortune - 0.2, P3[1] - 0.3]]);
  page('p_adani', 'fme_adani', P4, [[P4[0] + 0.1, (qy('fme_adani', 0) + qy('fme_adani', 1)) / 2], [K.holdings - 0.2, qy('fme_adani', 2)]], [[0, K.d208 - 0.15, K.d208 + 0.9], [1, K.older - 0.2, K.older + 1.3], [2, K.holdings - 0.1, P4[1] - 0.3]]);
  page('p_cz', 'fme_cz', P5, [[P5[0] + 0.1, (qy('fme_cz', 0) + qy('fme_cz', 1)) / 2]], [[0, K.d110 - 0.15, K.d110 + 0.9], [1, K.d110 + 1.0, P5[1] - 0.3]]);

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
  // one bar per person on ONE scale ($0 - $110 B): the hook shows the five rows empty, the summary fills them in
  const chart = (t) => {
    const al = Math.max(win(t, H0[0] + 0.2, H0[1] - 0.15), win(t, S1[0], S1[1] - 0.15)); if (al <= 0.003) return; const full = t > S1[0] - 0.5;
    const X0 = SAFE.x0, BW = SAFE.w; ctx.save(); ctx.globalAlpha *= al;
    T(full ? 'NET WORTH · FORBES 2026' : 'FIVE OF THE WEALTHIEST', CX, 640, { font: F.d(800, 34), ls: 3, color: GOLD });
    PEOPLE.forEach(([name, v, ind, ta], i) => {
      const y = 720 + i * 112, a = full ? S1[0] + 0.1 + i * 0.12 : H0[0] + 0.4 + i * 0.12, e = ea(t, a, a + 0.4, E.out4); if (e <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -24, 0);
      const fn = F.d(800, 30); T(full ? name : '?', X0, y, { font: fn, color: '#FFFFFF', align: 'left', sx: fit(name, fn, BW - 330) });
      if (full) T('$' + v + ' B', X0 + BW, y, { font: F.d(800, 34), color: '#FFFFFF', align: 'right' });
      rr(X0, y + 16, BW, 34, 17); ctx.fillStyle = '#0E0E11'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
      if (full) { const p = ea(t, a + 0.15, a + 0.95, E.inOut2), w = Math.max(34, BW * v / 110 * p); ctx.save(); rr(X0, y + 16, BW, 34, 17); ctx.clip(); rr(X0, y + 16, w, 34, 17); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore(); }
      if (full) { const ce = ea(t, ta - 0.1, ta + 0.35, E.back), fc = F.d(800, 19), cw = M(ind, fc, 2) + 28, cx = Math.min(X0 + M(name, fn) * fit(name, fn, BW - 330) + 18, X0 + BW - 220 - cw);
        if (ce > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(ce); rr(cx, y - 27, cw, 34, 17); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke(); T(ind, cx + cw / 2, y - 3, { font: fc, ls: 2, color: GOLD }); ctx.restore(); } }
      ctx.restore();
    });
    if (full) { const be = ea(t, K.founders - 0.2, K.founders + 0.3, E.back), txt = 'ONE SHARED BASE: THE UAE', f = F.d(800, 30), w = M(txt, f, 3) + 70;
      if (be > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(be); ctx.translate(CX, 1272); ctx.scale(lerp(0.8, 1, be), lerp(0.8, 1, be)); rr(-w / 2, -36, w, 72, 36); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: f, ls: 3, color: GOLD }); ctx.restore(); } }
    else T('FORBES 2026 · NET WORTH AS OF 1 MARCH 2026', CX, 1280, { font: F.d(700, 22), ls: 3, color: C.dim, alpha: ea(t, K.forbes - 0.1, K.forbes + 0.3) });
    ctx.restore();
  };
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    chart(t);
    hudTitle(t, 'LIVING IN THE UAE', 'FIVE OF THE WEALTHIEST', "FORBES' 2026 ESTIMATES", 0.15, H0[1] - 0.15, GOLD);
    hudTitle(t, 'FORBES 2026 · UAE RESIDENT', 'PAVEL DUROV', '$6.6 BILLION · TELEGRAM', P1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'FORBES ME · RICHEST ARABS 2026', 'HUSSAIN SAJWANI', "$15.3 BILLION · THE UAE'S RICHEST ON THE LIST", P2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'FORBES 2026 · UAE RESIDENT', 'ANDREY MELNICHENKO', '& FAMILY · $20.4 BILLION', P3[0] + 0.05, P3[1] - 0.15, GOLD);
    hudTitle(t, 'FORBES 2026 · UAE RESIDENT', 'VINOD ADANI', '$20.8 BILLION · OVERSEAS INVESTMENT FIRMS', P4[0] + 0.05, P4[1] - 0.15, GOLD);
    hudTitle(t, 'FORBES 2026 · UAE RESIDENT', 'CHANGPENG ZHAO · CZ', '$110 BILLION · BINANCE', P5[0] + 0.05, P5[1] - 0.15, GOLD);
    hudTitle(t, 'VERY DIFFERENT BUSINESSES', 'ONE BASE', 'TECHNOLOGY · PROPERTY · INDUSTRY · FINANCE', S1[0] + 0.05, S1[1] - 0.15, GOLD);
    srcChip(t, 'FORBES MIDDLE EAST · RICHEST RESIDENTS IN THE UAE 2026', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, "FORBES MIDDLE EAST · THE WORLD'S RICHEST ARABS 2026", P2[0] + 0.2, P2[1] - 0.15);
    for (const T0 of [P3, P4, P5]) srcChip(t, 'FORBES MIDDLE EAST · RICHEST RESIDENTS IN THE UAE 2026', T0[0] + 0.2, T0[1] - 0.15);
    // the call to action: which name surprised you most?
    const ce = ea(t, K.which - 0.1, K.which + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold });
      const qa = ea(t, K.which, K.which + 0.45, E.out4); ctx.globalAlpha *= qa; T('WHICH NAME', CX, 850, { font: F.d(800, 66), ls: 2, color: '#FFFFFF' }); T('SURPRISED YOU MOST?', CX, 930, { font: F.d(800, 58), ls: 2, color: GOLD, sx: fit('SURPRISED YOU MOST?', F.d(800, 58), SAFE.w, 2) });
      const fc = F.d(800, 26), names = ['DUROV', 'SAJWANI', 'MELNICHENKO', 'ADANI', 'CZ'], ws = names.map(n => M(n, fc, 2) + 44), rows2 = [names.slice(0, 3), names.slice(3)];
      let k = 0; rows2.forEach((row, r) => { const rw = row.reduce((s, n) => s + M(n, fc, 2) + 44 + 14, -14); let x = CX - rw / 2; row.forEach(n => { const w = ws[k], e = ea(t, K.which + 0.3 + k * 0.08, K.which + 0.7 + k * 0.08, E.back); k++;
        if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x + w / 2, 1040 + r * 76); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -30, w, 60, 30); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke(); T(n, 0, 9, { font: fc, ls: 2, color: GOLD }); ctx.restore(); } x += w + 14; }); });
      T('TELL ME IN THE COMMENTS', CX, 1230, { font: F.d(700, 26), ls: 4, color: C.dim, alpha: ea(t, K.which + 0.8, K.which + 1.2) });
      ctx.restore();
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, P1[0], P2[0], P3[0], P4[0], P5[0], S1[0], K.which].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.d66, K.d153, K.d204, K.d208, K.d110].forEach(x => cues.push({ k: 'pin', t: x }));
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 2818) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
