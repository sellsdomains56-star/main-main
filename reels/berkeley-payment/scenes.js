'use strict';
// ---------------------------------------------------------------------------
// "Before you spend 11 million AED on an office in Dubai, check how much you'll pay before the building is finished" - HeyGen f76cb90f (66.3 s).  60 fps.
// Berkeley Tower (Ellington Properties x Al Hamra Group, Business Bay): render card, map, the developer's release and its own payment-plan sheet with the
// cells marked, then the AED 11M split as a bar.  His face SMALL the whole time.
// Facts (research 31 Oct 2026, research_offices.md): Ellington release 20 Oct 2026: "rising above 60 floors", "Robotic parking will be a defining feature
// of the development, alongside double-decker lifts", "Five floors dedicated to amenities — across the ground floor, mezzanine and three additional
// levels", "business lounges and meeting rooms, fitness and wellness spaces ... a clubhouse".  Ellington's payment-plan sheet (PDF created 19 Oct 2026,
// not linked from the public page): 20% at booking, ten 5% instalments (four time-based, six construction-linked), 30% on completion.  On AED 11M:
// 2.2M + 5.5M + 3.3M, before DLD / purchase fees.  The tower is on Sheikh Zayed Road; Ellington says "a Dubai Metro station just steps away".
// Map: (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'], WHITES = ['#F3EFE6', '#FFFFFF'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  IMAGES.r_berk = 'assets/img/r_berk.jpg'; for (const k of ['ell', 'alhamra']) IMAGES['L_' + k] = `assets/img/logo_${k}.png`;
  const DARK_PLATE = new Set([]);
  const P = GEO.x.points || {};
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    n11: A('11'), check: A('check'), finished: A('finished.'), berkeley: A('berkeley'), ellington: A('ellington'), grade: A('grade'), business: A('business'), near: A('near'), metro: A('metro.'),
    the1: A('the', 11.5), n60: A('60'), robotic: A('robotic'), double: A('double-decker'), amenities: A('amenities'), five: A('five', 16.9), business2: A('business', 18.3), clubhouse: A('clubhouse.'),
    but: A('but', 21.7), published: A('published'), p20: A('20%'), p50: A('50%'), p30: A('30%'), on2: A('on', 31.7), n22: A('2.2'), n55: A('5.5'), n33: A('3.3'), before2: A('before', 40), and2: A('and', 42.7),
    ready: A('ready'), an2: A('an', 45.7), occupier: A('occupier.'), compare: A('compare'), usable: A('usable'), parking: A('parking'), fitout: A('fit-out'), service: A('service'), rental: A('rental'),
    a3: A('a', 57.4), lower: A('lower'), only: A('only'), full: A('full'), comment: A('comment'), BERK: A('berkeley', 61), budget: A('budget'), business3: A('business', 63), rent: A('rent'), lets: A("let's"),
  };
  const FACE_SEGS = [];
  const H0 = [0, K.berkeley - 0.12], C1 = [H0[1], K.near - 0.1], M1 = [C1[1], K.the1 - 0.1], P1 = [M1[1], K.but - 0.12], P2 = [P1[1], K.on2 - 0.12], CH = [P2[1], K.and2 - 0.12],
    R1 = [CH[1], K.compare - 0.12], C2 = [R1[1], K.a3 - 0.12], C3 = [C2[1], K.comment - 0.12];

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
  page('p_pr', 'ell_pr', P1, [[P1[0] + 0.1, qy('ell_pr', 0) + 200], [K.amenities - 0.4, (qy('ell_pr', 2) + qy('ell_pr', 1)) / 2], [K.business2 - 0.3, qy('ell_pr', 3)]],
    [[0, K.n60 - 0.3, K.n60 + 0.7], [1, K.robotic - 0.1, K.double + 0.9], [2, K.amenities - 0.1, K.five + 0.6], [3, K.business2 - 0.05, K.clubhouse + 0.5]]);
  page('p_plan', 'ell_plan', P2, [[P2[0] + 0.1, 680, 1.0], [K.published - 0.2, 970, 1.04]], [[0, K.p20 - 0.15, K.p20 + 0.6], [1, K.p50 - 0.15, K.p50 + 1.3], [2, K.p30 - 0.15, K.p30 + 0.6]], 1.0);

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
  flight('m1', M1, [[0, 55.262, 25.192, 13.6, 0, 20], [dur(M1) + 0.5, 55.262, 25.192, 13.85, 0, 28]], (t, cam) => {
    mapArea(t, cam, 'bbay', { c: BLUE, a0: M1[0], dur: 0.7, base: 0.3 }); mapRoad(t, cam, 'E11', { a0: M1[0], dur: 0.7, alpha: 0.95, hi: ea(t, K.near, K.near + 0.4) });
    mapPulse(t, cam, P.berk[0], P.berk[1], 160, M1[0] + 0.1, 0);
    calloutEN(t, cam, P.berk, 'BERKELEY TOWER', 'SHEIKH ZAYED ROAD · NEAR THE METRO', GOLD, M1[0] + 0.2, 0, 60, 230);
  });

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
  // the hook: AED 11 million, and how much is due before completion
  const hook = (t) => { const al = win(t, 0.05, H0[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const e = ea(t, K.n11 - 0.1, K.n11 + 0.5, E.back); ctx.save(); ctx.translate(CX, 820); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.globalAlpha *= clamp(e);
    T('AED', 0, -70, { font: F.d(800, 44), ls: 6, color: GOLD }); T('11,000,000', 0, 40, { font: F.d(800, 120), ls: 2, color: '#FFFFFF', sx: fit('11,000,000', F.d(800, 120), SAFE.w, 2) }); ctx.restore();
    const q = ea(t, K.check - 0.1, K.check + 0.4, E.out4); T('HOW MUCH BEFORE IT IS FINISHED?', CX, 960, { font: F.d(800, 36), ls: 2, color: AMBER, alpha: q, sx: fit('HOW MUCH BEFORE IT IS FINISHED?', F.d(800, 36), SAFE.w, 2) });
    ctx.restore(); };
  section(C1, ST(C1), [
    { x: CX, y: 820, w: 820, h: 420, photo: 'r_berk', logo: 'ell', t: C1[0] + 0.05, title: 'BERKELEY TOWER', sub: 'ELLINGTON × AL HAMRA · BUSINESS BAY', subT: K.ellington, credit: 'RENDER · ELLINGTON', fs: 40 },
    { kind: 'tag', x: CX, y: 1110, w: 520, h: 72, icon: 'building', title: 'GRADE A COMMERCIAL', t: K.grade - 0.1 },
  ], []);
  // the AED 11M split, as a bar: 20% booking, 50% instalments, 30% completion
  const SEG = [[0.2, '2.2M', 'ON BOOKING', '20%', GOLD, K.n22], [0.5, '5.5M', 'TEN 5% INSTALMENTS', '50%', BLUE[0], K.n55], [0.3, '3.3M', 'ON COMPLETION', '30%', '#F3EFE6', K.n33]];
  const bar = (t) => { const al = win(t, CH[0], CH[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    T('AED 11,000,000 OFFICE', CX, 640, { font: F.d(800, 40), ls: 2, color: '#FFFFFF' }); T("ELLINGTON'S PUBLISHED SCHEDULE", CX, 690, { font: F.d(700, 24), ls: 4, color: GOLD });
    const X0 = SAFE.x0, BW = SAFE.w, y = 760, h = 110; rr(X0, y, BW, h, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    let x = X0; SEG.forEach(([f, amt, lab, pct, col, a], i) => { const w = BW * f, e = ea(t, a - 0.2, a + 0.5, E.out3);
      if (e > 0.003) { ctx.save(); ctx.beginPath(); rr(x + 2, y, Math.max(4, (w - 4) * e), h, i === 0 ? [18, 4, 4, 18] : i === 2 ? [4, 18, 18, 4] : 4); ctx.fillStyle = col; ctx.fill(); ctx.restore();
        const la = ea(t, a + 0.1, a + 0.5, E.out4); T(pct, x + w / 2, y + 70, { font: F.d(800, 44), color: '#17181B', alpha: la });
        T(amt, x + w / 2, y + h + 64, { font: F.d(800, 48), color: '#FFFFFF', alpha: la }); T(lab, x + w / 2, y + h + 104, { font: F.d(700, 21), ls: 2, color: col === '#F3EFE6' ? '#F3EFE6' : col, alpha: la, sx: fit(lab, F.d(700, 21), w - 16, 2) }); }
      x += w; });
    const n = ea(t, K.before2 - 0.1, K.before2 + 0.4); if (n > 0.003) { const txt = '+ PURCHASE FEES AND OTHER COSTS', f = F.d(800, 26), w = M(txt, f, 2) + 56; ctx.save(); ctx.globalAlpha *= n; rr(CX - w / 2, 1060, w, 62, 31); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = AMBER; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, CX, 1100, { font: f, ls: 2, color: AMBER }); ctx.restore(); }
    ctx.restore(); };
  const R1rows = t => rows(t, R1, [[700, K.ready - 0.2, 'A READY OFFICE', 'CAN EARN INCOME SOONER', 'ok'], [860, K.an2 - 0.15, 'AN OFF-PLAN OFFICE', 'NEEDS TIME, CONSTRUCTION AND AN OCCUPIER', 'q']]);
  const CK = [['USABLE SPACE', K.usable, 'house'], ['PARKING ALLOCATION', K.parking, 'check'], ['FIT-OUT COSTS', K.fitout, 'tag'], ['SERVICE CHARGES', K.service, 'doc'], ['REALISTIC RENTAL INCOME', K.rental, 'chart']];
  section(C2, ST(C2), CK.map(([ti, a, ic], i) => ({ kind: 'tag', x: i === 4 ? CX : (i % 2 ? 745 : 335), y: 640 + Math.floor(i / 2) * 115, w: i === 4 ? 620 : 390, h: 84, icon: ic, title: ti, t: a - 0.15 })), []);
  section(C3, ST(C3), [
    { kind: 'tag', x: CX, y: 700, w: 640, h: 80, icon: 'tag', title: 'A LOWER PRICE PER SQ FT', t: K.lower - 0.1 },
    { kind: 'tag', x: CX, y: 900, w: 820, h: 80, icon: 'check', title: 'ONLY HELPS IF THE FULL INVESTMENT WORKS', t: K.only - 0.1 },
  ], [ { pts: [[CX, 742], [CX, 858]], t: K.only - 0.4, c: 'w', d: 0.3 } ]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    hook(t);
    for (const s of SECT) drawSection(t, s);
    bar(t); R1rows(t);
    hudTitle(t, 'BEFORE YOU SPEND', 'AED 11 MILLION', 'ON AN OFFICE IN DUBAI', 0.15, H0[1] - 0.15, GOLD);
    hudTitle(t, 'BUSINESS BAY', 'BERKELEY TOWER', 'BY ELLINGTON', C1[0] + 0.05, C1[1] - 0.15, GOLD);
    hudTitle(t, 'ON SHEIKH ZAYED ROAD', 'BUSINESS BAY', 'A METRO STATION STEPS AWAY', M1[0] + 0.05, M1[1] - 0.15, BLUE[1]);
    hudTitle(t, 'THE ANNOUNCED DESIGN', '60+ FLOORS', 'ROBOTIC PARKING · DOUBLE-DECKER LIFTS', P1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'THE PAYMENT PLAN', '20 · 50 · 30', "ELLINGTON'S PUBLISHED SCHEDULE", P2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'ON AN AED 11M OFFICE', 'WHAT YOU PAY, WHEN', '', CH[0] + 0.05, CH[1] - 0.15, GOLD);
    hudTitle(t, 'REMEMBER', 'READY vs OFF-PLAN', '', R1[0] + 0.05, R1[1] - 0.15, AMBER);
    hudTitle(t, 'COMPARE', 'THE WHOLE PICTURE', '', C2[0] + 0.05, C2[1] - 0.15, GOLD);
    hudTitle(t, 'PRICE PER SQ FT', 'ISN\'T ENOUGH', '', C3[0] + 0.05, C3[1] - 0.15, AMBER);
    srcChip(t, 'ELLINGTON PROPERTIES · 20 OCT 2026', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'ELLINGTON · BERKELEY TOWER PAYMENT PLAN', P2[0] + 0.2, P2[1] - 0.15);
    // the call to action: comment BERKELEY with your budget; for your business or to rent out
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'BERKELEY', send = K.BERK + 0.5, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.05, K.comment + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.BERK - 0.05, K.BERK + 0.4, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.BERK - 0.05, K.BERK + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      const fc = F.d(800, 32), chip = (txt, a, xr, y) => { const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return; const w = M(txt, fc, 2) + 60; ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(xr - w / 2, y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -36, w, 72, 36); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: fc, ls: 2, color: GOLD }); ctx.restore(); };
      chip('YOUR BUDGET', K.budget - 0.15, X1, 960);
      const wr = M('TO RENT OUT', fc, 2) + 60; chip('TO RENT OUT', K.rent - 0.15, X1, 1052); chip('FOR YOUR BUSINESS', K.business3 - 0.15, X1 - wr - 18, 1052);
      T("Let's compare your options", CX, 1160, { font: F.d(700, 38), color: C.ink, alpha: ea(t, K.lets - 0.2, K.lets + 0.3, E.out4) });
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, C1[0], M1[0], P1[0], P2[0], CH[0], R1[0], C2[0], C3[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.p20, K.p50, K.p30, K.n22, K.n55, K.n33].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.BERK + 0.5 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3977) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
