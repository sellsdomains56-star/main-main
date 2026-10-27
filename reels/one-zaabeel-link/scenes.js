'use strict';
// ---------------------------------------------------------------------------
// "How do you lift 8,500 tons of steel 100 metres into the air?" - HeyGen take de4c494d (version v551867ee, 55.6 s, English): The Link at One Za'abeel.
// His face full screen on the hook only (never the small bubble); a real photo (Commons, CC0); REAL PAGES with a marker on the exact words (Khaleej Times
// 26 Mar 2024: 230 m, over 8,500 tonnes in 12 days, the 900+ ton second phase in four days, 67.277 m; Guinness World Records: 67.227 m, 1 March 2024);
// an illustrated side view of the two towers (approximate scale: The Link 230 m, first section 192 m, 100 m up, cantilever ~67 m beyond the main
// tower, towers ~300 m and ~235 m) where the first section rises with a day counter, the final section joins, then the cantilever; the map for
// One Za'abeel / DIFC / Dubai World Trade Centre; his call to action "ZA'ABEEL".  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const PUNCHES = [], OVERLAYS = [];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`])); IMAGES.photo = 'assets/oz_cc0.jpg';
  const GOLD = '#E9C47C', RED = ['#E5484D', '#FF8A8E'], RED2 = '#FF8A8E', TEAL = '#2FD8A0';
  const P = GEO.x.points || {};
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const dur = T => T[1] - T[0];
  HUD_X = SAFE.x0;

  const K = {
    that: A("that's"), the1: A('the', 7), m230: A('230'), across: A('across'), but: A('but'), first: A('first'), n8500: A('8,500', 14), raising: A('raising'), took: A('took'), d12: A('12'),
    second: A('second'), final: A('final'), completing: A('completing'), and: A('and', 23.3), around: A('around', 24), m67: A('67'), beyond: A('beyond'), no: A('no', 27), underneath: A('underneath'),
    weight: A('weight'), carried: A('carried'), supports: A('supports'), projecting: A('projecting'), called: A('called'), cant: A('cantilever.'),
    in: A('in', 34.8), march: A('march'), guinness: A('guinness'), longest: A('longest'), building: A('building.'),
    if: A('if', 41), oz: A('one', 42.2), difc: A('difc'), dwtc: A('world', 44.5), compare: A('compare'), props: A('properties,'), rental: A('rental'), prices: A('prices'), area: A('area.'),
    comment: A('comment'), zab: A("za'abeel", 49.7), send: A('send'), budget: A('budget'), goal: A('goal.'), well: A("we'll"),
  };
  const FACE_SEGS = [[0, K.that - 0.1]];
  const B2 = [K.that - 0.1, K.the1 - 0.1], B3 = [B2[1], K.but - 0.12], B4 = [B3[1], K.first - 0.12], B5 = [B4[1], K.raising - 0.12], B6 = [B5[1], K.in - 0.12], B7 = [B6[1], K.if - 0.1], B8 = [B7[1], K.comment - 0.1];

  // ---------------------------------------------------------------- the pages
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
  page('p_kt1', 'kt_link', B3, [[K.the1 + 0.1, qy('kt_link', 0)]], [[0, K.m230 - 0.3, K.across + 0.3]]);
  page('p_kt2', 'kt_link', B5, [[B5[0] + 0.1, qy('kt_link', 1)]], [[1, K.first + 0.2, K.n8500 + 0.9]]);
  page('p_gwr', 'gwr_link', B7, [[K.march - 0.3, qy('gwr_link', 0)]], [[0, K.march, K.building + 0.3]]);

  // ---------------------------------------------------------------- the map: One Za'abeel, DIFC, Dubai World Trade Centre
  SAT_SCENES.m = { a: B8[0], b: B8[1], veil: 'map', keys: [camKey(0, 55.2905, 25.2245, 15.1, 120, 36), camKey(1.6, 55.289, 25.222, 14.6, 120, 38), camKey(dur(B8) + 0.5, 55.2875, 25.2205, 14.35, 120, 40)] };
  add({ id: 'm', kind: 'sat', a: B8[0], b: B8[1], cfg: { top: (t, cam) => {
    mapArea(t, cam, 'difc', { c: RED, a0: K.difc - 0.3, dur: 0.8, on: [K.difc - 0.2, B8[1]] });
    calloutEN(t, cam, P.oz, "ONE ZA'ABEEL", 'THE LINK', GOLD, K.oz - 0.1, 0, 120, -190);
    calloutEN(t, cam, P.difc, 'DIFC', 'FINANCIAL CENTRE', RED[1], K.difc - 0.1, 0, -150, 160);
    calloutEN(t, cam, P.dwtc, 'DUBAI WORLD', 'TRADE CENTRE', TEAL, K.dwtc - 0.2, 0, -170, -170);
    const items = [['PROPERTIES', K.props - 0.3], ['RENTAL DEMAND', K.rental - 0.1], ['PRICES', K.prices - 0.1]];
    items.forEach(([s, a], i) => { const e = ea(t, a - 0.1, a + 0.35, E.back); if (e <= 0.003) return; const f = F.d(800, 30), w = M(s, f, 2) + 60, x = CX, y = 1080 + i * 70;
      ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x, y); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); glassPill(-w / 2, -30, w, 60, 30); rr(-w / 2, -30, w, 60, 30); ctx.strokeStyle = 'rgba(233,196,124,0.8)'; ctx.lineWidth = 2; ctx.stroke(); T(s, 0, 11, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore(); });
  } } });
  const calloutEN = (t, cam, [lon, lat], label, sub, color, a0, a1, dx = 0, dy = -150) => {
    const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
    const [ax, ay] = satProj(cam, lon, lat), f = F.d(800, 32), f2 = F.d(700, 22), tw2 = Math.max(M(label, f, 1), sub ? M(sub, f2, 3) : 0), pw = tw2 + 70, ph = sub ? 104 : 68;
    const lx = clamp(ax + dx, SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(ay + dy, 620 + ph / 2, 1280 - ph / 2), e = ea(t, a0, a0 + 0.5, E.back), p = ea(t, a0 - 0.1, a0 + 0.35, E.out3);
    const ex = clamp(ax, lx - pw / 2 + 24, lx + pw / 2 - 24), ey = ay < ly ? ly - ph / 2 : ly + ph / 2, my = lerp(ay, ey, 0.55);
    ctx.save(); ctx.globalAlpha *= al; ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
    const leg = [[ax, ay], [ax, my], [ex, my], [ex, ey]].filter((q, i, arr) => !i || Math.hypot(q[0] - arr[i - 1][0], q[1] - arr[i - 1][1]) > 0.5);
    strokePoly(leg, p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly(leg, p, { color: '#FFFFFF', w: 2.5 });
    ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rr(-pw / 2, -ph / 2, 10, ph, [18, 0, 0, 18]); ctx.fillStyle = color; ctx.fill();
    T(label, -pw / 2 + 34, -ph / 2 + 46, { font: f, ls: 1, color: '#FFFFFF', align: 'left' }); if (sub) T(sub, -pw / 2 + 34, ph / 2 - 22, { font: f2, ls: 3, color, align: 'left' });
    ctx.restore();
  };

  // ---------------------------------------------------------------- the illustration: two towers, The Link in two sections, the cantilever
  const G0 = 1215, PPM = 2.6, mY = m => G0 - m * PPM;                               // ground line, pixels per metre
  const TB = [262, 392, mY(235)], TA = [570, 724, mY(300)];                         // towers: left (about 235 m), right = main tower (about 300 m)
  const LX0 = 300, LX1 = LX0 + 230 * PPM, S1 = LX0 + 192 * PPM, LH = 50, LB = mY(100);   // The Link: 230 m long, first section 192 m, bottom 100 m up
  const lift1 = t => ea(t, K.raising + 0.05, K.d12 + 0.35, E.inOut2), lift2 = t => ea(t, K.second + 0.2, K.completing, E.inOut2);
  const tower = (x0, x1, top, e) => {
    const h = (G0 - top) * e, y = G0 - h; if (h <= 1) return;
    const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#1B2230'); g.addColorStop(0.55, '#2A3446'); g.addColorStop(1, '#151A24'); ctx.fillStyle = g; ctx.fillRect(x0, y, x1 - x0, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y, x1 - x0, h); ctx.clip(); ctx.strokeStyle = 'rgba(169,222,255,0.10)'; ctx.lineWidth = 1;
    for (let yy = G0 - 9; yy > y; yy -= 9) { ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); }
    for (let xx = x0 + 13; xx < x1; xx += 13) { ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, G0); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = 'rgba(233,196,124,0.85)'; ctx.fillRect(x1 - 3, y, 3, h); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x0, y, 2, h);
  };
  const truss = (x0, x1, yb, glowA = 0) => {                                        // a steel box with a diamond grid
    const y = yb - LH; ctx.fillStyle = '#12161E'; ctx.fillRect(x0, y, x1 - x0, LH); ctx.save(); ctx.beginPath(); ctx.rect(x0, y, x1 - x0, LH); ctx.clip();
    ctx.strokeStyle = 'rgba(233,196,124,0.75)'; ctx.lineWidth = 1.6; for (let x = x0 - LH; x < x1 + LH; x += 22) { ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x + LH, y); ctx.moveTo(x, y); ctx.lineTo(x + LH, yb); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y, x1 - x0, LH); if (glowA > 0.003) { ctx.save(); ctx.globalAlpha *= glowA; ctx.fillStyle = 'rgba(233,196,124,0.35)'; ctx.fillRect(x0, y, x1 - x0, LH); ctx.restore(); }
  };
  const dimH = (x0, x1, y, txt, p, color = GOLD) => { if (p <= 0.003) return; const xe = lerp(x0, x1, p); line(x0, y, xe, y, { color, w: 3 }); line(x0, y - 12, x0, y + 12, { color, w: 3 }); if (p > 0.98) line(x1, y - 12, x1, y + 12, { color, w: 3 });
    if (txt) { const f = F.d(800, 30), w = M(txt, f, 1) + 34; ctx.save(); ctx.globalAlpha *= clamp((p - 0.6) * 2.5); rr((x0 + x1) / 2 - w / 2, y - 62, w, 46, 23); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); T(txt, (x0 + x1) / 2, y - 29, { font: f, ls: 1, color }); ctx.restore(); } };
  const dimV = (x, y0, y1, txt, p) => { if (p <= 0.003) return; line(x, y0, x, lerp(y0, y1, p), { color: GOLD, w: 3 }); line(x - 12, y0, x + 12, y0, { color: GOLD, w: 3 }); if (p > 0.98) line(x - 12, y1, x + 12, y1, { color: GOLD, w: 3 });
    if (txt) { const f = F.d(800, 30), w = M(txt, f, 1) + 30; ctx.save(); ctx.globalAlpha *= clamp((p - 0.6) * 2.5); ctx.translate(x, (y0 + y1) / 2); rr(-w / 2, -23, w, 46, 23); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke(); T(txt, 0, 10, { font: f, ls: 1, color: GOLD }); ctx.restore(); } };
  const chip = (t, txt, a0, a1, x, y, color = GOLD, size = 28) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, size), w = M(txt, f, 2) + 50; ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0) * 0.6); rr(x - w / 2, y - size, w, size * 2 + 4, size + 2); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); T(txt, x, y + size * 0.42, { font: f, ls: 2, color }); ctx.restore(); };
  const diagram = (t, a0, a1) => {
    const al = win(t, a0, a1, 0.35); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    T('ILLUSTRATION · APPROXIMATE SCALE', SAFE.x1, 572, { font: F.d(700, 18), ls: 3, color: C.mute, align: 'right', alpha: ea(t, B4[0] + 0.5, B4[0] + 1) * (1 - ea(t, K.and - 0.2, K.and + 0.2)) });
    const zu = ea(t, K.and - 0.1, K.around + 0.2, E.inOut3) * (1 - ea(t, K.projecting - 0.4, K.called, E.inOut3) * 0.6), z = 1 + 0.38 * zu, fx = lerp(CX, 770, zu), fy = lerp(900, 960, zu);
    ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    // ground and the road between the towers (live traffic below the lift)
    line(140, G0, 940, G0, { color: 'rgba(243,239,230,0.35)', w: 2 }); ctx.fillStyle = 'rgba(243,239,230,0.06)'; ctx.fillRect(TB[1], G0, TA[0] - TB[1], 18); ctx.setLineDash([14, 12]); line(TB[1] + 6, G0 + 9, TA[0] - 6, G0 + 9, { color: 'rgba(243,239,230,0.35)', w: 2 }); ctx.setLineDash([]);
    const te = ea(t, B4[0], B4[0] + 0.8, E.out3); tower(...TB, te); tower(...TA, ea(t, B4[0] + 0.15, B4[0] + 0.95, E.out3));
    // first section: on the ground, then 100 m up in 12 days; final section: the second lift
    const u1 = lift1(t), y1 = lerp(G0 - 2, LB, u1), u2 = lift2(t), y2 = lerp(G0 - 2, LB, u2), se = ea(t, B4[0] + 0.5, B4[0] + 1.0);
    ctx.save(); ctx.globalAlpha *= se;
    if (u1 > 0.002 && u1 < 0.999) { ctx.strokeStyle = 'rgba(243,239,230,0.45)'; ctx.lineWidth = 1.5; for (const x of [LX0 + 20, TB[1] + 10, TA[0] - 10, TA[0] + 40]) { ctx.beginPath(); ctx.moveTo(x, y1 - LH); ctx.lineTo(x, LB - 160); ctx.stroke(); } }
    if (u2 > 0.002 && u2 < 0.999) { ctx.strokeStyle = 'rgba(243,239,230,0.45)'; ctx.lineWidth = 1.5; for (const x of [S1 + 15, LX1 - 15]) { ctx.beginPath(); ctx.moveTo(x, y2 - LH); ctx.lineTo(x, LB - 70); ctx.stroke(); } }
    const cg = ea(t, K.projecting - 0.1, K.projecting + 0.4) * (1 - ea(t, B6[1] - 0.6, B6[1]));
    truss(LX0, S1, y1, 0); truss(S1 + (u2 < 0.999 ? 6 : 0), LX1, y2, 0.55 * cg * (0.7 + 0.3 * Math.sin(t * 6)));
    if (cg > 0.003) { ctx.save(); ctx.globalAlpha *= cg; ctx.fillStyle = 'rgba(233,196,124,0.28)'; ctx.fillRect(TA[1], LB - LH, LX1 - TA[1], LH); ctx.restore(); }
    const jf = ea(t, K.completing - 0.1, K.completing + 0.2) * (1 - ea(t, K.completing + 0.4, K.completing + 1.2)); if (jf > 0.003) glow(S1, LB - LH / 2, 120, '255,236,190', 0.7 * jf);
    ctx.restore();
    // labels on the ground before the lift
    const gl = ea(t, B4[0] + 0.7, B4[0] + 1.1) * (1 - ea(t, K.raising + 0.1, K.raising + 0.4));
    if (gl > 0.003) { T('SECTION 1', (LX0 + S1) / 2, G0 - 58, { font: F.d(800, 24), ls: 3, color: '#FFFFFF', alpha: gl }); T('FINAL', (S1 + LX1) / 2, G0 - 58, { font: F.d(800, 20), ls: 2, color: GOLD, alpha: gl * (1 - ea(t, K.second, K.second + 0.3)) }); }
    // 100 m and the day counter during the first lift
    dimV(198, G0, LB, '100 M', ea(t, K.raising + 0.2, K.d12 + 0.2, E.out3) * (1 - ea(t, K.and - 0.3, K.and)));
    const dc = win(t, K.raising, K.second - 0.1); if (dc > 0.003) { const d = 1 + Math.floor(11 * clamp(u1 * 1.02)); chip(t, `DAY ${d} OF 12`, K.raising, K.second - 0.1, (TB[1] + TA[0]) / 2, 680, GOLD, 30); }
    chip(t, 'FINAL SECTION · 900+ T · 4 DAYS', K.second, K.and - 0.2, CX, 640, GOLD, 26);
    chip(t, 'THE LINK · COMPLETE', K.completing + 0.1, K.and - 0.2, CX, 730, '#FFFFFF', 26);
    // the end: about 67 m beyond the main tower, nothing underneath
    dimH(TA[1], LX1, LB - LH - 36, '≈67 M', ea(t, K.m67 - 0.3, K.m67 + 0.4, E.out3) * (1 - ea(t, K.weight - 0.3, K.weight)));
    const bt = win(t, K.beyond - 0.1, K.weight - 0.3); if (bt > 0.003) T('BEYOND THE MAIN TOWER', (TA[1] + LX1) / 2, LB - LH - 112, { font: F.d(800, 20), ls: 2, color: '#FFFFFF', alpha: bt });
    const nc = win(t, K.no - 0.15, K.weight - 0.2); if (nc > 0.003) { ctx.save(); ctx.globalAlpha *= nc; const cx = (TA[1] + LX1) / 2 + 20; ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(243,239,230,0.55)'; ctx.lineWidth = 2; ctx.strokeRect(cx - 14, LB + 4, 28, G0 - LB - 6); ctx.setLineDash([]);
      const xe = ea(t, K.no, K.no + 0.4); ctx.strokeStyle = RED2; ctx.lineWidth = 6; ctx.lineCap = 'round'; const m = (G0 + LB) / 2; ctx.beginPath(); ctx.moveTo(cx - 34, m - 34); ctx.lineTo(cx - 34 + 68 * xe, m - 34 + 68 * xe); ctx.stroke(); if (xe > 0.5) { const x2 = clamp(xe * 2 - 1); ctx.beginPath(); ctx.moveTo(cx + 34, m - 34); ctx.lineTo(cx + 34 - 68 * x2, m - 34 + 68 * x2); ctx.stroke(); }
      T('NO COLUMNS', cx, m + 92, { font: F.d(800, 22), ls: 2, color: RED2, alpha: ea(t, K.underneath - 0.2, K.underneath + 0.2) }); ctx.restore(); }
    // the load path: back along the structure, into the towers, down to the ground
    const lp = win(t, K.weight - 0.1, K.projecting - 0.2); if (lp > 0.003) { ctx.save(); ctx.globalAlpha *= lp; const path = [[LX1 - 12, LB - LH / 2], [TA[0] + 30, LB - LH / 2], [TA[0] + 30, G0 - 6]], path2 = [[TA[0] - 10, LB - LH / 2], [TB[0] + 60, LB - LH / 2], [TB[0] + 60, G0 - 6]];
      const pr = ea(t, K.weight, K.supports, E.inOut2); strokePoly(path, pr, { color: 'rgba(255,138,142,0.9)', w: 5 }); strokePoly(path2, ea(t, K.carried, K.supports + 0.3, E.inOut2), { color: 'rgba(255,138,142,0.6)', w: 4 });
      for (const pts of [path, path2]) for (let k = 0; k < 6; k++) { const u = ((t * 0.35 + k / 6) % 1) * pr; const L = polyLen(pts) * u; let acc = 0; for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + s >= L) { const q = s ? (L - acc) / s : 0; dot(lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q), 5, '#FFFFFF', 0.8); break; } acc += s; } }
      ctx.restore(); }
    const cl = win(t, K.called - 0.2, B6[1] - 0.2); if (cl > 0.003) { ctx.save(); ctx.globalAlpha *= cl; const e = ea(t, K.called - 0.2, K.called + 0.3, E.back); ctx.translate((TA[1] + LX1) / 2, LB - LH - 70); ctx.scale(lerp(0.7, 1, e), lerp(0.7, 1, e)); T('CANTILEVER', 0, 0, { font: F.d(800, 46), ls: 3, color: GOLD }); ctx.restore(); }
    ctx.restore();
  };
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 25), w = M(txt, f, 2) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 54, 27); T(txt, CX, 1209, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore(); };

  const overlay = (t) => {
    const F0 = faceF(t); if (F0 > 0.999 && t < VEND - 0.05) return;
    ctx.save(); ctx.globalAlpha *= 1 - F0;
    // the real photo (Commons, CC0), slow push
    const pa = win(t, B2[0] - 0.05, B2[1] - 0.15, 0.3); if (pa > 0.003 && IMG.photo) { ctx.save(); ctx.globalAlpha *= pa; const im = IMG.photo, s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * (1.02 + 0.05 * prog(t, B2[0], B2[1])), dw = im.naturalWidth * s, dh = im.naturalHeight * s; ctx.drawImage(im, (W - dw) * 0.42, (H - dh) * 0.5, dw, dh);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(8,8,10,0.75)'); g.addColorStop(0.3, 'rgba(8,8,10,0.05)'); g.addColorStop(0.62, 'rgba(8,8,10,0.05)'); g.addColorStop(1, 'rgba(8,8,10,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      T('Photo: EditQ / Wikimedia Commons, CC0', CX, 1440, { font: F.d(700, 20), color: 'rgba(243,239,230,0.6)' }); ctx.restore(); }
    diagram(t, B4[0], B4[1]); diagram(t, B6[0], B6[1]);
    hudTitle(t, 'ONE ZA\'ABEEL, DUBAI', 'THE LINK', '100 M ABOVE THE GROUND', B2[0] + 0.05, B2[1] - 0.15, GOLD);
    hudTitle(t, 'THE LINK', '230 METRES LONG', '100 M UP, BETWEEN THE TWO TOWERS', B3[0] + 0.05, B3[1] - 0.15, GOLD);
    hudTitle(t, 'NOT IN ONE GO', 'TWO LIFTS', 'THE FIRST SECTION, THEN THE FINAL ONE', B4[0] + 0.05, B4[1] - 0.15, GOLD);
    hudTitle(t, 'THE FIRST SECTION', 'OVER 8,500 TONNES', 'LIFTED INTO PLACE OVER 12 DAYS', B5[0] + 0.05, B5[1] - 0.15, GOLD);
    hudTitle(t, 'LIFT 1', 'RAISED 100 METRES', 'IN 12 DAYS', B6[0] + 0.05, K.second - 0.2, GOLD);
    hudTitle(t, 'LIFT 2', 'THE FINAL SECTION', 'COMPLETING THE STRUCTURE', K.second - 0.1, K.and - 0.2, GOLD);
    hudTitle(t, 'LOOK AT THE END', 'ABOUT 67 M BEYOND THE TOWER', 'NO COLUMNS UNDERNEATH', K.and - 0.1, K.weight - 0.2, GOLD);
    hudTitle(t, 'HOW IT HOLDS', 'THE WEIGHT GOES BACK', 'THROUGH THE STRUCTURE INTO ITS SUPPORTS', K.weight - 0.1, K.projecting - 0.25, RED2);
    hudTitle(t, 'THE PROJECTING SECTION', 'A CANTILEVER', '', K.projecting - 0.15, B6[1] - 0.15, GOLD);
    hudTitle(t, 'GUINNESS WORLD RECORDS', "THE WORLD'S LONGEST", 'CANTILEVERED BUILDING · MARCH 2024', B7[0] + 0.05, B7[1] - 0.15, GOLD);
    hudTitle(t, 'THINKING OF INVESTING HERE?', "AROUND ONE ZA'ABEEL", 'DIFC · DUBAI WORLD TRADE CENTRE', B8[0] + 0.05, B8[1] - 0.15, GOLD);
    srcChip(t, 'KHALEEJ TIMES · 26 MAR 2024', B3[0] + 0.3, B3[1] - 0.15); srcChip(t, 'KHALEEJ TIMES · 26 MAR 2024', B5[0] + 0.1, B5[1] - 0.15); srcChip(t, 'GUINNESS WORLD RECORDS · 1 MAR 2024', B7[0] + 0.3, B7[1] - 0.15);
    ctx.restore();
    // the call to action: comment ZA'ABEEL, send your budget and investment goal
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = "ZA'ABEEL", send = K.send - 0.05, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.2, K.comment + 0.7, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.zab - 0.05, K.zab + 0.45, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.zab - 0.05, K.zab + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, K.budget - 0.2, K.budget + 0.3, E.out4), b3 = ea(t, K.well - 0.1, K.well + 0.4, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 800, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 875, { font: fm, color: '#17181B' }); ctx.restore(); }
      const bub = (txt, y, e, chk) => { if (e <= 0.002) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 36); const f = F.d(700, 38), w = Math.min(BW, M(txt, f) + 130); rr(X0, y, w, 100, 50); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon(chk, X0 + 60, y + 50, 20, { p: 1, color: C.gold, w: 4.5 }); T(txt, X0 + 104, y + 63, { font: f, color: C.ink, align: 'left', sx: Math.min(1, (BW - 140) / M(txt, f)) }); ctx.restore(); };
      bub('Send your budget & investment goal', 930, b2, 'check'); bub("We'll compare the options with you", 1045, b3, 'check');
    }
  };
  OVERLAYS.push(overlay);

  [B2[0], B3[0], B4[0], B5[0], B6[0], B7[0], B8[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.d12 + 0.35, K.completing, K.m67, K.cant].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.send - 0.05 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, FOOT_MAX: TL.frames - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
