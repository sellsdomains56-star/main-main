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
function Tfit(str, x, y, o, maxW) { const w = M(str, o.font, o.ls || 0); T(str, x, y, { ...o, sx: Math.min(1, maxW / w) * (o.sx || 1) }); }
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
function sceneChat(t, o) {                                              // o: {head, typeA, typeB, send, msg, reply, show}
  const ce = ea(t, o.show, o.show + 0.7, E.out4);
  ctx.save(); ctx.globalAlpha *= ce; ctx.translate(0, (1 - ce) * 40); Tfit(o.head, CX, 560, { font: F.i(112), color: C.ink }, 900); ctx.restore();
  if (o.sub) { const se = ea(t, o.show + 0.35, o.show + 1.0, E.out4); ctx.save(); ctx.globalAlpha *= se; ctx.translate(0, (1 - se) * 24); Tfit(o.sub, CX, 650, { font: F.d(700, 44), ls: 1, color: C.dim }, 900); ctx.restore(); }
  const send = o.send, sent = ea(t, send, send + 0.35), ia = ea(t, o.show + 0.6, o.show + 1.2, E.out4), iy = 1200;
  ctx.save(); ctx.globalAlpha *= ia;
  rr(80, iy - 70, 920, 140, 70); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
  const typed = o.msg.slice(0, Math.floor(o.msg.length * ea(t, o.typeA, o.typeB, E.lin) + 0.0001));
  T(typed, 140, iy + 20, { font: F.d(600, 64), color: C.ink, align: 'left', alpha: 1 - sent });
  if (t < send) { const cur = (Math.floor(t * 2.4) % 2 === 0) ? 1 : 0.15, cw2 = M(typed, F.d(600, 64)); line(140 + cw2 + 8, iy - 34, 140 + cw2 + 8, iy + 34, { color: C.gold, w: 4, alpha: cur }); }
  T('Message…', 140, iy + 20, { font: F.d(600, 64), color: C.mute, align: 'left', alpha: (1 - ea(t, o.typeA, o.typeA + 0.06)) * (1 - sent) });
  dot(930, iy, 52, C.gold, 1); icon('plane', 930, iy, 22, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent });
  ctx.restore();
  const b1 = ea(t, send, send + 0.5, E.out4);
  if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 40); const bw = M(o.msg, F.d(700, 62)) + 90; rr(1000 - bw, 770, bw, 120, 60); ctx.fillStyle = C.gold; ctx.fill(); T(o.msg, 1000 - bw / 2, 850, { font: F.d(700, 62), color: '#17181B' }); ctx.restore(); }
  const b2 = ea(t, send + 0.55, send + 1.05, E.out4);
  if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 40); const bw = M(o.reply, F.d(700, 62)) + 150; rr(80, 925, bw, 120, 60); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
    icon('check', 150, 985, 26, { p: ea(t, send + 0.8, send + 1.2), color: C.gold, w: 5 }); T(o.reply, 210, 1005, { font: F.d(700, 62), color: C.ink, align: 'left' }); ctx.restore(); }
}

// a statement that rises into place (fits the 940 px column)
function bw(t, txt, y, a, o = {}) {
  const e = enter(t, a, o.d ?? 0.55, o.dist ?? 36), out = o.out ? 1 - ea(t, o.out, o.out + 0.3) : 1;
  Tfit(txt, CX, y + e.dy, { font: F.d(o.w || 800, o.size || 100), ls: o.ls ?? 2, color: o.color || C.ink, alpha: e.a * out * (o.alpha ?? 1) }, o.maxW || 940);
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
    const p = ea(t, tHit, tHit + 0.3, E.out5), a = ea(t, tHit, tHit + 0.14, E.out2), f = F.d(800, o.size || 108), sw = M(txt, f, 10) + 90;
    ctx.save(); ctx.globalAlpha *= A * a; ctx.translate(CX, o.y || 1060); ctx.rotate(o.rot ?? -0.05); ctx.scale(lerp(1.7, 1, p), lerp(1.7, 1, p));
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
  T('Imagery © Esri, Maxar, Earthstar Geographics', CX, 1884, { font: F.d(500, 26), color: 'rgba(243,239,230,0.6)' });
  ctx.restore();
}
