/* wepink Gulf — the silk behind every page.
 *
 * Two layers, fixed under all content:
 *  - a sheet of satin (WebGL): slow folds that lift and part around the
 *    cursor or finger, and a ripple that spreads from every tap or click;
 *  - fine pink threads with glints running along them (2D canvas), which
 *    bend away from the cursor.
 * Without WebGL only the threads show. Both sleep while the tab is hidden,
 * draw at about 30 frames a second, and move at half speed when the device
 * asks for reduced motion. Colours follow the black / white switch.
 */
window.WP_SILK = (function () {
  const TAU = Math.PI * 2;
  const FRAME = 33; // ms between frames
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNoir = () => document.documentElement.dataset.tone === "noir";

  // The pointer, in CSS pixels. `sx/sy` trail it softly; `energy` rises while
  // it moves and fades when it rests, so the silk settles back by itself.
  const P = { x: -1e4, y: -1e4, sx: -1e4, sy: -1e4, energy: 0, taps: [] };
  function track() {
    window.addEventListener(
      "pointermove",
      (e) => {
        const first = P.x < -1e3;
        const step = first ? 0 : Math.hypot(e.clientX - P.x, e.clientY - P.y);
        P.x = e.clientX;
        P.y = e.clientY;
        if (first) {
          P.sx = P.x;
          P.sy = P.y;
        }
        P.energy = Math.min(1, P.energy + step / 160);
      },
      { passive: true }
    );
    window.addEventListener(
      "pointerdown",
      (e) => {
        P.taps.push({ x: e.clientX, y: e.clientY, at: performance.now() });
        if (P.taps.length > 2) P.taps.shift();
      },
      { passive: true }
    );
  }
  function ease() {
    P.sx += (P.x - P.sx) * 0.14;
    P.sy += (P.y - P.sy) * 0.14;
    P.energy *= 0.965;
  }

  /* ---------- satin (WebGL) ---------- */
  const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uT;
uniform vec3 uM;      // pointer x, y (0..1 of the view, y down), energy
uniform vec4 uTap0;   // x, y, age in seconds, strength
uniform vec4 uTap1;
uniform float uScroll;
uniform vec3 uBase;
uniform vec3 uDeep;
uniform vec3 uSheen;
uniform float uGloss;
uniform float uRelief;
uniform float uGlow;

float aspect() { return uRes.x / uRes.y; }

// long satin folds, warped so they drift and twist
float folds(vec2 p, float t) {
  vec2 q = p;
  q.x += 0.42 * sin(q.y * 1.1 + t * 0.19);
  q.y += 0.28 * sin(q.x * 0.9 - t * 0.15);
  float f = sin(q.x * 1.4 + q.y * 0.7 + t * 0.30);
  f += 0.55 * sin(q.x * 0.55 - q.y * 1.6 - t * 0.22 + 1.7);
  f += 0.18 * sin((q.x + q.y) * 2.7 + t * 0.41);
  return f;
}

float ripple(vec2 p, vec4 tap) {
  if (tap.w <= 0.0) return 0.0;
  vec2 c = vec2(tap.x * aspect(), tap.y) * 3.0;
  float d = length(p - c);
  float front = d - tap.z * 1.5;
  return tap.w * exp(-front * front * 9.0) * exp(-tap.z * 1.3) * 0.75;
}

// the cloth's height: folds, lifted and parted under the pointer, plus ripples
float cloth(vec2 p, float t, out float lift) {
  vec2 m = vec2(uM.x * aspect(), uM.y) * 3.0;
  vec2 d = p - m;
  lift = uM.z * exp(-dot(d, d) * 1.6);
  float h = folds(p - d * lift * 0.45 + vec2(0.0, uScroll), t) + lift * 1.05;
  return h + ripple(p, uTap0) + ripple(p, uTap1);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uRes.y * 3.0;
  float t = uT;
  float lift;
  float l0;
  float e = 0.03;
  float h = cloth(p, t, lift);
  float hx = cloth(p + vec2(e, 0.0), t, l0);
  float hy = cloth(p + vec2(0.0, e), t, l0);
  vec3 n = normalize(vec3((h - hx) / e * uRelief, (h - hy) / e * uRelief, 1.0));
  vec3 light = normalize(vec3(-0.45, -0.6, 0.66));
  float diffuse = dot(n, light) * 0.5 + 0.5;
  vec3 half_ = normalize(light + vec3(0.0, 0.0, 1.0));
  float facing = max(dot(n, half_), 0.0);
  float sheen = pow(facing, 14.0);
  float spark = pow(facing, 80.0);
  vec3 col = mix(uDeep, uBase, smoothstep(0.2, 0.98, diffuse));
  col += uSheen * (sheen * uGlow + spark * uGloss + lift * 0.12);
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}`;
  // [base, deep, sheen, gloss, relief, glow] per tone, colours as 0..1 RGB
  const TONES = {
    blanc: [[1.0, 0.976, 0.986], [0.94, 0.8, 0.868], [1.0, 1.0, 1.0], 0.6, 0.42, 0.5],
    noir: [[0.11, 0.03, 0.068], [0.02, 0.004, 0.011], [1.0, 0.2, 0.6], 0.38, 0.32, 0.36],
  };

  function satin(wrap) {
    const cv = document.createElement("canvas");
    cv.className = "silk-satin";
    let gl = null;
    try {
      gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "low-power" });
    } catch (e) {
      gl = null;
    }
    if (!gl) return null;
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = shader(gl.VERTEX_SHADER, VERT);
    const fs = shader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uRes", "uT", "uM", "uTap0", "uTap1", "uScroll", "uBase", "uDeep", "uSheen", "uGloss", "uRelief", "uGlow"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    let lost = false;
    cv.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      lost = true;
      cv.remove();
    });
    wrap.appendChild(cv);

    function size() {
      // The cloth is soft, so a half-resolution buffer stretched by CSS looks
      // the same and costs a quarter of the work.
      const scale = window.innerWidth > 1600 ? 0.4 : 0.5;
      cv.width = Math.max(2, Math.round(window.innerWidth * scale));
      cv.height = Math.max(2, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, cv.width, cv.height);
    }
    function draw(time, now) {
      if (lost) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tone = TONES[isNoir() ? "noir" : "blanc"];
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, time);
      gl.uniform3f(U.uM, P.sx / vw, P.sy / vh, P.energy);
      [U.uTap0, U.uTap1].forEach((u, i) => {
        const tap = P.taps[i];
        const age = tap ? (now - tap.at) / 1000 : 0;
        gl.uniform4f(u, tap ? tap.x / vw : 0, tap ? tap.y / vh : 0, age, tap && age < 4 ? 1 : 0);
      });
      gl.uniform1f(U.uScroll, (window.scrollY || 0) / vh * 0.6);
      gl.uniform3fv(U.uBase, tone[0]);
      gl.uniform3fv(U.uDeep, tone[1]);
      gl.uniform3fv(U.uSheen, tone[2]);
      gl.uniform1f(U.uGloss, tone[3]);
      gl.uniform1f(U.uRelief, tone[4]);
      gl.uniform1f(U.uGlow, tone[5]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    return { size, draw };
  }

  /* ---------- threads (2D canvas) ---------- */
  const RIBBONS = [
    { from: 0.16, to: 0.66, amp: 0.08, waves: 0.8, speed: 0.035, spread: 0.15, twists: 1.1, spin: 0.05, phase: 0, glints: [0, 0.45] },
    { from: 0.9, to: 0.34, amp: 0.06, waves: 1.1, speed: -0.028, spread: 0.11, twists: 1.5, spin: -0.04, phase: 2.4, glints: [0.2, 0.7] },
  ];
  function threads(wrap, onSatin) {
    const cv = document.createElement("canvas");
    cv.className = "silk-threads";
    const ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) return null;
    wrap.appendChild(cv);
    let w = 0;
    let h = 0;
    let dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    // centre line and half-width of a ribbon at x (0..1), in pixels
    function at(r, x, time, drift) {
      const y = r.from + (r.to - r.from) * x + r.amp * Math.sin(TAU * (x * r.waves + time * r.speed) + r.phase + drift);
      const twist = Math.cos(TAU * (x * r.twists + time * r.spin) + r.phase);
      return [y * h, twist * r.spread * h * 0.5];
    }
    // threads near the pointer are combed aside
    const REACH = 2 * 110 * 110;
    function comb(x, y) {
      if (P.energy < 0.01) return y;
      const dx = x - P.sx;
      const dy = y - P.sy;
      const f = Math.exp(-(dx * dx + dy * dy) / REACH) * P.energy;
      return y + (dy >= 0 ? 1 : -1) * f * 46;
    }
    function draw(time) {
      const noir = isNoir();
      const drift = (window.scrollY || 0) * 0.0012;
      const count = w < 720 ? 22 : 34;
      const steps = Math.max(40, Math.round(w / 14));
      const rgb = noir ? "255, 46, 147" : "230, 0, 126";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = noir ? "lighter" : "source-over";
      ctx.lineWidth = noir ? 0.8 : 0.7;
      const strength = (noir ? 0.2 : 0.16) * (onSatin ? 0.85 : 1);
      for (const r of RIBBONS) {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(${rgb}, 0)`);
        g.addColorStop(0.18, `rgba(${rgb}, 1)`);
        g.addColorStop(0.55, noir ? "rgba(255, 140, 198, 1)" : `rgba(${rgb}, 1)`);
        g.addColorStop(0.85, `rgba(${rgb}, 1)`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.strokeStyle = g;
        const line = [];
        for (let s = 0; s <= steps; s++) line.push(at(r, s / steps, time, drift));
        for (let i = 0; i < count; i++) {
          const u = (i / (count - 1)) * 2 - 1; // -1 edge .. +1 edge
          ctx.globalAlpha = strength * (1 - 0.65 * Math.abs(u));
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const [y, half] = line[s];
            const x = (s / steps) * w;
            const yy = comb(x, y + u * half);
            s ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
          }
          ctx.stroke();
        }
        // glints gliding along the ribbon
        ctx.globalAlpha = 1;
        for (const off of r.glints) {
          const x = (((time * 0.045 + off) % 1) + 1) % 1;
          const px = x * w;
          const y = comb(px, at(r, x, time, drift)[0]);
          const edge = Math.min(1, x * 6, (1 - x) * 6);
          const glow = ctx.createRadialGradient(px, y, 0, px, y, 22);
          glow.addColorStop(0, noir ? `rgba(255, 220, 238, ${0.9 * edge})` : `rgba(255, 255, 255, ${0.95 * edge})`);
          glow.addColorStop(0.25, `rgba(${rgb}, ${(noir ? 0.45 : 0.28) * edge})`);
          glow.addColorStop(1, `rgba(${rgb}, 0)`);
          ctx.fillStyle = glow;
          ctx.fillRect(px - 22, y - 22, 44, 44);
        }
      }
      ctx.globalAlpha = 1;
    }
    return { size, draw };
  }

  function start() {
    if (document.querySelector(".silk")) return;
    const wrap = document.createElement("div");
    wrap.className = "silk";
    wrap.setAttribute("aria-hidden", "true");
    document.body.prepend(wrap);
    const sheet = satin(wrap);
    const lines = threads(wrap, !!sheet);
    const layers = [sheet, lines].filter(Boolean);
    if (!layers.length) return wrap.remove();
    if (sheet) document.documentElement.classList.add("has-silk");
    track();
    const size = () => layers.forEach((l) => l.size());
    size();
    window.addEventListener("resize", size);
    const begin = performance.now();
    let raf = 0;
    let last = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME) return;
      last = now;
      ease();
      const time = ((now - begin) / 1000) * (calm ? 0.5 : 1);
      layers.forEach((l) => l.draw(time, now));
    }
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    });
    raf = requestAnimationFrame(frame);
  }

  return { start };
})();
