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
  T('Message…', X0 + 56, iy + 20, { font: F.d(700, 64), color: C.mute, align: 'left', alpha: (1 - ea(t, o.typeA, o.typeA + 0.06)) * (1 - sent) });
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
