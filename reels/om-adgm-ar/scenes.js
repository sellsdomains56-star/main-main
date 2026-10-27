'use strict';
// ---------------------------------------------------------------------------
// "في شيء قاعد يصير في بوظبي" - voice note n2 of 27 Oct 2026 (03:41), the whole note: ADGM, Al Maryah and Al Reem, with his call
// to action "ADGM".
// Everything on screen in Arabic, right to left; every beat is a real page (marker on the exact words) or the map; no face (audio only); captions on the
// opening line only.  His voice: the whole note, untouched (one plain gain, pauses over 0.3 s shortened).  Pages: pagedata.js (captures in assets/, not
// committed).  Beats reused from ../office-market-ar (the combined video), re-timed with OFFS.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  // word times.  A(): anchors written in the combined video's times (the beats come from ../office-market-ar), shifted to this video by OFFS
  // (the same note with the same pauses, so one constant shift per piece); B(): anchors in this video's own times.
  const OFFS = [[135.0, 188.5, -135.48]];
  const cmap = c => { for (const [a, b, o] of OFFS) if (c >= a && c < b) return c + o; return c; };
  const find = (w, from) => { const n = s => s.replace(/[.،؟?:!]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === w); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const A = (w, from = 0) => find(w, Math.max(0, cmap(from) - 0.3)), B = (w, from = 0) => find(w, Math.max(0, from - 0.3));
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };   // centre of a quoted phrase (image px)
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


  // ================================================================ the beats
  // ---- 1. Abu Dhabi: ADGM, Al Maryah and Al Reem
  const a1 = [0, A('نتكلم', 142) - 0.1], a2 = [a1[1], A('نسبة', 153.5) - 0.1], a3 = [a2[1], A('الحين', 164) - 0.1], a4 = [a3[1], A('ومع', 179) - 0.1], a5 = [a4[1], B('اكتب', 52.3) - 0.1];
  const MAR = P.maryah, REEM = P.reem;
  flight('m_ad1', a1, [[0, 54.38, 24.47, 12.6, 60, 20], [dur(a1) + 0.5, 54.392, 24.5, 14.2, 150, 38]], (t, cam) => {
    area(t, cam, 'maryah', BLUE, a1[0] + 1.2, [a1[0] + 1.4, a1[1]]);
    calloutAR(t, cam, MAR, 'جزيرة الماريه', 'سوق أبوظبي العالمي ADGM', BLUE[1], a1[0] + 1.6, 0, 0, -210);
    chip(t, 'الطلب على المكاتب يرتفع', A('الطلب', 139.5) - 0.1, a1[1]);
  });
  beat(a1, ['في شيء قاعد يصير في أبوظبي', 'الطلب على المكاتب', 'يرتفع بشكل ملحوظ'], null, BLUE[1]);
  page('p_adgm', 'admo_adgm', a2, [[A('عدد', 145.5) - 0.2, 7362]], [[0, A('عدد', 145.5), A('موظف', 148.5) + 0.3], [1, A('بنمو', 149) - 0.1, A('فقط', 152) + 0.2]]);
  beat(a2, ['سوق أبوظبي العالمي ADGM', 'قرابة 50 ألف موظف', 'نمو 34% خلال سنة'], 'المكتب الإعلامي لحكومة أبوظبي · سبتمبر 2026', BLUE[1]);
  page('p_cw', 'cw_ad', a3, [[A('نسبة', 153.5) + 1.2, 3740]], [[1, A('حالياً', 157.5) - 0.3, A('99%', 159) + 0.6], [0, A('والإيجارات', 161) - 0.1, A('32%', 162.5) + 0.6]], false);
  beat(a3, ['بس وين التحدي؟', 'إشغال 99% للفئة الأولى', 'والإيجارات +32%'], 'كوشمان آند ويكفيلد كور · أغسطس 2026', BLUE[1]);
  flight('m_ad2', a4, [[0, 54.392, 24.502, 14.3, 150, 36], [dur(a4) + 0.5, 54.396, 24.5, 13.8, 120, 32]], (t, cam) => {
    const tm = A('المارية', 171), tr = A('الريم', 172);
    area(t, cam, 'maryah', BLUE, a4[0] - 2, [tm - 0.2, a4[1]], 0.6); area(t, cam, 'reem', TEAL, tr - 0.4, [tr - 0.2, a4[1]]);
    chip(t, 'وين راح يسكنون؟', A('وين', 168.5) - 0.2, tm - 0.4, 1150, '#FFFFFF', 36);
    calloutAR(t, cam, MAR, 'جزيرة الماريه', 'السوق الفاخر', BLUE[1], tm - 0.1, 0, -150, -200);
    calloutAR(t, cam, REEM, 'جزيرة الريم', 'خيارات سكنية أوسع', TEAL[1], A('والريم', 175) - 0.1, 0, 150, 240);
  });
  beat(a4, ['وين راح يسكنون؟', 'الماريه والريم', 'سكن قريب من المكاتب'], null, TEAL[1]);
  flight('m_ad3', a5, [[0, 54.398, 24.5, 13.6, 120, 30], [dur(a5) + 0.5, 54.395, 24.497, 13.1, 60, 22]], (t, cam) => {
    area(t, cam, 'maryah', BLUE, a5[0] - 2, [a5[0], a5[1]], 0.6); area(t, cam, 'reem', TEAL, a5[0] - 2, [a5[0], a5[1]], 0.6);
    card(t, [['الطلب على السكن راح يرتفع', A('الطلب', 181) - 0.1], ['الفرص في المكاتب وحتى في السكني', A('يعني', 183.5) - 0.1, true]], A('الطلب', 181) - 0.2, a5[1], 1030);
  });
  beat(a5, ['مع استمرار دخول الشركات', 'الطلب على السكن', 'فرص في المكاتب وحتى السكني'], null, TEAL[1]);

  // ---------------------------------------------------------------- overlay: HUD titles, source chips, the call to action (his own, from this note)
  const CTA = B('اكتب', 52.3), KW = B('ADGM', 53.6), SEND = B('وبطرش', 54.2), MSG = 'ADGM', REPLY = 'بأرسل لك التقرير';
  const overlay = (t) => {
    BEATS.forEach(({ T: B0, hud, src }, i) => {                      // consecutive beats with the same title share one title (it stays up, then fades once)
      const same = (x) => x && x.hud && hud && x.hud[1] === hud[1];
      if (hud && !same(BEATS[i - 1])) { let j = i; while (same(BEATS[j + 1])) j++; hudAR(t, hud[0], hud[1], hud[2], B0[0] + 0.05, BEATS[j].T[1] - 0.1, hud[3] || GOLD); }
      if (src) srcChip(t, src, B0[0] + 0.3, B0[1] - 0.15);
    });
    
    const ce = ea(t, CTA - 0.1, CTA + 0.6, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('عبدالله أهلي', CX, 620, { font: F.d(800, 80), color: C.ink }); T('ABDULLAH AHLI', CX, 684, { font: F.d(700, 32), ls: 6, color: C.gold }); ctx.restore();
      const send = SEND - 0.1, sent = ea(t, send, send + 0.35), ia = ea(t, CTA + 0.2, CTA + 0.7, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = MSG;
      const typed = ea(t, KW - 0.05, KW + 0.35, E.lin), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      if (typed > 0.01) { ctx.save(); ctx.beginPath(); ctx.rect(X1 - 56 - M(msg, fm) * typed - 4, iy - 60, M(msg, fm) * typed + 8, 120); ctx.clip(); T(msg, X1 - 56, iy + 20, { font: fm, color: C.ink, align: 'right', alpha: 1 - sent }); ctx.restore(); }
      T('أضف تعليقاً…', X1 - 56, iy + 20, { font: F.d(700, 52), color: C.mute, align: 'right', alpha: (1 - ea(t, KW - 0.05, KW + 0.05)) * (1 - sent) });
      dot(X0 + 66, iy, 48, C.gold); ctx.save(); ctx.translate(X0 + 66, iy); ctx.scale(-1, 1); icon('plane', 0, 0, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore(); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X0, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X0 + w / 2, 975, { font: fm, color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const f = F.d(700, 46), w = Math.min(BW, M(REPLY, f) + 130); rr(X1 - w, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X1 - 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(REPLY, X1 - 112, 1102, { font: f, color: C.ink, align: 'right' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  BEATS.forEach(b => cues.push({ k: 'wh', t: b.T[0] - 0.2, d: 0.5 })); cues.push({ k: 'wh', t: CTA - 0.2, d: 0.5 }); cues.push({ k: 'send', t: SEND - 0.1 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, NO_CAPTIONS: false, CAP_UNTIL: B('الطلب', 4.3) - 0.05, STATIC_FACE: true };
}
