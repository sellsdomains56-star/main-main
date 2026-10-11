'use strict';
// ---------------------------------------------------------------------------
// Captions: small, bold, black on a white box, one short phrase at a time. Words/phrases come from timeline.json.
// ---------------------------------------------------------------------------
let WORDS = [];   // {text, t, end, chunk}
let CHUNKS = [];  // {a, b, words:[idx...], layout}

function parseTimeline(tl) {
  WORDS = tl.words.map(w => ({ text: w.text, t: w.t, end: w.e, chunk: w.chunk }));
  const by = {}; WORDS.forEach((w, i) => (by[w.chunk] = by[w.chunk] || []).push(i));
  CHUNKS = Object.keys(by).map(Number).sort((a, b) => a - b).map(k => ({ words: by[k] }));
  CHUNKS.forEach((c, i) => {
    const first = WORDS[c.words[0]], last = WORDS[c.words[c.words.length - 1]];
    c.a = first.t - 0.04;
    const next = CHUNKS[i + 1] ? WORDS[CHUNKS[i + 1].words[0]].t - 0.04 : DUR;
    c.b = Math.min(next, last.end + 0.45);
    c.hardEnd = next - c.b < 0.02; // chunk is replaced immediately by the next
    c.gap = next - c.b;            // room before the next phrase starts: the fade-out must finish inside it (no two captions at once)
  });
}

const CAP = { size: 58, maxW: 860, lh: 82, padX: 26, boxH: 74, r: 16 };
function layoutChunk(c) {
  if (c.layout) return c.layout;
  const font = F.d(800, CAP.size), txt = i => WORDS[i].text.toUpperCase(), sp = M(' ', font);
  const ws = c.words.map(i => ({ i, txt: txt(i), w: M(txt(i), font, 0) }));
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
  c.layout = { font, lines: lines.map(L => ({ txt: L.map(x => x.txt).join(' '), w: L.reduce((s, x) => s + x.w, 0) + sp * (L.length - 1) })) };
  return c.layout;
}

// Fv: 1 = face full-screen, 0 = graphics beat.  Black bold text on a white box per line; the phrase appears and goes.
function drawCaptions(tg, Fv = 1) {
  const y0 = lerp(1500, 1380, Fv);
  for (const c of CHUNKS) {
    if (tg < c.a - 0.001 || tg > c.b + 0.2) continue;
    const outP = c.hardEnd ? (tg >= c.b ? 1 : 0) : E.in2(prog(tg, c.b, c.b + Math.min(0.12, Math.max(0.02, c.gap - 0.02))));
    const inP = ea(tg, c.a, c.a + 0.07, E.out3), alpha = inP * (1 - outP); if (alpha <= 0.003) continue;
    const L = layoutChunk(c), nLines = L.lines.length, baseY = y0 - (nLines - 1) * CAP.lh * 0.5;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(0, (1 - inP) * 12); ctx.font = L.font; ctx.letterSpacing = '0px'; ctx.textAlign = 'center';
    L.lines.forEach((ln, li) => {
      const y = baseY + li * CAP.lh, bw = ln.w + CAP.padX * 2;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 4 * SS;
      rr(CX - bw / 2, y - CAP.size * 0.76 - (CAP.boxH - CAP.size) / 2 + 4, bw, CAP.boxH, CAP.r); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
      ctx.fillStyle = '#0A0A0B'; ctx.fillText(ln.txt, CX, y);
    });
    ctx.restore();
  }
}
