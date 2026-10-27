import os, sys
G = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(G, '..', '..') + '/'
rd = lambda f: open(os.path.join(G, f)).read()
H, S1, S2, S3, S4, S5, S6 = (rd(f) for f in ['helpers.js', 's1.js', 's2.js', 's3.js', 's4.js', 's5.js', 's6.js'])
def rep(s, a, b):
    assert s.count(a) == 1, a; return s.replace(a, b)

ANCHORS = """  // word times.  A(): anchors written in the combined video's times (the beats come from ../office-market-ar), shifted to this video by OFFS
  // (the same note with the same pauses, so one constant shift per piece); B(): anchors in this video's own times.
  const OFFS = %s;
  const cmap = c => { for (const [a, b, o] of OFFS) if (c >= a && c < b) return c + o; return c; };
  const find = (w, from) => { const n = s => s.replace(/[.،؟?:!]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === w); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const A = (w, from = 0) => find(w, Math.max(0, cmap(from) - 0.3)), B = (w, from = 0) => find(w, Math.max(0, from - 0.3));
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };   // centre of a quoted phrase (image px)
"""

CTA = """
  // ---------------------------------------------------------------- overlay: HUD titles, source chips, the call to action (his own, from this note)
  const CTA = %s, KW = %s, SEND = %s, MSG = %s, REPLY = %s;
  const overlay = (t) => {
    BEATS.forEach(({ T: B0, hud, src }, i) => {                      // consecutive beats with the same title share one title (it stays up, then fades once)
      const same = (x) => x && x.hud && hud && x.hud[1] === hud[1];
      if (hud && !same(BEATS[i - 1])) { let j = i; while (same(BEATS[j + 1])) j++; hudAR(t, hud[0], hud[1], hud[2], B0[0] + 0.05, BEATS[j].T[1] - 0.1, hud[3] || GOLD); }
      if (src) srcChip(t, src, B0[0] + 0.3, B0[1] - 0.15);
    });
    %s
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
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, NO_CAPTIONS: false, CAP_UNTIL: %s, STATIC_FACE: true };
}
"""

def build(folder, title, offs, body, cta, cap, extra_overlay=''):
    head = "'use strict';\n// ---------------------------------------------------------------------------\n" + title + \
        "\n// Everything on screen in Arabic, right to left; every beat is a real page (marker on the exact words) or the map; no face (audio only); captions on the\n" + \
        "// opening line only.  His voice: the whole note, untouched (one plain gain, pauses over 0.3 s shortened).  Pages: pagedata.js (captures in assets/, not\n" + \
        "// committed).  Beats reused from ../office-market-ar (the combined video), re-timed with OFFS.  Safe zone: x 130-950, y 300-1420.\n" + \
        "// ---------------------------------------------------------------------------\nfunction buildScenes() {\n  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };\n"
    js = head + (ANCHORS % offs) + H + "\n  // ================================================================ the beats\n" + body + (CTA % (*cta, extra_overlay, cap))
    open(R + folder + '/scenes.js', 'w').write(js); print('wrote', folder, len(js))

