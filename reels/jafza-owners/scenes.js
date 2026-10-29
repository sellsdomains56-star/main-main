'use strict';
// ---------------------------------------------------------------------------
// "Which member of Dubai's royal family is connected to Jebel Ali Free Zone?" - HeyGen 7cb7e81c (58.6 s, English).  60 fps.
// The royal-family roadmap style (../dubai-royal-roadmap): portrait -> lines -> logo cards -> lines, the camera walking down the chain, real pages with
// a marker on the exact words, his face SMALL the whole time.
// Facts (research 29 Oct 2026, scratchpad research_jafza.md): Sheikh Ahmed bin Saeed chairs Dubai World (Decree No. 9 of 2020; Decree No. 33 of 2023);
// DP World annual report 2025, note 1: PFZW "a wholly owned subsidiary of Dubai World Corporation ('the Intermediate Parent'), holds 100%" of DP World;
// "The Government of Dubai is the Ultimate owner of the Group" -> on screen the Government sits ABOVE Dubai World.  JAFZA: "DP World is our parent
// company".  Law No. (1) of 1980 established the free zone; Decree No. (1) of 1985 (9 Jan 1985, Crown Prince Maktoum bin Rashid) the authority.
// 17 Feb 2020 offer for the 19.55% on Nasdaq Dubai (delisted 23 Jun 2020).  6 Jun 2022: CDPQ ~22% of a JV holding Jebel Ali Port, JAFZA and NIP;
// assets stay consolidated in DP World (DP World 65.44% since Mar 2024).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  for (const k of ['ahmed', 'port']) IMAGES[k] = `assets/img/${k}.jpg`;
  for (const k of ['dw', 'dpw', 'jafza', 'god', 'cdpq', 'nasdaq', 'nip']) IMAGES['L_' + k] = `assets/img/logo_${k}.png`;
  const DARK_PLATE = new Set([]);
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    sheikh: A('sheikh'), chairs: A('chairs'), dw1: A('dubai', 6), govown: A('government-owned'), heres: A("here's"), owns1: A('owns'), port1: A('port'), owns2: A('owns', 14), dp1: A('dp'),
    jafza1: A('jafza'), operates: A('operates'), so: A('so'), chairmanship: A('chairmanship'), ultimate: A('ultimate'), government: A('government'), history: A('history'),
    y1980: A('1980,'), law: A('law'), y1985: A('1985,'), decree: A('decree'), authority: A('authority.'), then: A('then,'), y2020: A('2020,'), nasdaq: A('nasdaq'),
    theres: A("there's"), y2022: A('2022,'), canadian: A('canadian'), cdpq: A('cdpq'), minority: A('minority'), covering: A('covering'), dp2: A('dp', 49), retained: A('retained'),
    thats: A("that's"), hubs: A('hubs.'), follow: A('follow'), who: A('who'), companies: A('companies'), developments: A('developments.'),
  };
  const FACE_SEGS = [];
  const S0 = [0, K.sheikh - 0.12], C1 = [S0[1], K.so - 0.12], P1 = [C1[1], K.ultimate - 0.18], C1b = [P1[1], K.history - 0.08], H1 = [C1b[1], K.then - 0.12], P2 = [H1[1], K.theres - 0.12],
    C2 = [P2[1], K.minority - 1.0], P3 = [C2[1], K.dp2 - 0.12], C3 = [P3[1], K.thats - 0.1], OV = [C3[1], K.follow - 0.12];

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
  page('p_dw', 'dmo_dw', P1, [[P1[0] + 0.1, (qy('dmo_dw', 0) + qy('dmo_dw', 1)) / 2]], [[0, P1[0] + 0.2, K.chairmanship - 0.2], [1, K.chairmanship - 0.1, P1[1] - 0.3]]);
  page('p_dlp', 'dlp_1985', H1, [[H1[0] + 0.1, qy('dlp_1985', 0) + 40], [K.y1985 + 0.3, qy('dlp_1985', 1)]], [[0, K.y1980 - 0.1, K.law + 1.0], [1, K.decree - 0.2, K.authority + 0.4]]);
  page('p_delist', 'dmo_delist', P2, [[P2[0] + 0.1, qy('dmo_delist', 0)]], [[0, K.y2020 - 0.1, K.nasdaq + 0.5]]);
  page('p_cdpq', 'dpw_cdpq', P3, [[P3[0] + 0.1, qy('dpw_cdpq', 0)]], [[0, P3[0] + 0.25, K.covering + 2.8]]);

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
  // the chain, in world coordinates; the camera walks down it as he names each link
  const CHAIN = (T, cam, show) => section(T, cam, [
    { kind: 'person', x: 330, y: 0, r: 100, img: 'ahmed', t: show ?? K.sheikh - 0.05, name: 'AHMED BIN SAEED', title: 'AL MAKTOUM' },
    { x: CX, y: 430, w: 820, h: 170, logo: 'dw', pw: 230, t: show ?? K.dw1 - 0.1, title: 'DUBAI WORLD', sub: 'GOVERNMENT-OWNED GROUP', subT: show ?? K.govown, fs: 42 },
    { x: CX, y: 720, w: 820, h: 170, mono: 'PFZW', t: show ?? K.port1 - 0.15, title: 'PORT AND FREE ZONE\nWORLD', sub: 'WHOLLY OWNED BY DUBAI WORLD', subT: show ?? K.port1 + 0.5, fs: 36 },
    { x: CX, y: 1010, w: 820, h: 170, logo: 'dpw', pw: 260, t: show ?? K.dp1 - 0.1, title: 'DP WORLD', sub: '100% OWNED BY PFZW', subT: show ?? K.dp1 + 0.4, fs: 42 },
    { x: CX, y: 1300, w: 820, h: 170, logo: 'jafza', pw: 230, t: show ?? K.jafza1 - 0.1, title: 'JAFZA', sub: 'PART OF THE DP WORLD GROUP', subT: show ?? K.operates + 0.2, fs: 44 },
  ].concat(show ? [{ x: 770, y: -10, w: 360, h: 210, logo: 'god', ph: 90, t: K.ultimate - 0.1, title: 'GOVERNMENT\nOF DUBAI', fs: 30 }] : []), [
    { pts: [[330, 232], [330, 345]], t: show ?? K.chairs - 0.15, label: 'CHAIRS', at: [330, 288] },
    { pts: [[CX, 515], [CX, 635]], t: show ?? K.owns1 - 0.15, c: 'w', label: 'OWNS', at: [CX, 575] },
    { pts: [[CX, 805], [CX, 925]], t: show ?? K.owns2 - 0.15, c: 'w', label: 'OWNS', at: [CX, 865] },
    { pts: [[CX, 1095], [CX, 1215]], t: show ?? K.operates - 0.2, c: 'w', label: 'PART OF THE GROUP', at: [CX, 1155] },
  ].concat(show ? [{ pts: [[770, 95], [770, 345]], t: K.ultimate + 0.2, label: 'ULTIMATE OWNER', at: [770, 222] }] : []));
  CHAIN(C1, [[C1[0], 110, 1], [K.heres - 0.2, 110, 1], [K.owns1 - 0.3, 560, 1], [K.owns2 - 0.5, 560, 1], [K.owns2 + 0.1, 850, 1], [K.jafza1 - 0.3, 850, 1], [K.operates + 0.3, 1100, 1], [C1[1], 1110, 1]]);
  CHAIN(C1b, [[C1b[0], 150, 0.86], [C1b[1], 150, 0.88]], C1b[0] - 0.6);
  // 2022: outside investment
  section(C2, ST(C2), [
    { x: CX, y: 700, w: 820, h: 290, photo: 'port', logo: 'dpw', t: C2[0] + 0.05, title: 'JEBEL ALI PORT · JAFZA · NIP', sub: 'DP WORLD ASSETS', subT: C2[0] + 0.4, credit: 'PHOTO: IMRE SOLT, CC BY-SA 3.0', fs: 34 },
    { x: CX, y: 1060, w: 820, h: 160, logo: 'cdpq', pw: 300, t: K.canadian - 0.1, title: 'CDPQ', sub: 'CANADIAN INVESTOR · 2022', subT: K.cdpq, fs: 44 },
  ], [ { pts: [[CX, 978], [CX, 852]], t: K.cdpq + 0.2, label: 'MINORITY STAKE', at: [CX, 915] } ]);
  const C3rows = t => rows(t, C3, [[700, C3[0] + 0.05, 'DP WORLD', 'RETAINED CONTROL', 'ok'], [860, K.retained, 'THE ASSETS', 'STAY IN THE DP WORLD GROUP', 'ok']]);
  // the structure, at a glance
  const OVR = [['god', 'GOVERNMENT OF DUBAI', 'ULTIMATE OWNER'], ['dw', 'DUBAI WORLD', 'CHAIRED BY SHEIKH AHMED'], [null, 'PORT AND FREE ZONE WORLD', 'PFZW'], ['dpw', 'DP WORLD', ''], ['jafza', 'JAFZA', 'THE FREE ZONE']];
  const overview = (t) => {
    const al = win(t, OV[0], OV[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    OVR.forEach(([lg, ti, su], i) => {
      const a = OV[0] + 0.1 + i * 0.28, e = ea(t, a, a + 0.45, E.out4), y = 600 + i * 132; if (e <= 0.003) return;
      if (i) { const p = ea(t, a - 0.15, a + 0.1); line(CX, y - 132 + 112, CX, lerp(y - 132 + 112, y, p), { color: GOLD, w: 4 }); }
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -30, 0); box(SAFE.x0, y, SAFE.w, 112, 24, i === 4 ? GOLD : GOLD_A + '0.35)');
      if (lg) plate(lg, SAFE.x0 + 14, y + 14, 200, 84); else { rr(SAFE.x0 + 14, y + 14, 200, 84, 16); ctx.fillStyle = '#101114'; ctx.fill(); T('PFZW', SAFE.x0 + 114, y + 70, { font: F.d(800, 36), ls: 3, color: GOLD }); }
      T(ti, SAFE.x0 + 240, y + (su ? 52 : 68), { font: F.d(800, 34), color: '#FFFFFF', align: 'left', sx: fit(ti, F.d(800, 34), SAFE.w - 260) }); if (su) T(su, SAFE.x0 + 240, y + 88, { font: F.d(700, 21), ls: 3, color: GOLD, align: 'left' });
      ctx.restore();
    });
    ctx.restore();
  };
  // the hook: a royal ... connected to JAFZA?
  const hook = (t) => {
    const al = win(t, S0[0], S0[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const e = pop(t, 0.2, 0.6); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(CX, 690); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); glow(0, 0, 220, '233,196,124', 0.16); dot(0, 0, 100, '#141417'); ring(0, 0, 100, { color: GOLD, w: 5 }); T('?', 0, 34, { font: F.d(800, 110), color: GOLD }); ctx.restore();
      T("DUBAI'S ROYAL FAMILY", CX, 850, { font: F.d(800, 34), ls: 3, color: '#FFFFFF', alpha: ea(t, 0.5, 0.9) }); }
    ctx.restore();
  };
  section(S0, ST(S0), [ { x: CX, y: 1120, w: 820, h: 250, photo: 'port', logo: 'jafza', t: 1.4, title: 'JEBEL ALI FREE ZONE', sub: 'JAFZA', subT: 2.0, credit: 'PHOTO: IMRE SOLT, CC BY-SA 3.0', fs: 38 } ], [ { pts: [[CX, 880], [CX, 992]], t: 1.1, label: 'CONNECTED?', at: [CX, 936] } ]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    hook(t);
    for (const s of SECT) drawSection(t, s);
    { const v = Math.max(win(t, C1[0], C1[1] - 0.1), win(t, C1b[0], C1b[1] - 0.1)); if (v > 0.003) {      // the chain scrolls under the title: fade it out above y 600 (and below 1250 in the zoomed-out view)
      const g = ctx.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, 'rgba(8,8,10,1)'); g.addColorStop(0.72, 'rgba(8,8,10,1)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.save(); ctx.globalAlpha *= v; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 640);
      const vb = win(t, C1b[0], C1b[1] - 0.1); if (vb > 0.003) { const g2 = ctx.createLinearGradient(0, 1180, 0, 1330); g2.addColorStop(0, 'rgba(8,8,10,0)'); g2.addColorStop(1, 'rgba(8,8,10,1)'); ctx.globalAlpha = vb; ctx.fillStyle = g2; ctx.fillRect(0, 1180, W, H - 1180); }
      ctx.restore(); } }
    C3rows(t); overview(t);
    hudTitle(t, 'JEBEL ALI FREE ZONE', 'WHICH ROYAL?', 'WHO IS CONNECTED TO JAFZA', 0.15, S0[1] - 0.15, GOLD);
    hudTitle(t, 'THE ANSWER', 'SHEIKH AHMED BIN SAEED', 'CHAIRMAN OF DUBAI WORLD', C1[0] + 0.05, K.heres - 0.2, GOLD);
    hudTitle(t, "HERE'S HOW IT CONNECTS", 'THE OWNERSHIP CHAIN', 'DUBAI WORLD → PFZW → DP WORLD', K.heres - 0.05, C1[1] - 0.15, GOLD);
    hudTitle(t, 'THE LINK', 'HIS CHAIRMANSHIP', 'OF DUBAI WORLD', P1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'AT THE TOP', 'GOVERNMENT OF DUBAI', 'THE ULTIMATE OWNER', C1b[0] + 0.05, C1b[1] - 0.15, GOLD);
    hudTitle(t, '1980', 'A LAW CREATES', 'THE JEBEL ALI FREE ZONE', H1[0] + 0.05, K.y1985 - 0.25, GOLD);
    hudTitle(t, '1985 · DECREE NO. 1', 'ITS AUTHORITY', 'ISSUED 9 JANUARY 1985', K.y1985 - 0.1, H1[1] - 0.15, GOLD);
    hudTitle(t, '2020', 'OFF NASDAQ DUBAI', 'PFZW BUYS OUT THE PUBLIC', P2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'OUTSIDE INVESTMENT', '2022 · CDPQ', 'A CANADIAN INVESTOR', C2[0] + 0.05, C2[1] - 0.15, BLUE[1]);
    hudTitle(t, 'CDPQ · JUNE 2022', 'A MINORITY STAKE', '≈22% OF THREE ASSETS', P3[0] + 0.05, P3[1] - 0.15, BLUE[1]);
    hudTitle(t, 'BUT', 'DP WORLD KEPT CONTROL', '', C3[0] + 0.05, C3[1] - 0.15, TEAL[1]);
    hudTitle(t, 'THE STRUCTURE BEHIND', 'JAFZA', "ONE OF DUBAI'S BIGGEST BUSINESS HUBS", OV[0] + 0.05, OV[1] - 0.15, GOLD);
    srcChip(t, 'DUBAI MEDIA OFFICE · 1 MAR 2020', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'DUBAI LEGISLATION PORTAL · DECREE NO. (1) OF 1985', H1[0] + 0.2, H1[1] - 0.15);
    srcChip(t, 'DUBAI MEDIA OFFICE · 17 FEB 2020', P2[0] + 0.2, P2[1] - 0.15); srcChip(t, 'DP WORLD · 6 JUN 2022', P3[0] + 0.2, P3[1] - 0.15);
    // the call to action: follow for more "who owns Dubai" breakdowns
    const ce = ea(t, K.follow - 0.1, K.follow + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 660, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 714, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const tap = K.follow + 0.35, on = ea(t, tap, tap + 0.25), pr = 1 - 0.06 * Math.sin(Math.PI * clamp((t - tap) / 0.25)), bw = 460, bh = 108, by = 860;
      ctx.save(); ctx.globalAlpha *= ea(t, K.follow, K.follow + 0.4); ctx.translate(CX, by); ctx.scale(pr, pr);
      rr(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fillStyle = on < 0.5 ? C.gold : '#1A1712'; ctx.fill(); if (on >= 0.5) { ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke(); }
      if (on < 0.5) T('FOLLOW', 0, 18, { font: F.d(800, 48), ls: 4, color: '#17181B' }); else { icon('check', -bw / 2 + 62, 0, 20, { p: ea(t, tap + 0.1, tap + 0.5), color: GOLD, w: 5 }); T('FOLLOWING', 28, 17, { font: F.d(800, 44), ls: 3, color: GOLD, sx: fit('FOLLOWING', F.d(800, 44), bw - 150, 3) }); }
      const rp = clamp((t - tap) / 0.6); if (rp > 0 && rp < 1) ring(0, 0, 60 + 220 * rp, { color: 'rgb(233,196,124)', w: 4, alpha: 1 - rp });
      ctx.restore();
      const wa = ea(t, K.who - 0.15, K.who + 0.35, E.out4); if (wa > 0.003) { ctx.save(); ctx.globalAlpha *= wa; ctx.translate(0, (1 - wa) * 30); T('WHO OWNS DUBAI?', CX, 1040, { font: F.d(800, 58), ls: 2, color: '#FFFFFF' }); ctx.restore(); }
      [['COMPANIES', K.companies - 0.15, 335], ['DEVELOPMENTS', K.developments - 0.2, 745]].forEach(([txt, a, x]) => { const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return; const f = F.d(800, 34), w = M(txt, f, 2) + 64;
        ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x, 1150); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -38, w, 76, 38); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 12, { font: f, ls: 2, color: GOLD }); ctx.restore(); });
    }
  };
  OVERLAYS.push(overlay);

  [S0[0] + 0.2, C1[0], P1[0], C1b[0], H1[0], P2[0], C2[0], P3[0], C3[0], OV[0], K.follow].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.y1980, K.y1985, K.y2020, K.y2022].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.follow + 0.35 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3514) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
