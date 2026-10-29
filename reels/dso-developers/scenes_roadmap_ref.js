'use strict';
// ---------------------------------------------------------------------------
// "How is Dubai's royal family connected to the developers building the city?" - HeyGen take 4a30e26b (version v6ba6daca, 73.4 s, English).
// 60 fps.  A ROADMAP: each sheikh's photo, a gold line down ("CHAIRS") to the entity he chairs (its logo), then white lines down to what that entity owns
// (logos and landmark photos), built as he says each name; the camera walks down the tree.  His face FULL SCREEN on the hook, on "These are the
// connections" and on the closing line (never the small bubble).  The Emaar stake move gets its real page (Dubai Media Office, 12 May 2026).
// Facts (research 27 Oct 2026): Hamdan chairs ICD (Decree 23 of 2026); ICD wholly owns Ithra Dubai (One Za'abeel) and holds 27.97% of DIB, which holds
// ~45% of Deyaar; Maktoum chairs DREC (Decree 16 of 2026), wasl = DREC's asset-management arm; Ahmed bin Saeed chairs Dubai Holding (government-owned
// since Law 1 of 2023; Nakheel, Meraas, Dubai Properties, Meydan), DACC (behind Dubai South) and, separately, Expo City Dubai Authority (Resolution
// 27 of 2022 - it is NOT under DACC, so it hangs from him directly).  Safe zone: x 130-950, y 300-1420; captions at the bottom.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [];
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,';
  const IMAGES = { dmo_emaar: 'assets/dmo_emaar.png' };
  for (const k of ['hamdan', 'maktoum', 'ahmed', 'onezaabeel', 'palm', 'aindubai', 'bbay', 'meydan', 'burj', 'dwc', 'alwasl']) IMAGES[k] = `assets/img/${k}.jpg`;
  const LOGO = { icd: 'logo_icd_enwiki_pd', ithra: 'logo_ithra_dubai_official_white', oz: 'logo_one_zaabeel_official_white_gold', dib: 'logo_dubai_islamic_bank_official_for_dark_bg', deyaar: 'logo_deyaar_commons_1280',
    drec: 'logo_drec_official', wasl: 'logo_wasl_official_dark_114px', dh: 'logo_dubai_holding_official_white', nakheel: 'logo_nakheel_commons_pd_1280', meraas: 'logo_meraas_commons_pd_1280',
    dp: 'logo_dubai_properties_official', emaar: 'logo_emaar_commons_pd_1280', south: 'logo_dubai_south_official', expo: 'logo_expo_city_dubai_official' };
  for (const [k, f] of Object.entries(LOGO)) IMAGES['L_' + k] = `assets/img/${f}.png`;
  const DARK_PLATE = new Set(['ithra', 'oz', 'dib', 'dh']);                     // white logos sit on a dark plate, the rest on white
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;

  // ---------------------------------------------------------------- the words
  const K = {
    start: A('start'), hamdan: A('hamdan'), chairs1: A('chairs'), icd: A('icd,'), manages: A('manages'), gov: A('government', 10), owns1: A('owns', 11), ithra: A('ithra'), behind: A('behind'), oz: A("za'abeel."),
    stake: A('stake'), dib: A('islamic'), major: A('major', 17), deyaar: A('deyaar'),
    then: A('then'), maktoum: A('maktoum'), chairs2: A('chairs', 20.5), drec: A('real'), ownsM: A('owns', 23), land: A('land'), wasl: A('wasl'), arm: A('operating'), developing: A('developing'),
    homes: A('homes'), offices: A('offices'), hotels: A('hotels'), leisure: A('leisure'),
    next: A('next'), dh: A('holding', 32.8), chaired: A('chaired'), ahmed: A('ahmed'), govown: A('government-owned'), portfolio: A('portfolio', 36.5), nakheel: A('nakheel'), meraas: A('meraas'), dp: A('properties', 39), meydan: A('meydan'),
    may: A('may'), acquired: A('acquired'), icds: A("icd's"), emaar: A('emaar'), total: A('total'), p2973: A('29.73%'), largest: A('largest'),
    ahmed2: A('sheikh', 51.5), chairs3: A('chairs', 52.5), dacc: A('aviation'), south: A('south'), expo: A('expo'), these: A('these'),
    members: A('members'), chair4: A('chair', 62), entities: A('entities', 64), own4: A('own', 64.8), businesses: A('businesses'), land2: A('land', 66), stakes: A('stakes'), across: A('across'), chairing: A('chairing'),
  };
  const S_H = [K.start - 0.12, K.then - 0.1], S_M = [S_H[1], K.next - 0.1], S_A1 = [S_M[1], K.may - 0.12], S_A2 = [S_A1[1], K.total - 0.3], P_EM = [S_A2[1], K.ahmed2 - 0.12], S_A3 = [P_EM[1], K.these - 0.12];
  const S_OV = [K.members - 0.12, K.chairing - 0.12];
  const FACE_SEGS = [[0, S_H[0]], [S_A3[1], S_OV[0]], [S_OV[1], VEND]];

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
      if (n.sub) T(n.sub, x0 + 26, y0 + h - 22, { font: F.d(700, 21), ls: 3, color: GOLD, align: 'left', alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 52, 3) });
    } else if (w >= 600) {
      box(x0, y0, w, h); const pw = 230, ph = h - 40; if (n.logo) plate(n.logo, x0 + 20, y0 + 20, pw, ph); else { rr(x0 + 20, y0 + 20, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x0 + 20 + pw / 2, y0 + h / 2 + 16, { font: F.d(800, 46), ls: 3, color: GOLD }); }
      const tx = x0 + pw + 50, mw = x0 + w - 30 - tx, f = F.d(800, n.fs || 34), lines = n.title.split('\n'), ty = y0 + h / 2 + (n.sub ? -10 : 12) - (lines.length - 1) * 21;
      lines.forEach((l, i) => T(l, tx, ty + i * 42, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(l, f, mw, 1) }));
      if (n.sub) { const e3 = ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.45, E.out4), f3 = F.d(700, 22); ctx.save(); ctx.globalAlpha *= e3; n.sub.split('\n').forEach((l, i) => T(l, tx, ty + (lines.length - 1) * 42 + 44 + i * 30, { font: f3, ls: 2, color: GOLD, align: 'left', sx: fit(l, f3, mw, 2) })); ctx.restore(); }
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
    T(n.title, -w / 2 + 84, 12, { font: F.d(800, 32), ls: 2, color: '#FFFFFF', align: 'left' }); ctx.restore(); };
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
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : card)(t, n);
    ctx.restore();
  };

  // ---------------------------------------------------------------- 1. Sheikh Hamdan -> ICD -> Ithra Dubai (One Za'abeel) / DIB -> Deyaar
  const L = 325, R = 755;                                                           // the two columns (cards 390 wide inside the safe zone)
  section(S_H, [[S_H[0], 60, 1], [K.chairs1 - 0.2, 60, 1], [K.chairs1 + 0.6, 290, 1], [K.owns1 - 0.4, 290, 1], [K.owns1 + 0.5, 700, 1], [S_H[1], 730, 1]], [
    { kind: 'person', x: CX, y: 0, img: 'hamdan', t: K.start + 0.1, name: 'SHEIKH HAMDAN BIN MOHAMMED', title: 'CROWN PRINCE OF DUBAI' },
    { x: CX, y: 430, w: 820, h: 170, logo: 'icd', t: K.icd - 0.1, title: 'INVESTMENT CORPORATION\nOF DUBAI', sub: "DUBAI GOVERNMENT'S INVESTMENT ARM", subT: K.manages },
    { x: L, y: 735, w: 390, h: 220, logo: 'ithra', t: K.ithra - 0.1, title: 'ITHRA DUBAI', sub: 'DEVELOPER', subT: K.behind },
    { x: L, y: 1050, w: 390, h: 250, photo: 'onezaabeel', logo: 'oz', t: K.oz - 0.3, title: "ONE ZA'ABEEL", fy: 0.45 },
    { x: R, y: 735, w: 390, h: 220, logo: 'dib', t: K.dib - 0.15, title: 'DUBAI ISLAMIC BANK', fs: 28 },
    { x: R, y: 1040, w: 390, h: 220, logo: 'deyaar', t: K.deyaar - 0.15, title: 'DEYAAR', sub: 'DEVELOPER' },
  ], [
    { pts: [[CX, 190], [CX, 345]], t: K.chairs1 - 0.05, label: 'CHAIRS', at: [CX, 268] },
    { pts: [[CX, 515], [CX, 568], [L, 568], [L, 625]], t: K.owns1 - 0.05, c: 'w', label: 'OWNS', at: [L + 90, 568] },
    { pts: [[L, 845], [L, 925]], t: K.behind - 0.05, c: 'w', d: 0.35 },
    { pts: [[CX, 568], [R, 568], [R, 625]], t: K.stake - 0.1, c: 'w', label: '28% STAKE', at: [R - 90, 568] },
    { pts: [[R, 845], [R, 930]], t: K.major - 0.1, c: 'w', d: 0.4, label: '≈45% · MAJOR SHAREHOLDER', at: [R - 40, 888] },
  ]);
  // ---------------------------------------------------------------- 2. Sheikh Maktoum -> Dubai Real Estate Corporation -> wasl -> homes, offices, hotels, leisure
  section(S_M, [[S_M[0], 60, 1], [K.chairs2 - 0.2, 60, 1], [K.chairs2 + 0.6, 290, 1], [K.wasl - 0.4, 290, 1], [K.wasl + 0.5, 600, 1], [S_M[1], 620, 1]], [
    { kind: 'person', x: CX, y: 0, img: 'maktoum', t: K.then + 0.25, name: 'SHEIKH MAKTOUM BIN MOHAMMED', title: 'FIRST DEPUTY RULER OF DUBAI' },
    { x: CX, y: 430, w: 820, h: 170, logo: 'drec', t: K.drec - 0.15, title: 'DUBAI REAL ESTATE\nCORPORATION', sub: 'OWNS & MANAGES GOVERNMENT\nPROPERTIES AND LAND', subT: K.ownsM, fs: 32 },
    { x: CX, y: 735, w: 820, h: 170, logo: 'wasl', t: K.wasl - 0.1, title: 'WASL', sub: "MANAGES & DEVELOPS DREC'S ASSETS", subT: K.developing, fs: 44 },
    { kind: 'tag', x: L, y: 905, w: 390, h: 88, icon: 'house', title: 'HOMES', t: K.homes - 0.1 },
    { kind: 'tag', x: R, y: 905, w: 390, h: 88, icon: 'building', title: 'OFFICES', t: K.offices - 0.1 },
    { kind: 'tag', x: L, y: 1013, w: 390, h: 88, icon: 'briefcase', title: 'HOTELS', t: K.hotels - 0.1 },
    { kind: 'tag', x: R, y: 1013, w: 390, h: 88, icon: 'flag', title: 'LEISURE', t: K.leisure - 0.1 },
  ], [
    { pts: [[CX, 190], [CX, 345]], t: K.chairs2 - 0.05, label: 'CHAIRS', at: [CX, 268] },
    { pts: [[CX, 515], [CX, 650]], t: K.wasl - 0.2, c: 'w', label: 'ASSET MANAGEMENT ARM', at: [CX, 583] },
  ]);
  // ---------------------------------------------------------------- 3. Dubai Holding (chaired by Sheikh Ahmed) -> Nakheel, Meraas, Dubai Properties, Meydan
  section(S_A1, [[S_A1[0], 430, 1], [K.chaired - 0.2, 430, 1], [K.chaired + 0.5, 240, 1], [K.portfolio - 0.4, 240, 1], [K.portfolio + 0.5, 690, 1], [S_A1[1], 710, 1]], [
    { x: CX, y: 430, w: 820, h: 170, logo: 'dh', t: K.next + 0.15, title: 'DUBAI HOLDING', sub: 'GOVERNMENT-OWNED', subT: K.govown, fs: 44 },
    { kind: 'person', x: CX, y: 0, img: 'ahmed', t: K.chaired - 0.1, name: 'SHEIKH AHMED BIN SAEED', title: 'AL MAKTOUM' },
    { x: L, y: 735, w: 390, h: 200, photo: 'palm', logo: 'nakheel', t: K.nakheel - 0.15, title: 'NAKHEEL', fy: 0.45 },
    { x: R, y: 735, w: 390, h: 200, photo: 'aindubai', logo: 'meraas', t: K.meraas - 0.15, title: 'MERAAS', fx: 0.7 },
    { x: L, y: 965, w: 390, h: 200, photo: 'bbay', logo: 'dp', t: K.dp - 0.4, title: 'DUBAI PROPERTIES', fs: 30 },
    { x: R, y: 965, w: 390, h: 200, photo: 'meydan', t: K.meydan - 0.15, title: 'MEYDAN', fy: 0.25 },
  ], [
    { pts: [[CX, 345], [CX, 190]], t: K.chaired - 0.05, label: 'CHAIRS', at: [CX, 268] },
    { pts: [[CX, 515], [CX, 600], [L, 600], [L, 635]], t: K.portfolio, c: 'w' },
    { pts: [[CX, 600], [R, 600], [R, 635]], t: K.portfolio + 0.1, c: 'w' },
    { pts: [[CX, 600], [CX, 850], [L, 850], [L, 865]], t: K.dp - 0.7, c: 'w', d: 0.5 },
    { pts: [[CX, 850], [R, 850], [R, 865]], t: K.meydan - 0.45, c: 'w', d: 0.4 },
    { pts: [[CX, 600], [CX, 600]], t: K.portfolio, c: 'w', label: 'PORTFOLIO', at: [CX, 600] },
  ]);
  // ---------------------------------------------------------------- 4. May 2026: ICD's 22.27% of Emaar moves to Dubai Holding -> 29.73%, the largest shareholder
  section(S_A2, [[S_A2[0], 800, 1], [S_A2[1], 800, 1.03]], [
    { x: L, y: 640, w: 390, h: 210, logo: 'icd', t: S_A2[0] + 0.15, title: 'ICD', fs: 34, dim: K.acquired + 0.9 },
    { x: R, y: 640, w: 390, h: 210, logo: 'dh', t: S_A2[0] + 0.3, title: 'DUBAI HOLDING', fs: 30 },
    { x: CX, y: 1010, w: 820, h: 270, photo: 'burj', logo: 'emaar', t: K.emaar - 0.2, title: 'EMAAR PROPERTIES', fy: 0.3 },
  ], [
    { pts: [[R, 745], [R, 820], [CX + 150, 820], [CX + 150, 875]], t: K.emaar - 0.1, c: 'w', d: 0.5 },
  ]);
  const emaarMove = (t) => {                                                         // the date, then the 22.27% token travelling from ICD to Dubai Holding
    const al = win(t, S_A2[0], S_A2[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const de = ea(t, K.may - 0.1, K.may + 0.4, E.out4); if (de > 0.003) { ctx.save(); ctx.globalAlpha *= de; const f = F.d(800, 30), w = M('MAY 2026', f, 6) + 60; rr(CX - w / 2, 400, w, 64, 32); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke(); T('MAY 2026', CX, 443, { font: f, ls: 6, color: GOLD }); ctx.restore(); }
    const u = ea(t, K.acquired, K.acquired + 1.2, E.inOut3); if (t > K.acquired - 0.3) {
      const a0 = [L, 520], a1 = [R, 520], x = lerp(a0[0], a1[0], u), y = lerp(a0[1], a1[1], u) - Math.sin(Math.PI * u) * 70, ap = ea(t, K.acquired - 0.3, K.acquired) * (1 - ea(t, K.emaar + 0.2, K.emaar + 0.6));
      ctx.save(); ctx.globalAlpha *= ap; const pts = []; for (let i = 0; i <= 30; i++) { const v = i / 30 * u; pts.push([lerp(a0[0], a1[0], v), lerp(a0[1], a1[1], v) - Math.sin(Math.PI * v) * 70]); }
      ctx.setLineDash([2, 12]); strokePoly(pts, 1, { color: GOLD_A + '0.7)', w: 4 }); ctx.setLineDash([]);
      const f = F.d(800, 30), w = M('22.27% OF EMAAR', f, 2) + 50; glow(x, y, 80, '233,196,124', 0.4); rr(x - w / 2, y - 32, w, 64, 32); ctx.fillStyle = GOLD; ctx.fill(); T('22.27% OF EMAAR', x, y + 11, { font: f, ls: 2, color: '#17181B' }); ctx.restore();
    }
    const be = ea(t, K.emaar + 0.3, K.emaar + 0.8, E.back); if (be > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(be); const x = R + 40, y = 525, f = F.d(800, 26), w = M('NOW THE LARGEST SHAREHOLDER', f, 2) + 40; rr(x - w + 60, y - 26, w, 52, 26); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke(); T('NOW THE LARGEST SHAREHOLDER', x - w / 2 + 60, y + 9, { font: f, ls: 2, color: GOLD }); ctx.restore(); }
    ctx.restore();
  };
  // the proof: Dubai Media Office, 12 May 2026
  { const b = PAGES.dmo_emaar.boxes, ys = b[1].map(r => r[1]), qy = (Math.min(...ys) + Math.max(...b[1].map(r => r[1] + r[3]))) / 2, lb = (rects, t0, t1) => { const Ls = []; for (const [x, y, w, h] of rects) { const l = Ls.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else Ls.push({ x0: x, x1: x + w, y, h }); } Ls.sort((p, q) => p.y - q.y); const tot = Ls.reduce((s, l) => s + l.x1 - l.x0, 0); let acc = 0; return Ls.map(l => { const a = t0 + (t1 - t0) * acc / tot; acc += l.x1 - l.x0; return { bbox: [l.x0, l.y, l.x1 - l.x0, l.h], t0: a, t1: t0 + (t1 - t0) * acc / tot }; }); };
    SCENES.push({ id: 'p_emaar', kind: 'page', img: 'dmo_emaar', a: P_EM[0], b: P_EM[1], keys: [[0, 540, qy - 60, 0.95, 10], [P_EM[1] - P_EM[0] + 0.5, 540, qy - 50, 0.99, 14]], hl: [...lb(b[0], P_EM[0] + 0.15, K.p2973 - 0.25), ...lb(b[1], K.p2973 - 0.15, K.largest + 0.6)] }); }
  // ---------------------------------------------------------------- 5. Sheikh Ahmed also chairs DACC (behind Dubai South) and, separately, Expo City Dubai Authority
  section(S_A3, [[S_A3[0], 760, 1], [S_A3[1], 760, 1.025]], [
    { kind: 'person', x: CX, y: 430, r: 100, img: 'ahmed', t: S_A3[0] + 0.05, name: 'SHEIKH AHMED BIN SAEED', title: '' },
    { x: L, y: 790, w: 390, h: 210, mono: 'DACC', t: K.dacc - 0.15, title: 'DUBAI AVIATION CITY\nCORPORATION', fs: 27 },
    { x: L, y: 1085, w: 390, h: 200, photo: 'dwc', logo: 'south', t: K.south - 0.3, title: 'DUBAI SOUTH', fy: 0.4 },
    { x: R, y: 790, w: 390, h: 210, logo: 'expo', t: K.expo - 0.2, title: 'EXPO CITY DUBAI\nAUTHORITY', fs: 27 },
    { x: R, y: 1085, w: 390, h: 200, photo: 'alwasl', t: K.expo + 0.5, title: 'EXPO CITY DUBAI', fy: 0.45 },
  ], [
    { pts: [[CX, 600], [CX, 640], [L, 640], [L, 685]], t: K.chairs3 - 0.05, label: 'CHAIRS', at: [L + 70, 640] },
    { pts: [[L, 895], [L, 985]], t: K.dacc + 1.6, c: 'w', label: 'BEHIND', at: [L, 940], d: 0.4 },
    { pts: [[CX, 640], [R, 640], [R, 685]], t: K.expo - 0.45, label: 'ALSO CHAIRS', at: [R - 70, 640] },
    { pts: [[R, 895], [R, 985]], t: K.expo + 0.3, c: 'w', d: 0.35 },
  ]);
  // ---------------------------------------------------------------- 6. the connections: chair (gold) -> government entities -> own (white) -> businesses, land, stakes in developers
  const OX = [250, 540, 830];
  section(S_OV, [[S_OV[0], 800, 1], [S_OV[1], 800, 1.02]], [
    { kind: 'person', x: OX[0], y: 470, r: 78, img: 'hamdan', t: S_OV[0] + 0.05, name: 'HAMDAN', small: true },
    { kind: 'person', x: OX[1], y: 470, r: 78, img: 'maktoum', t: S_OV[0] + 0.2, name: 'MAKTOUM', small: true },
    { kind: 'person', x: OX[2], y: 470, r: 78, img: 'ahmed', t: S_OV[0] + 0.35, name: 'AHMED', small: true },
    { x: OX[0], y: 760, w: 250, h: 150, logo: 'icd', t: K.chair4, title: 'ICD', fs: 26, ph: 66 },
    { x: OX[1], y: 760, w: 250, h: 150, logo: 'drec', t: K.chair4 + 0.15, title: 'DREC', fs: 26, ph: 66 },
    { x: OX[2], y: 760, w: 250, h: 150, logo: 'dh', t: K.chair4 + 0.3, title: '+ DACC · EXPO CITY', fs: 20, ph: 66 },
    { kind: 'tag', x: CX, y: 965, w: 560, h: 84, icon: 'briefcase', title: 'BUSINESSES', t: K.businesses - 0.15 },
    { kind: 'tag', x: CX, y: 1065, w: 560, h: 84, icon: 'flag', title: 'LAND', t: K.land2 - 0.15 },
    { kind: 'tag', x: CX, y: 1165, w: 560, h: 84, icon: 'building', title: 'STAKES IN DEVELOPERS', t: K.stakes - 0.15 },
  ], [
    { pts: [[OX[0], 590], [OX[0], 685]], t: K.chair4 - 0.2, d: 0.4 }, { pts: [[OX[1], 590], [OX[1], 685]], t: K.chair4 - 0.05, d: 0.4 }, { pts: [[OX[2], 590], [OX[2], 685]], t: K.chair4 + 0.1, d: 0.4 },
    { pts: [[OX[0], 835], [OX[0], 885], [CX - 280, 885], [CX - 280, 923]], t: K.own4 - 0.1, c: 'w', d: 0.4 }, { pts: [[OX[1], 835], [OX[1], 923]], t: K.own4, c: 'w', d: 0.35 }, { pts: [[OX[2], 835], [OX[2], 885], [CX + 280, 885], [CX + 280, 923]], t: K.own4 + 0.1, c: 'w', d: 0.4 },
  ]);
  const legend = (t) => { const al = win(t, K.own4 + 0.3, S_OV[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const y = 1252, f = F.d(800, 22); line(250, y, 300, y, { color: GOLD, w: 4 }); T('CHAIRS', 314, y + 8, { font: f, ls: 3, color: GOLD, align: 'left' }); line(560, y, 610, y, { color: '#F3EFE6', w: 4 }); T('OWNS / STAKES', 624, y + 8, { font: f, ls: 3, color: '#FFFFFF', align: 'left' }); ctx.restore(); };
  const kicker = (t) => {                                                            // the overview's title
    const ov = win(t, S_OV[0] + 0.05, S_OV[1] - 0.2); if (ov > 0.003) T('THE CONNECTIONS', CX, 340, { font: F.d(800, 40), ls: 6, color: GOLD, alpha: ov });
  };
  const topVeil = (t) => {                                                           // what the camera walks past fades out before the Reels top bar (y < 300)
    const al = Math.max(win(t, S_H[0], S_H[1]), win(t, S_M[0], S_M[1]), win(t, S_A1[0], S_A1[1])); if (al <= 0.003) return;
    const g = ctx.createLinearGradient(0, 150, 0, 330); g.addColorStop(0, 'rgba(8,8,10,1)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.save(); ctx.globalAlpha *= al; ctx.fillStyle = 'rgba(8,8,10,1)'; ctx.fillRect(0, 0, W, 150); ctx.fillStyle = g; ctx.fillRect(0, 150, W, 180); ctx.restore();
  };

  const overlay = (t) => {
    const F0 = faceF(t); if (F0 > 0.999 && t < VEND - 0.05) return;
    ctx.save(); ctx.globalAlpha *= 1 - F0;
    for (const s of SECT) drawSection(t, s);
    topVeil(t); emaarMove(t); legend(t); kicker(t);
    const sc = win(t, P_EM[0] + 0.2, P_EM[1] - 0.15); if (sc > 0.003) { const f = F.d(800, 25), w = M('DUBAI MEDIA OFFICE · 12 MAY 2026', f, 2) + 48; ctx.save(); ctx.globalAlpha *= sc; glassPill(CX - w / 2, 1172, w, 54, 27); T('DUBAI MEDIA OFFICE · 12 MAY 2026', CX, 1209, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore(); }
    ctx.restore();
    const ce = ea(t, VEND - 0.1, VEND + 0.5, E.out3);
    if (ce > 0.003) { ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.92)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 900, { font: F.d(800, 66), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 958, { font: F.d(700, 34), ls: 6, color: C.gold });
      rr(CX - 60, 1000, 120 * ea(t, VEND + 0.2, VEND + 0.9, E.out4), 6, 3); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [S_H[0], S_M[0], S_A1[0], S_A2[0], P_EM[0], S_A3[0], S_OV[0]].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.chairs1, K.chairs2, K.chaired, K.chairs3, K.p2973].forEach(x => cues.push({ k: 'pin', t: x }));
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, FOOT_MAX: TL.frames - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
