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

const CAP = { size: 58, maxW: 820, lh: 82, padX: 26, boxH: 74, r: 16 };
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

// Captions: frosted-glass pill. The scene behind the text is copied, blurred and darkened (backdrop blur), so white bold text stays readable on a white article card,
// a bright satellite tile or his face alike - no hard white bar. One phrase at a time; the text is centred in the pill by CAP HEIGHT (not by the font's line box).
// CAP.style = 'glass' (default) | 'bar' (the old black-on-white box). Fv: 1 = face full-screen, 0 = graphics beat.
CAP.pillH = 84; CAP.padX = 42; CAP.cy = 1352; CAP.pitch = 94; CAP.blur = 18; CAP.pad = 46; CAP.style = 'glass';
let CAP_OFF = null, CAP_H = 0;
function capHeight(font) { if (!CAP_H) { ctx.save(); ctx.font = font; ctx.letterSpacing = '0px'; CAP_H = ctx.measureText('H').actualBoundingBoxAscent; ctx.restore(); } return CAP_H; }
function glassPill(x, y, w, h) {                                                   // backdrop blur + tint + hairline, drawn in canvas units (ctx is scaled by SS)
  const r = h / 2, pad = CAP.pad, cv = ctx.canvas, k = cv.width / W;                // k = pixels per canvas unit (the supersampling)
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.38)'; ctx.shadowBlur = 34 * SS; ctx.shadowOffsetY = 8 * SS; rr(x, y, w, h, r); ctx.fillStyle = 'rgba(12,12,16,0.5)'; ctx.fill(); ctx.restore();
  const sx = Math.max(0, Math.round((x - pad) * k)), sy = Math.max(0, Math.round((y - pad) * k)), sw = Math.min(cv.width - sx, Math.round((w + 2 * pad) * k)), sh = Math.min(cv.height - sy, Math.round((h + 2 * pad) * k));
  if (!CAP_OFF) CAP_OFF = document.createElement('canvas');
  if (CAP_OFF.width !== sw || CAP_OFF.height !== sh) { CAP_OFF.width = sw; CAP_OFF.height = sh; }
  const oc = CAP_OFF.getContext('2d'); oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.clearRect(0, 0, sw, sh); oc.drawImage(cv, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.save(); rr(x, y, w, h, r); ctx.clip(); ctx.filter = `blur(${CAP.blur * k}px)`;
  ctx.drawImage(CAP_OFF, sx / k, sy / k, sw / k, sh / k); ctx.filter = 'none';
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(18,18,22,0.52)'); g.addColorStop(1, 'rgba(8,8,10,0.66)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);   // darken: keeps white text readable on white cards
  const gl = ctx.createLinearGradient(0, y, 0, y + h * 0.5); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.fillRect(x, y, w, h * 0.5);   // faint glass sheen on the top half
  ctx.restore();
  ctx.save(); rr(x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}
function drawCaptions(tg, Fv = 1) {
  for (const c of CHUNKS) {
    if (tg < c.a - 0.001 || tg > c.b + 0.2) continue;
    const outP = c.hardEnd ? (tg >= c.b ? 1 : 0) : E.in2(prog(tg, c.b, c.b + Math.min(0.12, Math.max(0.02, c.gap - 0.02))));
    const inP = ea(tg, c.a, c.a + 0.07, E.out3), alpha = inP * (1 - outP); if (alpha <= 0.003) continue;
    const L = layoutChunk(c), nLines = L.lines.length, cy0 = CAP.cy - (nLines - 1) * CAP.pitch * 0.5, capH = capHeight(L.font);
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(0, (1 - inP) * 12); ctx.font = L.font; ctx.letterSpacing = '0px'; ctx.textAlign = 'center';
    L.lines.forEach((ln, li) => {
      const cy = cy0 + li * CAP.pitch, w = ln.w + CAP.padX * 2, h = CAP.pillH;
      if (CAP.style === 'bar') {                                                    // the old look: black on white
        rr(CX - w / 2, cy - h / 2, w, h, CAP.r); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.fillStyle = '#0A0A0B'; ctx.fillText(ln.txt, CX, cy + capH / 2); return;
      }
      glassPill(CX - w / 2, cy - h / 2, w, h);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8 * SS; ctx.shadowOffsetY = 2 * SS; ctx.fillStyle = '#FFFFFF'; ctx.fillText(ln.txt, CX, cy + capH / 2); ctx.restore();   // centred on cap height
    });
    ctx.restore();
  }
}
