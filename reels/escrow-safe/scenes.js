'use strict';
// ---------------------------------------------------------------------------
// "Before you pay for an off-plan property in Dubai, check where your money is going" - HeyGen a3c43173 (53.7 s, English).  60 fps.
// The law itself on screen: Law No. (8) of 2007 Concerning Escrow Accounts (Dubai Legislation Portal PDF), each article with a marker on the exact
// words, a plain buyer -> escrow -> project flow, his face SMALL the whole time.
// Facts (research 31 Oct 2026, scratchpad research_misc.md): Art. 6 (escrow account to sell off-plan), Art. 2 (Escrow Agent = institution accredited by
// the Department), Art. 9(1) (dedicated exclusively to construction; no attachment for the developer's creditors), Art. 14 (5% retained at the completion
// certificate, released 1 year from registration of units to purchasers), Art. 15 (escrow agent's duty: project completed or depositors refunded - a
// duty, not a promise of an immediate or full refund).  Safe zone: x 130-950, y 300-1420.
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
    check: A('check'), dubais: A("dubai's"), requires: A('requires'), with1: A('with'), approved: A('approved'), buyer: A('buyer'), into: A('into'), projects: A("project's"),
    funds: A('funds'), seized: A('seized'), the19: A('the', 19), p5: A('5%'), with2: A('with', 22.5), release: A('release'), if1: A('if'), fails: A('fails'), procedures: A('procedures'),
    that: A('that', 31.4), immediate: A('immediate'), guaranteed: A('guaranteed'), escrow2: A('escrow', 35), protection: A('protection'), doesnt: A("doesn't"),
    construction: A('construction', 38), market: A('market'), read: A('read'), verify: A('verify'), project2: A('project', 43.5), account: A('account', 45), construction2: A('construction', 46),
    payment: A('payment', 47.5), comment: A('comment'), SAFE: A('safe'), checklist: A('checklist'),
  };
  const FACE_SEGS = [];
  const H0 = [0, K.dubais - 0.12], P1a = [H0[1], K.with1 - 0.1], P1b = [P1a[1], K.buyer - 0.15], D1 = [P1b[1], K.funds - 0.12], P2 = [D1[1], K.the19 - 0.12],
    P3 = [P2[1], K.that - 0.12], N1 = [P3[1], K.escrow2 - 0.12], E1 = [N1[1], K.verify - 0.12], V1 = [E1[1], K.comment - 0.12];

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
  page('p_art6', 'law8_p3', P1a, [[P1a[0] + 0.1, qy('law8_p3', 0)]], [[0, K.requires - 0.1, P1a[1] - 0.3]]);
  page('p_art2', 'law8_p2', P1b, [[P1b[0] + 0.1, qy('law8_p2', 0)]], [[0, K.approved - 0.2, K.approved + 2.2]]);
  page('p_art9', 'law8_p4', P2, [[P2[0] + 0.1, qy('law8_p4', 1)]], [[1, K.funds, P2[1] - 0.3]]);
  page('p_art14', 'law8_p5', P3, [[P3[0] + 0.1, qy('law8_p5', 0) + 30], [K.if1 - 0.1, qy('law8_p5', 2)]], [[0, K.p5 - 0.3, K.with2 - 0.2], [1, K.release - 0.1, K.if1 - 0.3], [2, K.procedures - 0.2, P3[1] - 0.4]]);

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
  // where does your money go?
  section(H0, ST(H0), [
    { x: CX, y: 700, w: 820, h: 160, mono: 'AED', t: 0.15, title: 'YOUR OFF-PLAN\nPAYMENT', fs: 38 },
    { kind: 'tag', x: CX, y: 1010, w: 600, h: 84, icon: 'doc', title: 'WHERE DOES IT GO?', t: K.check - 0.1 },
  ], [ { pts: [[CX, 780], [CX, 968]], t: K.check - 0.35, d: 0.4 } ]);
  // buyer -> escrow account -> the project
  section(D1, ST(D1), [
    { x: CX, y: 650, w: 820, h: 150, mono: 'AED', t: D1[0] + 0.05, title: 'BUYER PAYMENTS', sub: 'OFF-PLAN INSTALMENTS', fs: 38 },
    { x: CX, y: 900, w: 820, h: 150, mono: 'ESCROW', t: K.into - 0.15, title: 'THE ESCROW ACCOUNT', sub: "IN THE PROJECT'S NAME", fs: 36 },
    { x: CX, y: 1150, w: 820, h: 150, mono: 'SITE', t: K.projects - 0.15, title: 'THE PROJECT', sub: 'ITS CONSTRUCTION', fs: 38 },
  ], [ { pts: [[CX, 725], [CX, 825]], t: K.into - 0.35, label: 'DEPOSITED', at: [CX, 775] }, { pts: [[CX, 975], [CX, 1075]], t: K.projects - 0.35, label: 'CONSTRUCTION ONLY', at: [CX, 1025] } ]);
  // what Art. 15 does not mean
  const N1rows = t => rows(t, N1, [[680, K.immediate - 0.15, 'AN IMMEDIATE REFUND', 'NOT PROMISED', 'no'], [840, K.guaranteed - 0.15, 'A GUARANTEED FULL REFUND', 'NOT IN EVERY CASE', 'no']]);
  // a protection, not a guarantee
  section(E1, ST(E1), [
    { kind: 'tile', x: 265, y: 990, w: 250, h: 240, icon: 'building', title: 'CONSTRUCTION\nDELAYS', t: K.construction - 0.15 },
    { kind: 'tile', x: 540, y: 990, w: 250, h: 240, icon: 'chart', title: 'MARKET\nRISK', t: K.market - 0.15 },
    { kind: 'tile', x: 815, y: 990, w: 250, h: 240, icon: 'doc', title: 'READ YOUR\nCONTRACT', t: K.read - 0.2 },
  ], []);
  const E1rows = t => { rows(t, E1, [[630, K.escrow2, 'ESCROW', 'AN IMPORTANT PROTECTION', 'ok']]);
    T("IT DOESN'T REMOVE", CX, 836, { font: F.d(800, 30), ls: 4, color: AMBER, alpha: win(t, K.doesnt - 0.1, E1[1] - 0.15) }); };
  // verify through official channels
  const V1rows = t => rows(t, V1, [[620, K.project2 - 0.15, 'THE PROJECT', 'IN OFFICIAL RECORDS', 'ok'], [775, K.account - 0.25, 'APPROVED ACCOUNT DETAILS', "THE PROJECT'S ESCROW ACCOUNT", 'ok'],
    [930, K.construction2 - 0.15, 'CONSTRUCTION STATUS', 'PROGRESS ON RECORD', 'ok'], [1085, K.payment - 0.15, 'PAYMENT INSTRUCTIONS', 'BEFORE EVERY TRANSFER', 'ok']]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  // the law's exact words in large type under the page (the PDF's own print is small on a phone): article label + verbatim sentence
  const wrap = (s, f, w) => { const out = []; let line = ''; for (const word of s.split(' ')) { const tl = line ? line + ' ' + word : word; if (M(tl, f) > w && line) { out.push(line); line = word; } else line = tl; } if (line) out.push(line); return out; };
  const quote = (t, a0, a1, label, text) => { const al = win(t, a0, a1, 0.35); if (al <= 0.003) return; const f = F.d(700, 36), lines = wrap(text, f, SAFE.w - 80), h = 92 + lines.length * 48, y0 = 1250 - h, e = ea(t, a0, a0 + 0.45, E.out4);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 26); box(SAFE.x0, y0, SAFE.w, h, 24, GOLD_A + '0.6)'); rr(SAFE.x0, y0, 8, h, [24, 0, 0, 24]); ctx.fillStyle = GOLD; ctx.fill();
    T(label, SAFE.x0 + 40, y0 + 46, { font: F.d(800, 22), ls: 3, color: GOLD, align: 'left', sx: fit(label, F.d(800, 22), SAFE.w - 80, 3) });
    lines.forEach((l, i) => T(l, SAFE.x0 + 40, y0 + 98 + i * 48, { font: f, color: '#FFFFFF', align: 'left' })); ctx.restore(); };
  const LAW = 'LAW NO. (8) OF 2007 · ';
  const quotes = (t) => {
    quote(t, P1a[0] + 0.3, P1a[1] - 0.15, LAW + 'ARTICLE 6', '“Any Developer who wishes to sell Units off-plan must submit to the Department a request to open an Escrow Account.”');
    quote(t, P1b[0] + 0.3, P1b[1] - 0.15, LAW + 'ARTICLE 2 · ESCROW AGENT', '“The financial or banking institution accredited by the Department to manage an Escrow Account.”');
    quote(t, P2[0] + 0.3, P2[1] - 0.15, LAW + 'ARTICLE 9 (1)', '“No attachment may be imposed on the payments deposited in this account for the benefit of the creditors of the Developer.”');
    quote(t, P3[0] + 0.3, K.release - 0.25, LAW + 'ARTICLE 14', '“An Escrow Agent must retain five percent (5%) of the total value of each Escrow Account once the Developer obtains the completion certificate.”');
    quote(t, K.release - 0.1, K.if1 - 0.25, LAW + 'ARTICLE 14', '“The retained amount will be released to the Developer one (1) year from the registration of Units in the name of purchasers.”');
    quote(t, K.if1 - 0.1, P3[1] - 0.15, LAW + 'ARTICLE 15', '“… ensure that the Real Estate Development project is completed, or depositors are refunded their payments.”');
  };
  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    N1rows(t); E1rows(t); V1rows(t);
    hudTitle(t, 'OFF-PLAN IN DUBAI', 'FOLLOW YOUR MONEY', 'BEFORE YOU PAY', 0.15, H0[1] - 0.15, GOLD);
    hudTitle(t, 'LAW NO. (8) OF 2007 · ART. 6', 'AN ESCROW ACCOUNT', 'REQUIRED TO SELL OFF-PLAN', P1a[0] + 0.05, P1a[1] - 0.15, GOLD);
    hudTitle(t, 'LAW NO. (8) OF 2007 · ART. 2', 'AN ACCREDITED AGENT', 'A BANK OR FINANCIAL INSTITUTION', P1b[0] + 0.05, P1b[1] - 0.15, GOLD);
    hudTitle(t, 'HOW IT FLOWS', 'INTO THE ESCROW', "FOR THE PROJECT'S CONSTRUCTION", D1[0] + 0.05, D1[1] - 0.15, GOLD);
    hudTitle(t, 'LAW NO. (8) OF 2007 · ART. 9', 'NO ATTACHMENT', "FOR THE DEVELOPER'S CREDITORS", P2[0] + 0.05, P2[1] - 0.15, TEAL[1]);
    hudTitle(t, 'LAW NO. (8) OF 2007 · ART. 14', '5% RETAINED', 'RELEASED 1 YEAR AFTER REGISTRATION', P3[0] + 0.05, K.if1 - 0.2, GOLD);
    hudTitle(t, 'LAW NO. (8) OF 2007 · ART. 15', "IF IT ISN'T COMPLETED", 'COMPLETION OR REFUNDS', K.if1 - 0.05, P3[1] - 0.15, GOLD);
    hudTitle(t, 'BUT THAT DOES NOT MEAN', 'A REFUND ON DEMAND', '', N1[0] + 0.05, N1[1] - 0.15, RED2);
    hudTitle(t, 'ESCROW IS A PROTECTION', 'NOT A GUARANTEE', 'OF TIMING OR RETURNS', E1[0] + 0.05, E1[1] - 0.15, AMBER);
    hudTitle(t, 'BEFORE YOU PAY', 'VERIFY FOUR THINGS', 'THROUGH OFFICIAL CHANNELS', V1[0] + 0.05, V1[1] - 0.15, TEAL[1]);
    quotes(t);
    // the call to action: comment SAFE for the checklist
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'SAFE', send = K.SAFE + 0.4, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.05, K.comment + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.SAFE - 0.05, K.SAFE + 0.3, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.SAFE - 0.05, K.SAFE + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      const b2 = ea(t, K.checklist - 0.3, K.checklist + 0.2, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'What to verify before booking', f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1045, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1097, 20, { p: ea(t, K.checklist - 0.2, K.checklist + 0.3), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1111, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, P1a[0], P1b[0], D1[0], P2[0], P3[0], K.if1, N1[0], E1[0], V1[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.p5].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.SAFE + 0.4 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3223) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