# ---------------------------------------------------------------- n5: the office market today (the whole note)
s6 = rep(S6, "towerPin(t, cam, TW, A('برج', 188.2) - 0.1);", "towerPin(t, cam, TW, B('مشروع', 59.3) - 0.1);")
s6 = rep(s6, "calloutAR(t, cam, TW, 'برج روكفيلر للأعمال', 'شارع الشيخ زايد', GOLD, A('روكفيلر', 191.5) - 0.1, 0, -140, 230);", "calloutAR(t, cam, TW, 'برج روكفيلر للأعمال', 'تطوير LMD · شارع الشيخ زايد', GOLD, B('روكفيلر', 59.8) - 0.1, 0, -140, 230);")
s6 = rep(s6, "beat(r1, ['برج مكاتب جديد', 'برج روكفيلر للأعمال', 'على شارع الشيخ زايد']);", "beat(r1, ['وهني يجي دور', 'برج روكفيلر للأعمال', 'على شارع الشيخ زايد']);")
body5 = "  // ---- 1. the office market today\n" + S1 + "\n  // ---- 2. DIFC\n" + rep(S2, "t5 = [t4[1], A('دبي', 49) - 0.15]", "t5 = [t4[1], B('ومع', 49.6) - 0.15]") + """
  // ---- 3. DIFC Zabeel (his short line in this note)
  const z1 = [t5[1], B('نشوف', 54) - 0.1], z2 = [z1[1], B('وهني', 57.9) - 0.1];
  page('p_zab1', 'dmo_zabeel', z1, [[B('تتجاوز', 52.5) - 0.2, 2410]], [[0, B('100', 53.3) - 0.3, B('درهم', 53.8) + 0.5]]);
  beat(z1, ['دي آي إف سي زعبيل', 'قيمة تطويرية تتجاوز 100 مليار', 'توسعة مركز دبي المالي العالمي'], 'المكتب الإعلامي لحكومة دبي · يناير 2026');
  flight('m_zabeel', z2, [[0, 55.285, 25.212, 13.9, 120, 30], [dur(z2) + 0.5, 55.29, 25.21, 14.3, 120, 36]], (t, cam) => {
    area(t, cam, 'difc', RED, z2[0] - 2, [z2[0], z2[1]]); area(t, cam, 'zabeel', GOLDS, z2[0] + 0.1, [z2[0] + 0.3, z2[1]]);
    calloutAR(t, cam, P.zabeel, 'منطقة زعبيل', 'التوسعة', GOLD, z2[0] + 0.4, 0, 120, -200);
    card(t, [['خطة طويلة المدى', B('خطة', 55) - 0.1], ['لاستيعاب شركات وعمال أكثر', B('لاستيعاب', 56.2) - 0.1, true]], B('خطة', 55) - 0.2, z2[1], 1050);
  });
  beat(z2, ['خطة طويلة المدى', 'مركز دبي المالي في زعبيل', 'شركات وعمال أكثر']);

  // ---- 4. the Rockefeller tower and the conclusion
  const r1 = [z2[1], A('كريستيان', 192) - 0.1], r2 = [r1[1], A('يعني', 199.8) - 0.1], r3 = [r2[1], A('المشروع', 207) - 0.1], r4 = [r3[1], A('ومستوحى', 214) - 0.2], r5 = [r4[1], A('بحسب', 215.3) - 0.1],
    r6 = [r5[1], A('الفكرة', 229.5) - 0.1], r7 = [r6[1], A('اكتب', 241) - 0.1];
""" + s6
build('om-market-ar', "// \"قطاع المكاتب التجارية في دبي\" - voice note n5 of 27 Oct 2026 (03:42), the whole note: the office market today, DIFC, DIFC Zabeel,\n// the Rockefeller tower, the conclusion and his call to action \"ريبورت\".",
      '[[0, 50.0, -0.01], [150.0, 250, -129.55]]', body5,
      ["A('اكتب', 241)", "A('ريبورت', 242)", "A('وبطرش', 242.5)", "'ريبورت'", "'بأرسل لك المقارنة'"], "t1[1] - 0.05")

# ---------------------------------------------------------------- n3: the DIFC Zabeel expansion
body3 = """  // ---- 1. the DIFC Zabeel expansion
  const t6 = [0, A('نتكلم', 57) - 0.1], t7 = [t6[1], A('والخطة', 65) - 0.1], t8 = [t7[1], A('الحين', 75) - 0.1], t9 = [t8[1], B('بس', 33.5) - 0.15];
""" + S3 + """
  // ---- 2. his question and the areas around (this note's own end)
  const q1 = [t9[1], B('إذا', 40.2) - 0.1], q2 = [q1[1], B('اكتبلي', 43.5) - 0.1];
  flight('m_q', q1, [[0, 55.285, 25.208, 13.6, 90, 28], [dur(q1) + 0.5, 55.286, 25.208, 14.0, 120, 34]], (t, cam) => {
    area(t, cam, 'difc', RED, q1[0] - 2, [q1[0], q1[1]], 0.6); area(t, cam, 'zabeel', GOLDS, q1[0] - 2, [q1[0], q1[1]], 0.6);
    card(t, [['السؤال الأهم للمستثمر', B('السؤال', 34) - 0.1], ['تدخل سوق المكاتب الحين؟', B('تدخل', 36.5) - 0.1, true], ['أو تنتظر المعروض الجديد؟', B('تنتظر', 38.8) - 0.1, true]], B('السؤال', 34) - 0.2, q1[1], 960);
  });
  beat(q1, ['بس السؤال الأهم', 'الحين أو تنتظر؟', 'المعروض الجديد في زعبيل']);
  const ma = B('المناطق', 41.1);
  flight('m_areas', q2, [[0, 55.282, 25.203, 13.3, 60, 24], [dur(q2) + 0.5, 55.281, 25.2, 13.0, 30, 22]], (t, cam) => {
    area(t, cam, 'difc', RED, q2[0] - 2, [q2[0], q2[1]], 0.6); area(t, cam, 'zabeel', GOLDS, q2[0] - 2, [q2[0], q2[1]], 0.6);
    area(t, cam, 'downtown', VIO, ma - 0.1, [ma, q2[1]]); area(t, cam, 'bbay', TEAL, ma + 0.2, [ma + 0.3, q2[1]]);
    chip(t, 'أي المناطق ممكن تستفيد من التوسعة؟', ma - 0.2, q2[1], 1150, '#FFFFFF', 32);
  });
  beat(q2, ['المناطق القريبة', 'مين ممكن يستفيد؟', 'وسط دبي · الخليج التجاري']);
"""
build('om-zabeel-ar', "// \"دبي أعلنت عن مشروع بقيمة 100 مليار درهم\" - voice note n3 of 27 Oct 2026 (03:41), the whole note: the DIFC Zabeel expansion,\n// his question (enter the office market now or wait for the new supply?) and his call to action \"DIFC\".",
      '[[50.0, 84.5, -50.32]]', body3,
      ["B('اكتبلي', 43.5)", "B('دي', 44.9)", "B('وبطرش', 45.5)", "'DIFC'", "'بأرسل لك التفاصيل'"], "B('وهذا', 3.3) - 0.05")

