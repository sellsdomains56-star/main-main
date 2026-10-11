'use strict';
// ---------------------------------------------------------------------------
// Big, plain captions: a short phrase, each word pops in on the beat it is spoken and the spoken word sits in a pill.
// ---------------------------------------------------------------------------
let WORDS = [];   // {text, t, end, chunk}
let CHUNKS = [];  // {a, b, words:[idx...], lines:[[idx...]], layout}


function parseTiming(txt) {
  let chunk = -1; const words = [];
  for (const raw of txt.split('\n')) {
    const l = raw.trim(); if (!l || l.startsWith('#')) continue;
    if (l === '|') { chunk++; continue; }
    const m = l.match(/^([\d.]+)\s+(.+)$/); if (!m) continue;
    words.push({ t: +m[1], text: m[2], chunk });
  }
  for (let i = 0; i < words.length; i++) {
    const nxt = words[i + 1];
    words[i].end = Math.min(nxt ? nxt.t : DUR, words[i].t + 0.7);
  }
  WORDS = words;
  const by = {}; words.forEach((w, i) => (by[w.chunk] = by[w.chunk] || []).push(i));
  CHUNKS = Object.keys(by).map(Number).sort((a, b) => a - b).map(k => ({ words: by[k] }));
  CHUNKS.forEach((c, i) => {
    const first = WORDS[c.words[0]], last = WORDS[c.words[c.words.length - 1]];
    c.a = first.t - 0.04;
    const next = CHUNKS[i + 1] ? WORDS[CHUNKS[i + 1].words[0]].t - 0.04 : DUR;
    c.b = Math.min(next, last.end + 0.45);
    c.hardEnd = next - c.b < 0.02; // chunk is replaced immediately by the next
  });
}

const CAP = { size: 92, maxW: 900, lh: 108 };
const CAP_PILL = '#DDD1B4', CAP_INK = '#17181B';
function layoutChunk(c) {
  if (c.layout) return c.layout;
  const font = F.d(800, CAP.size), sp = M(' ', font) + 16;
  const ws = c.words.map(i => ({ i, txt: WORDS[i].text.toUpperCase(), w: M(WORDS[i].text.toUpperCase(), font, -1) }));
  const total = ws.reduce((a, b) => a + b.w, 0) + sp * (ws.length - 1);
  let lines = [ws];
  if (total > CAP.maxW) {                       // balanced split into two lines
    let best = 1, bestDiff = 1e9;
    for (let k = 1; k < ws.length; k++) {
      const a = ws.slice(0, k).reduce((s, x) => s + x.w, 0) + sp * (k - 1), b = ws.slice(k).reduce((s, x) => s + x.w, 0) + sp * (ws.length - k - 1);
      const d = Math.abs(a - b); if (d < bestDiff) { bestDiff = d; best = k; }
    }
    lines = [ws.slice(0, best), ws.slice(best)];
  }
  c.layout = { font, sp, lines: lines.map(L => ({ L, w: L.reduce((s, x) => s + x.w, 0) + sp * (L.length - 1) })) };
  return c.layout;
}

// Fv: 1 = face full-screen, 0 = graphics beat.  Words pop in on the beat; the word being spoken sits in a pill.
function drawCaptions(tg, Fv = 1) {
  const y0 = lerp(1500, 1380, Fv);
  for (const c of CHUNKS) {
    if (tg < c.a - 0.001 || tg > c.b + 0.2) continue;
    const outP = c.hardEnd ? prog(tg, c.b - 0.02, c.b + 0.06) : E.in2(prog(tg, c.b, c.b + 0.16));
    const alpha = 1 - outP; if (alpha <= 0.003) continue;
    const L = layoutChunk(c), nLines = L.lines.length, baseY = y0 - (nLines - 1) * CAP.lh * 0.5;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = L.font; ctx.letterSpacing = '-1px'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    L.lines.forEach((ln, li) => {
      let x = CX - ln.w / 2; const y = baseY + li * CAP.lh;
      for (const wd of ln.L) {
        const W_ = WORDS[wd.i], age = tg - W_.t, cx_ = x + wd.w / 2; x += wd.w + L.sp;
        if (age < -0.02) continue;
        const next = WORDS[wd.i + 1], isCur = !(next && next.chunk === W_.chunk && tg >= next.t - 0.02);
        const p = E.back(prog(age, 0, 0.2)), s = lerp(0.6, 1, p), a = ea(age, -0.02, 0.07);
        ctx.save(); ctx.translate(cx_, y); ctx.scale(s, s); ctx.globalAlpha *= a;
        if (isCur) {                                                       // the word being spoken: dark text in a champagne pill
          rr(-wd.w / 2 - 22, -CAP.size * 0.8, wd.w + 44, CAP.size * 1.06, 24); ctx.fillStyle = CAP_PILL; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18 * SS; ctx.shadowOffsetY = 5 * SS; ctx.fill();
          ctx.shadowColor = 'transparent'; ctx.fillStyle = CAP_INK; ctx.fillText(wd.txt, 0, 0);
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 4 * SS;
          ctx.lineWidth = 15; ctx.strokeStyle = 'rgba(12,13,15,0.92)'; ctx.strokeText(wd.txt, 0, 0);
          ctx.shadowColor = 'transparent'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(wd.txt, 0, 0);
        }
        ctx.restore();
      }
    });
    ctx.restore();
  }
}
