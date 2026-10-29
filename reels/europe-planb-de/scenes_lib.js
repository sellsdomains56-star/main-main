'use strict';
// Shared building blocks for the scenes: timeline helpers, text helpers, number blocks, a chat call-to-action.
const enter = (t, a, d = 0.55, dist = 36) => ({ a: ea(t, a, a + d * 0.75, E.out2), dy: (1 - ea(t, a, a + d, E.out4)) * dist });
// time of the n-th word matching a regex (falls back to `fb` seconds)
function wt(re, n = 0, fb = 0, from = 0) {
  const ws = TL.words.filter(w => w.t >= from - 1e-6 && re.test(w.text.toUpperCase()));
  return ws[n] ? ws[n].t : fb;
}
function wend(re, n = 0, fb = 0, from = 0) {
  const ws = TL.words.filter(w => w.t >= from - 1e-6 && re.test(w.text.toUpperCase()));
  return ws[n] ? ws[n].e : fb;
}
function Tfit(str, x, y, o, maxW) { maxW = Math.min(maxW, SAFE.w); const w = M(str, o.font, o.ls || 0); T(str, x, y, { ...o, sx: Math.min(1, maxW / w) * (o.sx || 1) }); }
function label(s, x, y, t, a, o = {}) {
  const e = enter(t, a, 0.5, 18);
  T(s, x, y + e.dy, { font: o.font || F.d(700, o.size || 52), ls: o.ls ?? 10, color: o.color || C.dim, alpha: e.a * (o.alpha ?? 1), align: o.align || 'center' });
}
// a row of words that appear in turn, centred
function wordRow(words, times, y, t, o = {}) {
  const font = o.font || F.d(700, o.size || 56), ls = o.ls ?? 4, gap = o.gap ?? 34, ws = words.map(w => M(w, font, ls));
  const k = times.map(tm => ea(t, tm, tm + 0.55, E.out4)), total = ws.reduce((a, w, i) => a + (w + gap) * k[i], 0) - gap * Math.max(...k);
  let x = (o.cx ?? CX) - total / 2;
  words.forEach((w, i) => { const e = enter(t, times[i], 0.45, 14); T(w, x + ws[i] / 2, y + e.dy, { font, ls, color: (o.colors && o.colors[i]) || C.ink, alpha: e.a }); x += (ws[i] + gap) * k[i]; });
}
function counterGroup(t, o) {                                           // o: {val, dec, fin, suffix, a0, a1}
  const font = F.d(800, 280), nW = numberWidth(o.fin, font, -6), fs = F.i(150), sW = o.suffix ? M(o.suffix, fs) : 0, gap = o.suffix ? 14 : 0, tot = nW + gap + sW, x0 = -tot / 2;
  const v = o.val * ea(t, o.a0, o.a1, E.out3), na = ea(t, o.a0 - 0.05, o.a0 + 0.3);
  drawNumber(numberStr(v, o.dec), o.fin, x0, 95, { font, alpha: na, ls: -6 });
  if (o.suffix) { const eS = ea(t, o.a1 - 0.2, o.a1 + 0.3, E.out5); T(o.suffix, x0 + nW + gap + sW / 2, 95, { font: fs, color: C.gold, alpha: na * ea(t, o.a0, o.a0 + 0.3), sx: lerp(0.9, 1, eS), sy: lerp(0.9, 1, eS) }); }
}
function bigNumber(t, o) {                                              // [pre] number suffix, with a gold label line above
  ctx.save(); ctx.translate(CX, o.y); ctx.scale(o.sc, o.sc);
  if (o.pre) { const e0 = enter(t, o.preT, 0.5, 18); Tfit(o.pre, 0, -205 + e0.dy, { font: F.d(700, 66), ls: 12, color: o.preColor || C.gold, alpha: e0.a }, 900); }
  counterGroup(t, o);
  ctx.restore();
}
// a stack of statements that appear in turn (id, text, time), optionally dimming earlier ones
function stack(items, y0, step, t, o = {}) {
  items.forEach(([txt, a, col], i) => {
    const e = enter(t, a, 0.5, 30); if (e.a <= 0.003) return; const nxt = items[i + 1], dim = nxt && !o.keep ? 1 - 0.55 * ea(t, nxt[1], nxt[1] + 0.4) : 1;
    Tfit(txt, CX, y0 + i * step + e.dy, { font: F.d(o.weight || 800, o.size || 96), ls: o.ls ?? 2, color: col || C.ink, alpha: e.a * dim }, 940);
  });
}
// chat call to action: "Want my shortlist?" - a typed message, sent, answered
function sceneChat(t, o) {                                              // o: {head, sub, typeA, typeB, send, msg, reply, show}
  const ce = ea(t, o.show, o.show + 0.7, E.out4);
  ctx.save(); ctx.globalAlpha *= ce; ctx.translate(0, (1 - ce) * 40); Tfit(o.head, CX, 560, { font: F.i(112), color: C.ink }, SAFE.w); ctx.restore();
  if (o.sub) { const se = ea(t, o.show + 0.35, o.show + 1.0, E.out4); ctx.save(); ctx.globalAlpha *= se; ctx.translate(0, (1 - se) * 24); Tfit(o.sub, CX, 650, { font: F.d(700, 44), ls: 1, color: C.dim }, SAFE.w); ctx.restore(); }
  const send = o.send, sent = ea(t, send, send + 0.35), ia = ea(t, o.show + 0.6, o.show + 1.2, E.out4), iy = 1180, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0;
  ctx.save(); ctx.globalAlpha *= ia;
  rr(X0, iy - 70, BW, 140, 70); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
  const typed = o.msg.slice(0, Math.floor(o.msg.length * ea(t, o.typeA, o.typeB, E.lin) + 0.0001));
  T(typed, X0 + 56, iy + 20, { font: F.d(700, 64), color: C.ink, align: 'left', alpha: 1 - sent });
  if (t < send) { const cur = (Math.floor(t * 2.4) % 2 === 0) ? 1 : 0.15, cw2 = M(typed, F.d(700, 64)); line(X0 + 56 + cw2 + 8, iy - 34, X0 + 56 + cw2 + 8, iy + 34, { color: C.gold, w: 4, alpha: cur }); }
  T(o.ph || 'Message…', X0 + 56, iy + 20, { font: F.d(700, 64), color: C.mute, align: 'left', alpha: (1 - ea(t, o.typeA, o.typeA + 0.06)) * (1 - sent) });
  dot(X1 - 70, iy, 52, C.gold, 1); icon('plane', X1 - 70, iy, 22, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent });
  ctx.restore();
  const b1 = ea(t, send, send + 0.5, E.out4);
  if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 40); const bw = M(o.msg, F.d(700, 62)) + 90; rr(X1 - bw, 760, bw, 120, 60); ctx.fillStyle = C.gold; ctx.fill(); T(o.msg, X1 - bw / 2, 840, { font: F.d(700, 62), color: '#17181B' }); ctx.restore(); }
  const b2 = ea(t, send + 0.55, send + 1.05, E.out4);
  if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 40); const bw = M(o.reply, F.d(700, 62)) + 150; rr(X0, 915, bw, 120, 60); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
    icon('check', X0 + 70, 975, 26, { p: ea(t, send + 0.8, send + 1.2), color: C.gold, w: 5 }); T(o.reply, X0 + 130, 995, { font: F.d(700, 62), color: C.ink, align: 'left' }); ctx.restore(); }
}

