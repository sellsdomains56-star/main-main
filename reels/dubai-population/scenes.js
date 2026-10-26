'use strict';
// ---------------------------------------------------------------------------
// "Dubai's population: 4.8 million" - HeyGen take 0cde1c5a (45 s, English), Abdullah Ahli's twin.  No map (nothing to locate): animated numbers and cards
// on the dark gold background; his face is the small round bubble top-left.
// Figures as he says them, from Dubai Data and Statistics Establishment releases: end-2025 4.58M after +332K (7.5%); ~4.8M in September 2026 (4,807,185 on a
// September day; 4,782,535 end of August). End-2024 = 4.58M - 332K = ~4.25M (derived). The count moved to a real-time method from administrative records.
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

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const GOLD = '#E9C47C', SOFT = '#F3D9A4', TEAL = '#2FD8A0', BLUE = '#3DB2FF';
  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.end + 0.2, cx: 215, cy: 418, r: 78 }, { t: K.end + 1.2, cx: 540, cy: 560, r: 130 }] };
  HUD_X = 330;
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;

  // ---- 1: the live count, 4.8 million, as a field of 48 dots (one dot = 100,000 people)
  const counter = (t) => {
    const a0 = 0.3, a1 = K.end25 - 0.2, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    const v = 4807185 * ea(t, 0.4, K.m48 + 0.6, E.out3);
    T(numberStr(v, 0), CX, 760, { font: F.d(800, 120), color: '#FFFFFF' });
    T('RESIDENTS · SEPTEMBER 2026', CX, 830, { font: F.d(800, 30), ls: 6, color: GOLD, alpha: ea(t, K.sept - 0.2, K.sept + 0.2) });
    for (let i = 0; i < 48; i++) { const e = ea(t, 0.5 + i * 0.045, 0.8 + i * 0.045, E.back), x = SAFE.x0 + 50 + (i % 12) * 65, y = 930 + Math.floor(i / 12) * 62; dot(x, y, 17 * e, i < 46 ? GOLD : SOFT, 0.35 + 0.65 * e); }
    T('EACH DOT ≈ 100,000 PEOPLE', CX, 1220, { font: F.d(700, 22), ls: 3, color: C.mute, alpha: ea(t, 2.0, 2.4) });
    ctx.restore();
  };
  // ---- 2: three bars - end 2024 (~4.25M, derived), end 2025 (4.58M), Sep 2026 (~4.8M); +332K between the first two
  const bars = (t) => {
    const a0 = K.end25 - 0.15, a1 = K.method - 0.25, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    glassPill(SAFE.x0, 640, SAFE.w, 620, 30);
    T('DUBAI POPULATION · MILLIONS', SAFE.x0 + 34, 690, { font: F.d(800, 26), ls: 5, color: GOLD, align: 'left' });
    const base = 1150, k = 300 / 4.8, bw = 190, gap = 60, x0 = SAFE.x0 + (SAFE.w - (3 * bw + 2 * gap)) / 2;
    const rows = [['END 2024', 4.248, '≈4.25', SOFT, K.after], ['END 2025', 4.58, '4.58', GOLD, K.m458], ['SEP 2026', 4.807, '≈4.8', '#FFE2A8', K.end25 + 0.05]];
    // keep the order of time on screen, but grow each bar when he says it
    rows.forEach(([lab, v, txt, c, a], i) => {
      const e = ea(t, a - 0.05, a + 0.8, E.out3); const x = x0 + i * (bw + gap), h = v * k * e;
      ctx.save(); ctx.globalAlpha *= ea(t, a - 0.1, a + 0.2); const g = ctx.createLinearGradient(0, base - h, 0, base); g.addColorStop(0, c); g.addColorStop(1, 'rgba(233,196,124,0.25)'); rr(x, base - h, bw, h, 16); ctx.fillStyle = g; ctx.fill();
      T(txt, x + bw / 2, base - h - 20, { font: F.d(800, 50), color: '#FFFFFF' }); T(lab, x + bw / 2, base + 46, { font: F.d(800, 24), ls: 2, color: C.dim }); ctx.restore();
    });
    const pe = ea(t, K.k332 - 0.1, K.k332 + 0.5, E.back);
    if (pe > 0.003) { ctx.save(); ctx.globalAlpha *= pe; const x = x0 + bw + gap / 2; rr(x - 120, 712, 240, 78, 26); ctx.fillStyle = TEAL; ctx.fill(); T('+332K IN 2025', x, 750, { font: F.d(800, 28), color: '#0A0A0B' }); T('+7.5%', x, 778, { font: F.d(800, 20), ls: 1, color: '#0A0A0B' }); ctx.restore(); }
    T('SOURCE: DUBAI DATA AND STATISTICS ESTABLISHMENT · 2024 = 4.58M − 332K', CX, 1236, { font: F.d(700, 16), ls: 1.5, color: C.mute });
    ctx.restore();
  };
  // ---- 3: the new counting method
  const method = (t) => {
    const a0 = K.method - 0.2, a1 = K.but - 0.2, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    glassPill(SAFE.x0, 700, SAFE.w, 470, 30); rr(SAFE.x0, 700, 10, 470, 5); ctx.fillStyle = BLUE; ctx.fill();
    T('THE COUNT CHANGED', SAFE.x0 + 44, 770, { font: F.d(800, 30), ls: 5, color: BLUE, align: 'left' });
    T('NEW METHOD', SAFE.x0 + 44, 860, { font: F.d(800, 72), color: '#FFFFFF', align: 'left' });
    T('REAL-TIME COUNT FROM OFFICIAL RECORDS', SAFE.x0 + 44, 916, { font: F.d(700, 26), ls: 2, color: C.dim, align: 'left' });
    const e = ea(t, K.arrived - 1.6, K.arrived - 1.0, E.out4);
    ctx.save(); ctx.globalAlpha *= e; line(SAFE.x0 + 44, 966, SAFE.x1 - 44, 966, { color: 'rgba(243,239,230,0.2)', w: 2 });
    T('NOT ALL OF THEM', SAFE.x0 + 44, 1046, { font: F.d(800, 52), color: GOLD, align: 'left' }); T('JUST ARRIVED', SAFE.x0 + 44, 1110, { font: F.d(800, 52), color: GOLD, align: 'left' }); ctx.restore();
    ctx.restore();
  };
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
    counter(t); bars(t); method(t); demand(t); personas(t); questions(t);
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
