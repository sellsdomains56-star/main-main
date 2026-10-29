'use strict';
// ---------------------------------------------------------------------------
// "The UK and the UAE appear at opposite ends of one millionaire migration forecast" - HeyGen take ff714b82 (53.4 s, English).  60 fps.
// Same look as ../e11-land and ../dso-developers (the royal-family roadmap style: cards, gold / white lines, real pages with a marker on the exact
// words) and his face SMALL the whole time (the round bubble top-left).  No map: nothing here is about a place on the map.
// Facts (research 29 Oct 2026): 1) Henley & Partners press release, 24 Jun 2025: the UK "is forecast to lose a staggering –16,500 millionaires in
// 2025", the UAE "a record net inflow of +9,800" (forecasts; "millionaires" = USD 1m+ liquid investable wealth; Henley's 2026 report dropped
// per-country counts).  2) GOV.UK policy paper, 30 Oct 2024: the remittance basis replaced with a residence-based regime from 6 April 2025; a long-term
// resident (10 of the last 20 tax years) is in scope for Inheritance Tax on non-UK assets, and stays in scope for 3 to 10 years after leaving.
// 3) u.ae: "The UAE does not levy income tax on individuals."  4) Dubai Land Department: a property bought for AED 2 million or more -> apply for a
// 10-year renewable residence permit (ICP and GDRFA Dubai also say 10 years; u.ae's golden-visa table says 5 years for real estate, so it is not used).
// Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  IMAGES.F_uk = 'assets/img/flag_uk.png'; IMAGES.F_uae = 'assets/img/flag_uae.png'; IMAGES.L_henley = 'assets/img/henley_logo.png';
  const DARK_PLATE = new Set([]);
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    uk0: A('uk'), uae0: A('uae'), opposite: A('opposite'), one: A('one'), millionaire0: A('millionaire'), forecast0: A('forecast,'), numbers: A('numbers'),
    henley: A("henley's"), n16: A('16,500'), y2025: A('2025,'), uae1: A('uae', 12), n98: A('9,800.'),
    those: A('those'), forecasts: A('forecasts,'), confirmed: A('confirmed'), british: A('british'),
    the3: A('the', 19.7), replaced: A('replaced'), nondom: A('non-dom'), april: A('april'), overseas: A('overseas'), inheritance: A('inheritance'), long: A('long-term'), residents: A('residents,'),
    some: A('some', 28), exposure: A('exposure'), cont: A('continue'), leaving: A('leaving.'),
    in4: A('in', 30.6), salaries: A('salaries'), personal: A('personal', 32), tax4: A('tax,', 33), qualifying: A('qualifying'), aed: A('aed'), million: A('million', 36), ten: A('10-year'), visa: A('visa.'),
    for5: A('for', 40.3), housing: A('housing,'), schools: A('schools,'), business: A('business'), tax6: A('tax', 45.5), residency: A('residency.'),
    send: A('send'), MOVE: A('move', 47), alone: A('alone'), family: A('family.'), lets: A("let's"), areas: A('areas'),
  };
  const FACE_SEGS = [];
  const S0 = [0, K.henley - 0.12], P1 = [S0[1], K.those - 0.12], R1 = [P1[1], K.the3 - 0.1], P2 = [R1[1], K.long - 0.12], R2 = [P2[1], K.in4 - 0.1],
    D1 = [R2[1], K.qualifying - 0.1], D2 = [D1[1], K.for5 - 0.12], OV = [D2[1], K.send - 0.12];

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
    T(n.title, -w / 2 + 84, 12, { font: F.d(800, 32), ls: 2, color: '#FFFFFF', align: 'left' }); ctx.restore(); };
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
    box(x0, y0, w, h, 26, GOLD_A + '0.45)'); const cy = y0 + 72; glow(x, cy, 70, '233,196,124', 0.18); dot(x, cy, 46, '#1A1712'); ring(x, cy, 46, { color: GOLD, w: 3 });
    icon(n.icon, x, cy, 24, { p: ea(t, n.t + 0.1, n.t + 0.7), color: GOLD, w: 4 });
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
  page('p_henley', 'henley', P1, [[P1[0] + 0.1, (qy('henley', 0) + qy('henley', 1)) / 2]], [[0, K.henley + 0.6, K.y2025 + 0.5], [1, K.uae1 - 0.3, K.n98 + 0.9]]);
  page('p_govuk', 'govuk', P2, [[P2[0] + 0.1, qy('govuk', 0)], [K.overseas - 0.15, qy('govuk', 1) + 60]], [[0, K.replaced - 0.1, K.april + 0.6], [1, K.overseas + 0.25, K.long - 0.15]]);
  page('p_tax', 'uae_tax', D1, [[D1[0] + 0.1, qy('uae_tax', 0) + 80]], [[0, K.salaries, K.tax4 + 0.3]]);
  page('p_dld', 'dld_gv', D2, [[D2[0] + 0.1, (qy('dld_gv', 0) + qy('dld_gv', 1)) / 2]], [[0, K.aed - 0.5, K.million + 0.4], [1, K.ten - 0.5, K.visa + 0.3]]);

  // ---------------------------------------------------------------- roadmap branches (screen coordinates: camera at y 800)
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
  // the hook: the UK and the UAE at opposite ends of one forecast
  section(S0, [[S0[0], 800, 1], [S0[1], 812, 1.015]], [
    { x: 335, y: 690, w: 390, h: 250, photo: 'F_uk', t: K.uk0 - 0.05, title: 'UNITED KINGDOM', sub: 'BIGGEST NET OUTFLOW', subT: K.opposite, subC: RED2, fs: 30 },
    { x: 745, y: 690, w: 390, h: 250, photo: 'F_uae', t: K.uae0 - 0.05, title: 'UAE', sub: 'BIGGEST NET INFLOW', subT: K.opposite + 0.2, subC: TEAL[1], fs: 30 },
    { x: CX, y: 1030, w: 820, h: 150, logo: 'henley', pw: 290, t: K.one - 0.05, title: 'ONE FORECAST', sub: 'PRIVATE WEALTH\nMIGRATION REPORT 2025', subT: K.forecast0 - 0.2, fs: 38 },
    { kind: 'tag', x: CX, y: 1188, w: 520, h: 68, icon: 'bars', title: 'THE NUMBERS', t: K.numbers - 0.1 },
  ], [
    { pts: [[335, 815], [335, 895], [CX, 895], [CX, 955]], t: K.one - 0.35, d: 0.5 }, { pts: [[745, 815], [745, 895], [CX, 895]], t: K.one - 0.3, d: 0.45 },
    { pts: [[CX, 1105], [CX, 1154]], t: K.numbers - 0.3, c: 'w', d: 0.25 },
  ]);
  // the forecast as two bars, then what it is and what it is not
  const bars = (t) => {
    const al = win(t, R1[0], R1[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    T('NET MILLIONAIRE MIGRATION · 2025 FORECAST', CX, 600, { font: F.d(700, 24), ls: 3, color: GOLD, sx: fit('NET MILLIONAIRE MIGRATION · 2025 FORECAST', F.d(700, 24), SAFE.w, 3) });
    const BX = 360, BW = SAFE.x1 - BX;
    [['F_uk', 'UK', 16500, '–16,500', RED, 680, R1[0] + 0.1], ['F_uae', 'UAE', 9800, '+9,800', TEAL[0], 790, R1[0] + 0.3]].forEach(([fl, nm, v, lab, col, y, a]) => {
      const e = ea(t, a, a + 0.9, E.out3), ap = ea(t, a - 0.1, a + 0.25); if (ap <= 0.003) return; ctx.save(); ctx.globalAlpha *= ap;
      ctx.save(); rr(SAFE.x0, y - 30, 96, 60, 8); ctx.clip(); imgCover(fl, SAFE.x0, y - 30, 96, 60, 8); ctx.restore(); rr(SAFE.x0, y - 30, 96, 60, 8); ctx.strokeStyle = WHITE_A + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      T(nm, SAFE.x0 + 116, y + 13, { font: F.d(800, 36), color: '#FFFFFF', align: 'left' });
      rr(BX, y - 36, BW, 72, 14); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
      const L = Math.max(28, BW * v / 16500 * e); rr(BX, y - 36, L, 72, 14); ctx.fillStyle = col; ctx.fill();
      const shown = lab[0] + (Math.round(v * e / 100) * 100).toLocaleString('en-US');                  // counts up with the bar
      T(shown, BX + L - 20, y + 14, { font: F.d(800, 40), color: '#FFFFFF', align: 'right', alpha: ea(t, a + 0.35, a + 0.6) });
      ctx.restore();
    });
    T('MILLIONAIRE = USD 1M+ IN LIQUID INVESTABLE WEALTH', CX, 878, { font: F.d(700, 19), ls: 2, color: C.dim, alpha: ea(t, R1[0] + 0.6, R1[0] + 1.0), sx: fit('MILLIONAIRE = USD 1M+ IN LIQUID INVESTABLE WEALTH', F.d(700, 19), SAFE.w, 2) });
    ctx.restore();
  };
  const R1rows = t => rows(t, R1, [[925, K.forecasts - 0.15, 'FORECASTS FOR 2025', 'PROJECTED · NOT COUNTED', 'q'], [1085, K.confirmed - 0.15, 'BRITISH MILLIONAIRES TO DUBAI', 'NOT A CONFIRMED COUNT', 'no']]);
  // UK inheritance tax: long-term resident -> leave -> still in scope for 3 to 10 years
  section(R2, [[R2[0], 800, 1], [R2[1], 812, 1.015]], [
    { x: CX, y: 660, w: 820, h: 170, mono: '10/20', t: R2[0] + 0.05, title: 'LONG-TERM UK RESIDENT', sub: 'UK RESIDENT 10 OF THE\nLAST 20 TAX YEARS', subT: R2[0] + 0.35, fs: 36 },
    { x: CX, y: 1010, w: 820, h: 170, mono: '3–10', monoC: AMBER, t: K.exposure - 0.1, title: 'AFTER YOU LEAVE', sub: 'STILL IN UK INHERITANCE TAX\nFOR 3 TO 10 YEARS', subT: K.cont - 0.1, subC: AMBER, fs: 36, edge: 'rgba(255,181,71,0.6)' },
  ], [ { pts: [[CX, 745], [CX, 925]], t: K.some - 0.2, c: 'w', d: 0.5, label: 'YOU LEAVE THE UK', at: [CX, 835] } ]);
  // what to plan: housing, schools, business plans, tax residency
  section(OV, [[OV[0], 800, 1], [OV[1], 812, 1.015]], [
    { kind: 'tag', x: CX, y: 620, w: 600, h: 70, icon: 'plane', title: 'MOVING TO DUBAI', t: OV[0] + 0.1 },
    { kind: 'tile', x: 335, y: 860, w: 390, h: 200, icon: 'house', title: 'HOUSING', t: K.housing - 0.15 },
    { kind: 'tile', x: 745, y: 860, w: 390, h: 200, icon: 'school', title: 'SCHOOLS', t: K.schools - 0.15 },
    { kind: 'tile', x: 335, y: 1090, w: 390, h: 200, icon: 'briefcase', title: 'BUSINESS PLANS', t: K.business - 0.15 },
    { kind: 'tile', x: 745, y: 1090, w: 390, h: 200, icon: 'doc', title: 'TAX RESIDENCY', t: K.tax6 - 0.15 },
  ], [
    { pts: [[CX, 655], [CX, 720], [335, 720], [335, 760]], t: K.housing - 0.5, d: 0.4 }, { pts: [[CX, 720], [745, 720], [745, 760]], t: K.schools - 0.45, d: 0.35 },
    { pts: [[335, 960], [335, 990]], t: K.business - 0.35, c: 'w', d: 0.25 }, { pts: [[745, 960], [745, 990]], t: K.tax6 - 0.35, c: 'w', d: 0.25 },
  ]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    bars(t); R1rows(t);
    hudTitle(t, 'MILLIONAIRE MIGRATION', 'THE UK vs THE UAE', 'ONE FORECAST · OPPOSITE ENDS', 0.15, S0[1] - 0.15, GOLD);
    hudTitle(t, 'HENLEY & PARTNERS', 'THE 2025 FORECAST', 'NET MILLIONAIRE MIGRATION', P1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'THOSE WERE FORECASTS', 'NOT A HEADCOUNT', 'OF BRITONS MOVING TO DUBAI', R1[0] + 0.05, R1[1] - 0.15, AMBER);
    hudTitle(t, 'UK · FROM 6 APRIL 2025', 'NON-DOM REGIME REPLACED', 'NOW BASED ON RESIDENCE', P2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'UK INHERITANCE TAX', 'IT CAN FOLLOW YOU', 'ON OVERSEAS ASSETS', R2[0] + 0.05, R2[1] - 0.15, AMBER);
    hudTitle(t, 'IN DUBAI', 'NO TAX ON SALARIES', 'NO PERSONAL INCOME TAX', D1[0] + 0.05, D1[1] - 0.15, TEAL[1]);
    hudTitle(t, 'PROPERTY FROM AED 2M', '10-YEAR GOLDEN VISA', 'YOU CAN APPLY', D2[0] + 0.05, D2[1] - 0.15, TEAL[1]);
    hudTitle(t, 'BEFORE YOU MOVE', 'WHAT TO PLAN', 'THE DECISION INCLUDES', OV[0] + 0.05, OV[1] - 0.15, GOLD);
    srcChip(t, 'HENLEY & PARTNERS · PRESS RELEASE · 24 JUN 2025', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'GOV.UK · POLICY PAPER · 30 OCT 2024', P2[0] + 0.2, R2[1] - 0.15);
    srcChip(t, 'U.AE · THE UAE GOVERNMENT PORTAL', D1[0] + 0.2, D1[1] - 0.15); srcChip(t, 'DUBAI LAND DEPARTMENT · GOLDEN VISA', D2[0] + 0.2, D2[1] - 0.15);
    // the call to action: send MOVE, alone or with family
    const ce = ea(t, K.send - 0.1, K.send + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'MOVE', send = K.MOVE + 0.5, sent = ea(t, send, send + 0.35), ia = ea(t, K.send + 0.05, K.send + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.MOVE - 0.05, K.MOVE + 0.3, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Message…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.MOVE - 0.05, K.MOVE + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      // alone or with family: two answer chips
      [['ALONE', K.alone - 0.1], ['WITH FAMILY', K.family - 0.25]].forEach(([txt, a], i) => { const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return; const f = F.d(800, 36), w = M(txt, f, 2) + 70, x = i ? X1 - w : X1 - w - (M('WITH FAMILY', f, 2) + 70) - 24;
        ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x + w / 2, 960); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -40, w, 80, 40); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 13, { font: f, ls: 2, color: GOLD }); ctx.restore(); });
      const b2 = ea(t, K.areas - 0.3, K.areas + 0.2, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'Areas + property options', f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1045, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1097, 20, { p: ea(t, K.areas, K.areas + 0.4), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1111, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [S0[0] + 0.2, P1[0], R1[0], P2[0], R2[0], D1[0], D2[0], OV[0], K.send].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.n16, K.n98, K.ten].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.MOVE + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3206) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