// a statement that slides up out of a mask (kinetic type); o.hl = a gold box that wipes in behind it and turns the text black
function bw(t, txt, y, a, o = {}) {
  const size = o.size || 100, font = F.d(o.w || 800, size), ls = o.ls ?? 2, maxW = Math.min(o.maxW || SAFE.w, SAFE.w), w0 = M(txt, font, ls), k = Math.min(1, maxW / w0), w = w0 * k;
  const e = ea(t, a, a + (o.d ?? 0.5), E.out4), out = o.out ? 1 - ea(t, o.out, o.out + 0.3) : 1, al = ea(t, a, a + 0.12) * out * (o.alpha ?? 1); if (al <= 0.003) return;
  const cx = o.x ?? CX, dy = (1 - e) * size * 0.95;
  ctx.save(); ctx.beginPath(); ctx.rect(cx - w / 2 - 30, y - size * 1.0, w + 60, size * 1.45); ctx.clip();
  const col = o.color || C.ink;
  T(txt, cx, y + dy, { font, ls, color: col, alpha: al, sx: k });
  if (o.hl) { const hp = ea(t, a + 0.18, a + 0.55, E.out4); if (hp > 0.002) { const pad = size * 0.2, bx = cx - w / 2 - pad, bwid = (w + pad * 2) * hp; ctx.save(); ctx.globalAlpha *= al; rr(bx, y - size * 0.82, bwid, size * 1.0, size * 0.16); ctx.fillStyle = o.hl === true ? C.gold : o.hl; ctx.fill(); ctx.clip(); T(txt, cx, y + dy, { font, ls, color: '#0A0A0B', sx: k }); ctx.restore(); } }
  ctx.restore();
}