# ---------------------------------------------------------------- n1: Expo City
s4 = rep(S4, "e1 = [t9[1], A('الجواب', X0) - 0.1]", "e1 = [o1[1], A('الجواب', X0) - 0.1]")
s4 = rep(s4, "e11 = [e10[1], A('في', 134.5) - 0.1]", "e11 = [e10[1], B('إذا', 51.2) - 0.1]")
body1 = """  // ---- 0. his opening question: Aldar, an Abu Dhabi company, expanding in Dubai, in Expo City
  const o1 = [0, B('ليش', 5.5) - 0.1], ALDAR = [54.604, 24.449];                  // Aldar HQ, Al Raha Beach, Abu Dhabi
  flight('m_o1', o1, [[0, 54.88, 24.7, 10.2, 0, 8], [dur(o1) + 0.5, 54.9, 24.72, 10.55, 0, 14]], (t, cam) => {
    calloutAR(t, cam, ALDAR, 'الدار', 'أبوظبي', GOLD, B('الدار', 1.2) - 0.1, 0, 0, 210);
    mapFlow(t, cam, ALDAR, P.expo, B('تتوسع', 3) - 0.2, 0, { dur: 1.4, bend: 0.15 });
    calloutAR(t, cam, P.expo, 'إكسبو سيتي دبي', 'دبي', GOLD, B('إكسبو', 4.8) - 0.2, 0, 0, -210);
  });
  beat(o1, ['عبدالله', 'ليش الدار تتوسع في دبي؟', 'من أبوظبي إلى إكسبو سيتي']);

  // ---- 1. Expo City
""" + s4 + """
  // ---- 2. for the project details and the area plan
  const c1 = [e11[1], B('اكتب', 54.9) - 0.1];
  page('p_sky3', 'sky_aldar', c1, [], []);
  beat(c1, ['إذا تبغى تعرف', 'تفاصيل مشروع الدار', 'وخطة تطوير المنطقة'], 'سكاي نيوز عربية · أكتوبر 2024');
"""
build('om-expo-ar', "// \"ليش الدار اختارت إكسبو سيتي؟\" - voice note n1 of 27 Oct 2026 (03:40), the whole note with his call to action \"إكسبو\".",
      '[[83.0, 135.5, -83.62]]', body1,
      ["B('اكتب', 54.9)", "B('إكسبو', 55.4)", "B('وبأطرش', 56.4)", "'إكسبو'", "'بأرسل لك التفاصيل'"], "o1[1] - 0.05")

