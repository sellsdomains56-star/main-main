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

const CAP = { size: 68, maxW: 840, lh: 80, y: 1340 };   // y / scale are driven by main.js (face vs half-and-half)
const CAP_GOLD = '#F6CE76', CAP_HOT = '#FFE08A';
function layoutChunk(c) {
  if (c.layout) return c.layout;
  const font = F.d(800, CAP.size), sp = M(' ', font) + 12;
  const ws = c.words.map(i => ({ i, txt: WORDS[i].text.toUpperCase(), w: M(WORDS[i].text.toUpperCase(), font, -1) }));
  const total = ws.reduce((a, b) => a + b.w, 0) + sp * (ws.length - 1);
  let lines = [ws];
  if (total > CAP.maxW) {                       // balanced split into two lines
    let best = 1, bestDiff = 1e9;
    for (let k = 1; k < ws.length; k++) {
      const a = ws.slice(0, k).reduce((s, x) => s + x.w, 0) + sp * (k - 1), b = ws.slice(k).reduce((s, x) => s + x.w, 0) + sp * (ws.length - k - 1);
      const d = Math.abs(a - b); if (d < bestDiff && a <= CAP.maxW + 60 && b <= CAP.maxW + 60) { bestDiff = d; best = k; }
    }
    lines = [ws.slice(0, best), ws.slice(best)];
  }
  c.layout = { font, sp, lines: lines.map(L => ({ L, w: L.reduce((s, x) => s + x.w, 0) + sp * (L.length - 1) })) };
  return c.layout;
}

// Fv: 1 = face full-screen, 0 = half-and-half.  Words pop in on the beat; the word being spoken lights up.
function drawCaptions(tg, Fv = 1) {
  const y0 = lerp(1470, 1335, Fv), sc = 1.08;
  for (const c of CHUNKS) {
    if (tg < c.a - 0.001 || tg > c.b + 0.2) continue;
    const outP = c.hardEnd ? prog(tg, c.b - 0.02, c.b + 0.06) : E.in2(prog(tg, c.b, c.b + 0.16));
    const alpha = 1 - outP; if (alpha <= 0.003) continue;
    const L = layoutChunk(c), nLines = L.lines.length, baseY = y0 - (nLines - 1) * CAP.lh * 0.5 * sc;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.font = L.font; ctx.letterSpacing = '-1px'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    L.lines.forEach((ln, li) => {
      let x = CX - (ln.w * sc) / 2; const y = baseY + li * CAP.lh * sc;
      for (const wd of ln.L) {
        const W_ = WORDS[wd.i], age = tg - W_.t, cx_ = x + (wd.w * sc) / 2; x += (wd.w + L.sp) * sc;
        if (age < -0.02) continue;
        const next = WORDS[wd.i + 1], isCur = !(next && next.chunk === W_.chunk && tg >= next.t - 0.02);
        const p = E.back(prog(age, 0, 0.2)), s = lerp(0.55, 1, p) * (1 + 0.08 * Math.exp(-age * 9)) * sc, a = ea(age, -0.02, 0.07);
        const key = KEY.test(W_.text), col = key ? CAP_GOLD : isCur ? CAP_HOT : '#FFFFFF';
        ctx.save(); ctx.translate(cx_, y); ctx.scale(s, s); ctx.globalAlpha *= a;
        ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 4 * SS;
        ctx.lineWidth = 13; ctx.strokeStyle = 'rgba(6,6,8,0.94)'; ctx.strokeText(wd.txt, 0, 0);
        ctx.shadowColor = 'transparent'; ctx.fillStyle = col; ctx.fillText(wd.txt, 0, 0);
        ctx.restore();
      }
    });
    ctx.restore();
  }
}