// icon + two-line row (left aligned), the active row stays bright and the earlier ones settle back
function iconRow(t, ic, a, b, y, t0, nextT, o = {}) {
  const act = ea(t, t0, t0 + 0.6, E.out4), op = lerp(1, o.dimTo ?? 0.5, ea(t, nextT, nextT + 0.5)); if (act <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= op;
  icon(ic, 150, y - (b ? 10 : 30), 46, { p: ea(t, t0 + 0.1, t0 + 0.7), color: C.gold, w: 5 });
  ctx.save(); ctx.beginPath(); ctx.rect(250, y - 100, 780 * act, 240); ctx.clip();
  const dy = (1 - act) * 22;
  Tfit(a, 252, y + dy, { font: F.d(800, 92), ls: -1, align: 'left', color: C.ink }, 770);
  if (b) Tfit(b, 252, y + 78 + dy, { font: F.d(800, 76), ls: 0, align: 'left', color: C.gold }, 770);
  ctx.restore(); ctx.restore();
}
// full-face stamp (as the OUTDATED stamp of the Abu Dhabi reel): slams in on the word, leaves a moment later
function ovStamp(txt, tHit, tEnd, o = {}) {
  return t => {
    const A = ea(t, tHit - 0.2, tHit, E.lin) * (1 - ea(t, tEnd - 0.25, tEnd, E.lin)); if (A <= 0.003) return;
    const p = ea(t, tHit, tHit + 0.3, E.out5), a = ea(t, tHit, tHit + 0.14, E.out2), f = F.d(800, o.size || 108), sw = M(txt, f, 10) + 90, kf = Math.min(1, (SAFE.w - 40) / sw);
    ctx.save(); ctx.globalAlpha *= A * a; ctx.translate(CX, o.y || 1060); ctx.rotate(o.rot ?? -0.05); ctx.scale(lerp(1.7, 1, p) * kf, lerp(1.7, 1, p) * kf);
    ctx.fillStyle = 'rgba(20,21,24,0.82)'; rr(-sw / 2, -92, sw, 184, 22); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 7; rr(-sw / 2, -92, sw, 184, 22); ctx.stroke();
    T(txt, 0, 38, { font: f, ls: 10, color: C.gold });
    ctx.restore();
  };
}
// full-screen PAGE beat: a real page (screenshot / PDF page) is the whole background, flown like the map (pan, zoom, 3D tilt) with marker highlights drawn on the page itself.
// sc = { id, kind: 'page', img (IMAGES id), a, b, keys: [[seconds into the beat, centre x, centre y (image px), scale (screen px per image px), pitch deg], ...], hl: [{ bbox: [x, y, w, h] (image px), t0, t1, color }] }
function pageCam(sc, tg) {
  const keys = sc.keys, lt = Math.min(Math.max(tg - sc.a, 0), (sc.b - sc.a) + 0.5);
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const k0 = keys[i], k1 = keys[Math.min(i + 1, keys.length - 1)], u = k1[0] > k0[0] ? sEase(clamp((lt - k0[0]) / (k1[0] - k0[0]))) : 1;
  return { cx: sLerp(k0[1], k1[1], u), cy: sLerp(k0[2], k1[2], u), k: Math.exp(sLerp(Math.log(k0[3]), Math.log(k1[3]), u)), pitch: sLerp(k0[4] || 0, k1[4] || 0, u) };
}
function runPage(sc, t) {
  if (t < sc.a - 0.15 || t > sc.b + 0.4 || !imgOK(sc.img)) return;
  const alpha = ea(t, sc.a - 0.12, sc.a + 0.3, E.out2) * (1 - prog(t, sc.b - 0.12, sc.b + 0.2)); if (alpha <= 0.002) return;
  const im = IMG[sc.img], cam = pageCam(sc, t), ex = p3ext(cam.pitch);
  ctx.save(); ctx.globalAlpha *= alpha;
  planeRender(cam.pitch, () => {
    ctx.fillStyle = '#0c0c0f'; ctx.fillRect(-ex.ox, -ex.oyT, W + 2 * ex.ox, H + ex.oyT + ex.oyB);
    ctx.save(); ctx.translate(SAT_CX, SAT_CY); ctx.scale(cam.k, cam.k); ctx.translate(-cam.cx, -cam.cy);
    ctx.drawImage(im, 0, 0);
    for (const h of sc.hl || []) {                                              // marker wipes across the exact words
      const hp = ea(t, h.t0, h.t1, E.out4); if (hp <= 0.002) continue;
      const [bx, by, bw_, bh] = h.bbox, ww = (bw_ + 16) * hp; if (h.under) { ctx.save(); ctx.fillStyle = h.color || '#FFC93C'; ctx.fillRect(bx - 8, by + bh - h.under * 1.6, ww, h.under); ctx.restore(); continue; }   // h.under = px: a bar under white text on a dark band (multiply would vanish there)
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = h.color || '#FFC93C'; ctx.fillRect(h.rtl ? bx + bw_ + 8 - ww : bx - 8, by - 4, ww, bh + 8); ctx.restore();   // h.rtl: Arabic text, the marker wipes right to left
    }
    ctx.restore();
  });
  // dark veils: the HUD sits on top, the captions below; the page shows through in between (and faintly behind them)
  const gt = ctx.createLinearGradient(0, 0, 0, 720); gt.addColorStop(0, 'rgba(8,8,10,0.97)'); gt.addColorStop(0.6, 'rgba(8,8,10,0.86)'); gt.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = gt; ctx.fillRect(0, 0, W, 720);
  const gb = ctx.createLinearGradient(0, 1130, 0, 1480); gb.addColorStop(0, 'rgba(8,8,10,0)'); gb.addColorStop(0.55, 'rgba(8,8,10,0.82)'); gb.addColorStop(1, 'rgba(8,8,10,0.95)'); ctx.fillStyle = gb; ctx.fillRect(0, 1130, W, H - 1130);
  ctx.restore();
}
// full-screen satellite beat: sc.cfg = { outlines:[{key,t0,t1}], pins:[{lon,lat,t,title,sub}], top:(t,cam)=>{} }
function runSat(sc, t) {
  if (t < sc.a - 0.15 || t > sc.b + 0.4) return;
  const alpha = ea(t, sc.a - 0.12, sc.a + 0.25, E.out2) * (sc.last ? 1 : 1 - prog(t, sc.b - 0.12, sc.b + 0.2)); if (alpha <= 0.002) return;
  const S = SAT_SCENES[sc.id], cfg = sc.cfg;
  ctx.save(); ctx.globalAlpha *= alpha;
  const cam = satDraw(S, t);
  for (const o of cfg.outlines || []) satOutline(cam, OUTLINES[o.key], ea(t, o.t0, o.t1, E.inOut2));
  for (const p of cfg.pins || []) { const [x, y] = satProj(cam, p.lon, p.lat); satPin(x, y, t, p.t, p.title, p.sub); }
  if (cfg.top) cfg.top(t, cam);
  T('Imagery © Esri, Maxar, Earthstar Geographics', CX, 1440, { font: F.d(700, 24), color: 'rgba(243,239,230,0.55)' });
  ctx.restore();
}

// ------------------------------------------------------------------------------------------------- real images (screenshots / photos / logos)
const IMG = {};                                                       // id -> loaded <img>, filled by main.js from CFG.IMAGES
const imgOK = id => IMG[id] && IMG[id].complete && IMG[id].naturalWidth > 0;
// A real image on a rounded card. o: { x, y, w, h (the card box), a (enter), out (exit), from: [dx, dy] slide offset, rot (deg), fit: 'cover' | 'contain', fx, fy (cover focus 0..1),
//   zoom: [z0, z1] slow push over its life, focus: { bbox: [x, y, w, h] in image px, t0, t1, zoom (extra margin) }, hl: { bbox, t0, t1, color, mode }, chip: 'SOURCE · DATE', bg }
function card(t, id, o) {
  if (!imgOK(id)) return;
  const im = IMG[id], a = o.a, ein = ea(t, a, a + 0.55, E.out4), out = o.out ? ea(t, o.out, o.out + 0.35, E.in3) : 0, al = ea(t, a, a + 0.18) * (1 - out); if (al <= 0.003) return;
  const [fdx, fdy] = o.from || [0, 80], rot = (o.rot || 0) * Math.PI / 180, sc = lerp(0.9, 1, ein) * (o.zoom ? lerp(o.zoom[0], o.zoom[1], prog(t, a, o.out || a + 6)) : 1) * lerp(1, 0.94, out);
  const fl = Math.sin((t - a) * 1.4) * 4;
  ctx.save(); ctx.globalAlpha *= al;
  ctx.translate(o.x + o.w / 2 + (1 - ein) * fdx + (out ? out * (o.exit ? o.exit[0] : 0) : 0), o.y + o.h / 2 + (1 - ein) * fdy + fl + (out ? out * (o.exit ? o.exit[1] : 0) : 0));
  ctx.rotate(rot + (1 - ein) * (o.spin ?? 0.05)); ctx.scale(sc, sc);
  const r = o.r ?? 28, w = o.w, h = o.h;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50 * SS; ctx.shadowOffsetY = 26 * SS; rr(-w / 2, -h / 2, w, h, r); ctx.fillStyle = o.bg || '#F4F1EA'; ctx.fill(); ctx.restore();
  ctx.save(); rr(-w / 2, -h / 2, w, h, r); ctx.clip();
  // source window: cover / contain, glided onto a focus box when asked
  const asp = w / h; let sw, sh, sx, sy;
  if ((o.fit || 'cover') === 'cover') { if (im.naturalWidth / im.naturalHeight > asp) { sh = im.naturalHeight; sw = sh * asp; } else { sw = im.naturalWidth; sh = sw / asp; } sx = (im.naturalWidth - sw) * (o.fx ?? 0.5); sy = (im.naturalHeight - sh) * (o.fy ?? 0); }
  else { if (im.naturalWidth / im.naturalHeight > asp) { sw = im.naturalWidth; sh = sw / asp; } else { sh = im.naturalHeight; sw = sh * asp; } sx = (im.naturalWidth - sw) / 2; sy = (im.naturalHeight - sh) / 2; }
  for (const f of [].concat(o.focus || [])) {                                  // one or several glides onto a box of the image
    const p = ea(t, f.t0, f.t1, E.inOut3), [bx, by, bw_, bh] = f.bbox, cw = Math.max(bw_ * (f.zoom || 1.25), 1), ch = cw / asp, cx2 = bx + bw_ / 2, cy2 = by + bh / 2;
    sx = lerp(sx, cx2 - cw / 2, p); sy = lerp(sy, cy2 - ch / 2, p); sw = lerp(sw, cw, p); sh = lerp(sh, ch, p);
  }
  sw = Math.min(sw, im.naturalWidth); sh = Math.min(sh, im.naturalHeight); sx = clamp(sx, 0, im.naturalWidth - sw); sy = clamp(sy, 0, im.naturalHeight - sh);
  if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(-w / 2, -h / 2, w, h); }
  ctx.drawImage(im, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  for (const H of [].concat(o.hl || [])) {                                      // marker highlight over a phrase in the image
    const hp = ea(t, H.t0, H.t1, E.out4); if (hp > 0.002) {
      const [bx, by, bw_, bh] = H.bbox, k = w / sw, px = -w / 2 + (bx - sx) * k, py = -h / 2 + (by - sy) * k;
      ctx.save(); ctx.globalCompositeOperation = H.mode || 'multiply'; ctx.fillStyle = H.color || '#FFC93C'; ctx.fillRect(px - 8, py - 4, (bw_ * k + 16) * hp, bh * k + 8); ctx.restore();
    }
  }
  if (o.dim) { const f0 = [].concat(o.focus || [])[0]; ctx.fillStyle = `rgba(8,8,10,${o.dim * ea(t, f0 ? f0.t0 : a, f0 ? f0.t1 : a + 0.5)})`; ctx.fillRect(-w / 2, -h / 2, w, h); }
  ctx.restore();
  ctx.save(); rr(-w / 2, -h / 2, w, h, r); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  if (o.chip) { const ce = ea(t, a + 0.35, a + 0.8, E.out4), f = F.d(800, 27), cw = M(o.chip, f, 3) + 66; ctx.save(); ctx.globalAlpha *= ce; rr(-w / 2 + 18, -h / 2 - 34 - (1 - ce) * 14, cw, 52, 26); ctx.fillStyle = 'rgba(8,8,10,0.94)'; ctx.fill(); ctx.strokeStyle = 'rgba(233,196,124,0.55)'; ctx.lineWidth = 2; ctx.stroke(); dot(-w / 2 + 44, -h / 2 - 8 - (1 - ce) * 14, 7, C.gold); T(o.chip, -w / 2 + 60 + (cw - 66) / 2, -h / 2 + 1 - (1 - ce) * 14, { font: f, ls: 3, color: C.ink }); ctx.restore(); }
  ctx.restore();
}
// a logo / transparent PNG pop (no card): scales in with overshoot
function pic(t, id, x, y, w, a, o = {}) {
  if (!imgOK(id)) return; const im = IMG[id], e = ea(t, a, a + 0.5, E.back), al = ea(t, a, a + 0.2) * (o.out ? 1 - ea(t, o.out, o.out + 0.3) : 1); if (al <= 0.003) return;
  const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, y + (1 - e) * (o.dy ?? 30)); ctx.scale(lerp(0.7, 1, e), lerp(0.7, 1, e)); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
// round photo badge (portraits): ring draws on, name chip below
function badge(t, id, x, y, r, a, name, o = {}) {
  if (!imgOK(id)) return; const im = IMG[id], e = ea(t, a, a + 0.55, E.back), al = ea(t, a, a + 0.18) * (o.out ? 1 - ea(t, o.out, o.out + 0.3) : 1); if (al <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, y); ctx.scale(lerp(0.6, 1, e), lerp(0.6, 1, e)); ctx.rotate((1 - e) * -0.12);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40 * SS; ctx.shadowOffsetY = 18 * SS; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#111'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 5, 0, 7); ctx.clip();
  const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max((r * 2) / iw, (r * 2) / ih) * (o.zoom || 1) * lerp(1.12, 1, ea(t, a, a + 1.2, E.out3)), fx = o.fx ?? 0.5, fy = o.fy ?? 0.25;
  ctx.drawImage(im, -iw * s * fx + (fx - 0.5) * 0, -ih * s * fy + (fy - 0.25) * 0 - (o.dy || 0), iw * s, ih * s); ctx.restore();
  ring(0, 0, r - 2, { color: C.gold, w: 6, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * ea(t, a + 0.1, a + 0.8, E.out3) });
  if (name) { const f = F.d(800, 32), cw = M(name, f, 4) + 56, ce = ea(t, a + 0.4, a + 0.9, E.out4); ctx.save(); ctx.globalAlpha *= ce; rr(-cw / 2, r - 14 + (1 - ce) * 12, cw, 56, 28); ctx.fillStyle = C.gold; ctx.fill(); T(name, 0, r + 24 + (1 - ce) * 12, { font: f, ls: 4, color: '#0A0A0B' }); ctx.restore(); }
  ctx.restore();
}
// full-face hook title (over his first beat): words slam in one by one inside gold boxes
function ovHook(lines, o = {}) {              // lines: [[text, time, style('ink' | 'gold' | 'box')], ...]; o.out = time it leaves
  return t => {
    const out = 1 - ea(t, o.out, o.out + 0.3, E.in2); if (out <= 0.003) return;
    const size = o.size || 104, y0 = o.y || 410, step = size * 1.12;
    lines.forEach(([txt, a, st], i) => {
      const font = F.d(800, size), ls = 2, w0 = M(txt, font, ls), k = Math.min(1, SAFE.w / (w0 + 56)), w = w0 * k, y = y0 + i * step, e = ea(t, a, a + 0.38, E.out5), al = ea(t, a, a + 0.1) * out; if (al <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= al; ctx.translate(CX, y); ctx.scale(lerp(1.5, 1, e), lerp(1.5, 1, e)); ctx.rotate((1 - e) * 0.06);
      if (st === 'box' || st === 'ivory') { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24 * SS; ctx.shadowOffsetY = 8 * SS; rr(-w / 2 - 28, -size * 0.8, w + 56, size * 1.04, 20); ctx.fillStyle = st === 'box' ? C.gold : C.ink; ctx.fill(); ctx.restore(); T(txt, 0, 0, { font, ls, color: '#0A0A0B', sx: k }); }
      else { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 26 * SS; ctx.shadowOffsetY = 6 * SS; T(txt, 0, 0, { font, ls, color: st === 'gold' ? C.gold : C.ink, sx: k }); }
      ctx.restore();
    });
  };
}

// ------------------------------------------------------------------------------------------------- pills + small motion pieces
// a pill row: icon + text on a dark glass pill that slides in from the right with a gold progress sweep under it
function pillRow(t, ic, txt, y, a, o = {}) {
  const e = ea(t, a, a + 0.55, E.out5), al = ea(t, a, a + 0.15) * (o.dim ?? 1) * (o.out ? 1 - ea(t, o.out, o.out + 0.3) : 1); if (al <= 0.003) return;
  const w = o.w || 780, h = o.h || 128, x = (o.x ?? CX) - w / 2 + (1 - e) * 260, font = F.d(800, o.size || 62), k = Math.min(1, (w - 190) / M(txt, font, 2));
  ctx.save(); ctx.globalAlpha *= al;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30 * SS; ctx.shadowOffsetY = 12 * SS; rr(x, y - h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(24,24,28,0.94)'; ctx.fill(); ctx.restore();
  rr(x, y - h / 2, w, h, h / 2); ctx.strokeStyle = 'rgba(233,196,124,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
  const sw = ea(t, a + 0.25, a + 0.9, E.out4); if (sw > 0.002) { ctx.save(); rr(x, y - h / 2, w, h, h / 2); ctx.clip(); ctx.fillStyle = C.gold; ctx.fillRect(x + 40, y + h / 2 - 7, (w - 80) * sw, 4); ctx.restore(); }
  dot(x + 70, y, 38, C.goldSoft); icon(ic, x + 70, y, 21, { p: ea(t, a + 0.15, a + 0.7, E.out3), color: C.gold, w: 4.5 });
  T(txt, x + 128 + (w - 190) / 2, y + (o.size || 62) * 0.34, { font, ls: 2, color: C.ink, sx: k });
  ctx.restore();
}
// a bubble that swells, wobbles and bursts into sparks at tBurst
function bubble(t, cx, cy, rMax, a, tBurst) {
  const g = ea(t, a, tBurst, E.in2), r = rMax * (0.12 + 0.88 * g) * (1 + 0.035 * Math.sin(t * 7)), life = 1 - ea(t, tBurst, tBurst + 0.05, E.lin);
  if (t >= a && life > 0.003) {
    ctx.save(); ctx.globalAlpha *= ea(t, a, a + 0.25) * life;
    const gr = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r); gr.addColorStop(0, 'rgba(255,246,222,0.42)'); gr.addColorStop(0.55, 'rgba(255,236,190,0.14)'); gr.addColorStop(1, 'rgba(255,220,150,0.30)');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = 'rgba(255,240,205,0.95)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - r * 0.36, cy - r * 0.38, r * 0.2, Math.PI * 1.05, Math.PI * 1.55); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  }
  if (t >= tBurst && t < tBurst + 1.0) {                                       // burst: a ring + sparks
    const p = prog(t, tBurst, tBurst + 0.9), r0 = rMax * (1 + 0.9 * E.out3(p));
    ring(cx, cy, r0, { color: C.gold, w: 6 * (1 - p), alpha: 1 - p });
    const R = rng(5); for (let i = 0; i < 22; i++) { const ang = R() * 6.283, d = rMax * (0.9 + 1.5 * R()) * E.out3(p), s = 3 + R() * 5; dot(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d + 40 * p * p, s * (1 - p), i % 3 ? C.gold : '#FFF6DE', 1 - p); }
  }
}

// ------------------------------------------------------------------------------------------------- charts (added for the Ohana reel)
// horizontal bar row: a label, a small line under it, and a bar that grows with the value counting up inside it. Bars are scaled to o.max (the longest bar fills the safe column).
// o: { label, sub, y (label baseline), a (row enters), g0, g1 (bar grows), val, max, gold }   returns { by, len } (bar top, bar length) so you can hang a gap / bracket on it
function barRow(t, o) {
  const X0 = SAFE.x0, FULL = SAFE.w, e = enter(t, o.a, 0.5, 22); if (e.a <= 0.003) return null;
  const by = o.y + 72, bh = 100, g = ea(t, o.g0, o.g1, E.out4), len = FULL * o.val / o.max;
  T(o.label, X0, o.y + e.dy, { font: F.d(800, 50), ls: 3, align: 'left', color: o.gold ? C.gold : C.ink, alpha: e.a });
  if (o.sub) T(o.sub, X0, o.y + 50 + e.dy, { font: F.d(700, 34), ls: 2, align: 'left', color: C.dim, alpha: e.a });
  ctx.save(); ctx.globalAlpha *= e.a; rr(X0, by + e.dy, FULL, bh, 20); ctx.fillStyle = 'rgba(243,239,230,0.07)'; ctx.fill();
  if (g > 0.002) {
    ctx.save(); ctx.translate(0, e.dy); rr(X0, by, Math.max(24, len * g), bh, 20); ctx.fillStyle = o.gold ? C.gold : C.ink; ctx.fill(); ctx.clip();
    drawNumber(numberStr(o.val * g, o.dec || 0), numberStr(o.val, o.dec || 0), X0 + 34, by + bh / 2 + 24, { font: F.d(800, 68), color: '#0A0A0B', ls: 0, alpha: ea(t, o.g0 + 0.1, o.g0 + 0.4) }); ctx.restore();
  }
  ctx.restore();
  return { by, len };
}
// ring gauge: a faint ring, a gold/ivory arc that fills to pct %, the percentage counting up inside, a two-line label under it.  Two of them side by side: cx 340 and 740.
// o: { cx, cy = 770, r = 175, pct, a0, a1, gold, l1, l2 }
function gauge(t, o) {
  const cy = o.cy ?? 770, r = o.r ?? 175, col = o.gold ? C.gold : C.ink, p = ea(t, o.a0, o.a1, E.out4);
  ring(o.cx, cy, r, { color: C.faint, w: 26, alpha: ea(t, o.a0 - 0.3, o.a0, E.lin) });
  if (p > 0.002) { ctx.save(); ctx.shadowColor = o.gold ? 'rgba(233,196,124,0.55)' : 'rgba(243,239,230,0.35)'; ctx.shadowBlur = 18 * SS; ring(o.cx, cy, r, { color: col, w: 26, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * o.pct / 100 * p }); ctx.restore(); }
  T(Math.round(o.pct * p) + '%', o.cx, cy + 38, { font: F.d(800, 110), ls: -2, color: col, alpha: ea(t, o.a0 - 0.05, o.a0 + 0.25) });
  if (o.l1) bw(t, o.l1, cy + 260, o.a0 - 0.55, { size: 50, ls: 3, x: o.cx, maxW: 380 });
  if (o.l2) bw(t, o.l2, cy + 325, o.a0 - 0.45, { size: 50, ls: 3, x: o.cx, maxW: 380, color: C.dim });
}

// ------------------------------------------------------------------------------------------------- map storytelling (one continuous satellite journey)
// Everything below draws over the satellite scene from its cfg.top(t, cam). The camera path is SAT_SCENES.<id>.keys built with camKey().
let HUD_X = 330;                                                         // the HUD title sits right of the face bubble (bubble x 130-290); scenes.js sets it to SAFE.x0 when there is no bubble
const MAP_Y0 = 540, MAP_Y1 = 1270;                                              // callout labels stay between the HUD and the captions
const mpp = (cam, lat) => 156543.03 * Math.cos(lat * Math.PI / 180) / Math.pow(2, cam.z);          // metres per screen pixel
function camKey(sec, lon, lat, z, dy = 0, pitch = 0) {                          // waypoint that shows (lon, lat) dy px ABOVE the screen's map centre (room for the HUD / panel); pitch = 3D tilt in degrees (0 = top-down)
  const y = worldY(lat, z) + dy, n = Math.PI - 2 * Math.PI * y / (256 * Math.pow(2, z));
  return [sec, lon, Math.atan(Math.sinh(n)) * 180 / Math.PI, z, pitch];
}
// a callout anchored to a place: pulse ring + dot + leader line + a frosted label. o: {lon, lat, a0, a1, title, sub, dx, dy}
function mapTag(t, cam, o) {
  const al = ea(t, o.a0, o.a0 + 0.25) * (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.4) : 1); if (al <= 0.003) return;
  const [x, y] = satProj(cam, o.lon, o.lat); if (x < -60 || x > W + 60 || y < 260 || y > 1500) return;
  const e = ea(t, o.a0, o.a0 + 0.5, E.back), f1 = F.d(800, 36), f2 = F.d(700, 25), w1 = M(o.title, f1, 1), w2 = o.sub ? M(o.sub, f2, 1) : 0, pw = Math.max(w1, w2) + 54, ph = o.sub ? 90 : 62;
  const lx = clamp(x + (o.dx ?? 0), SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(y + (o.dy ?? -100), MAP_Y0 + ph / 2, MAP_Y1 - ph / 2), ey = ly + (y > ly ? ph / 2 : -ph / 2), p = ea(t, o.a0 + 0.1, o.a0 + 0.55, E.out3);
  ctx.save(); ctx.globalAlpha *= al;
  line(x, y, lerp(x, lx, p), lerp(y, ey, p), { color: 'rgba(255,255,255,0.75)', w: 2.5 });
  const u = ((t - o.a0) / 1.8) % 1; ring(x, y, 14 + 54 * E.out3(u), { color: '#FFFFFF', w: 3, alpha: (1 - u) * 0.6 });
  dot(x, y, 17 * e, 'rgba(255,255,255,0.95)'); dot(x, y, 9.5 * e, C.gold);
  ctx.save(); ctx.translate(lx, ly); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); ctx.translate(-lx, -ly);
  glassPill(lx - pw / 2, ly - ph / 2, pw, ph, 22);
  T(o.title, lx, ly + (o.sub ? -4 : 12), { font: f1, ls: 1, color: '#FFFFFF' });
  if (o.sub) T(o.sub, lx, ly + 30, { font: f2, ls: 1.5, color: C.gold });
  ctx.restore(); ctx.restore();
}
// an island outline that traces in at a0, fades back to a faint `keep` outline at a1.  Outlines come from OUTLINES (outlines.json)
function mapOutline(t, cam, key, a0, a1, o = {}) {
  const pts = OUTLINES[key]; if (!pts) return;
  const p = ea(t, a0, a0 + (o.dur ?? 1.5), E.inOut2), keep = o.keep ?? 0, f = a1 ? 1 - (1 - keep) * ea(t, a1, a1 + 0.7) : 1; if (p <= 0.001 || f <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= f; satOutline(cam, pts, p, o.color || C.gold); ctx.restore();
}
// "this area matters": soft glow + three expanding rings + a dashed boundary, radius in metres
function mapPulse(t, cam, lon, lat, meters, a0, a1) {
  const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.5) : 1); if (al <= 0.003) return;
  const [x, y] = satProj(cam, lon, lat), R = meters / mpp(cam, lat);
  glow(x, y, R * 1.25, '233,196,124', 0.26 * al);
  for (let i = 0; i < 3; i++) { const u = ((t - a0) / 2.4 + i / 3) % 1; ring(x, y, R * (0.2 + 0.8 * u), { color: 'rgb(233,196,124)', w: 4, alpha: al * (1 - u) * 0.85 }); }
  ring(x, y, R, { color: 'rgb(255,236,190)', w: 3, alpha: al * 0.85, dash: [18, 12] });
}
// an animated route between two places (dashed gold curve that draws on, with dots travelling along it). A, B = [lon, lat]
function mapFlow(t, cam, A, B, a0, a1, o = {}) {
  const al = a1 ? 1 - ea(t, a1, a1 + 0.5) : 1, p = ea(t, a0, a0 + (o.dur ?? 1.3), E.inOut2); if (p <= 0.002 || al <= 0.003) return;
  const [x0, y0] = satProj(cam, A[0], A[1]), [x1, y1] = satProj(cam, B[0], B[1]), bend = o.bend ?? 0.28, mx = (x0 + x1) / 2 + (y1 - y0) * bend, my = (y0 + y1) / 2 - (x1 - x0) * bend, pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40, v = 1 - u; pts.push([v * v * x0 + 2 * v * u * mx + u * u * x1, v * v * y0 + 2 * v * u * my + u * u * y1]); }
  ctx.save(); ctx.globalAlpha *= al; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 45; strokePoly(pts, p, { color: 'rgba(8,8,10,0.55)', w: 13 }); strokePoly(pts, p, { color: C.gold, w: 7 }); ctx.setLineDash([]);
  for (let k = 0; k < 3; k++) { const u = (((t - a0) * 0.45 + k / 3) % 1) * p, i = Math.min(40, Math.floor(u * 40)); glow(pts[i][0], pts[i][1], 40, '255,246,222', 0.5); dot(pts[i][0], pts[i][1], 10, '#FFF6DE', 0.95); }
  ctx.restore();
}
// hatching that builds up across an island, west to east: "still taking shape" (construction in progress)
function mapBuild(t, cam, key, a0, a1) {
  const pts = OUTLINES[key]; if (!pts) return; const p = ea(t, a0, a1, E.inOut2), al = ea(t, a0, a0 + 0.4); if (p <= 0.002 || al <= 0.003) return;
  const P = pts.map(([lo, la]) => satProj(cam, lo, la)), xs = P.map(q => q[0]), ys = P.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  ctx.save(); ctx.globalAlpha *= al; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
  ctx.beginPath(); ctx.rect(x0, y0, (x1 - x0) * p, y1 - y0); ctx.clip(); ctx.strokeStyle = 'rgba(233,196,124,0.55)'; ctx.lineWidth = 5; ctx.beginPath();
  for (let d = -(y1 - y0); d < x1 - x0 + 40; d += 26) { ctx.moveTo(x0 + d, y1); ctx.lineTo(x0 + d + (y1 - y0), y0); } ctx.stroke(); ctx.restore();
  const bx = x0 + (x1 - x0) * p; line(bx, y0 - 10, bx, y1 + 10, { color: C.gold, w: 4, alpha: al * (1 - E.in3(p)) });
}
// top-left title block (the face bubble sits top-right): small "NUMBER n", the name, a gold subtitle
function hudTitle(t, kicker, name, sub, a0, a1, color) {
  const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
  const e = ea(t, a0, a0 + 0.7, E.out4), dy = (1 - e) * 34, X = HUD_X, MW = SAFE.x1 - HUD_X, f = F.d(800, 60), f3 = F.d(700, 32);
  ctx.save(); ctx.globalAlpha *= al; { const g = ctx.createLinearGradient(0, 270, 0, 590); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(0.2, 'rgba(8,8,10,0.62)'); g.addColorStop(0.62, 'rgba(8,8,10,0.62)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 270, W, 320); }   // dark scrim so the title stays readable over bright fills
  ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 2 * SS;
  T(kicker, X, 360 + dy, { font: F.d(700, 30), ls: 8, color: C.dim, align: 'left', sx: Math.min(1, MW / M(kicker, F.d(700, 30), 8)) });
  T(name, X, 424 + dy, { font: f, ls: 1, color: C.ink, align: 'left', sx: Math.min(1, MW / M(name, f, 1)), alpha: 1 });
  rr(X, 440 + dy, 120 * e, 6, 3); ctx.fillStyle = color || C.gold; ctx.fill();
  if (sub) T(sub, X, 488 + dy, { font: f3, ls: 3, color: color || C.gold, align: 'left', sx: Math.min(1, MW / M(sub, f3, 3)) });
  ctx.restore();
}
// "fully broken down": a frosted checklist panel that fills row by row as he names each point. o: {title, items:[{txt, a, gold}], a0, a1, bottom, rowH, size, alpha}
function breakdown(t, o) {
  const al = ea(t, o.a0, o.a0 + 0.4, E.out3) * (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.4) : 1) * (o.alpha ?? 1); if (al <= 0.003) return;
  const X = SAFE.x0, Wd = SAFE.w, rowH = o.rowH ?? 54, hh = 62, hFull = hh + o.items.length * rowH + 20, y0 = (o.bottom ?? 1262) - hFull, sz = o.size ?? 33, vis = o.items.reduce((n, it) => n + ea(t, it.a, it.a + 0.45, E.out4), 0), h = hh + 14 + rowH * vis;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, o.a0, o.a0 + 0.5, E.out4)) * 36);
  glassPill(X, y0, Wd, h, 28);
  T(o.title, X + 34, y0 + 42, { font: F.d(800, 28), ls: 7, color: C.gold, align: 'left' });
  line(X + 30, y0 + hh - 6, X + Wd - 30, y0 + hh - 6, { color: 'rgba(243,239,230,0.22)', w: 2 });
  let latest = -1; o.items.forEach((it, i) => { if (t >= it.a && (latest < 0 || it.a >= o.items[latest].a)) latest = i; });
  o.items.forEach((it, i) => {
    const e = ea(t, it.a, it.a + 0.45, E.out4); if (e <= 0.003) return;
    const cy = y0 + hh + i * rowH + rowH / 2, hi = i === latest ? 1 - ea(t, it.a + 0.3, it.a + 2.2) : 0;
    if (hi > 0.01) { rr(X + 14, cy - rowH / 2 + 4, Wd - 28, rowH - 8, 16); ctx.fillStyle = `rgba(233,196,124,${0.16 * hi})`; ctx.fill(); }
    ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -34, 0);
    dot(X + 52, cy, 17, it.gold ? C.gold : C.goldSoft); icon('check', X + 52, cy + 1, 10, { p: ea(t, it.a + 0.1, it.a + 0.5), color: it.gold ? '#0A0A0B' : C.gold, w: 4 });
    T(it.txt, X + 88, cy + sz * 0.36, { font: F.d(800, sz), ls: 1, color: it.gold ? C.gold : C.ink, align: 'left', sx: Math.min(1, (Wd - 130) / M(it.txt, F.d(800, sz), 1)) });
    ctx.restore();
  });
  ctx.restore();
}
// a numbered island badge (overview): gold disc with the number + a small name label
function islandBadge(t, cam, n, lon, lat, name, a0, a1) {
  const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
  const [x, y] = satProj(cam, lon, lat), e = ea(t, a0, a0 + 0.55, E.back), f = F.d(800, 30), w = M(name, f, 2) + 40;
  ctx.save(); ctx.globalAlpha *= al; glow(x, y, 70, '233,196,124', 0.35); dot(x, y, 30 * e, C.gold); T(String(n), x, y + 14 * e, { font: F.d(800, 40), color: '#0A0A0B', sx: e, sy: e });
  const lx = clamp(x, SAFE.x0 + w / 2, SAFE.x1 - w / 2), ly = y + 62; glassPill(lx - w / 2, ly - 22, w, 44, 22); T(name, lx, ly + 10, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore();
}

// a coloured island overlay like the reference reels: translucent fill that wipes in west to east, a glowing white edge, and the name written along the island's main axis.
// wins = [[tIn, tOut], ...] windows where it is at full strength (label shown); between/after them it stays as a faint fill (o.base). label = string or [line1, line2].
const _isl = {};
function mapIsland(t, cam, key, c0, c1, wins, label, o = {}) {
  const pts = OUTLINES[key]; if (!pts || !wins.length) return;
  const first = wins[0][0]; if (t < first) return;
  let full = 0; for (const [a, b] of wins) full = Math.max(full, ea(t, a, a + 0.5) * (1 - ea(t, b, b + 0.6)));
  const base = o.base ?? 0.2, al = base + (1 - base) * full, p = ea(t, first, first + (o.dur ?? 1.0), E.inOut2); if (al <= 0.003 || p <= 0.002) return;
  let I = _isl[key]; if (!I) { const k = Math.cos(24.5 * Math.PI / 180); let mx = 0, my = 0; pts.forEach(([lo, la]) => { mx += lo * k; my += la; }); mx /= pts.length; my /= pts.length; let sxx = 0, syy = 0, sxy = 0; pts.forEach(([lo, la]) => { const dx = lo * k - mx, dy = la - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; });
    let ang = -0.5 * Math.atan2(2 * sxy, sxx - syy); while (ang > Math.PI / 2) ang -= Math.PI; while (ang <= -Math.PI / 2) ang += Math.PI; ang = clamp(ang, -0.85, 0.85); I = _isl[key] = { ang }; }
  const P = pts.map(([lo, la]) => satProj(cam, lo, la)); let cx = 0, cy = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; P.forEach(([x, y]) => { cx += x; cy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); cx /= P.length; cy /= P.length;
  if (x1 < -50 || x0 > W + 50 || y1 < 0 || y0 > H) return;
  const ca = Math.cos(I.ang), sa = Math.sin(I.ang); let u0 = 1e9, u1 = -1e9; P.forEach(([x, y]) => { const u = (x - cx) * ca + (y - cy) * sa; u0 = Math.min(u0, u); u1 = Math.max(u1, u); }); const len = u1 - u0;
  const fa = lerp(0.62, 0.2, clamp((len - 450) / 1100, 0, 1));
  ctx.save(); ctx.globalAlpha *= al;
  if (p < 0.999) { ctx.beginPath(); ctx.rect(x0 - 30, 0, (x1 - x0 + 60) * p, H); ctx.clip(); }
  const g = ctx.createLinearGradient(x0, y1, x1, y0); g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.globalAlpha *= fa; ctx.fillStyle = g; ctx.fill(); ctx.globalAlpha /= fa;
  ctx.lineJoin = 'round'; ctx.shadowColor = c1; ctx.shadowBlur = 14 * SS; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 3.5; ctx.stroke(); ctx.shadowColor = 'transparent';
  ctx.restore();
  if (p < 0.999) { const fx = x0 - 30 + (x1 - x0 + 60) * p; ctx.save(); ctx.globalAlpha *= al * (1 - p) * 0.9; const lg = ctx.createLinearGradient(fx - 40, 0, fx, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,0.55)'); ctx.fillStyle = lg; ctx.fillRect(fx - 40, Math.max(0, y0 - 20), 40, Math.min(H, y1 + 20) - Math.max(0, y0 - 20)); ctx.restore(); }
  let la = 0; for (const [a, b, ld] of wins) la = Math.max(la, ea(t, a + 0.45, a + 0.9) * (1 - ea(t, b, b + 0.6)) * (ld ? 1 - ea(t, a + ld, a + ld + 0.6) : 1)); if (la > 0.01 && label) {
    const lines = Array.isArray(label) ? label : [label], sz = clamp(len * 0.095, 30, 46), f = F.d(800, sz), lh = sz * 1.12;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(I.ang); ctx.globalAlpha *= la; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 12 * SS; ctx.shadowOffsetY = 2 * SS;
    lines.forEach((ln, i) => T(ln, 0, (i - (lines.length - 1) / 2) * lh + sz * 0.36, { font: f, ls: 1, color: '#FFFFFF', sx: Math.min(1, (len * 0.95) / M(ln, f, 1)) }));
    ctx.restore();
  }
}
// a big white title across the map (like "MOST IMPORTANT" in the reference): pops in, soft shadow, optional gold sub line
function bigTitle(t, text, y, a0, a1, o = {}) {
  const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
  const e = ea(t, a0, a0 + 0.6, E.back), f = F.d(800, o.size ?? 100), sx = Math.min(1, SAFE.w / M(text, f, 1));
  ctx.save(); ctx.globalAlpha *= al; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 22 * SS; ctx.shadowOffsetY = 3 * SS;
  T(text, CX, y + (1 - e) * 30, { font: f, ls: 1, color: '#FFFFFF', sx: sx * (0.92 + 0.08 * e), sy: 0.92 + 0.08 * e });
  if (o.sub) T(o.sub, CX, y + 62 + (1 - e) * 30, { font: F.d(700, 36), ls: 8, color: C.gold });
  ctx.restore();
}

// a compact pin: dot with a soft pulse + a small dark pill with the name beside it (side 'r' or 'l'). Use it when several places sit close together (mapTag's big labels would hide the pins).
function mapDot(t, cam, o) {
  const al = ea(t, o.a0, o.a0 + 0.3) * (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.4) : 1); if (al <= 0.003) return;
  const [x, y] = satProj(cam, o.lon, o.lat), e = ea(t, o.a0, o.a0 + 0.45, E.back), sz = o.size ?? 28, f = F.d(800, sz), tw0 = M(o.text, f, 1), pad = 18, h = sz + 22, right = (o.side || 'r') === 'r';
  const avail = right ? SAFE.x1 - (x + 24) : (x - 24) - SAFE.x0, w = Math.max(60, Math.min(tw0 + pad * 2, avail)), sx = Math.min(1, (w - pad * 2) / tw0), lx = right ? x + 24 : x - 24 - w, ly = clamp(y - h / 2 + (o.dy || 0), MAP_Y0, MAP_Y1 - h), u = ((t - o.a0) / 2) % 1;
  ctx.save(); ctx.globalAlpha *= al;
  ring(x, y, 14 + 40 * u, { color: '#FFFFFF', w: 2.5, alpha: (1 - u) * 0.6 });
  dot(x, y, 15 * e, 'rgba(255,255,255,0.95)'); dot(x, y, 8.5 * e, C.gold);
  rr(lx, ly, w, h, h / 2); ctx.fillStyle = 'rgba(8,8,10,0.86)'; ctx.fill(); ctx.strokeStyle = 'rgba(233,196,124,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  T(o.text, lx + w / 2, ly + h / 2 + sz * 0.36, { font: f, ls: 1, color: '#FFFFFF', sx });
  ctx.restore();
}

// an animated route along real coordinates (e.g. a metro line from OpenStreetMap): a glowing line that draws on from the first point, with a bright head. pts = [[lon, lat], ...]
function mapRoute(t, cam, pts, a0, a1, o = {}) {
  const al = a1 ? 1 - ea(t, a1, a1 + 0.5) : 1, p = ea(t, a0, a0 + (o.dur ?? 2.2), E.inOut2); if (p <= 0.002 || al <= 0.003) return;
  const P = pts.map(([lo, la]) => satProj(cam, lo, la)), col = o.color || '#3D8BFF', w = o.w ?? 9;
  ctx.save(); ctx.globalAlpha *= al; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  strokePoly(P, p, { color: 'rgba(8,9,11,0.7)', w: w + 9 });
  ctx.shadowColor = col; ctx.shadowBlur = 20 * SS; const hd = strokePoly(P, p, { color: col, w }); ctx.shadowColor = 'transparent';
  strokePoly(P, p, { color: 'rgba(255,255,255,0.9)', w: 2.5 });
  if (hd && p < 0.995) { glow(hd.x, hd.y, 64, '170,215,255', 0.6); dot(hd.x, hd.y, 9, '#FFFFFF'); }
  ctx.restore();
}