# ---------------------------------------------------------------- n2: ADGM
s5 = rep(S5, "a1 = [e11[1], A('نتكلم', 142) - 0.1]", "a1 = [0, A('نتكلم', 142) - 0.1]")
s5 = rep(s5, "a5 = [a4[1], A('في', 187.5) - 0.1]", "a5 = [a4[1], B('اكتب', 52.3) - 0.1]")
build('om-adgm-ar', "// \"في شيء قاعد يصير في بوظبي\" - voice note n2 of 27 Oct 2026 (03:41), the whole note: ADGM, Al Maryah and Al Reem, with his call\n// to action \"ADGM\".",
      '[[135.0, 188.5, -135.48]]', "  // ---- 1. Abu Dhabi: ADGM, Al Maryah and Al Reem\n" + s5,
      ["B('اكتب', 52.3)", "B('ADGM', 53.6)", "B('وبطرش', 54.2)", "'ADGM'", "'بأرسل لك التقرير'"], "B('الطلب', 4.3) - 0.05")

# ---------------------------------------------------------------- n4: the Rockefeller tower (the whole take)
body4 = """  const TW = P.tower;
  // ---- 1. a new office tower on Sheikh Zayed Road called Rockefeller; first, the background of the name
  const k1 = [0, B('عائلة', 9.2) - 0.1];
  flight('m_r1', k1, [[0, 55.268, 25.2, 13.2, 60, 26], [dur(k1) + 0.5, 55.266, 25.196, 14.8, 150, 44]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: 0.3, dur: 1.2, alpha: 0.9 }); towerPin(t, cam, TW, B('برج', 0.3) + 0.2);
    calloutAR(t, cam, TW, 'برج روكفيلر للأعمال', 'شارع الشيخ زايد', GOLD, B('روكفيلر', 3.6) - 0.1, 0, -140, 230);
    chip(t, 'خلفية الاسم وعلاقته بعالم الأعمال', B('خلفية', 6.7) - 0.2, k1[1], 1150, '#FFFFFF', 32);
  });
  beat(k1, ['برج مكاتب جديد', 'برج روكفيلر للأعمال', 'على شارع الشيخ زايد']);
  // ---- 2. the family: Standard Oil, Rockefeller Center (Arabic Wikipedia)
  const k2 = [k1[1], B('جون', 12.2) - 0.1], k3 = [k2[1], B('وابنه', 15) - 0.1], k4 = [k3[1], B('واليوم', 21.6) - 0.1];
  page('p_fam', 'wiki_family', k2, [[k2[0] + 0.1, qy('wiki_family', 0)]], [[0, B('لها', 10.2), B('الأمريكي', 11.6) + 0.4]], true, 0.92);
  beat(k2, ['عائلة روكفيلر', 'تاريخ طويل في الاقتصاد الأمريكي', 'الصناعة والسياسة والصيرفة'], 'ويكيبيديا · عائلة روكفلر');
  page('p_so', 'wiki_so', k3, [[k3[0] + 0.1, qy('wiki_so', 0)]], [[0, B('شارك', 13.2) - 0.1, B('أويل', 14.7) + 0.3]], true, 0.92);
  beat(k3, ['جون دي روكفيلر', 'شارك في تأسيس ستاندرد أويل', 'عام 1870'], 'ويكيبيديا · ستاندرد أويل');
  page('p_rc', 'wiki_rc', k4, [[k4[0] + 0.1, (qy('wiki_rc', 0) + qy('wiki_rc', 1)) / 2]], [[1, B('وراء', 15.9), B('نيويورك', 17.7) + 0.4], [0, B('مجمع', 18.2), B('واحد', 21.2) + 0.2]], true, 0.92);
  beat(k4, ['وابنه', 'روكفيلر سنتر في نيويورك', 'مجمع للأعمال والتجارة والإعلام'], 'ويكيبيديا · مركز روكفلر');
  // ---- 3. Christian Rockefeller, the sixth generation, with the developer LMD; his first branded real-estate project
  const k5 = [k4[1], B('بالشراكة', 27.4) - 0.1], k6 = [k5[1], B('وهذا', 29.5) - 0.1], k7 = [k6[1], B('ومن', 35.4) - 0.1];
  page('p_masd1', 'masd_rock', k5, [[B('كريستيان', 22.5) + 0.2, qy('masd_rock', 0)]], [[0, B('الجيل', 23.8), B('دبي', 27.1) + 0.2]]);
  beat(k5, ['واليوم', 'كريستيان روكفيلر', 'من الجيل السادس للعائلة'], 'المصدر العقاري · أكتوبر 2026');
  page('p_bayan0', 'bayan_rock', k6, [[k6[0] + 0.1, qy('bayan_rock', 0)]], [[0, B('مع', 28.2) - 0.1, B('LMD', 29) + 0.4]], true, 0.92);
  beat(k6, ['بالشراكة مع المطور', 'LMD', 'برج كريستيان أ. روكفلر التجاري'], 'البيان · أكتوبر 2026');
  page('p_bayan1', 'bayan_rock', k7, [[B('أول', 30.1) - 0.1, qy('bayan_rock', 1)]], [[1, B('أول', 30.1), B('التجارية', 32.2) + 0.4]]);
  beat(k7, ['أول مشروع عقاري', 'يحمل علامته التجارية', 'كريستيان روكفيلر بيزنس تاور'], 'البيان · أكتوبر 2026');
  // ---- 4. his view: the brand counts when the work environment backs it
  const k8 = [k7[1], B('والمشروع', 42.3) - 0.1];
  flight('m_view', k8, [[0, 55.266, 25.196, 14.6, 150, 42], [dur(k8) + 0.5, 55.2662, 25.1958, 15.1, 150, 46]], (t, cam) => {
    towerPin(t, cam, TW, k8[0] - 2); mapRoad(t, cam, 'E11', { a0: k8[0] - 2, dur: 0.1, alpha: 0.9 });
    card(t, [['من وجهة نظري', B('ومن', 35.4)], ['قيمة البراند في المكاتب', B('قيمة', 36.6) - 0.1, true], ['تظهر لما تدعمها بيئة عمل تليق بالشركات', B('بيئة', 39.9) - 0.1]], B('ومن', 35.4) - 0.1, k8[1], 980);
  });
  beat(k8, ['من وجهة نظري', 'قيمة البراند', 'تدعمها بيئة العمل']);
  // ---- 5. five amenity floors, hospitality-inspired facilities
  const k9 = [k8[1], B('ومرافق', 48.2) - 0.1], k10 = [k9[1], B('والخيارات', 50.7) - 0.1];
  page('p_masd2', 'masd_rock', k9, [[k9[0] + 0.6, qy('masd_rock', 2)]], [[2, B('خمس', 43.8) - 0.1, B('للمرافق', 44.6) + 0.5]], true, 0.9);
  beat(k9, ['والمشروع', 'خمسة طوابق للمرافق', 'المرافق والخدمات'], 'المصدر العقاري · أكتوبر 2026');
  page('p_bayan2', 'bayan_rock', k10, [[k10[0] + 0.1, qy('bayan_rock', 2)]], [[2, B('مستوحاة', 49.1) - 0.1, B('الفندقية', 50.1) + 0.4]], true, 0.9);
  beat(k10, ['ومرافق', 'مستوحاة من الضيافة الفندقية', 'مكاتب فاخرة'], 'البيان · أكتوبر 2026');
  // ---- 6. the options, the prices and the payment plan
  const k11 = [k10[1], B('وبحسب', 55.1) - 0.1], k12 = [k11[1], B('الاسم', 69.4) - 0.1];
  const FO = [B('مستقلة', 52.2), B('نص', 53.3), B('كامل', 54.4)];
  flight('m_opts', k11, [[0, 55.266, 25.1955, 15.0, 150, 44], [dur(k11) + 0.5, 55.266, 25.1955, 15.3, 150, 46]], (t, cam) => { towerPin(t, cam, TW, k11[0] - 2); });
  beat(k11, ['الخيارات', 'من مكتب مستقل', 'إلى نص طابق أو طابق كامل']);
  flight('m_r2', k12, [[0, 55.266, 25.1955, 15.3, 150, 46], [dur(k12) + 0.5, 55.2655, 25.195, 15.6, 150, 48]], (t, cam) => {
    towerPin(t, cam, TW, k12[0] - 2); mapRoad(t, cam, 'E11', { a0: k12[0] - 2, dur: 0.1, alpha: 0.9 });
    card(t, [['بحسب التسعير الأولي المتاح', B('وبحسب', 55.1) - 0.1], ['من أقل من 4.4 مليون درهم', B('تبدأ', 58.1) - 0.1, true], ['4,000 – 4,600 درهم للقدم المربع', B('يتراوح', 61.8) + 0.3, true]], B('وبحسب', 55.1) - 0.2, B('وخطة', 67.3) - 0.1, 980);
    card(t, [['خطة الدفع', B('وخطة', 67.3) - 0.1], ['50 / 50', B('50-50', 68.9) - 0.3, true]], B('وخطة', 67.3) - 0.1, k12[1], 980);
  });
  beat(k12, ['بحسب التسعير الأولي المتاح', 'الأسعار وخطة الدفع', 'حسب الوحدة']);
  // ---- 7. the name gets attention, the comparison shows the value: three points; then the benchmark against the towers around it
  const k13 = [k12[1], B('إذا', 79) - 0.1], k14 = [k13[1], B('اكتب', 83.3) - 0.1];
  flight('m_r3', k13, [[0, 55.268, 25.198, 14.0, 120, 34], [dur(k13) + 0.5, 55.269, 25.199, 13.7, 90, 30]], (t, cam) => {
    towerPin(t, cam, TW, k13[0] - 2); mapRoad(t, cam, 'E11', { a0: k13[0] - 2, dur: 0.1, alpha: 0.9 });
    chip(t, 'الاسم يلفت الانتباه · والمقارنة تبين القيمة', B('الاسم', 69.4) - 0.1, B('هني', 73.6) - 0.2, 1150, '#FFFFFF', 30);
    card(t, [['الموقع', B('الموقع', 75.5) - 0.1, true], ['مواصفات المكتب', B('مواصفات', 76.4) - 0.1, true], ['السعر مقابل البدائل', B('والسعر', 77.6) - 0.1, true]], B('هني', 73.6) - 0.1, k13[1], 900);
  });
  beat(k13, ['الاسم يلفت الانتباه', 'والمقارنة تبين القيمة', 'الدراسة على ثلاث نقاط']);
  flight('m_r4', k14, [[0, 55.27, 25.2, 13.4, 60, 26], [dur(k14) + 0.5, 55.27, 25.2, 13.1, 30, 22]], (t, cam) => {
    towerPin(t, cam, TW, k14[0] - 2); rings(t, cam, TW, k14[0] + 0.2, k14[1], 1600);
    area(t, cam, 'difc', RED, k14[0] + 0.3, [k14[0] + 0.4, k14[1]], 0.5); area(t, cam, 'downtown', VIO, k14[0] + 0.5, [k14[0] + 0.6, k14[1]], 0.5); area(t, cam, 'bbay', TEAL, k14[0] + 0.7, [k14[0] + 0.8, k14[1]], 0.5);
    chip(t, 'مقارنة معيارية مع الأبراج المنافسة حوله', B('مقارنة', 79.7) - 0.2, k14[1], 1150, '#FFFFFF', 30);
  });
  beat(k14, ['مقارنة معيارية', 'برج روكفيلر مقابل المنافسين', 'الأبراج اللي حوله']);
"""
floors = """// the options: a floor of four bays - one office, half a floor, a whole floor (lights up as he names each)
    { const al = win(t, k11[0] + 0.1, k11[1] - 0.1); if (al > 0.003) {
      ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, k11[0] + 0.1)); const y = 900, h = 330; glassPill(SAFE.x0, y, SAFE.w, h, 30);
      const lit = FO.reduce((n, a, i) => t >= a - 0.1 ? [1, 2, 4][i] : n, 0), cur = FO.reduce((k, a, i) => t >= a - 0.1 ? i : k, -1), bw = (SAFE.w - 120 - 3 * 14) / 4;
      for (let i = 0; i < 4; i++) { const x = SAFE.x1 - 60 - (i + 1) * bw - i * 14, on = i < lit; rr(x, y + 60, bw, 120, 14); ctx.fillStyle = on ? 'rgba(233,196,124,0.85)' : 'rgba(243,239,230,0.08)'; ctx.fill(); ctx.strokeStyle = on ? GOLD : 'rgba(243,239,230,0.25)'; ctx.lineWidth = 2; ctx.stroke(); }
      const L = ['مكتب مستقل', 'نص طابق', 'طابق كامل'];
      if (cur >= 0) T(L[cur], CX, y + 262, { font: F.d(800, 52), color: '#FFFFFF' });
      ctx.restore(); } }"""
build('om-rockefeller-ar', "// \"في برج مكاتب جديد قادم على شارع الشيخ زايد يحمل اسم روكفيلر\" - voice note n4 of 27 Oct 2026 (03:41), the whole take: the name's\n// background (Standard Oil, Rockefeller Center), Christian Rockefeller and LMD, the amenities, the options, the prices, the three points, \"report\".",
      '[]', body4,
      ["B('اكتب', 83.3)", "B('report', 83.9)", "B('وبطرش', 84.1)", "'report'", "'بأرسل لك المقارنة كاملة'"], "B('وقبل', 4.1) - 0.05", floors)
