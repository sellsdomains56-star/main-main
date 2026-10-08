/* HAVA flavour cans: each label is drawn once onto a flat canvas, then wrapped around a cylinder
   slice by slice, so the can can turn in 3D without WebGL. Used by the home page and Flavours. */
(() => {
  const FLAVOURS = [
    { key: 'lingon', sv: 'LINGON', svName: 'Lingon', en: 'LINGONBERRY', body: '#F2D8DC', art: '#B0384D', ink: '#9C2E42', glow: '#8E2236', light: '#F2BCC6' },
    { key: 'hjortron', sv: 'HJORTRON', svName: 'Hjortron', en: 'CLOUDBERRY', body: '#F5E2C2', art: '#CC8526', ink: '#8A5710', glow: '#A3611A', light: '#F4D29C' },
    { key: 'flader', sv: 'FLÄDER', svName: 'Fläder', en: 'ELDERFLOWER', body: '#EDEFD3', art: '#949C3E', ink: '#5F6620', glow: '#6F7A2A', light: '#E4E8AA' },
    { key: 'blabar', sv: 'BLÅBÄR', svName: 'Blåbär', en: 'WILD BLUEBERRY', body: '#D9DDF0', art: '#3D4A8F', ink: '#36427F', glow: '#2C3B8C', light: '#C3CBF4' },
    { key: 'gurka', sv: 'GURKA & MYNTA', svName: 'Gurka & mynta', en: 'CUCUMBER & MINT', body: '#D9ECE1', art: '#3A8565', ink: '#2B634B', glow: '#23704F', light: '#B2E2C8' }
  ];
  const TW = 1100, TH = 900;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    };
  }
  function spaced(ctx, str, x, y, gap) {
    const chars = [...str];
    const widths = chars.map(c => ctx.measureText(c).width);
    let pos = x - (widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1)) / 2;
    ctx.textAlign = 'left';
    chars.forEach((c, i) => { ctx.fillText(c, pos, y); pos += widths[i] + gap; });
  }
  function glyph(ctx, ch, cx, top, h, w) {
    ctx.beginPath();
    if (ch === 'H') {
      ctx.moveTo(cx - w / 2, top); ctx.lineTo(cx - w / 2, top + h);
      ctx.moveTo(cx + w / 2, top); ctx.lineTo(cx + w / 2, top + h);
      ctx.moveTo(cx - w / 2, top + h / 2); ctx.lineTo(cx + w / 2, top + h / 2);
    } else if (ch === 'A') {
      ctx.moveTo(cx - w / 2, top + h); ctx.lineTo(cx, top); ctx.lineTo(cx + w / 2, top + h);
    } else {
      ctx.moveTo(cx - w / 2, top); ctx.lineTo(cx, top + h); ctx.lineTo(cx + w / 2, top);
    }
    ctx.stroke();
  }

  const art = new Image();
  let textures = [];
  const readyFns = [];

  function buildTexture(fl, index) {
    const c = document.createElement('canvas');
    c.width = TW; c.height = TH;
    const x = c.getContext('2d');
    x.fillStyle = fl.body;
    x.fillRect(0, 0, TW, TH);
    const sheen = x.createLinearGradient(0, 0, 0, TH);
    sheen.addColorStop(0, 'rgba(255, 255, 255, .45)');
    sheen.addColorStop(.45, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(1, 'rgba(0, 0, 0, .05)');
    x.fillStyle = sheen;
    x.fillRect(0, 0, TW, TH);

    if (art.complete && art.naturalWidth) {
      const tint = document.createElement('canvas');
      tint.width = art.naturalWidth; tint.height = art.naturalHeight;
      const tg = tint.getContext('2d');
      tg.drawImage(art, 0, 0);
      tg.globalCompositeOperation = 'source-in';
      tg.fillStyle = fl.art;
      tg.fillRect(0, 0, tint.width, tint.height);
      const ah = TW * tint.height / tint.width, ay = TH * .33;
      x.globalAlpha = .5;
      x.drawImage(tint, 0, ay, TW, ah);
      x.globalAlpha = 1;
      const fade = x.createLinearGradient(0, ay + ah * .78, 0, ay + ah + 2);
      fade.addColorStop(0, rgba(fl.body, 0));
      fade.addColorStop(1, fl.body);
      x.fillStyle = fade;
      x.fillRect(0, ay + ah * .78, TW, ah * .22 + 3);
    }

    const cx = TW / 2;
    x.strokeStyle = '#1A1A1A';
    x.lineCap = 'butt';
    x.lineJoin = 'miter';
    x.lineWidth = 6;
    const lh = TH * .085, lw = lh * .82, gap = TH * .05;
    let top = TH * .1;
    ['H', 'A', 'V', 'A'].forEach(ch => { glyph(x, ch, cx, top, lh, ch === 'H' ? lw * .8 : lw); top += lh + gap; });
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(cx - 58, TH * .672); x.lineTo(cx + 58, TH * .672); x.stroke();

    const font = (w, s) => `${w} ${s}px Montserrat, "Helvetica Neue", Arial, sans-serif`;
    x.textBaseline = 'alphabetic';
    x.fillStyle = '#1A1A1A';
    x.font = font(500, 30); spaced(x, fl.sv, cx, TH * .735, 6);
    x.fillStyle = fl.ink;
    x.font = font(600, 14); spaced(x, fl.en, cx, TH * .775, 4);
    x.fillStyle = '#1A1A1A';
    x.font = font(500, 13); spaced(x, 'SPARKLING WATER', cx, TH * .812, 4);
    x.font = font(400, 11); spaced(x, 'THE ESSENCE OF SWEDEN.', cx, TH * .848, 2.5);
    spaced(x, '330ML', cx, TH * .882, 2.5);

    // The back: the Λ mark, drawn on both edges so it wraps across the seam.
    [0, TW].forEach(bx => {
      x.strokeStyle = '#1A1A1A';
      x.lineWidth = 2;
      x.beginPath(); x.arc(bx, TH * .3, 30, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(bx - 10.5, TH * .3 + 10.5); x.lineTo(bx, TH * .3 - 12); x.lineTo(bx + 10.5, TH * .3 + 10.5); x.stroke();
      x.font = font(500, 13);
      spaced(x, 'SWEDEN', bx, TH * .4, 4);
    });

    const rnd = seeded(101 + index);
    for (let i = 0; i < 170; i++) {
      const dx = rnd() * TW, dy = TH * (.03 + rnd() * .94), s = 2 + rnd() * 5.5;
      x.fillStyle = 'rgba(255, 255, 255, .42)';
      x.beginPath(); x.ellipse(dx, dy, s * .8, s, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(0, 0, 0, .07)';
      x.beginPath(); x.ellipse(dx + s * .12, dy + s * .3, s * .7, s * .55, 0, 0, Math.PI); x.fill();
      x.fillStyle = 'rgba(255, 255, 255, .9)';
      x.beginPath(); x.arc(dx - s * .3, dy - s * .4, s * .24, 0, Math.PI * 2); x.fill();
    }
    return c;
  }

  function build() {
    textures = FLAVOURS.map(buildTexture);
    readyFns.forEach(fn => fn());
  }

  function geometry(w, h) {
    const Hc = h * .9;
    const R = Math.min(w * .4, Hc / 5.3);
    return { Hc, R, cx: w / 2, y0: (h - Hc) / 2 };
  }

  // Draws one can centred in the box (0, 0, w, h) of the context.
  function drawCan(ctx, w, h, index, angle, opts = {}) {
    const tex = textures[index];
    if (!tex) return;
    const { Hc, R, cx, y0 } = geometry(w, h);
    const ry = R * .17, shoulder = Hc * .07, base = Hc * .05;
    const yTop = y0 + ry, yB0 = y0 + shoulder + ry, yB1 = y0 + Hc - base - ry, yBot = y0 + Hc - ry;
    if (opts.clear !== false) ctx.clearRect(0, 0, w, h);

    const floor = ctx.createRadialGradient(cx, yBot + ry * .4, R * .2, cx, yBot + ry * .4, R * 1.6);
    floor.addColorStop(0, opts.shadow || 'rgba(0, 0, 0, .55)');
    floor.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floor;
    ctx.beginPath(); ctx.ellipse(cx, yBot + ry * .4, R * 1.6, ry * 1.6, 0, 0, Math.PI * 2); ctx.fill();

    const n = Math.max(36, Math.round(R));
    const step = 2 * R / n, bodyH = yB1 + ry - yB0, turn = angle / (Math.PI * 2);
    for (let i = 0; i < n; i++) {
      const x0 = cx - R + i * step;
      const a0 = Math.asin(clamp((x0 - cx) / R, -1, 1));
      const a1 = Math.asin(clamp((x0 + step - cx) / R, -1, 1));
      let sx = (0.5 + a0 / (Math.PI * 2) + turn) * TW;
      sx = ((sx % TW) + TW) % TW;
      const sw = Math.max(0.5, (a1 - a0) / (Math.PI * 2) * TW);
      if (sx + sw <= TW) {
        ctx.drawImage(tex, sx, 0, sw, TH, x0, yB0, step + .6, bodyH);
      } else {
        const first = TW - sx, k = first / sw;
        ctx.drawImage(tex, sx, 0, first, TH, x0, yB0, step * k + .3, bodyH);
        ctx.drawImage(tex, 0, 0, sw - first, TH, x0 + step * k, yB0, step * (1 - k) + .6, bodyH);
      }
    }

    const shade = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    shade.addColorStop(0, 'rgba(5, 12, 20, .62)');
    shade.addColorStop(.08, 'rgba(5, 12, 20, .18)');
    shade.addColorStop(.2, 'rgba(255, 255, 255, .26)');
    shade.addColorStop(.3, 'rgba(255, 255, 255, .05)');
    shade.addColorStop(.6, 'rgba(255, 255, 255, 0)');
    shade.addColorStop(.85, 'rgba(5, 12, 20, .16)');
    shade.addColorStop(1, 'rgba(5, 12, 20, .66)');
    ctx.fillStyle = shade;
    ctx.fillRect(cx - R, yB0, 2 * R, bodyH);

    const metal = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
    metal.addColorStop(0, '#4E555C');
    metal.addColorStop(.16, '#D9DDE1');
    metal.addColorStop(.26, '#F6F7F8');
    metal.addColorStop(.45, '#B8BEC3');
    metal.addColorStop(.75, '#99A0A7');
    metal.addColorStop(1, '#454C53');
    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(cx - R, yB1);
    ctx.ellipse(cx, yB1, R, ry, 0, Math.PI, 0, true);
    ctx.bezierCurveTo(cx + R, yB1 + base * .5, cx + R * .9, yBot - ry * .1, cx + R * .86, yBot);
    ctx.ellipse(cx, yBot, R * .86, ry * .86, 0, 0, Math.PI, false);
    ctx.bezierCurveTo(cx - R * .9, yBot - ry * .1, cx - R, yB1 + base * .5, cx - R, yB1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - R * .86, yTop);
    ctx.ellipse(cx, yTop, R * .86, ry * .86, 0, Math.PI, 0, true);
    ctx.bezierCurveTo(cx + R * .9, yTop + shoulder * .35, cx + R, yB0 - shoulder * .35, cx + R, yB0);
    ctx.ellipse(cx, yB0, R, ry, 0, 0, Math.PI, false);
    ctx.bezierCurveTo(cx - R, yB0 - shoulder * .35, cx - R * .9, yTop + shoulder * .35, cx - R * .86, yTop);
    ctx.fill();

    const lid = ctx.createLinearGradient(cx - R, yTop - ry, cx + R, yTop + ry);
    lid.addColorStop(0, '#BFC5CA');
    lid.addColorStop(.45, '#F4F5F6');
    lid.addColorStop(1, '#A2A9AF');
    ctx.fillStyle = lid;
    ctx.beginPath(); ctx.ellipse(cx, yTop, R * .86, ry * .86, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(70, 78, 86, .55)';
    ctx.lineWidth = Math.max(1, R * .02);
    ctx.beginPath(); ctx.ellipse(cx, yTop + ry * .08, R * .74, ry * .66, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(140, 148, 156, .95)';
    ctx.beginPath(); ctx.ellipse(cx, yTop - ry * .05, R * .16, ry * .26, 0, 0, Math.PI * 2); ctx.fill();

    const glint = ctx.createLinearGradient(cx - R * .66, 0, cx - R * .46, 0);
    glint.addColorStop(0, 'rgba(255, 255, 255, 0)');
    glint.addColorStop(.5, 'rgba(255, 255, 255, .4)');
    glint.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glint;
    ctx.fillRect(cx - R * .66, yB0 + ry, R * .2, yB1 - yB0 - ry);
  }

  function fit(canvas) {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: box.width, h: box.height };
  }

  window.HAVA_CANS = {
    FLAVOURS,
    drawCan,
    fit,
    geometry,
    onReady(fn) { readyFns.push(fn); if (textures.length) fn(); }
  };

  art.addEventListener('load', build);
  art.src = 'assets/art-mountains.png';
  build();
  if (document.fonts && document.fonts.load) document.fonts.load('500 30px Montserrat').then(build, () => {});
})();
