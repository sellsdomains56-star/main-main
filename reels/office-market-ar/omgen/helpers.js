  const END = TL.dur;

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  const GOLD = '#E9C47C', BLUE = ['#3DB2FF', '#A9DEFF'], TEAL = ['#2FD8A0', '#A6F3D6'], GOLDS = ['#C99A4A', '#F3D9A4'], VIO = ['#8C7BFF', '#CFC6FF'], RED = ['#E5484D', '#FF8A8E'];
  const P = GEO.x.points || {};
  const HX = SAFE.x1;
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;
  const fit = (s, f, w) => Math.min(1, w / M(s, f));
  const dur = T => T[1] - T[0];

  // ---------------------------------------------------------------- beat builders
  const BEATS = [];                                                  // [{T, hud:[kicker, name, sub, color], src}]
  const flight = (id, T, keys, top) => { SAT_SCENES[id] = { a: T[0], b: T[1], veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a: T[0], b: T[1], cfg: { top } }); };
  // a page: headline first, then the camera flies to each stop [abs time, image y] and holds; marks: [phrase index, t0, t1] (the marker wipes line by line)
  const lineBoxes = (rects) => {                                     // merge the rects of one phrase into one box per text line, top line first
    const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); }
    return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]);
  };
  const page = (id, img, T, stops, marks, rtl = true, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, 0.92, 10]; keys[0] = [0, ...pc]; }   // a short beat opens on the quoted line, not on the headline
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = [];
    for (const [pi, t0, t1] of marks) {
      const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0;
      for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot, rtl }); }
    }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const beat = (T, hud, src) => BEATS.push({ T, hud, src });

  // ---------------------------------------------------------------- overlay pieces
  const hudAR = (t, kicker, name, sub, a0, a1, color = GOLD) => {
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const e = ea(t, a0, a0 + 0.7, E.out4), dy = (1 - e) * 34, MW = HX - SAFE.x0, f = F.d(800, 56), fk = F.d(700, 30), f3 = F.d(700, 31);
    ctx.save(); ctx.globalAlpha *= al; { const g = ctx.createLinearGradient(0, 270, 0, 600); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(0.2, 'rgba(8,8,10,0.62)'); g.addColorStop(0.62, 'rgba(8,8,10,0.62)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 270, W, 330); }
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 2 * SS;
    T(kicker, HX, 356 + dy, { font: fk, color: C.dim, align: 'right', sx: fit(kicker, fk, MW) });
    T(name, HX, 424 + dy, { font: f, color: C.ink, align: 'right', sx: fit(name, f, MW) });
    rr(HX - 120 * e, 464 + dy, 120 * e, 6, 3); ctx.fillStyle = color; ctx.fill();
    if (sub) T(sub, HX, 512 + dy, { font: f3, color, align: 'right', sx: fit(sub, f3, MW) });
    ctx.restore();
  };
  const calloutAR = (t, cam, [lon, lat], label, sub, color, a0, a1, dx = 0, dy = -150) => {
    const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
    const [ax, ay] = satProj(cam, lon, lat), f = F.d(800, 36), f2 = F.d(700, 25), tw2 = Math.max(M(label, f), sub ? M(sub, f2) : 0), pw = tw2 + 70, ph = sub ? 108 : 70;
    const lx = clamp(ax + dx, SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(ay + dy, 640 + ph / 2, 1300 - ph / 2), e = ea(t, a0, a0 + 0.5, E.back), p = ea(t, a0 - 0.1, a0 + 0.35, E.out3);
    const ex = clamp(ax, lx - pw / 2 + 24, lx + pw / 2 - 24), ey = ay < ly ? ly - ph / 2 : ly + ph / 2, my = lerp(ay, ey, 0.55);
    ctx.save(); ctx.globalAlpha *= al; ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
    const leg = [[ax, ay], [ax, my], [ex, my], [ex, ey]].filter((q, i, arr) => !i || Math.hypot(q[0] - arr[i - 1][0], q[1] - arr[i - 1][1]) > 0.5);
    strokePoly(leg, p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly(leg, p, { color: '#FFFFFF', w: 2.5 });
    ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rr(pw / 2 - 10, -ph / 2, 10, ph, [0, 18, 18, 0]); ctx.fillStyle = color; ctx.fill();
    T(label, pw / 2 - 34, -ph / 2 + 48, { font: f, color: '#FFFFFF', align: 'right' });
    if (sub) T(sub, pw / 2 - 34, ph / 2 - 20, { font: f2, color, align: 'right' });
    ctx.restore();
  };
  const chip = (t, txt, a0, a1, y = 1150, color = GOLD, size = 31) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, size), w = Math.min(SAFE.w, M(txt, f) + 64); ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(CX - w / 2, y, w, size + 35, (size + 35) / 2); T(txt, CX, y + size * 0.5 + 28, { font: f, color, sx: fit(txt, f, SAFE.w - 64) }); ctx.restore(); };
  // a card of up to three lines (right-aligned, gold edge on the right) - for his figures on the map
  const card = (t, rows, a0, a1, y = 1000) => {
    const al = win(t, a0, a1); if (al <= 0.003) return; const h = 40 + rows.length * 76;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(SAFE.x0, y, SAFE.w, h, 30); rr(SAFE.x1 - 10, y, 10, h, [0, 30, 30, 0]); ctx.fillStyle = GOLD; ctx.fill();
    rows.forEach(([txt, a, gold], i) => { const e = ea(t, a - 0.15, a + 0.3, E.out4); if (e <= 0.003) return; const f = F.d(800, i === 0 && rows.length > 1 && !gold ? 34 : 40); ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * 30, 0); T(txt, SAFE.x1 - 40, y + 72 + i * 76, { font: f, color: gold ? GOLD : '#FFFFFF', align: 'right', sx: fit(txt, f, SAFE.w - 80) }); ctx.restore(); });
    ctx.restore();
  };
  const tiles = (t, items, a1, y = 1030) => {                       // 2x2 tiles that pop in one by one (right to left, top to bottom)
    const tw3 = 390, th = 110, gap = 30, x0 = CX - tw3 - gap / 2;
    items.forEach(([txt, a], i) => { const e = ea(t, a - 0.1, a + 0.35, E.back) * (1 - ea(t, a1, a1 + 0.35)); if (e <= 0.003) return; const col = i % 2, row = Math.floor(i / 2), x = col ? x0 : x0 + tw3 + gap, yy = y + row * (th + gap);
      ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x + tw3 / 2, yy + th / 2); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); glassPill(-tw3 / 2, -th / 2, tw3, th, 26); rr(-tw3 / 2, -th / 2, tw3, th, 26); ctx.strokeStyle = 'rgba(233,196,124,0.85)'; ctx.lineWidth = 3; ctx.stroke(); T(txt, 0, 16, { font: F.d(800, 46), color: GOLD }); ctx.restore(); });
  };
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 25), w = M(txt, f) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 54, 27); T(txt, CX, 1209, { font: f, color: '#FFFFFF' }); ctx.restore(); };
  const rings = (t, cam, [lon, lat], a0, a1, m = 3800) => { const al = win(t, a0, a1); if (al <= 0.003) return; const [x, y] = satProj(cam, lon, lat); for (let i = 0; i < 3; i++) { const u = ((t - a0) / 1.8 + i / 3) % 1; ring(x, y, m * (0.15 + 0.85 * u) / mpp(cam, lat), { color: 'rgb(233,196,124)', w: 6, alpha: (1 - u) * 0.9 * al }); } };
  const towerPin = (t, cam, [lon, lat], a0) => { const al = ea(t, a0, a0 + 0.4); if (al <= 0.003) return; const [x, y] = satProj(cam, lon, lat), h = 260 * ea(t, a0, a0 + 0.9, E.out3);
    ctx.save(); ctx.globalAlpha *= al; const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, 'rgba(233,196,124,0)'); g.addColorStop(1, 'rgba(233,196,124,0.85)'); ctx.fillStyle = g; ctx.fillRect(x - 5, y - h, 10, h); glow(x, y, 70, '233,196,124', 0.5); dot(x, y, 11, '#FFF6DE'); ring(x, y, 22, { color: GOLD, w: 3 }); ctx.restore(); };
  const area = (t, cam, key, c, a0, on, base = 0.5) => mapArea(t, cam, key, { c, a0, dur: 0.8, on, base });

