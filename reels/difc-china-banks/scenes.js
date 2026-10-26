'use strict';
// ---------------------------------------------------------------------------
// "China's biggest banks in DIFC" - HeyGen take 4a30e26b (68 s, English), Abdullah Ahli's twin.
// Mostly animation on the dark gold background; ONE map (DIFC and the communities around it) only where he talks about property around DIFC.
// His face is the small round bubble top-left.  Facts: DIFC (2024 release, repeated by WAM Sep 2026): China's five largest banks hold more than 30% of
// DIFC's banking and capital-markets assets; CICC opened its DIFC branch in May 2025 (as he says).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    five: tw(/^FIVE$/, 0, 0.46), p30: tw(/^30%$/, 0, 2.26), difc1: tw(/^DIFC'S$/, 0, 3.26), y2024: tw(/^2024\.$/, 0, 7.2), doesnt: tw(/^DOESN'T$/, 0, 8.2), thousands: tw(/^THOUSANDS$/, 0, 8.6), apart: tw(/^APARTMENTS\.$/, 0, 11.08),
    these: tw(/^THESE$/, 0, 12.04), finance: tw(/^FINANCE,$/, 0, 13.12), trade: tw(/^TRADE,$/, 0, 13.8), raise: tw(/^RAISE$/, 0, 14.38), deals: tw(/^ARRANGE$/, 0, 15.52), small: tw(/^SMALL$/, 0, 17.16), billions: tw(/^BILLIONS$/, 0, 18.18),
    cicc: tw(/^CICC$/, 0, 19.58), may: tw(/^MAY$/, 0, 22.52), joining: tw(/^JOINING$/, 0, 23.68), companies: tw(/^COMPANIES$/, 1, 27.14), lawyers: tw(/^LAWYERS,$/, 0, 28.84), acc: tw(/^ACCOUNTANTS,$/, 0, 29.69), adv: tw(/^ADVISORS,$/, 0, 30.38), offices: tw(/^OFFICES\.$/, 0, 31.58),
    expand: tw(/^EXPAND$/, 0, 32.82), space: tw(/^SPACE\.$/, 0, 35.16), hire: tw(/^HIRE$/, 0, 36.1), live: tw(/^LIVE\.$/, 0, 38.58), but1: tw(/^BUT$/, 0, 39.12), license: tw(/^LICENSE$/, 0, 41.7), howmany: tw(/^MANY$/, 0, 43.18), office2: tw(/^OFFICE$/, 0, 44.9),
    ifyou: tw(/^IF$/, 0, 46.6), check: tw(/^CHECK$/, 0, 48.94), firms2: tw(/^EXPANDING,$/, 0, 49.7), tenants: tw(/^TENANTS$/, 0, 50.86), supply: tw(/^SUPPLY$/, 0, 52.96), being: tw(/^BEING$/, 0, 54.0), right: tw(/^RIGHT$/, 0, 58.0),
    study: tw(/^THERE'S$/, 0, 60.36), comment: tw(/^COMMENT$/, 0, 66.72), china: tw(/^CHINA$/, 0, 66.88),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const GOLD = '#E9C47C', RED = '#E5484D', RED2 = '#FF8A8E', BLUE = ['#3DB2FF', '#A9DEFF'], TEAL = ['#2FD8A0', '#A6F3D6'], VIO = ['#8C7BFF', '#CFC6FF'];
  const T_MAP = [K.ifyou - 0.2, K.comment - 0.2], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('m', T_MAP, [[0, 55.282, 25.214, 15.0, 150, 44], [1.6, 55.276, 25.205, 14.15, 150, 40], [dur(T_MAP) + 0.5, 55.276, 25.205, 14.3, 150, 42]]);
  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;

  SCENES.find(s => s.id === 'm').cfg.top = (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: T_MAP[0] + 0.2, dur: 1.2, alpha: 0.9, shields: [[55.262, 25.19], [55.279, 25.209]] });
    mapArea(t, cam, 'difc', { c: [RED, RED2], a0: T_MAP[0] + 0.1, dur: 0.9, on: [T_MAP[0] + 0.3, K.study], label: 'DIFC', sub: 'DUBAI INTERNATIONAL FINANCIAL CENTRE', dx: 160, dy: -130, tag: 0.95 });
    mapArea(t, cam, 'downtown', { c: VIO, a0: K.check - 0.3, dur: 0.8, on: [K.check - 0.2, K.right], label: 'DOWNTOWN', dx: 180, dy: 60, base: 0.6, tag: 0.95 });
    mapArea(t, cam, 'bbay', { c: TEAL, a0: K.check, dur: 0.8, on: [K.check + 0.1, K.right], label: 'BUSINESS BAY', dx: -170, dy: 90, base: 0.6, tag: 0.95 });
    mapScale(t, cam, T_MAP[0] + 1.6, 0);
  };

  // ---- 1: the 30% ring and the five banks
  const BANKS = ['ICBC', 'BANK OF CHINA', 'BANK OF COMMUNICATIONS', 'CHINA CONSTRUCTION BANK', 'AGRICULTURAL BANK OF CHINA'];
  const ring30 = (t) => {
    const a0 = 0.3, a1 = K.doesnt - 0.25, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    const cx = CX, cy = 720, R = 150, p = 0.30 * ea(t, K.p30 - 0.3, K.p30 + 0.9, E.out3);
    ctx.lineCap = 'round'; ctx.lineWidth = 46; ctx.strokeStyle = 'rgba(243,239,230,0.1)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI); ctx.stroke();
    T(Math.round(p * 100) + '%+', cx, cy + 30, { font: F.d(800, 96), color: '#FFFFFF', alpha: ea(t, K.p30 - 0.2, K.p30 + 0.2) });
    T("OF DIFC'S BANKING &", cx, cy + R + 70, { font: F.d(800, 30), ls: 3, color: GOLD, alpha: ea(t, K.difc1 - 0.2, K.difc1 + 0.3) });
    T('CAPITAL MARKETS ASSETS', cx, cy + R + 108, { font: F.d(800, 30), ls: 3, color: GOLD, alpha: ea(t, K.difc1, K.difc1 + 0.4) });
    BANKS.forEach((b, i) => { const e = ea(t, K.five + 0.2 + i * 0.22, K.five + 0.6 + i * 0.22, E.out4); if (e <= 0.003) return; const f = F.d(800, 23), col = i < 3 ? 0 : 1, row = i < 3 ? i : i - 3, w = (SAFE.w - 16) / 2, x = SAFE.x0 + col * (w + 16), y = 1092 + row * 54;
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * (col ? 24 : -24), 0); rr(x, y - 22, w, 44, 22); ctx.fillStyle = 'rgba(229,72,77,0.16)'; ctx.fill(); ctx.strokeStyle = 'rgba(229,72,77,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); T(b, x + w / 2, y + 8, { font: f, ls: 1, color: '#FFFFFF', sx: Math.min(1, (w - 24) / M(b, f, 1)) }); ctx.restore(); });
    T('SOURCE: DIFC, FIGURES PUBLISHED IN 2024', CX, 1262, { font: F.d(700, 17), ls: 2, color: C.mute, alpha: ea(t, K.y2024 - 0.3, K.y2024) });
    ctx.restore();
  };
  // ---- 2: not thousands of bankers buying apartments; what the banks do; a small team, billions
  const notThis = (t) => {
    const a0 = K.doesnt - 0.2, a1 = K.cicc - 0.25, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    const c1 = 1 - ea(t, K.these - 0.3, K.these + 0.1);
    if (c1 > 0.003) { ctx.save(); ctx.globalAlpha *= c1 * ea(t, a0, a0 + 0.4); glassPill(SAFE.x0, 760, SAFE.w, 300, 30); T('THOUSANDS OF BANKERS', CX, 870, { font: F.d(800, 52), color: '#FFFFFF' }); T('BUYING APARTMENTS', CX, 940, { font: F.d(800, 52), color: '#FFFFFF' });
      const s = ea(t, K.apart - 0.4, K.apart + 0.2, E.inOut2); if (s > 0.003) { ctx.lineWidth = 8; ctx.strokeStyle = RED; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(SAFE.x0 + 70, 905); ctx.lineTo(SAFE.x0 + 70 + (SAFE.w - 140) * s, 905); ctx.stroke(); }
      T('NOT WHAT THIS MEANS', CX, 1010, { font: F.d(800, 26), ls: 4, color: RED2, alpha: ea(t, K.apart, K.apart + 0.3) }); ctx.restore(); }
    const c2 = ea(t, K.these - 0.1, K.these + 0.3); if (c2 > 0.003) {
      ctx.save(); ctx.globalAlpha *= c2;
      T('WHAT THESE BANKS DO', CX, 700, { font: F.d(800, 30), ls: 5, color: GOLD });
      const items = [['FINANCE', K.finance], ['TRADE', K.trade], ['RAISE CAPITAL', K.raise], ['ARRANGE DEALS', K.deals]], gap = 16, w = (SAFE.w - gap) / 2, h = 96;
      items.forEach(([txt, a], i) => { const e = ea(t, a - 0.05, a + 0.35, E.out4); if (e <= 0.003) return; const x = SAFE.x0 + (i % 2) * (w + gap), y = 740 + Math.floor(i / 2) * (h + gap); ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 20); glassPill(x, y, w, h, 24); T(txt, x + w / 2, y + 60, { font: F.d(800, 34), ls: 1, color: '#FFFFFF' }); ctx.restore(); });
      const e3 = ea(t, K.small - 0.1, K.small + 0.4, E.out4); if (e3 > 0.003) { ctx.save(); ctx.globalAlpha *= e3; ctx.translate(0, (1 - e3) * 20); const y = 990; glassPill(SAFE.x0, y, SAFE.w, 200, 28);
        for (let i = 0; i < 5; i++) { const px = SAFE.x0 + 70 + i * 44; dot(px, y + 72, 15, GOLD); rr(px - 18, y + 92, 36, 44, 16); ctx.fillStyle = GOLD; ctx.fill(); }
        T('A SMALL TEAM', SAFE.x0 + 50, y + 172, { font: F.d(800, 24), ls: 3, color: C.dim, align: 'left' });
        const ae = ea(t, K.billions - 0.3, K.billions + 0.3, E.out4); line(SAFE.x0 + 320, y + 100, SAFE.x0 + 320 + 120 * ae, y + 100, { color: GOLD, w: 5 });
        if (ae > 0.9) { ctx.beginPath(); ctx.moveTo(SAFE.x0 + 445, y + 100); ctx.lineTo(SAFE.x0 + 428, y + 88); ctx.lineTo(SAFE.x0 + 428, y + 112); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); }
        T('BILLIONS', SAFE.x1 - 40, y + 112, { font: F.d(800, 66), color: GOLD, align: 'right', alpha: ea(t, K.billions - 0.1, K.billions + 0.3) }); T('IN BUSINESS', SAFE.x1 - 40, y + 160, { font: F.d(800, 24), ls: 3, color: C.dim, align: 'right', alpha: ea(t, K.billions + 0.2, K.billions + 0.5) }); ctx.restore(); }
      ctx.restore(); }
    ctx.restore();
  };
  // ---- 3: CICC, May 2025
  const cicc = (t) => {
    const a0 = K.cicc - 0.2, a1 = K.companies - 0.25, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    glassPill(SAFE.x0, 700, SAFE.w, 520, 30); rr(SAFE.x0, 700, 10, 520, 5); ctx.fillStyle = RED; ctx.fill();
    T('MAY 2025', SAFE.x0 + 44, 776, { font: F.d(800, 32), ls: 5, color: GOLD, align: 'left', alpha: ea(t, K.may - 0.2, K.may + 0.2) });
    T('CICC', SAFE.x0 + 44, 880, { font: F.d(800, 110), color: '#FFFFFF', align: 'left' });
    T('OPENED ITS DIFC BRANCH', SAFE.x0 + 44, 940, { font: F.d(800, 32), ls: 2, color: C.dim, align: 'left' });
    const je = ea(t, K.joining - 0.1, K.joining + 0.4); if (je > 0.003) { ctx.save(); ctx.globalAlpha *= je; line(SAFE.x0 + 44, 990, SAFE.x1 - 44, 990, { color: 'rgba(243,239,230,0.2)', w: 2 }); T('JOINING THE CHINESE BANKS ALREADY THERE', SAFE.x0 + 44, 1040, { font: F.d(800, 24), ls: 2, color: GOLD, align: 'left', sx: Math.min(1, (SAFE.w - 88) / M('JOINING THE CHINESE BANKS ALREADY THERE', F.d(800, 24), 2)) });
      for (let i = 0; i < 6; i++) { const e = ea(t, K.joining + 0.1 + i * 0.12, K.joining + 0.4 + i * 0.12, E.back); const x = SAFE.x0 + 80 + i * 120, y = 1130; ctx.save(); ctx.globalAlpha *= e; rr(x - 40, y - 52, 80, 100, 10); ctx.fillStyle = i === 0 ? RED : 'rgba(243,239,230,0.16)'; ctx.fill(); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { rr(x - 26 + c * 32, y - 38 + r * 28, 20, 16, 3); ctx.fillStyle = i === 0 ? '#0A0A0B' : 'rgba(243,239,230,0.4)'; ctx.fill(); } ctx.restore(); }
      ctx.restore(); }
    ctx.restore();
  };
  // ---- 4: the chain - firms in Dubai need lawyers, accountants, advisors, offices; expand -> more space; hire -> homes
  const chain = (t) => {
    const a0 = K.companies - 0.2, a1 = K.but1 - 0.2, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    T('COMPANIES DOING BUSINESS THROUGH DUBAI NEED', CX, 690, { font: F.d(800, 24), ls: 2, color: GOLD, alpha: ea(t, a0, a0 + 0.4), sx: Math.min(1, SAFE.w / M('COMPANIES DOING BUSINESS THROUGH DUBAI NEED', F.d(800, 24), 2)) });
    const svc = [['LAWYERS', K.lawyers], ['ACCOUNTANTS', K.acc], ['ADVISORS', K.adv], ['OFFICES', K.offices]], gap = 12, w = (SAFE.w - 3 * gap) / 4;
    svc.forEach(([txt, a], i) => { const e = ea(t, a - 0.05, a + 0.35, E.out4); if (e <= 0.003) return; const x = SAFE.x0 + i * (w + gap); ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 18); glassPill(x, 720, w, 84, 22); T(txt, x + w / 2, 772, { font: F.d(800, 22), ls: 1, color: '#FFFFFF', sx: Math.min(1, (w - 14) / M(txt, F.d(800, 22), 1)) }); ctx.restore(); });
    const steps = [['FIRMS EXPAND', 'MORE OFFICE SPACE', K.expand, K.space], ['THEY HIRE HERE', 'EMPLOYEES NEED HOMES', K.hire, K.live]];
    steps.forEach(([a, b, ta, tb], i) => {
      const e = ea(t, ta - 0.1, ta + 0.4, E.out4); if (e <= 0.003) return; const y = 860 + i * 190; ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 22);
      glassPill(SAFE.x0, y, SAFE.w, 160, 26); T(a, SAFE.x0 + 40, y + 70, { font: F.d(800, 38), color: '#FFFFFF', align: 'left' });
      const e2 = ea(t, tb - 0.4, tb + 0.1, E.out4); line(SAFE.x0 + 40, y + 104, SAFE.x0 + 40 + 60 * e2, y + 104, { color: GOLD, w: 4 }); T(b, SAFE.x0 + 120, y + 116, { font: F.d(800, 30), ls: 1, color: GOLD, align: 'left', alpha: e2 });
      ctx.restore(); });
    ctx.restore();
  };
  // ---- 5: a licence does not tell you the headcount or the office space
  const license = (t) => {
    const a0 = K.but1 - 0.15, a1 = T_MAP[0] + 0.2, al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    T('YOU NEED TO SEE THE EXPANSION', CX, 700, { font: F.d(800, 32), ls: 3, color: GOLD, alpha: ea(t, a0, a0 + 0.4) });
    const e = ea(t, K.license - 0.3, K.license + 0.3, E.out4); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 24); glassPill(SAFE.x0, 740, SAFE.w, 440, 30);
      rr(SAFE.x0 + 50, 790, 220, 280, 16); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke(); for (let r = 0; r < 4; r++) line(SAFE.x0 + 80, 860 + r * 44, SAFE.x0 + 240, 860 + r * 44, { color: 'rgba(243,239,230,0.35)', w: 4 }); dot(SAFE.x0 + 230, 1035, 22, GOLD);
      T('A BANKING LICENCE', SAFE.x0 + 320, 860, { font: F.d(800, 34), color: '#FFFFFF', align: 'left' }); T('DOES NOT TELL YOU', SAFE.x0 + 320, 904, { font: F.d(800, 26), ls: 2, color: C.dim, align: 'left' });
      [['HOW MANY EMPLOYEES?', K.howmany], ['HOW MUCH OFFICE SPACE?', K.office2]].forEach(([q, a], i) => { const qe = ea(t, a - 0.2, a + 0.3, E.out4); if (qe <= 0.003) return; ctx.save(); ctx.globalAlpha *= qe; rr(SAFE.x0 + 320, 950 + i * 74, 450, 58, 29); ctx.fillStyle = 'rgba(229,72,77,0.18)'; ctx.fill(); T(q, SAFE.x0 + 345, 988 + i * 74, { font: F.d(800, 24), ls: 1, color: '#FFFFFF', align: 'left', sx: Math.min(1, 410 / M(q, F.d(800, 24), 1)) }); ctx.restore(); });
      ctx.restore(); }
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'DIFC · DUBAI', "CHINA'S 5 BIGGEST BANKS", "MORE THAN 30% OF DIFC'S ASSETS", 0.3, K.doesnt - 0.25, RED2);
    hudTitle(t, 'WHAT IT DOES NOT MEAN', 'NOT A FLOOD OF BUYERS', 'A SMALL TEAM, BILLIONS IN BUSINESS', K.doesnt - 0.2, K.cicc - 0.25, GOLD);
    hudTitle(t, 'MAY 2025', 'CICC IN DIFC', 'ANOTHER CHINESE INSTITUTION', K.cicc - 0.2, K.companies - 0.25, RED2);
    hudTitle(t, 'HOW IT REACHES PROPERTY', 'FIRMS → OFFICES → HOMES', 'IF THE EXPANSION IS REAL', K.companies - 0.2, K.but1 - 0.2, GOLD);
    hudTitle(t, 'CHECK BEFORE YOU BUY', 'LICENCE ≠ HEADCOUNT', 'SEE THE EXPANSION HAPPEN', K.but1 - 0.15, T_MAP[0] + 0.2, GOLD);
    hudTitle(t, 'PROPERTY AROUND DIFC', 'WHAT TO CHECK', 'DIFC · DOWNTOWN · BUSINESS BAY', T_MAP[0] + 0.25, K.being - 0.2, GOLD);
    hudTitle(t, 'CLOSE TO FINANCE HELPS', 'THE RIGHT PRICE', 'IS WHAT MAKES IT WORK', K.being - 0.15, T_MAP[1] - 0.1, GOLD);
    ring30(t); notThis(t); cicc(t); chain(t); license(t);
    breakdown(t, { title: 'AROUND DIFC, CHECK', a0: K.check - 0.3, a1: K.study - 0.2, items: [{ txt: 'WHICH FIRMS ARE EXPANDING', a: K.firms2 - 0.4 }, { txt: 'WHAT TENANTS ACTUALLY PAY', a: K.tenants }, { txt: 'HOW MUCH NEW SUPPLY IS COMING', a: K.supply - 0.3 }, { txt: 'BUY AT THE RIGHT PRICE', a: K.right, gold: true }] });
    // the study card while he mentions it
    const se = win(t, K.study - 0.1, T_MAP[1] - 0.15); if (se > 0.003) { ctx.save(); ctx.globalAlpha *= se; ctx.translate(0, slide(t, K.study - 0.1)); glassPill(SAFE.x0, 1040, SAFE.w, 220, 28); rr(SAFE.x0, 1040, 10, 220, 5); ctx.fillStyle = GOLD; ctx.fill();
      T('THE FULL STUDY', SAFE.x0 + 40, 1094, { font: F.d(800, 28), ls: 5, color: GOLD, align: 'left' }); ['BUSINESS ACTIVITY', 'NEARBY COMMUNITIES', 'PROPERTY OPTIONS AROUND DIFC'].forEach((s2, i) => { const e = ea(t, K.study + 0.8 + i * 0.9, K.study + 1.2 + i * 0.9); T('·  ' + s2, SAFE.x0 + 40, 1146 + i * 38, { font: F.d(800, 26), color: '#FFFFFF', align: 'left', alpha: e }); }); ctx.restore(); }

    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.china + 0.8, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.4, K.comment + 0.9, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'CHINA', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.china - 0.05, K.china + 0.4, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.china - 0.05, K.china + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the full study', f = F.d(700, 44), w = Math.min(BW, M(rp, f) + 130); rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1102, { font: f, color: C.ink, align: 'left' }); ctx.restore(); }
    }
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.4, 3.8));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [K.doesnt, K.cicc, K.companies, K.but1, T_MAP[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.p30, K.billions, K.may, K.space, K.live].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.china + 0.8 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 2053 };
}
