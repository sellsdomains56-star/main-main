'use strict';
// ---------------------------------------------------------------------------
// Arabic version, blue edit (v2): Silicon Oasis / Academic City new launch, his own 4K recording, Gulf Arabic.
// - Only the FRONTAL camera angle is used for his face (the recording alternates a frontal and a side angle); it is re-framed (CFG.REFRAME) so he sits in the middle, big, with no grade / vignette / dark scrims.
// - Every other beat is ONE background that moves: real aerial imagery (Esri) of Dubai townhouse communities flown in 3D with a blue wash, the Silicon Oasis map, or a page of our study (developer's name blurred).
// - Blue palette (no black). BK Group logo top-left; the developer (Aldar) appears only as a blurred pop-up.
// - Right-to-left everywhere. Safe zone: x 130-950, y 300-1270.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    complain: tw(/يشتكون/, 0, 1.4), hal: tw(/الحل/, 0, 4.3), tarh: tw(/طرح/, 0, 4.7), joint: tw(/جوينت/, 0, 6.8), akbar: tw(/أكبر/, 0, 8.1), dawla: tw(/الدولة/, 0, 9.4),
    wen: tw(/وين/, 0, 9.9), mashroo: tw(/المشروع/, 1, 11.2), silicon: tw(/السيليكون/, 0, 12.5), oasis: tw(/أويسس/, 0, 13.0), nearby: tw(/وبمقربة/, 0, 13.56), acad: tw(/الجامعية/, 0, 14.4), cross: tw(/ويتقاطع/, 0, 15.48), blue: tw(/الأزرق/, 0, 16.54), metro: tw(/للمترو/, 0, 17.0),
    notyet: tw(/يعلن/, 0, 18.44), demand: tw(/طلب/, 0, 20.82), success: tw(/نجاح/, 0, 24.9),
    how: tw(/كيف/, 0, 25.5), man: tw(/المطور؟/, 0, 26.6), many: tw(/الكثير/, 0, 27.12), units: tw(/الوحدات/, 0, 29.6),
    main: tw(/العنصر/, 0, 31.0), pow: tw(/قوة/, 0, 35.02),
    bk: tw(/^بي$/, 0, 37.98), partners: tw(/الشركاء/, 0, 40.18), dev2: tw(/للمطور/, 1, 41.4),
    scen: tw(/السيناريوهات/, 0, 42.6), expected: tw(/المتوقعة/, 0, 43.22), study: tw(/دراسة/, 0, 45.5), data: tw(/بيانات/, 0, 47.86), market: tw(/العقاري/, 0, 52.0), three: tw(/الثلاثة/, 0, 53.24), exist: tw(/موجودة/, 0, 53.8),
    copy: tw(/نسخة/, 0, 55.7), write: tw(/اكتب/, 0, 60.5), proj: tw(/مشروع/, 1, 61.2), end: tw(/منها/, 0, 63.2),
  };

  // ---- his full-screen beats: ONLY inside the frontal-angle shots (3.5-9.9, 22.3-25.5, 27.0-30.6, 35.8-42.5, 44.9-48.4 s of the recording)
  const FACE_SEGS = [[3.65, 9.55], [22.45, 25.1], [27.15, 30.25], [35.95, 42.15], [45.05, 48.05]];
  const PUNCHES = [[K.hal, 0.03], [K.joint, 0.03], [K.success, 0.04], [K.bk, 0.03], [K.partners, 0.03], [K.data, 0.03]];
  const REFRAME = { s: 1.3, cx: 0.60, cy: 0.40, ty: 0.37 };                   // source point (60% across, 40% down = his face) -> 37% down the screen, zoomed 1.3x: he is centred and big
  const T_G0 = [0, 3.95], T_MAP = [9.45, 17.9], T_G1 = [17.8, 22.65], T_G2 = [25.0, 27.3], T_G3 = [30.15, 36.15], T_P1 = [42.05, 45.2], T_P2 = [47.95, 54.5], T_CTA = [54.4, 99];
  const OVERLAYS = [], IMAGES = { st1: 'assets/study_p01.png', st2: 'assets/study_p02.png', st5: 'assets/study_p05.png', bk: 'assets/brand/bk_logo_raw.png', aldar: 'assets/brand/aldar_frame.png' };
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const DSOc = [55.3854, 25.1237], MIDc = [55.401, 25.122];
  const STN = { dso: [55.3888, 25.1208], acad: [55.4124, 25.0977] };
  const BLUE = '#2F8BFF', SKY = '#A9D4FF', CYAN = '#7FE7FF', NAVY = '#0B1A33';

  const flight = (id, [a, b], keys, cfg = {}) => { SAT_SCENES[id] = { a, b, veil: 'none', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg }); return SAT_SCENES[id]; };
  // aerial flights over real townhouse communities (Esri World Imagery, tilted): background of the text beats
  const AR3 = [55.3235, 25.0652], DH2 = [55.3868, 24.9903], VAL = [55.4506, 25.0085], TIL = [55.2236, 25.0262];
  const air = (id, T, [lon, lat], dl = 0.0016, z = 16.9) => flight(id, T, [[0, lon - dl, lat - dl * 0.6, z, 120, 34], [dur(T) / 2, lon, lat, z + 0.15, 120, 35], [dur(T) + 0.6, lon + dl, lat + dl * 0.6, z + 0.3, 120, 34]], { tint: 0.1 });
  air('air0', T_G0, AR3); air('air1', T_G1, DH2); air('air2', T_G2, VAL, 0.0012); air('air3', T_G3, TIL); air('air4', T_CTA, AR3, 0.0014, 16.8); SCENES.find(x => x.id === 'air4').cfg.tint = 0.28;

  // ---- the map beat: Silicon Oasis -> Academic City -> the Blue Line
  const dm = dur(T_MAP);
  flight('map', T_MAP, [[0, 55.40, 25.121, 12.4, 170, 26], [rel(T_MAP, K.silicon) - 0.4, ...DSOc, 13.0, 165, 31], [rel(T_MAP, K.nearby) - 0.3, ...MIDc, 13.2, 160, 34], [rel(T_MAP, K.cross) - 0.3, ...MIDc, 13.2, 160, 34], [rel(T_MAP, K.blue) + 0.7, 55.3766, 25.150, 11.5, 80, 22], [dm + 0.6, 55.3766, 25.150, 11.5, 80, 22]], { tint: 0.05 });
  SCENES.find(s => s.id === 'map').cfg.top = (t, cam) => {
    mapIsland(t, cam, 'dso', '#FFFFFF', '#CFE6FF', [[K.silicon - 0.2, K.nearby - 0.1], [K.cross + 1.6, T_MAP[1]]], 'السيليكون أويسس');
    mapIsland(t, cam, 'academic', '#00D4FF', '#9BF0FF', [[K.nearby - 0.1, K.cross], [K.cross + 1.6, T_MAP[1]]], 'المدينة الجامعية');
    mapRoute(t, cam, OUTLINES.blue_main, K.cross - 0.1, 0, { dur: 3.0, color: '#5CE1FF' });
    mapRoute(t, cam, OUTLINES.blue_branch, K.blue + 0.3, 0, { dur: 1.6, color: '#5CE1FF' });
    mapDot(t, cam, { lon: STN.dso[0], lat: STN.dso[1], a0: K.blue + 0.9, text: 'محطة السيليكون أويسس', side: 'l', size: 26 });
    mapDot(t, cam, { lon: STN.acad[0], lat: STN.acad[1], a0: K.metro, text: 'محطة المدينة الجامعية', side: 'r', size: 26, dy: 10 });
  };

  // ---- the study pages (ours), full screen, flown like the map; the developer's name is blurred on the page
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1, color: '#FFD25A' });
  const page = (id, img, [a, b], keys, hl) => add({ id, kind: 'page', img, a, b, keys, hl });
  page('p2', 'st2', T_P1, [[0, 1240, 1300, 0.42, 0], [0.9, 940, 1210, 0.8, 20], [dur(T_P1) + 0.5, 940, 1210, 0.84, 22]], [mk([780, 1072, 790, 52], K.expected, K.expected + 1.4)]);
  page('p5', 'st5', T_P2, [[0, 1240, 1500, 0.42, 0], [0.9, 760, 990, 0.82, 20], [rel(T_P2, K.three) + 0.3, 760, 990, 0.82, 20], [rel(T_P2, K.exist) + 0.3, 880, 2150, 0.78, 20], [dur(T_P2) + 0.5, 880, 2150, 0.8, 22]],
    [mk([205, 632, 1030, 92], K.market, K.market + 0.8), mk([205, 766, 1030, 95], K.market + 0.6, K.market + 1.4), mk([205, 904, 1030, 95], K.three - 0.3, K.three + 0.5), mk([235, 2104, 640, 50], K.exist + 0.3, K.exist + 1.4)]);

  // ---- right-to-left HUD title (top right)
  const hudAr = (t, kicker, name, sub, a0, a1, color) => {
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const e = ea(t, a0, a0 + 0.7, E.out4), dy = (1 - e) * 34, X = SAFE.x1, MW = SAFE.w - 150, f = F.d(800, 62), f3 = F.d(700, 36), fk = F.d(700, 30);
    ctx.save(); ctx.globalAlpha *= al; { const pw = Math.min(SAFE.w - 10, Math.max(M(kicker, fk), M(name, f), sub ? M(sub, f3) : 0) + 80); glassPill(X - pw + 28, 318 + dy * 0.5, pw, sub ? 250 : 190, 30); }
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10 * SS; ctx.shadowOffsetY = 2 * SS;
    T(kicker, X, 370 + dy, { font: fk, color: C.dim, align: 'right', sx: Math.min(1, MW / M(kicker, fk)) });
    T(name, X, 438 + dy, { font: f, color: C.ink, align: 'right', sx: Math.min(1, MW / M(name, f)) });
    const bw0 = 130 * e; rr(X - bw0, 462 + dy, bw0, 6, 3); ctx.fillStyle = color || SKY; ctx.fill();
    if (sub) T(sub, X, 520 + dy, { font: f3, color: color || SKY, align: 'right', sx: Math.min(1, MW / M(sub, f3)) });
    ctx.restore();
  };
  // BK Group: the real logo (white) on a frosted blue tile; the big version carries the company line
  const bkTile = (t, x, y, s, a) => { const al = a; if (al <= 0.003 || !imgOK('bk')) return; const im = IMG.bk, h = s * 0.72, w = h * im.naturalWidth / im.naturalHeight; ctx.save(); ctx.globalAlpha *= al; glassPill(x, y, s, s, s * 0.22); ctx.drawImage(im, x + (s - w) / 2, y + (s - h) / 2, w, h); ctx.restore(); };
  const popBK = (t, a0, a1) => {
    const e = ea(t, a0, a0 + 0.5, E.out4), o = 1 - ea(t, a1, a1 + 0.3); const al = e * o; if (al <= 0.003 || !imgOK('bk')) return;
    const X = 130, Y = 930, Wd = 520, Hh = 210, im = IMG.bk, lh = 150, lw = lh * im.naturalWidth / im.naturalHeight;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate((1 - e) * -60, 0); glassPill(X, Y, Wd, Hh, 30); ctx.drawImage(im, X + 34, Y + (Hh - lh) / 2, lw, lh);
    T('BK GROUP', X + lw + 60, Y + 92, { font: F.d(800, 50), ls: 3, color: '#FFFFFF', align: 'left' }); T('REAL ESTATE BROKERAGE', X + lw + 60, Y + 140, { font: F.d(700, 25), ls: 3, color: SKY, align: 'left', sx: Math.min(1, (Wd - lw - 90) / M('REAL ESTATE BROKERAGE', F.d(700, 25), 3)) });
    ctx.restore();
  };
  // the developer, as a blurred pop-up (name and logo unreadable)
  const popDev = (t, a0, a1, X = 650, Y = 930) => {
    const e = ea(t, a0, a0 + 0.5, E.out4), o = 1 - ea(t, a1, a1 + 0.3); const al = e * o; if (al <= 0.003 || !imgOK('aldar')) return;
    const Wd = 300, Hh = 210; ctx.save(); ctx.globalAlpha *= al; ctx.translate((1 - e) * 60, 0); glassPill(X, Y, Wd, Hh, 30);
    ctx.save(); rr(X, Y, Wd, Hh, 30); ctx.clip(); ctx.filter = 'blur(26px)'; ctx.drawImage(IMG.aldar, X + 30, Y + 22, 110, 110); T('ALDAR', X + 220, Y + 92, { font: F.d(800, 54), color: '#FFFFFF' }); T('PROPERTIES', X + 150, Y + 168, { font: F.d(800, 36), color: '#FFFFFF' }); ctx.filter = 'none'; ctx.restore();
    ctx.restore();
  };

  const overlay = (t) => {
    // brand + name: BK Group top-left on every beat, his name chip while he is introduced
    const onPage = [T_P1, T_P2].reduce((m, T) => Math.max(m, ea(t, T[0] - 0.12, T[0] + 0.2) * (1 - ea(t, T[1] - 0.1, T[1] + 0.25))), 0);
    bkTile(t, 130, 300, 118, ea(t, 0.4, 0.9) * (1 - onPage));                                  // no BK on the full-page pages of the study
    const nm = ea(t, 0.6, 1.1) * (1 - ea(t, 3.5, 3.9));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 432, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 464, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }

    // beat G0: the complaint (type over a flight above a townhouse community)
    const g0 = ea(t, T_G0[0] + 0.05, T_G0[0] + 0.4) * (1 - ea(t, T_G0[1] - 0.15, T_G0[1] + 0.15));
    if (g0 > 0.003) { ctx.save(); ctx.globalAlpha *= g0;
      bw(t, 'كثير يشتكون', 780, K.complain - 0.1, { size: 92, ls: 0 });
      bw(t, 'من أسعار التاون هاوس', 930, K.complain + 0.7, { size: 100, ls: 0, hl: '#FFFFFF', color: C.ink });
      bw(t, 'في دبي', 1070, K.complain + 1.9, { size: 92, ls: 0, color: '#FFFFFF' });
      ctx.restore(); }
    // his face beat 1: pop-up of the developer (blurred) when he says "one of the biggest developers"
    popDev(t, K.akbar - 0.1, 9.55);

    // map beat
    hudAr(t, 'موقع المشروع', 'السيليكون أويسس', 'DUBAI SILICON OASIS', T_MAP[0] + 0.1, K.nearby - 0.2, '#FFFFFF');
    hudAr(t, 'وبمقربة من', 'المدينة الجامعية', 'ACADEMIC CITY', K.nearby - 0.15, K.cross - 0.2, CYAN);
    hudAr(t, 'ويتقاطع مع', 'الخط الأزرق للمترو', 'METRO BLUE LINE', K.cross - 0.15, T_MAP[1] - 0.1, CYAN);

    // beat G1: not announced yet, lots of demand
    const g1 = ea(t, T_G1[0] + 0.05, T_G1[0] + 0.4) * (1 - ea(t, T_G1[1] - 0.15, T_G1[1] + 0.15));
    if (g1 > 0.003) { ctx.save(); ctx.globalAlpha *= g1;
      bw(t, 'لم يعلن عنه لحد الآن', 800, K.notyet - 0.1, { size: 96, ls: 0 });
      bw(t, 'كثير طلب واستفسارات', 960, K.demand - 0.1, { size: 100, ls: 0, hl: '#FFFFFF', color: C.ink });
      ctx.restore(); }

    // beat G2: how do I secure a unit
    const g2 = ea(t, T_G2[0] + 0.05, T_G2[0] + 0.35) * (1 - ea(t, T_G2[1] - 0.15, T_G2[1] + 0.15));
    if (g2 > 0.003) { ctx.save(); ctx.globalAlpha *= g2;
      bw(t, 'كيف أضمن الحجز', 820, K.how - 0.05, { size: 124, ls: 0, hl: '#FFFFFF', color: C.ink });
      bw(t, 'مع المطور؟', 980, K.how + 0.6, { size: 100, ls: 0, color: '#FFFFFF' });
      ctx.restore(); }

    // beat G3: the main element is the strength of the broker
    const g3 = ea(t, T_G3[0] + 0.05, T_G3[0] + 0.4) * (1 - ea(t, T_G3[1] - 0.15, T_G3[1] + 0.15));
    if (g3 > 0.003) { ctx.save(); ctx.globalAlpha *= g3;
      bw(t, 'العنصر الأساسي', 760, K.main - 0.1, { size: 104, ls: 0 });
      bw(t, 'مدى حصولك على الوحدة', 890, K.main + 1.8, { size: 70, ls: 0, color: '#FFFFFF' });
      bw(t, 'قوة الوسيط', 1060, K.pow - 0.05, { size: 150, ls: 0, hl: '#FFFFFF', color: C.ink });
      ctx.restore(); }

    // face beat 4: BK Group, and the developer as a blurred pop-up
    popBK(t, K.bk - 0.15, 42.15);
    popDev(t, K.dev2 - 0.5, 42.15);

    // study pages + the study cover as a small pop-up on the face beat in between
    hudAr(t, 'دراستنا', 'السيناريوهات المتوقعة', 'تحليل مبني على البيانات', T_P1[0] + 0.1, T_P1[1] - 0.1, '#FFFFFF');
    card(t, 'st1', { x: 650, y: 900, w: 260, h: 368, a: K.study - 0.4, out: 48.0, from: [80, 0], rot: 4, fit: 'cover', fy: 0, zoom: [1, 1.04], r: 16 });
    hudAr(t, 'بيانات حيوية', 'سجل المطور في دبي', 'ثلاثة مجمعات', T_P2[0] + 0.1, T_P2[1] - 0.1, '#FFFFFF');

    // the call to action: an aerial of a townhouse community, the study cover, "مشروع" typed in the comment field, sent, answered
    const ce = ea(t, T_CTA[0] + 0.1, T_CTA[0] + 0.8, E.out4);
    if (ce > 0.003) {
      const send = K.end + 0.5, sent = ea(t, send, send + 0.35), ia = ea(t, T_CTA[0] + 0.5, T_CTA[0] + 1.1, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'مشروع', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.proj - 0.1, K.proj + 0.55, E.lin) + 0.0001));
      card(t, 'st1', { x: 390, y: 330, w: 300, h: 424, a: T_CTA[0] + 0.15, from: [0, 60], rot: 3, fit: 'cover', fy: 0, zoom: [1, 1.04], r: 18 });
      ctx.save(); ctx.globalAlpha *= ce; glassPill(CX - 280, 776, 560, 128, 34); T('ABDULLAH AHLI', CX, 834, { font: F.d(800, 54), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 880, { font: F.d(700, 28), ls: 6, color: SKY }); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = 'rgba(12,16,26,0.88)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X1 - 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'right', alpha: 1 - sent }); T('أضف تعليقاً…', X1 - 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'right', alpha: (1 - ea(t, K.proj - 0.1, K.proj)) * (1 - sent) });
      dot(X0 + 66, iy, 48, '#FFFFFF'); icon('plane', X0 + 66, iy, 20, { p: 1, color: BLUE, w: 4.5, rot: -0.5 + 0.5 * sent + Math.PI }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 925, w, 112, 56); ctx.fillStyle = '#FFFFFF'; ctx.fill(); T(msg, X1 - w / 2, 1000, { font: F.d(700, 58), color: NAVY }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'جاري إرسال الدراسة إليك', w = M(rp, F.d(700, 46)) + 130; rr(X0, 1048, w, 112, 56); ctx.fillStyle = 'rgba(12,16,26,0.88)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1105, 24, { p: ea(t, send + 1.0, send + 1.4), color: SKY, w: 5 }); T(rp, X0 + w - 50, 1121, { font: F.d(700, 46), color: C.ink, align: 'right' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  // ---- sound: whooshes on the beat changes (very quiet)
  [T_G0[0] + 0.1, T_MAP[0], T_G1[0], T_G2[0], T_G3[0], T_P1[0], T_P2[0], T_CTA[0], 3.6, 22.4, 27.1, 35.9, 45.0].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.silicon, K.nearby].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.end + 0.5 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, REFRAME, FOOT_MAX: 1906 };
}
