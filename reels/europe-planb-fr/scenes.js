'use strict';
// ---------------------------------------------------------------------------
// "Vous vivez en Europe ? Une question." / "Sie leben in Europa? Eine kurze Frage." - the same script as two HeyGen takes: French 939e35f4 (36.9 s)
// and German f2b407a1 (45.2 s).  60 fps.  This one file builds both: LANG picks the anchors and the on-screen text (everything on screen in the
// video's language).  Same look as ../uk-uae-move (the royal-family roadmap style) with his face SMALL the whole time.  No map.
// The only figure on screen is the cost of living: INSEE (France), "En septembre 2026, les prix à la consommation augmentent de 3,1 % sur un an"
// (15 Oct 2026) / Destatis (Germany), "Inflationsrate im September 2026 bei +3,3 %" (13 Oct 2026).  The rest is his advice, not facts.
// Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
const LANG = 'fr';
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[\s.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  IMAGES.F_eu = 'assets/img/flag_eu.png'; IMAGES.F_uae = 'assets/img/flag_uae.png';
  const DARK_PLATE = new Set([]);
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  // the anchors: the same beats in both languages
  const K = LANG === 'fr' ? {
    quand: A('quand'), riots: A('émeutes'), instab: A("l'instabilité"), cost: A('coût'), plan: A('quel'), work: A('vous', 8.4), why: A('pourquoi'),
    t1: A('logement,'), t2: A('revenus'), t3: A('investissements'), one: A('seul'), dubai: A('dubaï'), o1: A('résidence'), o2: A("d'ancrage"), o3: A('investissement'),
    but: A('mais'), r1: A('bien,'), r2: A('prix'), r3: A('situation'), no: A('pas', 28), leave: A('quitter'), explore: A('explorer'),
    send: A('envoyez-moi'), kw: A('europe', 32), c1: A('pays', 32.5), c2: A('budget.'), reply: A('correspond'),
  } : {
    quand: A('wenn'), riots: A('ausschreitungen'), instab: A('politische'), cost: A('lebenshaltungskosten'), plan: A('wann'), work: A('sie', 10.9), why: A('warum'),
    t1: A('zuhause,'), t2: A('einkommen'), t3: A('investitionen'), one: A('einzigen'), dubai: A('dubai'), o1: A('zweitwohnsitz,'), o2: A('zuhause', 21.5), o3: A('immobilieninvestition'),
    but: A('aber'), r1: A('immobilie,'), r2: A('preis'), r3: A('steuerliche'), no: A('sie', 33.8), leave: A('morgen'), explore: A('heute'),
    send: A('schicken'), kw: A('europe'), c1: A('wohnsitzland'), c2: A('budget.'), reply: A('dubai', 43),
  };
  // the words on screen
  const L = LANG === 'fr' ? {
    h0: ['VOUS VIVEZ EN EUROPE ?', 'UNE QUESTION'], eu: 'L’EUROPE',
    h1: ['QUAND VOUS VOYEZ…', 'LES INFOS'], riots: 'DES ÉMEUTES AUX INFOS', instab: 'L’INSTABILITÉ POLITIQUE', costTag: 'LE COÛT DE LA VIE',
    hp1: ['LE COÛT DE LA VIE', '+3,1 % SUR UN AN', 'FRANCE · SEPTEMBRE 2026'], hp2: ['À QUEL MOMENT', 'VOTRE PLAN B ?'], chip1: 'INSEE · INFORMATIONS RAPIDES · 15 OCT. 2026',
    hb1: ['DES ANNÉES DE TRAVAIL', 'VOTRE PATRIMOINE'], hb2: ['POURQUOI TOUT METTRE', 'DANS UN SEUL PAYS ?'], work: 'DES ANNÉES DE TRAVAIL',
    tiles: ['LOGEMENT', 'REVENUS', 'INVESTIS-\nSEMENTS'], one: 'UN SEUL PAYS ?',
    hd: ['ET SI…', 'DUBAÏ ?', 'UNE AUTRE OPTION'], dubai: 'DUBAÏ', uae: 'ÉMIRATS ARABES UNIS', opts: ['UNE RÉSIDENCE SECONDAIRE', 'UN POINT D’ANCRAGE POUR LA FAMILLE', 'UN INVESTISSEMENT IMMOBILIER'],
    hr: ['MAIS', 'LES RISQUES RESTENT', 'CHANGER DE PAYS NE LES EFFACE PAS'], risks: [['LE BIEN', 'À ÉTUDIER'], ['LE PRIX', 'À ÉTUDIER'], ['VOTRE SITUATION FISCALE', 'À ÉTUDIER SÉRIEUSEMENT']],
    hn: ['PAS BESOIN DE PARTIR DEMAIN', 'EXPLOREZ AUJOURD’HUI'], leave: ['QUITTER L’EUROPE DEMAIN', 'PAS BESOIN'], explore: ['EXPLORER VOS OPTIONS', 'DÈS AUJOURD’HUI'],
    role: 'STRATÈGE DE PORTEFEUILLE', input: 'Votre message…', chips: ['VOTRE PAYS', 'VOTRE BUDGET'], reply: 'Voyons si Dubaï vous correspond',
  } : {
    h0: ['SIE LEBEN IN EUROPA?', 'EINE KURZE FRAGE'], eu: 'EUROPA',
    h1: ['WENN SIE SEHEN…', 'DIE NACHRICHTEN'], riots: 'AUSSCHREITUNGEN IN DEN NACHRICHTEN', instab: 'POLITISCHE UNSICHERHEIT', costTag: 'LEBENSHALTUNGSKOSTEN',
    hp1: ['LEBENSHALTUNGSKOSTEN', 'INFLATION +3,3 %', 'DEUTSCHLAND · SEPTEMBER 2026'], hp2: ['WANN FANGEN SIE AN?', 'IHR PLAN B'], chip1: 'DESTATIS · PRESSEMITTEILUNG · 13. OKT. 2026',
    hb1: ['JAHRELANG GEARBEITET', 'ETWAS AUFGEBAUT'], hb2: ['WARUM ALLES', 'IN EINEM LAND?'], work: 'JAHRELANGE ARBEIT',
    tiles: ['ZUHAUSE', 'EINKOMMEN', 'INVESTI-\nTIONEN'], one: 'EIN EINZIGES LAND?',
    hd: ['UND WENN…', 'DUBAI?', 'EINE WEITERE OPTION'], dubai: 'DUBAI', uae: 'VEREINIGTE ARABISCHE EMIRATE', opts: ['EIN ZWEITWOHNSITZ', 'EIN ZUHAUSE FÜR IHRE FAMILIE', 'IMMOBILIENINVESTITION IM AUSLAND'],
    hr: ['ABER', 'DIE RISIKEN BLEIBEN', 'AUCH IN EINEM ANDEREN LAND'], risks: [['DIE IMMOBILIE', 'MUSS PASSEN'], ['DER PREIS', 'MUSS PASSEN'], ['IHRE STEUERLICHE SITUATION', 'MUSS ZU IHREN PLÄNEN PASSEN']],
    hn: ['SIE MÜSSEN NICHT MORGEN GEHEN', 'HEUTE INFORMIEREN'], leave: ['EUROPA MORGEN VERLASSEN', 'NICHT NÖTIG'], explore: ['ÜBER MÖGLICHKEITEN INFORMIEREN', 'SCHON HEUTE'],
    role: 'PORTFOLIO-STRATEGE', input: 'Nachricht…', chips: ['WOHNSITZLAND', 'BUDGET'], reply: 'Schauen wir, ob Dubai passt',
  };
  const PAGE = LANG === 'fr' ? 'insee' : 'destatis';
  const FACE_SEGS = [];
  const H0 = [0, K.quand - 0.12], B1 = [H0[1], K.cost - 0.12], P1 = [B1[1], K.work - 0.12], B2 = [P1[1], K.dubai - 0.12], B3 = [B2[1], K.but - 0.12],
    B4 = [B3[1], K.no - 0.12], B5 = [B4[1], K.send - 0.12];

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
      if (n.sub) T(n.sub, x0 + 26, y0 + h - 22, { font: F.d(700, 21), ls: 3, color: n.subC || GOLD, align: 'left', alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 52, 3) });
      if (n.credit) T(n.credit, x0 + w - 14, y0 + 26, { font: F.d(700, 15), ls: 1, color: 'rgba(255,255,255,0.75)', align: 'right' });
    } else if (w >= 600) {
      box(x0, y0, w, h, 26, n.edge || GOLD_A + '0.32)'); const pw = n.pw || 230, ph = h - 40; if (n.logo) plate(n.logo, x0 + 20, y0 + 20, pw, ph); else { rr(x0 + 20, y0 + 20, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x0 + 20 + pw / 2, y0 + h / 2 + 16, { font: F.d(800, 46), ls: 3, color: n.monoC || GOLD }); }
      const tx = x0 + pw + 50, mw = x0 + w - 30 - tx, f = F.d(800, n.fs || 34), lines = n.title.split('\n'), ty = y0 + h / 2 + (n.sub ? -10 : 12) - (lines.length - 1) * 21;
      lines.forEach((l, i) => T(l, tx, ty + i * 42, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(l, f, mw, 1) }));
      if (n.sub) { const e3 = ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.45, E.out4), f3 = F.d(700, 22); ctx.save(); ctx.globalAlpha *= e3; n.sub.split('\n').forEach((l, i) => T(l, tx, ty + (lines.length - 1) * 42 + 44 + i * 30, { font: f3, ls: 2, color: n.subC || GOLD, align: 'left', sx: fit(l, f3, mw, 2) })); ctx.restore(); }
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
    T(n.title, -w / 2 + 84, 12, { font: F.d(800, 32), ls: 2, color: '#FFFFFF', align: 'left', sx: fit(n.title, F.d(800, 32), w - 110, 2) }); ctx.restore(); };
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
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : n.kind === 'tile' ? tile : card)(t, n);
    ctx.restore();
  };


  // a tile: a big icon in a ring, the label under it (the "what to plan" grid)
  const tile = (t, n) => {
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    box(x0, y0, w, h, 26, GOLD_A + '0.45)'); const cy = y0 + 72; glow(x, cy, 70, '233,196,124', 0.18); dot(x, cy, 46, '#1A1712'); ring(x, cy, 46, { color: GOLD, w: 3 });
    icon(n.icon, x, cy, 24, { p: ea(t, n.t + 0.1, n.t + 0.7), color: GOLD, w: 4 });
    const f = F.d(800, 32); n.title.split('\n').forEach((l, i, a) => T(l, x, y0 + h - 34 - (a.length - 1 - i) * 38, { font: f, ls: 1, color: '#FFFFFF', sx: fit(l, f, w - 30, 1) }));
    ctx.restore();
  };

  // ---------------------------------------------------------------- pages (marker on the exact words)
  const lineBoxes = (rects) => { const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); } return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]); };
  const page = (id, img, T, stops, marks, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, 0.92, 10]; keys[0] = [0, ...pc]; }
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = []; for (const [pi, t0, t1, under] of marks) { const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0; for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot, under }); } }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };
  // the cost of living: the national statistics office's own headline (white on a dark band: underlined, not marked)
  if (LANG === 'fr') page('p_cost', 'insee', P1, [[P1[0] + 0.1, qy('insee', 0) + 50]], [[0, K.cost - 0.05, K.cost + 1.2, 14]]);
  else page('p_cost', 'destatis', P1, [[P1[0] + 0.1, qy('destatis', 0) + 60], [K.cost + 1.2, qy('destatis', 1) - 150]], [[0, K.cost - 0.05, K.cost + 1.2, 10], [1, K.cost + 1.25, K.cost + 2.0]]);

  // ---------------------------------------------------------------- roadmap branches (screen coordinates: camera at y 800)
  const ST = (T) => [[T[0], 800, 1], [T[1], 812, 1.015]];
  const rows = (t, T0, items) => {                                                    // status rows: ok (teal check), no (red cross), q (amber question)
    const al = win(t, T0[0], T0[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    items.forEach(([y, a, txt, sub, kind]) => { const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -30, 0);
      const col = kind === 'ok' ? TEAL[0] : kind === 'no' ? '#E5484D' : AMBER, colL = kind === 'ok' ? TEAL[1] : kind === 'no' ? RED2 : AMBER;
      box(SAFE.x0, y, SAFE.w, 140, 28, col + '99'); const cx = SAFE.x1 - 70, cy = y + 70, p = ea(t, a + 0.15, a + 0.55);
      dot(cx, cy, 36, col + '2E'); if (kind === 'ok') icon('check', cx, cy + 2, 18, { p, color: col, w: 5 }); else if (kind === 'q') T('?', cx, cy + 16, { font: F.d(800, 46), color: AMBER, alpha: p });
      else { ctx.strokeStyle = RED2; ctx.lineWidth = 6; ctx.lineCap = 'round'; const q = 14; ctx.beginPath(); ctx.moveTo(cx - q, cy - q); ctx.lineTo(cx - q + 2 * q * clamp(p * 2), cy - q + 2 * q * clamp(p * 2)); ctx.stroke(); if (p > 0.5) { const b = clamp(p * 2 - 1); ctx.beginPath(); ctx.moveTo(cx + q, cy - q); ctx.lineTo(cx + q - 2 * q * b, cy - q + 2 * q * b); ctx.stroke(); } }
      T(txt, SAFE.x0 + 40, y + 64, { font: F.d(800, 38), color: '#FFFFFF', align: 'left', sx: fit(txt, F.d(800, 38), SAFE.w - 170) }); T(sub, SAFE.x0 + 40, y + 106, { font: F.d(700, 23), ls: 3, color: colL, align: 'left', sx: fit(sub, F.d(700, 23), SAFE.w - 170, 3) }); ctx.restore(); });
    ctx.restore();
  };
  // the hook: you live in Europe
  section(H0, ST(H0), [ { x: CX, y: 760, w: 640, h: 380, photo: 'F_eu', t: 0.05, title: L.eu, fs: 44 } ], []);
  // what you see on the news
  section(B1, ST(B1), [
    { kind: 'tag', x: CX, y: 700, w: 820, h: 76, icon: 'tv', title: L.riots, t: K.riots - 0.15 },
    { kind: 'tag', x: CX, y: 830, w: 820, h: 76, icon: 'warn', title: L.instab, t: K.instab - 0.15 },
    { kind: 'tag', x: CX, y: 960, w: 820, h: 76, icon: 'up', title: L.costTag, t: K.cost - 0.45 },
  ], [ { pts: [[CX, 738], [CX, 792]], t: K.instab - 0.35, c: 'w', d: 0.2 }, { pts: [[CX, 868], [CX, 922]], t: K.cost - 0.65, c: 'w', d: 0.2 } ]);
  // years of work -> home, income, investments -> all in one country?
  section(B2, ST(B2), [
    { kind: 'tag', x: CX, y: 630, w: 640, h: 72, icon: 'briefcase', title: L.work, t: B2[0] + 0.1 },
    { kind: 'tile', x: 265, y: 860, w: 250, h: 210, icon: 'house', title: L.tiles[0], t: K.t1 - 0.15 },
    { kind: 'tile', x: 540, y: 860, w: 250, h: 210, icon: 'chart', title: L.tiles[1], t: K.t2 - 0.15 },
    { kind: 'tile', x: 815, y: 860, w: 250, h: 210, icon: 'bars', title: L.tiles[2], t: K.t3 - 0.15 },
    { kind: 'tag', x: CX, y: 1110, w: 640, h: 72, icon: 'flag', title: L.one, t: K.one - 0.3 },
  ], [
    { pts: [[CX, 666], [CX, 712], [265, 712], [265, 755]], t: K.t1 - 0.5, d: 0.35 }, { pts: [[CX, 712], [CX, 755]], t: K.t2 - 0.35, d: 0.2 }, { pts: [[CX, 712], [815, 712], [815, 755]], t: K.t3 - 0.45, d: 0.3 },
    { pts: [[265, 965], [265, 1020], [CX, 1020], [CX, 1074]], t: K.one - 0.6, c: 'w', d: 0.35 }, { pts: [[815, 965], [815, 1020], [CX, 1020]], t: K.one - 0.55, c: 'w', d: 0.3 }, { pts: [[CX, 965], [CX, 1020]], t: K.one - 0.5, c: 'w', d: 0.2 },
  ]);
  // Dubai as another option: a second home, a base for the family, a property investment
  section(B3, ST(B3), [
    { x: CX, y: 680, w: 640, h: 250, photo: 'F_uae', t: B3[0] + 0.05, title: L.dubai, sub: L.uae, subT: B3[0] + 0.4, fs: 40 },
    { kind: 'tag', x: CX, y: 900, w: 820, h: 76, icon: 'house', title: L.opts[0], t: K.o1 - 0.15 },
    { kind: 'tag', x: CX, y: 1000, w: 820, h: 76, icon: 'flag', title: L.opts[1], t: K.o2 - 0.25 },
    { kind: 'tag', x: CX, y: 1100, w: 820, h: 76, icon: 'building', title: L.opts[2], t: K.o3 - 0.15 },
  ], [ { pts: [[CX, 805], [CX, 862]], t: K.o1 - 0.4, d: 0.25 }, { pts: [[CX, 938], [CX, 962]], t: K.o2 - 0.35, c: 'w', d: 0.15 }, { pts: [[CX, 1038], [CX, 1062]], t: K.o3 - 0.3, c: 'w', d: 0.15 } ]);
  const B4rows = t => rows(t, B4, [[650, K.r1 - 0.15, L.risks[0][0], L.risks[0][1], 'q'], [810, K.r2 - 0.15, L.risks[1][0], L.risks[1][1], 'q'], [970, K.r3 - 0.15, L.risks[2][0], L.risks[2][1], 'q']]);
  const B5rows = t => rows(t, B5, [[700, K.leave - 0.2, L.leave[0], L.leave[1], 'no'], [860, K.explore - 0.2, L.explore[0], L.explore[1], 'ok']]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    B4rows(t); B5rows(t);
    hudTitle(t, L.h0[0], L.h0[1], '', 0.15, H0[1] - 0.15, GOLD);
    hudTitle(t, L.h1[0], L.h1[1], '', B1[0] + 0.05, B1[1] - 0.15, AMBER);
    hudTitle(t, L.hp1[0], L.hp1[1], L.hp1[2], P1[0] + 0.05, K.plan - 0.2, AMBER);
    hudTitle(t, L.hp2[0], L.hp2[1], '', K.plan - 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, L.hb1[0], L.hb1[1], '', B2[0] + 0.05, K.why - 0.2, GOLD);
    hudTitle(t, L.hb2[0], L.hb2[1], '', K.why - 0.05, B2[1] - 0.15, AMBER);
    hudTitle(t, L.hd[0], L.hd[1], L.hd[2], B3[0] + 0.05, B3[1] - 0.15, TEAL[1]);
    hudTitle(t, L.hr[0], L.hr[1], L.hr[2], B4[0] + 0.05, B4[1] - 0.15, AMBER);
    hudTitle(t, L.hn[0], L.hn[1], '', B5[0] + 0.05, B5[1] - 0.15, TEAL[1]);
    srcChip(t, L.chip1, P1[0] + 0.2, P1[1] - 0.15);
    // the call to action: send EUROPE, your country and your budget
    const ce = ea(t, K.send - 0.1, K.send + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T(L.role, CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold, sx: fit(L.role, F.d(700, 34), SAFE.w, 6) }); ctx.restore();
      const msg = 'EUROPE', send = K.kw + 0.5, sent = ea(t, send, send + 0.35), ia = ea(t, K.send + 0.05, K.send + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.kw - 0.05, K.kw + 0.35, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T(L.input, X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.kw - 0.05, K.kw + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      // your country and your budget: two answer chips, right-aligned
      const fc = F.d(800, 34), chips = [[L.chips[0], K.c1 - 0.15], [L.chips[1], K.c2 - 0.15]].map(([s, a]) => [s, a, M(s, fc, 2) + 64]);
      let cx0 = X1 - chips.reduce((s, c) => s + c[2], 0) - 20 * (chips.length - 1);
      for (const [txt, a, w] of chips) { const e = ea(t, a, a + 0.45, E.back); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(cx0 + w / 2, 960); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -38, w, 76, 38); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 12, { font: fc, ls: 2, color: GOLD }); ctx.restore(); } cx0 += w + 20; }
      const b2 = ea(t, K.reply - 0.35, K.reply + 0.15, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = L.reply, f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1045, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1097, 20, { p: ea(t, K.reply - 0.1, K.reply + 0.3), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1111, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, B1[0], P1[0], B2[0], B3[0], B4[0], B5[0], K.send].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.cost, K.one].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.kw + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 2215) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
