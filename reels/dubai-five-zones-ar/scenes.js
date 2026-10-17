'use strict';
// ---------------------------------------------------------------------------
// Arabic version: Silicon Oasis / Academic City new launch (his own recording, 4K, Gulf Arabic). The developers are NOT named (he does not name them).
// He is NOT small: FACE beats are the full screen (warm grade, slow push, punch-ins); in between, ONE background per beat - type, a satellite flight, a page of our study - with Arabic captions on everything.
// No bubble, no pop-ups. Everything is right-to-left (HUD right-aligned, typing grows leftwards). Safe zone: x 130-950, y 300-1270.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    complain: tw(/يشتكون/, 0, 1.4), hal: tw(/الحل/, 0, 4.3), tarh: tw(/طرح/, 0, 4.7), joint: tw(/جوينت/, 0, 6.8), akbar: tw(/أكبر/, 0, 8.1), dawla: tw(/الدولة/, 0, 9.4),
    wen: tw(/وين/, 0, 9.9), mawqi: tw(/موقع/, 0, 10.5), mashroo: tw(/المشروع/, 1, 11.2), silicon: tw(/السيليكون/, 0, 12.5), oasis: tw(/أويسس/, 0, 13.0), nearby: tw(/وبمقربة/, 0, 13.56), acad: tw(/الجامعية/, 0, 14.4), cross: tw(/ويتقاطع/, 0, 15.48), blue: tw(/الأزرق/, 0, 16.54), metro: tw(/للمترو/, 0, 17.0),
    notyet: tw(/يعلن/, 0, 18.44), demand: tw(/طلب/, 0, 20.82), sign: tw(/مؤشر/, 0, 22.8), success: tw(/نجاح/, 0, 24.9),
    how: tw(/كيف/, 0, 25.5), man: tw(/المطور؟/, 0, 26.6), many: tw(/الكثير/, 0, 27.12), chal: tw(/تحديات/, 0, 27.84), units: tw(/الوحدات/, 0, 29.6),
    today: tw(/اليوم/, 2, 30.5), main: tw(/العنصر/, 0, 31.0), lala: tw(/لا:/, 0, 34.66), power: tw(/قوة/, 0, 35.02), behind: tw(/خلف/, 0, 36.7),
    bk: tw(/^بي$/, 0, 37.98), partners: tw(/الشركاء/, 0, 40.18), dev2: tw(/للمطور/, 1, 41.4),
    scen: tw(/السيناريوهات/, 0, 42.6), expected: tw(/المتوقعة/, 0, 43.22), study: tw(/دراسة/, 0, 45.5), data: tw(/بيانات/, 0, 47.86), perf: tw(/بأداء/, 0, 49.66), market: tw(/العقاري/, 0, 52.0), three: tw(/الثلاثة/, 0, 53.24), exist: tw(/موجودة/, 0, 53.8),
    ifw: tw(/إذا/, 0, 54.6), copy: tw(/نسخة/, 0, 55.7), real: tw(/الحقيقية/, 0, 58.7), write: tw(/اكتب/, 0, 60.5), proj: tw(/مشروع/, 1, 61.2), comments: tw(/التعليقات/, 0, 62.0), send: tw(/أرسلك/, 0, 62.7), end: tw(/منها/, 0, 63.2),
  };

  // ---- his full-screen beats (a, b) and the beats in between (one background each)
  const FACE_SEGS = [[0, 4.55], [9.7, 11.05], [19.55, 25.3], [30.4, 34.8], [37.1, 42.1], [54.35, 60.2]];
  const PUNCHES = [[K.hal, 0.04], [K.success, 0.05], [K.power, 0.05], [K.partners, 0.04], [K.copy, 0.04]];
  const T_G1 = [4.55, 9.7], T_MAP = [11.05, 19.55], T_G2 = [25.3, 30.4], T_G3 = [34.8, 37.1], T_P1 = [42.1, 46.9], T_P2 = [46.9, 54.35], T_CTA = [60.2, 99];
  const OVERLAYS = [], IMAGES = { st1: 'assets/study_p01.png', st2: 'assets/study_p02.png', st5: 'assets/study_p05.png' };
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const DSOc = [55.3854, 25.1237], MIDc = [55.401, 25.122];
  const STN = { dso: [55.3888, 25.1208], acad: [55.4124, 25.0977] };

  // ---- the satellite flight: Silicon Oasis -> Academic City -> the Blue Line
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'top', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  const dm = dur(T_MAP);
  flight('map', T_MAP, [[0, 55.40, 25.121, 12.4, 170, 26], [rel(T_MAP, K.silicon) - 0.4, ...DSOc, 13.0, 165, 31], [rel(T_MAP, K.nearby) - 0.3, ...MIDc, 13.2, 160, 34], [rel(T_MAP, K.cross) - 0.3, ...MIDc, 13.2, 160, 34], [rel(T_MAP, K.blue) + 0.9, 55.3766, 25.164, 11.4, 185, 22], [dm + 0.6, 55.3766, 25.164, 11.4, 185, 22]]);
  SCENES.find(s => s.id === 'map').cfg.top = (t, cam) => {
    mapIsland(t, cam, 'dso', '#6C63FF', '#A79BFF', [[K.silicon - 0.2, K.nearby - 0.1], [K.cross + 1.6, T_MAP[1]]], 'السيليكون أويسس');
    mapIsland(t, cam, 'academic', '#2FD8B5', '#93F3DF', [[K.nearby - 0.1, K.cross], [K.cross + 1.6, T_MAP[1]]], 'المدينة الجامعية');
    mapRoute(t, cam, OUTLINES.blue_main, K.cross - 0.1, 0, { dur: 3.2 });
    mapRoute(t, cam, OUTLINES.blue_branch, K.blue + 0.3, 0, { dur: 1.8 });
    mapDot(t, cam, { lon: STN.dso[0], lat: STN.dso[1], a0: K.blue + 0.9, text: 'محطة السيليكون أويسس', side: 'l', size: 26 });
    mapDot(t, cam, { lon: STN.acad[0], lat: STN.acad[1], a0: K.metro, text: 'محطة المدينة الجامعية', side: 'r', size: 26, dy: 10 });
  };

  // ---- the study pages (ours), full screen, flown like the map; the developer's name is covered on the page
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1 });
  const page = (id, img, [a, b], keys, hl) => add({ id, kind: 'page', img, a, b, keys, hl });
  page('p2', 'st2', T_P1, [[0, 1240, 1300, 0.42, 0], [0.9, 940, 1210, 0.8, 20], [dur(T_P1) + 0.5, 940, 1210, 0.84, 22]], [mk([780, 1072, 790, 52], K.expected, K.expected + 1.4), mk([630, 1193, 340, 50], K.study - 0.6, K.study + 0.2)]);
  page('p5', 'st5', T_P2, [[0, 1240, 1500, 0.42, 0], [0.9, 760, 990, 0.82, 20], [rel(T_P2, K.three) + 0.3, 760, 990, 0.82, 20], [rel(T_P2, K.exist) + 0.3, 880, 2150, 0.78, 20], [dur(T_P2) + 0.5, 880, 2150, 0.8, 22]],
    [mk([205, 632, 1030, 92], K.market, K.market + 0.8), mk([205, 766, 1030, 95], K.market + 0.6, K.market + 1.4), mk([205, 904, 1030, 95], K.three - 0.3, K.three + 0.5), mk([235, 2104, 640, 50], K.exist + 0.3, K.exist + 1.4)]);

  // ---- right-to-left HUD title (top right; the face is not a bubble here)
  const hudAr = (t, kicker, name, sub, a0, a1, color) => {
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const e = ea(t, a0, a0 + 0.7, E.out4), dy = (1 - e) * 34, X = SAFE.x1, MW = SAFE.w, f = F.d(800, 62), f3 = F.d(700, 36), fk = F.d(700, 30);
    ctx.save(); ctx.globalAlpha *= al; { const g = ctx.createLinearGradient(0, 270, 0, 600); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(0.2, 'rgba(8,8,10,0.62)'); g.addColorStop(0.62, 'rgba(8,8,10,0.62)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 270, W, 330); }
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 2 * SS;
    T(kicker, X, 370 + dy, { font: fk, color: C.dim, align: 'right', sx: Math.min(1, MW / M(kicker, fk)) });
    T(name, X, 438 + dy, { font: f, color: C.ink, align: 'right', sx: Math.min(1, MW / M(name, f)) });
    const bw0 = 130 * e; rr(X - bw0, 462 + dy, bw0, 6, 3); ctx.fillStyle = color || C.gold; ctx.fill();
    if (sub) T(sub, X, 520 + dy, { font: f3, color: color || C.gold, align: 'right', sx: Math.min(1, MW / M(sub, f3)) });
    ctx.restore();
  };

  const overlay = (t) => {
    // name chip while he is introduced (top left, on the face beat)
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.6, 4.0));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 28), w = M('ABDULLAH AHLI', f, 3) + 48; glassPill(130, 330, w, 52, 26); T('ABDULLAH AHLI', 130 + w / 2, 366, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }

    // beat G1: the launch, as type on the dark background
    const g1 = ea(t, T_G1[0] + 0.05, T_G1[0] + 0.4) * (1 - ea(t, T_G1[1] - 0.15, T_G1[1] + 0.15));
    if (g1 > 0.003) {
      ctx.save(); ctx.globalAlpha *= g1;
      bw(t, 'طرح قريب جداً', 700, K.tarh - 0.05, { size: 110, ls: 0 });
      bw(t, 'جوينت فينتشر', 880, K.joint - 0.1, { size: 124, ls: 0, hl: true, color: C.ink });
      bw(t, 'أحد أكبر المطورين', 1040, K.akbar - 0.05, { size: 96, ls: 0 });
      bw(t, 'على مستوى الدولة', 1170, K.dawla - 0.4, { size: 88, ls: 0, color: C.gold });
      ctx.restore();
    }
    // map beat
    hudAr(t, 'موقع المشروع', 'السيليكون أويسس', 'DUBAI SILICON OASIS', T_MAP[0] + 0.1, K.nearby - 0.2, '#A79BFF');
    hudAr(t, 'وبمقربة من', 'المدينة الجامعية', 'ACADEMIC CITY', K.nearby - 0.15, K.cross - 0.2, '#93F3DF');
    hudAr(t, 'ويتقاطع مع', 'الخط الأزرق للمترو', 'METRO BLUE LINE', K.cross - 0.15, T_MAP[1] - 0.1, '#8CC8FF');

    // beat G2: how do I secure a unit
    const g2 = ea(t, T_G2[0] + 0.05, T_G2[0] + 0.4) * (1 - ea(t, T_G2[1] - 0.15, T_G2[1] + 0.15));
    if (g2 > 0.003) {
      ctx.save(); ctx.globalAlpha *= g2;
      bw(t, 'كيف أضمن الحجز؟', 780, K.how - 0.05, { size: 118, ls: 0, hl: true, color: C.ink });
      bw(t, 'الكثير عانى من تحديات', 960, K.many - 0.05, { size: 84, ls: 0 });
      bw(t, 'ما قدر يحصل على الوحدات', 1085, K.units - 1.2, { size: 84, ls: 0, color: C.gold });
      ctx.restore();
    }
    // beat G3: the main element
    const g3 = ea(t, T_G3[0] + 0.05, T_G3[0] + 0.4) * (1 - ea(t, T_G3[1] - 0.15, T_G3[1] + 0.15));
    if (g3 > 0.003) {
      ctx.save(); ctx.globalAlpha *= g3;
      bw(t, 'العنصر الأساسي', 700, T_G3[0] + 0.1, { size: 84, ls: 0, color: C.dim });
      bw(t, 'قوة الوسيط', 900, K.power - 0.05, { size: 150, ls: 0, hl: true, color: C.ink });
      bw(t, 'والشركة اللي خلفه', 1070, K.power + 0.9, { size: 84, ls: 0, color: C.gold });
      ctx.restore();
    }
    // study pages
    hudAr(t, 'دراستنا', 'السيناريوهات المتوقعة', 'تحليل مبني على البيانات', T_P1[0] + 0.1, T_P1[1] - 0.1, C.gold);
    hudAr(t, 'بيانات حيوية', 'سجل المطور في دبي', 'ثلاثة مجمعات', T_P2[0] + 0.1, T_P2[1] - 0.1, C.gold);

    // the call to action: dark background, the study cover, "مشروع" typed in the comment field, sent, answered
    const ce = ea(t, T_CTA[0] + 0.1, T_CTA[0] + 0.8, E.out4);
    if (ce > 0.003) {
      const send = K.end + 0.5, sent = ea(t, send, send + 0.35), ia = ea(t, T_CTA[0] + 0.5, T_CTA[0] + 1.1, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'مشروع', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.proj - 0.1, K.proj + 0.55, E.lin) + 0.0001));
      card(t, 'st1', { x: 390, y: 310, w: 300, h: 424, a: T_CTA[0] + 0.15, from: [0, 60], rot: 3, fit: 'cover', fy: 0, zoom: [1, 1.04], r: 18 });
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 815, { font: F.d(800, 56), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 865, { font: F.d(700, 30), ls: 6, color: C.gold }); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X1 - 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'right', alpha: 1 - sent }); T('أضف تعليقاً…', X1 - 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'right', alpha: (1 - ea(t, K.proj - 0.1, K.proj)) * (1 - sent) });
      dot(X0 + 66, iy, 48, C.gold); icon('plane', X0 + 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent + Math.PI }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 915, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 990, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'جاري إرسال الدراسة إليك', w = M(rp, F.d(700, 46)) + 130; rr(X0, 1040, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1097, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + w - 50, 1113, { font: F.d(700, 46), color: C.ink, align: 'right' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  // ---- sound: whooshes on the beat changes (very quiet)
  [T_G1[0], T_MAP[0], T_G2[0], T_G3[0], T_P1[0], T_P2[0], T_CTA[0]].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.silicon, K.nearby].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.end + 0.5 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, FOOT_MAX: 1906 };
}
