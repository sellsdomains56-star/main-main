'use strict';
// ---------------------------------------------------------------------------
// Karaoke-style captions: a short phrase sits dim, each word lights up on the
// exact moment it is spoken. Key words (numbers, brands) light up gold.
// ---------------------------------------------------------------------------
let WORDS = [];   // {text, t, end, chunk}
let CHUNKS = [];  // {a, b, words:[idx...], lines:[[idx...]], layout}

const KEY = /^(\d|AED|US\$|trillion|billion|Mubadala|ADIA|Aldar|Aldar's|Modon's|Talay|Yas|Riva|Reserve|Hudayriyat|Golf|Estates|GDP|beyond|Portugal's)/i;

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

const CAP = { size: 64, maxW: 900, lh: 86, y: 1376 };
function layoutChunk(c) {
  if (c.layout) return c.layout;
  const font = F.d(600, CAP.size), sp = M(' ', font) + 9;
  const ws = c.words.map(i => ({ i, w: M(WORDS[i].text, font, -1) }));
  const total = ws.reduce((a, b) => a + b.w, 0) + sp * (ws.length - 1);
  let lines = [ws];
  if (total > CAP.maxW) {
    // balanced two-line split
    let best = 1, bestDiff = 1e9;
    for (let k = 1; k < ws.length; k++) {
      const a = ws.slice(0, k).reduce((s, x) => s + x.w, 0) + sp * (k - 1);
      const b = ws.slice(k).reduce((s, x) => s + x.w, 0) + sp * (ws.length - k - 1);
      const d = Math.abs(a - b); if (d < bestDiff && a <= CAP.maxW && b <= CAP.maxW) { bestDiff = d; best = k; }
    }
    lines = [ws.slice(0, best), ws.slice(best)];
  }
  c.layout = { font, sp, lines: lines.map(L => ({ L, w: L.reduce((s, x) => s + x.w, 0) + sp * (L.length - 1) })) };
  return c.layout;
}

function drawCaptions(t) {
  for (const c of CHUNKS) {
    if (t < c.a - 0.001 || t > c.b + 0.25) continue;
    const inP = E.out4(prog(t, c.a, c.a + 0.28));
    const outP = c.hardEnd ? prog(t, c.b - 0.02, c.b + 0.08) : E.in2(prog(t, c.b, c.b + 0.22));
    const alpha = inP * (1 - outP);
    if (alpha <= 0.003) continue;
    const L = layoutChunk(c);
    const nLines = L.lines.length;
    const baseY = CAP.y - (nLines - 1) * CAP.lh * 0.5;
    ctx.save(); ctx.globalAlpha *= alpha;
    const dy = (1 - inP) * 26 - outP * 10; ctx.translate(0, dy);
    L.lines.forEach((ln, li) => {
      let x = CX - ln.w / 2; const y = baseY + li * CAP.lh;
      for (const wd of ln.L) {
        const W_ = WORDS[wd.i];
        const lit = E.out3(prog(t, W_.t - 0.02, W_.t + 0.14));
        const key = KEY.test(W_.text);
        const pop = 1 + 0.04 * Math.sin(Math.PI * clamp((t - W_.t) / 0.28));
        const litColor = key ? C.gold : C.ink;
        const cxw = x + wd.w / 2;
        // dim base, lit overlay (cross-fade) so colour transition is smooth
        T(W_.text, cxw, y, { font: L.font, color: C.ink, alpha: 0.26 * (1 - lit), ls: -1, sx: 1 });
        T(W_.text, cxw, y, { font: L.font, color: litColor, alpha: lit, ls: -1, sx: pop, sy: pop });
        x += wd.w + L.sp;
      }
    });
    ctx.restore();
  }
}
