'use strict';
// ---------------------------------------------------------------------------
// بالم سبرينغز - محركات النمو (Arabic, his edited Zoom voice: clip B, 62.7 s).  60 fps.  Everything on screen in Arabic, right to left.
// No camera footage (audio only) and no picture of him (his request): voice + graphics only.
// Facts (4 Nov 2026): Palm Springs is reported only by broker listings ("حسب المعلومات الأولية", approximate pin).  Dubai Media Office (Arabic):
// Palm Jebel Ali 31 May 2023 "على مساحة 13.4 كيلومترات مربعة أي ما يعادل ضعف حجم «نخلة جميرا»" / "لنحو 35 ألف أسرة"; Al Maktoum International 28 Apr 2024
// "الأكبر في العالم بتكلفة 128 مليار درهم" (he says "تتجاوز الـ120 مليار": true).  The Tilal Al Furjan example (4-bed, 3.2m off-plan -> 6m ready) is HIS
// example - no public source; 3.2 -> 6.0 = +87.5% (his "95%" was cut from the voice; the screen shows the correct figure; years are not shown on screen).
// Map: (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;،؟]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'], WHITES = ['#F3EFE6', '#FFFFFF'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  IMAGES.L_nakheel = 'assets/img/nakheel_logo_white_original.png';
  const DARK_PLATE = new Set(['nakheel']);
  const P = GEO.x.points || {};
  const SITE = [55.026, 24.966];                                                    // Palm Springs: the reported area (Hessyan 1, approximate)
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = SAFE.x0;                                                                   // no bubble: the titles may use the full safe width (right-aligned)
  const BUBBLE = null;                                                              // no picture of him (his request): voice + graphics only

  const K = {
    nakheel: A('نخيل'), dimn: A('ضمن'), hasab: A('حسب'), majma2: A('المجمع'), nakhla: A('نخلة'), bimuhatha: A('بمحاذاة'), tatwir: A('تطوير'), tawsia: A('وتوسعة'), matar: A('مطار'),
    wazaif: A('الوظائف'), yazid: A('يزيد'), majmaat: A('والمجمعات'), khalna: A('وخلنا'), nakheel2: A('نخيل', 34), tilal: A('تلال'), m32: A('3.2 مليون'), m6: A('بـ6 ملايين'),
    dirasa: A('دراسة'), uktub: A('اكتب'), kw: A('بالم', 58), tawasal: A('وبتواصل'),
  };
  const FACE_SEGS = [];
  const H0 = [0, K.hasab - 0.12], M1 = [H0[1], 12.25], P1 = [M1[1], K.tawsia - 0.15], P2 = [P1[1], 23.1], D1 = [P2[1], 31.3], E1a = [D1[1], K.tilal - 0.2], E1b = [E1a[1], 50.6], CTA = 50.75;
  const WORK = 23.3, JOBS = K.wazaif - 0.25, NAFS = 45.3;                            // the joins: 12.25 / 23.1 / 50.6 / 50.75 and these starts are where his recordings meet

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
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : n.kind === 'tile' ? tile : n.kind === 'cardAR' ? cardAR : card)(t, n);
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
  // ---------------------------------------------------------------- right-to-left pieces (Arabic)
  const hudAR = (t, kicker, name, sub, a0, a1, color) => {                           // the title block beside his bubble, right-aligned at the safe edge
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const e = ea(t, a0, a0 + 0.7, E.out4), dy = (1 - e) * 34, X = SAFE.x1, MW = SAFE.x1 - HUD_X, f = F.d(800, 56), f3 = F.d(700, 32), fk = F.d(700, 28);
    ctx.save(); ctx.globalAlpha *= al; { const g = ctx.createLinearGradient(0, 270, 0, 600); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(0.2, 'rgba(8,8,10,0.62)'); g.addColorStop(0.62, 'rgba(8,8,10,0.62)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 270, W, 330); }
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 2 * SS;
    if (kicker) T(kicker, X, 362 + dy, { font: fk, color: C.dim, align: 'right', sx: fit(kicker, fk, MW) });
    T(name, X, 430 + dy, { font: f, color: C.ink, align: 'right', sx: fit(name, f, MW) });
    rr(X - 120 * e, 450 + dy, 120 * e, 6, 3); ctx.fillStyle = color || C.gold; ctx.fill();
    if (sub) T(sub, X, 500 + dy, { font: f3, color: color || C.gold, align: 'right', sx: fit(sub, f3, MW) });
    ctx.restore();
  };
  const cardAR = (t, n) => {                                                          // a wide card: logo / icon plate on the RIGHT, text right-aligned beside it
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2) * (n.a1 ? 1 - ea(t, n.a1, n.a1 + 0.4) : 1); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    box(x0, y0, w, h, 26, n.edge || GOLD_A + '0.32)'); const pw = n.pw || 200, ph = h - 36, px = x0 + w - 18 - pw;
    if (n.logo) plate(n.logo, px, y0 + 18, pw, ph);
    else { rr(px, y0 + 18, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      if (n.icon) { dot(px + pw / 2, y0 + 18 + ph / 2, Math.min(ph, pw) * 0.32, '#1A1712'); ring(px + pw / 2, y0 + 18 + ph / 2, Math.min(ph, pw) * 0.32, { color: GOLD, w: 3 }); icon(n.icon, px + pw / 2, y0 + 18 + ph / 2, Math.min(ph, pw) * 0.16, { p: ea(t, n.t + 0.1, n.t + 0.7), color: GOLD, w: 4 }); }
      else T(n.mono, px + pw / 2, y0 + 18 + ph / 2 + 15, { font: F.d(800, 42), color: n.monoC || GOLD, sx: fit(n.mono, F.d(800, 42), pw - 20) }); }
    const tx = px - 28, mw = tx - x0 - 28, f = F.d(800, n.fs || 40);
    T(n.title, tx, y0 + h / 2 + (n.sub ? -4 : 15), { font: f, color: '#FFFFFF', align: 'right', sx: fit(n.title, f, mw) });
    if (n.sub) T(n.sub, tx, y0 + h / 2 + 42, { font: F.d(700, 26), color: n.subC || GOLD, align: 'right', alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 26), mw) });
    ctx.restore();
  };
  const chipAR = (t, txt, x, y, a0, a1, ic, col = GOLD) => {                          // a pill: icon on the right, text beside it
    const e = ea(t, a0, a0 + 0.45, E.back) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (e <= 0.003) return; const f = F.d(800, 34), w = Math.min(SAFE.w, M(txt, f) + (ic ? 120 : 70)), h = 84;
    ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x, y); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); box(-w / 2, -h / 2, w, h, h / 2, col + 'AA');
    if (ic) { dot(w / 2 - 46, 0, 26, '#1A1712'); icon(ic, w / 2 - 46, 0, 14, { p: ea(t, a0, a0 + 0.5), color: col, w: 3.5 }); }
    T(txt, ic ? w / 2 - 86 : 0, 12, { font: f, color: '#FFFFFF', align: ic ? 'right' : 'center', sx: fit(txt, f, w - (ic ? 120 : 60)) }); ctx.restore();
  };
  const calloutAR = (t, cam, [lon, lat], label, sub, color, a0, a1, dy = -150) => {   // a map label box (text right-aligned, colour bar on the right) with a leg to the place
    const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
    const [ax, ay] = satProj(cam, lon, lat), f = F.d(800, 32), f2 = F.d(700, 24), tw = Math.max(M(label, f), sub ? M(sub, f2) : 0), pw = Math.min(SAFE.w, tw + 76), ph = sub ? 108 : 70;
    const lx = clamp(ax, SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(ay + dy, 640 + ph / 2, 1270 - ph / 2), e = ea(t, a0, a0 + 0.5, E.back), p = ea(t, a0 - 0.1, a0 + 0.35, E.out3);
    const ey = ay < ly ? ly - ph / 2 : ly + ph / 2;
    ctx.save(); ctx.globalAlpha *= al; ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
    strokePoly([[ax, ay], [ax, lerp(ay, ey, 1)]], p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly([[ax, ay], [ax, ey]], p, { color: '#FFFFFF', w: 2.5 });
    ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rr(pw / 2 - 10, -ph / 2, 10, ph, [0, 18, 18, 0]); ctx.fillStyle = color; ctx.fill();
    T(label, pw / 2 - 34, -ph / 2 + 46, { font: f, color: '#FFFFFF', align: 'right', sx: fit(label, f, pw - 56) }); if (sub) T(sub, pw / 2 - 34, ph / 2 - 22, { font: f2, color, align: 'right', sx: fit(sub, f2, pw - 56) });
    ctx.restore();
  };
  // ---------------------------------------------------------------- the maps
  const calloutEN = (t, cam, [lon, lat], label, sub, color, a0, a1, dx = 0, dy = -150) => {
    const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
    const [ax, ay] = satProj(cam, lon, lat), f = F.d(800, 30), f2 = F.d(700, 21), tw2 = Math.max(M(label, f, 1), sub ? M(sub, f2, 2) : 0), pw = Math.min(SAFE.w, tw2 + 70), ph = sub ? 100 : 66;
    const lx = clamp(ax + dx, SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(ay + dy, 620 + ph / 2, 1270 - ph / 2), e = ea(t, a0, a0 + 0.5, E.back), p = ea(t, a0 - 0.1, a0 + 0.35, E.out3);
    const ex = clamp(ax, lx - pw / 2 + 24, lx + pw / 2 - 24), ey = ay < ly ? ly - ph / 2 : ly + ph / 2, my = lerp(ay, ey, 0.55);
    ctx.save(); ctx.globalAlpha *= al; ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
    const leg = [[ax, ay], [ax, my], [ex, my], [ex, ey]].filter((q, i, arr) => !i || Math.hypot(q[0] - arr[i - 1][0], q[1] - arr[i - 1][1]) > 0.5);
    strokePoly(leg, p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly(leg, p, { color: '#FFFFFF', w: 2.5 });
    ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rr(-pw / 2, -ph / 2, 10, ph, [18, 0, 0, 18]); ctx.fillStyle = color; ctx.fill();
    T(label, -pw / 2 + 32, -ph / 2 + 44, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(label, f, pw - 50, 1) }); if (sub) T(sub, -pw / 2 + 32, ph / 2 - 22, { font: f2, ls: 2, color, align: 'left', sx: fit(sub, f2, pw - 50, 2) });
    ctx.restore();
  };
  const numPin = (t, cam, [lon, lat], n, a0, a1, badge) => {                         // a numbered site marker (1, 2, 3) with an optional badge
    const e = ea(t, a0, a0 + 0.5, E.back) * (a1 ? 1 - ea(t, a1, a1 + 0.3) : 1); if (e <= 0.003) return; const [x, y] = satProj(cam, lon, lat);
    ctx.save(); ctx.globalAlpha *= clamp(e); glow(x, y, 70, '233,196,124', 0.45); ctx.translate(x, y); ctx.scale(lerp(0.6, 1, e), lerp(0.6, 1, e)); dot(0, 0, 30, GOLD); ring(0, 0, 38, { color: '#FFFFFF', w: 3 }); T(String(n), 0, 12, { font: F.d(800, 34), color: '#17181B' });
    if (badge) { const be = ea(t, badge, badge + 0.4, E.back); if (be > 0.003) { const f = F.d(800, 22), w = M('MASTER PLAN ✓', f, 2) + 36; ctx.globalAlpha *= clamp(be); rr(46, -22, w, 44, 22); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = TEAL[0]; ctx.lineWidth = 2; ctx.stroke(); T('MASTER PLAN ✓', 46 + w / 2, 8, { font: f, ls: 2, color: TEAL[1] }); } }
    ctx.restore();
  };
  const flight = (id, T, keys, top) => { SAT_SCENES[id] = { a: T[0], b: T[1], veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a: T[0], b: T[1], cfg: { top } }); };
  const mapTagEN = (t, cam, [lon, lat], txt, a0, a1, dy) => {                         // a small labelled marker on the map (the overview)
    const e = ea(t, a0, a0 + 0.45, E.back) * (a1 ? 1 - ea(t, a1, a1 + 0.3) : 1); if (e <= 0.003) return;
    const [x, y] = satProj(cam, lon, lat), f = F.d(800, 26), w = M(txt, f, 2) + 44, lx = clamp(x, SAFE.x0 + w / 2, SAFE.x1 - w / 2), ly = clamp(y + dy, 620, 1270);
    ctx.save(); ctx.globalAlpha *= clamp(e); ring(x, y, 16, { color: '#FFFFFF', w: 3 }); dot(x, y, 7, '#FFFFFF');
    ctx.translate(lx, ly); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); rr(-w / 2, -26, w, 52, 26); ctx.fillStyle = 'rgba(10,11,14,0.92)'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
    T(txt, 0, 10, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore();
  };
  page('p_pja', 'dmo_pja_ar', P1, [[P1[0] + 0.1, qy('dmo_pja_ar', 0)], [16.0, qy('dmo_pja_ar', 1)]], [[0, P1[0] + 0.6, 15.8], [1, 16.1, P1[1] - 0.3]]);
  page('p_dwc', 'dmo_dwc_ar', P2, [[P2[0] + 0.1, qy('dmo_dwc_ar', 0)]], [[0, K.matar - 0.1, P2[1] - 0.6]]);
  for (const s of SCENES) if (s.kind === 'page') for (const h of s.hl) h.rtl = true;    // Arabic: the marker wipes right to left

  flight('m1', M1, [[0, 55.06, 25.03, 11.55, 0, 10], [2.2, 55.03, 24.986, 12.15, 0, 20], [dur(M1) + 0.5, 55.033, 24.99, 12.25, 0, 22]], (t, cam) => {
    mapArea(t, cam, 'hessyan1', { c: TEAL, a0: K.majma2 - 0.3, dur: 0.8, on: [K.majma2, M1[1]], base: 0.35 }); mapPulse(t, cam, SITE[0], SITE[1], 650, K.majma2, 0);
    calloutAR(t, cam, SITE, 'بالم سبرينغز', 'حسب المعلومات الأولية · الموقع تقريبي', TEAL[1], K.majma2 + 0.2, 0, 230);
    mapArea(t, cam, 'palm', { c: GOLDS, a0: K.nakhla - 0.3, dur: 0.9, on: [K.nakhla - 0.1, M1[1]], base: 0.45 }); mapTagEN(t, cam, P.palm, 'نخلة جبل علي', K.nakhla, 0, -100);
    mapRoad(t, cam, 'E11', { a0: K.bimuhatha - 0.2, dur: 1.4, alpha: 0.95, name: 'شارع الشيخ زايد', shields: [[55.075, 24.995], [55.06, 24.98]] });
  });

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
  section(H0, ST(H0), [ { kind: 'cardAR', x: CX, y: 760, w: 820, h: 180, logo: 'nakheel', pw: 250, t: 0.4, title: 'بالم سبرينغز', sub: 'من نخيل', subT: K.nakheel - 0.1, fs: 52 } ], []);
  const H0chip = t => chipAR(t, 'ضمن خياراتك الاستثمارية؟', CX, 1010, K.dimn - 0.25, H0[1] - 0.15, 'chart');
  // more business -> more jobs -> demand for family homes -> communities like Palm Springs
  const CH = [['توسع الأعمال', 'briefcase', WORK], ['زيادة الوظائف', 'up', JOBS], ['طلب أعلى على البيوت العائلية', 'house', K.yazid - 0.2], ['مجمعات مثل بالم سبرينغز', 'building', K.majmaat - 0.1]];
  section(D1, ST(D1), CH.map(([ti, ic, a], i) => ({ kind: 'cardAR', x: CX, y: 650 + i * 170, w: 820, h: 130, icon: ic, pw: 130, t: a, title: ti, fs: 38 })),
    CH.slice(1).map(([, , a], i) => ({ pts: [[CX, 650 + i * 170 + 65], [CX, 650 + (i + 1) * 170 - 65]], t: a - 0.3, d: 0.3 })));
  // the example: Nakheel communities nearby -> Tilal Al Furjan
  section(E1a, ST(E1a), [ { kind: 'cardAR', x: CX, y: 980, w: 820, h: 170, logo: 'nakheel', pw: 240, t: K.nakheel2 - 0.25, title: 'مجمعات نخيل', sub: 'القريبة من هذه المنطقة', subT: K.nakheel2 + 0.2, fs: 44 } ], []);
  const E1chip = t => chipAR(t, 'مثال على ارتفاع رأس المال', CX, 760, E1a[0] + 0.1, E1a[1] - 0.15, 'up', TEAL[0]);
  section(E1b, ST(E1b), [ { kind: 'cardAR', x: CX, y: 660, w: 820, h: 170, logo: 'nakheel', pw: 240, t: E1b[0] + 0.05, title: 'تلال الفرجان', sub: 'فيلا من 4 غرف · مثال', subT: E1b[0] + 0.4, fs: 46 } ], []);
  const bars = (t) => { const al = win(t, E1b[0], E1b[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al; const X0 = SAFE.x0, X1 = SAFE.x1, BW = SAFE.w;
    [['السعر على الخريطة', '3.2 مليون درهم', 3.2, 830, K.m32 - 0.4], ['السعر وهي جاهزة', '6 ملايين درهم', 6.0, 1000, K.m6 - 0.4]].forEach(([lab, val, v, y, a]) => {
      const e = ea(t, a, a + 0.4, E.out4), p = ea(t, a + 0.1, a + 0.9, E.inOut2); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e;
      T(lab, X1, y, { font: F.d(800, 32), color: '#FFFFFF', align: 'right' }); T(val, X0, y, { font: F.d(800, 34), color: '#FFFFFF', align: 'left' });
      rr(X0, y + 20, BW, 46, 23); ctx.fillStyle = '#0E0E11'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.save(); rr(X0, y + 20, BW, 46, 23); ctx.clip(); const w = BW * v / 6.0 * p; rr(X1 - w, y + 20, w, 46, 23); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore(); ctx.restore(); });   // bars grow right to left
    ctx.restore(); chipAR(t, 'ارتفاع بنحو 87.5%', CX, 1190, K.m6 + 0.9, E1b[1] - 0.15, 'up', TEAL[0]); };
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    H0chip(t); E1chip(t); bars(t);
    hudAR(t, 'مجمع جديد من نخيل', 'ليش يستاهل؟', 'ضمن خياراتك الاستثمارية', 0.15, H0[1] - 0.15, GOLD);
    hudAR(t, 'حسب المعلومات الأولية', 'مقابل نخلة جبل علي', 'بمحاذاة شارع الشيخ زايد', M1[0] + 0.05, M1[1] - 0.15, TEAL[1]);
    hudAR(t, 'المحرك الأول', 'تطوير نخلة جبل علي', '13.4 كم² · ضعف نخلة جميرا', P1[0] + 0.05, 15.95, GOLD);
    hudAR(t, 'نخلة جبل علي', 'لنحو 35 ألف أسرة', 'والطرق المرتبطة فيها', 16.05, P1[1] - 0.15, GOLD);
    hudAR(t, 'المحرك الثاني', 'توسعة مطار آل مكتوم', 'بتكلفة 128 مليار درهم', P2[0] + 0.05, P2[1] - 0.15, BLUE[1]);
    hudAR(t, 'مع توسع الأعمال', 'يزيد الطلب', 'على البيوت العائلية', D1[0] + 0.05, D1[1] - 0.15, GOLD);
    hudAR(t, 'خلنا ناخذ مثال', 'ارتفاع رأس المال', 'مجمعات نخيل القريبة', E1a[0] + 0.05, E1a[1] - 0.15, TEAL[1]);
    hudAR(t, 'مثال من نخيل', 'تلال الفرجان', 'فيلا من 4 غرف', E1b[0] + 0.05, K.m6 + 0.8, GOLD);
    hudAR(t, 'تلال الفرجان', 'ارتفاع بنحو 87.5%', 'من 3.2 إلى 6 ملايين درهم', K.m6 + 0.9, E1b[1] - 0.15, TEAL[1]);
    srcChip(t, 'المكتب الإعلامي لحكومة دبي · 31 مايو 2023', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'المكتب الإعلامي لحكومة دبي · 28 أبريل 2024', P2[0] + 0.2, P2[1] - 0.15);
    // the call to action: his investment study - comment "بالم"
    const ce = ea(t, CTA - 0.1, CTA + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('عبدالله أهلي', CX, 650, { font: F.d(800, 70), color: C.ink }); T('محلل عقاري', CX, 712, { font: F.d(700, 34), color: C.gold }); ctx.restore();
      cardAR(t, { x: CX, y: 850, w: 820, h: 150, icon: 'doc', pw: 150, t: K.dirasa - 0.25, title: 'دراسة متكاملة عن المشروع', sub: 'من زاوية استثمارية', subT: K.dirasa + 0.6, fs: 38 });
      const msg = 'بالم', send = K.kw + 0.45, sent = ea(t, send, send + 0.35), ia = ea(t, K.uktub - 0.4, K.uktub, E.out4), iy = 1270, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.kw - 0.05, K.kw + 0.3, E.lin) + 0.0001)), fm = F.d(700, 56);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X1 - 56, iy + 20, { font: fm, color: C.ink, align: 'right', alpha: 1 - sent }); T('أضف تعليقاً…', X1 - 56, iy + 18, { font: F.d(700, 46), color: C.mute, align: 'right', alpha: (1 - ea(t, K.kw - 0.05, K.kw + 0.05)) * (1 - sent) });
      dot(X0 + 66, iy, 48, C.gold); icon('plane', X0 + 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: Math.PI + 0.5 - 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 90; rr(X1 - w, 975, w, 104, 52); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 1046, { font: fm, color: '#17181B' }); ctx.restore(); }
      const b2 = ea(t, K.tawasal - 0.1, K.tawasal + 0.4, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'بتواصل وياك بشكل مباشر', f = F.d(700, 38), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1095, w, 96, 48); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + w - 56, 1143, 18, { p: ea(t, K.tawasal, K.tawasal + 0.4), color: C.gold, w: 4.5 }); T(txt, X0 + w - 96, 1157, { font: f, color: C.ink, align: 'right', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, M1[0], P1[0], P2[0], D1[0], E1a[0], E1b[0], CTA].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.m32, K.m6].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.kw + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
