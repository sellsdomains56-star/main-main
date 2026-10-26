'use strict';
// ---------------------------------------------------------------------------
// "Dubai's population: 4.8 million" - HeyGen take 0cde1c5a (45 s, English), Abdullah Ahli's twin.  No map (nothing to locate): animated numbers and cards
// on the dark gold background; his face is the small round bubble top-left.
// Figures as he says them, from Dubai Data and Statistics Establishment releases: end-2025 4.58M after +332K (7.5%); ~4.8M in September 2026 (4,807,185 on a
// September day; 4,782,535 end of August). The count moved to a real-time method from administrative records.
// REAL PAGES as proof (captured with shot_hl.mjs into assets/, not committed): Gulf News 29 Sep 2026 (4,807,185) and WAM 30 Jul 2026 (4.58M, +332,000, the
// Digital Dubai infographic with 2023-2025 = 3.974M / 4.249M / 4.580M, and the new method), flown like the map with a marker on the exact words.
// Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);

  const K = {
    m48: tw(/^4\.8$/, 0, 1.74), sept: tw(/^SEPTEMBER\.$/, 0, 2.66), end25: tw(/^AT$/, 0, 3.5), y2025: tw(/^2025,$/, 0, 3.88), m458: tw(/^4\.58$/, 0, 5.18), after: tw(/^AFTER$/, 0, 6.7), k332: tw(/^332,000$/, 0, 8.42),
    method: tw(/^COUNTING$/, 0, 10.7), arrived: tw(/^ARRIVED\.$/, 0, 15.12), but: tw(/^BUT$/, 0, 15.89), housing: tw(/^HOUSING,$/, 0, 18.4), transport: tw(/^TRANSPORT,$/, 0, 19.2), schools: tw(/^SCHOOLS,$/, 0, 19.92), health: tw(/^HEALTHCARE\.$/, 0, 20.78),
    forp: tw(/^FOR$/, 0, 21.52, 21.3), where1: tw(/^WHERE$/, 0, 23.3), afford: tw(/^AFFORD\.$/, 0, 25.66), family: tw(/^FAMILY$/, 0, 26.4), town: tw(/^TOWNHOUSE$/, 0, 27.16), isnt: tw(/^ISN'T$/, 0, 28.1), studio: tw(/^STUDIO$/, 0, 30.04), other: tw(/^OTHER$/, 0, 30.76),
    growth: tw(/^POPULATION$/, 2, 32.09), whether: tw(/^WHETHER$/, 0, 34.77), loc: tw(/^LOCATION,$/, 0, 36.46), price: tw(/^PRICE,$/, 0, 37.47), compete: tw(/^COMPETING$/, 0, 38.38),
    city: tw(/^CITY$/, 0, 39.68), can: tw(/^CAN$/, 0, 40.92), pace: tw(/^PACE\?$/, 0, 42.38), where2: tw(/^WHERE$/, 1, 43.3), end: tw(/^GREATEST\?$/, 0, 44.28),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = { gn: 'assets/gn_pop.png', wam: 'assets/wam_pop.png' };
  const GOLD = '#E9C47C', SOFT = '#F3D9A4', TEAL = '#2FD8A0', BLUE = '#3DB2FF';
  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.end + 0.2, cx: 215, cy: 418, r: 78 }, { t: K.end + 1.2, cx: 540, cy: 560, r: 130 }] };
  HUD_X = 330;
  // ---- the real pages: Gulf News (the 4.8 million count), then WAM (4.58M at the end of 2025 with the official infographic, +332,000, the new method)
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1 });
  const page = (id, img, [a, b], keys, hl) => SCENES.push({ id, kind: 'page', img, a, b, keys, hl });
  const T_GN = [0, K.end25 - 0.15], T_WAM = [K.end25 - 0.15, K.but - 0.2], A = T_WAM[0];
  page('p_gn', 'gn', T_GN, [[0, 538, 330, 0.92, 0], [1.15, 538, 345, 0.98, 6], [2.0, 540, 2398, 0.98, 16], [T_GN[1] + 0.5, 540, 2402, 1.01, 18]],
    [mk([811, 2348, 179, 48], 2.0, 2.3), mk([38, 2414, 581, 48], 2.3, 2.85)]);
  page('p_wam', 'wam', T_WAM, [[0, 538, 300, 0.95, 0], [0.8, 538, 310, 0.98, 4], [1.45, 540, 1000, 1.12, 12], [2.6, 540, 1010, 1.15, 14], [3.15, 440, 2020, 1.22, 14], [4.3, 440, 2030, 1.25, 16],
    [4.85, 540, 2818, 0.97, 16], [7.2, 540, 2822, 0.99, 16], [7.95, 540, 4152, 0.97, 16], [T_WAM[1] - A + 0.5, 540, 4158, 1.01, 18]],
    [mk([467, 2705, 545, 60], A + 4.85, A + 5.2), mk([39, 2787, 871, 60], A + 5.2, A + 5.75), mk([39, 2869, 138, 60], A + 5.75, A + 5.9),
     mk([321, 4109, 679, 60], A + 8.2, A + 8.75), mk([39, 4191, 677, 60], A + 8.75, A + 9.35)]);
  // where the page comes from (small chip above the captions)
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = M(txt, f, 2) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1176, w, 50, 25); T(txt, CX, 1209, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore(); };
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;

  // ---- 4: what a bigger population needs - four tiles
  const glyph = (k, x, y, s, c) => {
    ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (k === 'home') { ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.8); ctx.lineTo(x - s, y - s * 0.1); ctx.lineTo(x, y - s); ctx.lineTo(x + s, y - s * 0.1); ctx.lineTo(x + s, y + s * 0.8); ctx.closePath(); ctx.stroke(); rr(x - s * 0.25, y + s * 0.2, s * 0.5, s * 0.6, 3); ctx.stroke(); }
    if (k === 'train') { rr(x - s * 0.75, y - s, s * 1.5, s * 1.6, s * 0.35); ctx.stroke(); rr(x - s * 0.5, y - s * 0.7, s, s * 0.6, 4); ctx.stroke(); dot(x - s * 0.4, y + s * 0.3, 6, c); dot(x + s * 0.4, y + s * 0.3, 6, c); ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.65); ctx.lineTo(x - s * 0.85, y + s); ctx.moveTo(x + s * 0.5, y + s * 0.65); ctx.lineTo(x + s * 0.85, y + s); ctx.stroke(); }
    if (k === 'school') { ctx.beginPath(); ctx.moveTo(x - s, y - s * 0.35); ctx.lineTo(x, y - s * 0.85); ctx.lineTo(x + s, y - s * 0.35); ctx.lineTo(x, y + s * 0.15); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - s * 0.55, y - s * 0.1); ctx.lineTo(x - s * 0.55, y + s * 0.5); ctx.quadraticCurveTo(x, y + s * 0.85, x + s * 0.55, y + s * 0.5); ctx.lineTo(x + s * 0.55, y - s * 0.1); ctx.stroke(); }
    if (k === 'tower') { rr(x - s * 0.55, y - s, s * 1.1, s * 1.9, 6); ctx.stroke(); for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 2; c2++) rr(x - s * 0.32 + c2 * s * 0.4, y - s * 0.75 + r * s * 0.4, s * 0.24, s * 0.22, 2), ctx.fill(); }
    if (k === 'health') { ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, y - s * 0.5); ctx.lineTo(x, y + s * 0.5); ctx.moveTo(x - s * 0.5, y); ctx.lineTo(x + s * 0.5, y); ctx.stroke(); }
    ctx.restore();
  };
  const demand = (t) => {
    const a0 = K.but - 0.15, a1 = K.forp - 0.2, al = win(t, a0, a1); if (al <= 0.003) return;
    const items = [['home', 'HOUSING', K.housing], ['train', 'TRANSPORT', K.transport], ['school', 'SCHOOLS', K.schools], ['health', 'HEALTHCARE', K.health]];
    const gap = 18, w = (SAFE.w - gap) / 2, h = 230;
    ctx.save(); ctx.globalAlpha *= al;
    T('MORE DEMAND FOR', CX, 690, { font: F.d(800, 34), ls: 6, color: GOLD, alpha: ea(t, a0, a0 + 0.4) });
    items.forEach(([k, txt, a], i) => {
      const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; const x = SAFE.x0 + (i % 2) * (w + gap), y = 730 + Math.floor(i / 2) * (h + gap), hi = 1 - ea(t, a + 0.4, a + 1.4);
      ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 24); glassPill(x, y, w, h, 28);
      if (hi > 0.01) { rr(x, y, w, h, 28); ctx.strokeStyle = `rgba(233,196,124,${hi})`; ctx.lineWidth = 3; ctx.stroke(); }
      glyph(k, x + w / 2, y + 88, 46, GOLD); T(txt, x + w / 2, y + 190, { font: F.d(800, 36), ls: 2, color: '#FFFFFF' }); ctx.restore();
    });
    ctx.restore();
  };
  // ---- 5: who lives where - a family wanting a townhouse near a school is not the tenant for a luxury studio across the city
  const personas = (t) => {
    const a0 = K.forp - 0.15, a1 = K.growth - 0.25, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    const q = ea(t, a0, a0 + 0.4); ctx.save(); ctx.globalAlpha *= q * (1 - ea(t, K.family - 0.4, K.family));
    T('WHERE DO THEY WANT TO LIVE?', CX, 860, { font: F.d(800, 52), color: '#FFFFFF' }); T('WHAT CAN THEY AFFORD?', CX, 940, { font: F.d(800, 52), color: GOLD, alpha: ea(t, K.afford - 1.2, K.afford - 0.7) }); ctx.restore();
    const card = (x, y, w, h, title, sub, c, a, k) => { const e = ea(t, a - 0.1, a + 0.45, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 26); glassPill(x, y, w, h, 28); rr(x, y, w, 8, 4); ctx.fillStyle = c; ctx.fill(); glyph(k, x + 70, y + h / 2, 34, c); T(title, x + 130, y + h / 2 - 6, { font: F.d(800, 38), color: '#FFFFFF', align: 'left' }); T(sub, x + 130, y + h / 2 + 36, { font: F.d(700, 24), ls: 2, color: C.dim, align: 'left' }); ctx.restore(); };
    card(SAFE.x0, 700, SAFE.w, 190, 'A FAMILY', 'TOWNHOUSE · NEAR A SCHOOL', TEAL, K.family, 'home');
    const ne = ea(t, K.isnt - 0.1, K.isnt + 0.35, E.back); if (ne > 0.003) { ctx.save(); ctx.globalAlpha *= ne; dot(CX, 985, 46, '#FF6B5A'); T('≠', CX, 1006, { font: F.d(800, 60), color: '#0A0A0B' }); ctx.restore(); }
    card(SAFE.x0, 1080, SAFE.w, 190, 'A LUXURY STUDIO', 'ON THE OTHER SIDE OF DUBAI', BLUE, K.studio - 0.4, 'tower');
    ctx.restore();
  };
  // ---- 7: the two closing questions
  const questions = (t) => {
    const a0 = K.city - 0.3, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, K.end + 0.2, K.end + 0.6)); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    T('THE CITY IS GROWING', CX, 760, { font: F.d(800, 44), ls: 4, color: GOLD });
    const q = (txt, y, a, c) => { const e = ea(t, a - 0.05, a + 0.5, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 26); glassPill(SAFE.x0, y, SAFE.w, 150, 30); T(txt[0], CX, y + 64, { font: F.d(800, 42), color: c }); T(txt[1], CX, y + 116, { font: F.d(800, 42), color: c }); ctx.restore(); };
    q(['CAN HOUSING AND', 'INFRASTRUCTURE KEEP PACE?'], 820, K.can, '#FFFFFF');
    q(['WHERE WILL THE PRESSURE', 'BE GREATEST?'], 1000, K.where2, GOLD);
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'DUBAI · SEPTEMBER 2026', 'POPULATION', '≈4.8 MILLION', 0.3, K.end25 - 0.2, GOLD);
    hudTitle(t, 'END OF 2025', '4.58 MILLION', '+332,000 IN A YEAR', K.end25 - 0.15, K.method - 0.25, GOLD);
    hudTitle(t, 'READ THE NUMBER CAREFULLY', 'METHOD UPDATED', 'NOT ALL NEW ARRIVALS', K.method - 0.2, K.but - 0.2, BLUE);
    hudTitle(t, 'A BIGGER CITY', 'MORE DEMAND', 'HOUSING · TRANSPORT · SCHOOLS · HEALTH', K.but - 0.15, K.forp - 0.2, GOLD);
    hudTitle(t, 'FOR PROPERTY INVESTORS', 'WHO, WHERE, HOW MUCH', 'WHERE HOUSEHOLDS WANT TO LIVE', K.forp - 0.15, K.growth - 0.25, GOLD);
    hudTitle(t, 'GROWTH SUPPORTS DEMAND', 'YOUR PROPERTY?', 'IT DEPENDS ON THREE THINGS', K.growth - 0.2, K.city - 0.35, GOLD);
    hudTitle(t, 'DUBAI 2026', 'THE BIG QUESTION', 'KEEPING PACE WITH GROWTH', K.city - 0.3, K.end + 0.2, GOLD);
    srcChip(t, 'GULF NEWS · 29 SEP 2026', 0.6, T_GN[1] - 0.15); srcChip(t, 'WAM · DIGITAL DUBAI · 30 JUL 2026', T_WAM[0] + 0.3, T_WAM[1] - 0.15);
    demand(t); personas(t); questions(t);
    breakdown(t, { title: 'IT DEPENDS ON', a0: K.whether - 0.3, a1: K.city - 0.35, items: [{ txt: 'LOCATION', a: K.loc }, { txt: 'PRICE', a: K.price }, { txt: 'THE HOMES COMPETING WITH IT', a: K.compete - 0.2, gold: true }] });
    // the end card: his name under the grown bubble
    const ce = ea(t, K.end + 0.3, K.end + 1.0, E.out4);
    if (ce > 0.003) { ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 780, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 834, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore(); }
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.2, 3.6));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [K.end25, K.method, K.but, K.forp, K.growth, K.city].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.k332, K.housing, K.transport, K.schools, K.health].forEach(x => cues.push({ k: 'pin', t: x }));
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1347 };
}
