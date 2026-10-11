/* wepink Gulf — product renderings drawn as SVG.
 * Used until the brand's packshots arrive: set `image: "assets/products/x.webp"`
 * on a product in data.js and the photo is shown instead.
 */
window.WP_ART = (function () {
  let uid = 0;
  const INK = "#1C0A14";
  const FONT = "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function defs(id, c, c2) {
    return `<defs>
      <linearGradient id="${id}g" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${c}" stop-opacity=".78"/>
        <stop offset=".45" stop-color="${c}"/>
        <stop offset="1" stop-color="${c}" stop-opacity=".9"/>
      </linearGradient>
      <linearGradient id="${id}s" x1="0" x2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".0"/>
        <stop offset=".5" stop-color="#ffffff" stop-opacity=".55"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${id}m" x1="0" x2="1">
        <stop offset="0" stop-color="#B9A7AF"/>
        <stop offset=".35" stop-color="#FFFFFF"/>
        <stop offset=".7" stop-color="#D9CCD2"/>
        <stop offset="1" stop-color="#9E8A93"/>
      </linearGradient>
      <linearGradient id="${id}a" x1="0" x2="1">
        <stop offset="0" stop-color="${c2}" stop-opacity=".85"/>
        <stop offset=".4" stop-color="#ffffff" stop-opacity=".9"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <linearGradient id="${id}glass" x1="0" x2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
        <stop offset=".5" stop-color="#ffffff" stop-opacity=".18"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity=".45"/>
      </linearGradient>
      <radialGradient id="${id}sh" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="${INK}" stop-opacity=".28"/>
        <stop offset="1" stop-color="${INK}" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
  }

  function shadow(id, cx, w) {
    return `<ellipse cx="${cx}" cy="444" rx="${w}" ry="14" fill="url(#${id}sh)"/>`;
  }

  function label(x, y, w, h, color, line, type, size, opts) {
    const o = opts || {};
    const cx = x + w / 2;
    const fs = o.fs || 22;
    // Long names wrap onto two lines and shrink to fit the label.
    const words = String(line).split(" ");
    const lines = line.length > 10 && words.length > 1 ? [words[0], words.slice(1).join(" ")] : [line];
    const longest = Math.max(...lines.map((l) => l.length));
    const ls = Math.min(o.ls || 14, (w - 14) / (longest * 0.62));
    const nameY = lines.length > 1 ? [0.52, 0.52 + (ls * 1.15) / h] : [0.58];
    const typeY = lines.length > 1 ? nameY[1] + 0.15 : 0.76;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx || 10}" fill="#fff" fill-opacity="${o.op || 0.94}"/>
      <text x="${cx}" y="${y + h * (lines.length > 1 ? 0.3 : 0.34)}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${fs}" letter-spacing="-0.5" fill="${color}">wepink</text>
      ${lines.map((l, i) => `<text x="${cx}" y="${y + h * nameY[i]}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${ls.toFixed(1)}" fill="${INK}">${esc(l)}</text>`).join("")}
      <text x="${cx}" y="${y + h * typeY}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="${o.ts || 8}" letter-spacing="1.6" fill="${INK}" fill-opacity=".62">${esc(type.toUpperCase())}</text>
      ${size ? `<text x="${cx}" y="${y + h * Math.min(0.94, typeY + 0.14)}" text-anchor="middle" font-family="${FONT}" font-weight="500" font-size="${o.ts || 8}" fill="${INK}" fill-opacity=".5">${esc(size)}</text>` : ""}`;
  }

  const shapes = {
    splash(id, p) {
      return `${shadow(id, 200, 96)}
        <rect x="150" y="70" width="34" height="11" rx="5" fill="${INK}"/>
        <rect x="170" y="54" width="60" height="40" rx="10" fill="${INK}"/>
        <rect x="176" y="58" width="10" height="32" rx="5" fill="#fff" fill-opacity=".14"/>
        <rect x="178" y="92" width="44" height="24" rx="4" fill="url(#${id}m)"/>
        <rect x="186" y="114" width="28" height="18" fill="url(#${id}m)" opacity=".8"/>
        <rect x="126" y="128" width="148" height="314" rx="36" fill="url(#${id}g)"/>
        <rect x="126" y="128" width="148" height="314" rx="36" fill="url(#${id}glass)"/>
        <rect x="140" y="150" width="14" height="270" rx="7" fill="#fff" fill-opacity=".38"/>
        <rect x="252" y="170" width="6" height="200" rx="3" fill="#fff" fill-opacity=".22"/>
        ${label(150, 244, 100, 132, p.color, p.line, p.typeName.en, p.sizeText)}`;
    },
    perfume(id, p) {
      return `${shadow(id, 200, 118)}
        <rect x="146" y="84" width="108" height="98" rx="22" fill="url(#${id}a)"/>
        <rect x="156" y="92" width="16" height="82" rx="8" fill="#fff" fill-opacity=".55"/>
        <rect x="170" y="180" width="60" height="20" rx="3" fill="url(#${id}m)"/>
        <rect x="96" y="196" width="208" height="244" rx="34" fill="#fff" fill-opacity=".55"/>
        <rect x="96" y="196" width="208" height="244" rx="34" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="3"/>
        <rect x="116" y="216" width="168" height="204" rx="22" fill="url(#${id}g)"/>
        <rect x="116" y="216" width="168" height="204" rx="22" fill="url(#${id}glass)"/>
        <rect x="104" y="214" width="10" height="200" rx="5" fill="#fff" fill-opacity=".7"/>
        <rect x="128" y="226" width="12" height="180" rx="6" fill="#fff" fill-opacity=".3"/>
        ${label(138, 268, 124, 104, p.color, p.line, p.typeName.en, p.sizeText, { fs: 21, ls: 14 })}`;
    },
    lotion(id, p) {
      return `${shadow(id, 200, 92)}
        <rect x="114" y="72" width="70" height="13" rx="6" fill="${p.color2 === "#FFFFFF" ? INK : p.color2}" stroke="${INK}" stroke-opacity=".1"/>
        <rect x="166" y="62" width="68" height="32" rx="10" fill="${INK}"/>
        <rect x="192" y="92" width="16" height="44" fill="url(#${id}m)"/>
        <rect x="164" y="132" width="72" height="34" rx="8" fill="${INK}"/>
        <rect x="128" y="160" width="144" height="282" rx="48" fill="url(#${id}g)"/>
        <rect x="142" y="186" width="14" height="230" rx="7" fill="#fff" fill-opacity=".35"/>
        ${label(146, 250, 108, 132, p.color, p.line, p.typeName.en, p.sizeText)}`;
    },
    mist(id, p) {
      return `${shadow(id, 200, 70)}
        <rect x="164" y="64" width="72" height="104" rx="18" fill="url(#${id}a)"/>
        <rect x="172" y="72" width="12" height="88" rx="6" fill="#fff" fill-opacity=".6"/>
        <rect x="158" y="162" width="84" height="280" rx="30" fill="url(#${id}g)"/>
        <rect x="168" y="180" width="10" height="240" rx="5" fill="#fff" fill-opacity=".38"/>
        ${label(166, 250, 68, 120, p.color, p.line, "Hair mist", p.sizeText, { fs: 15, ls: 11, ts: 7, rx: 8 })}`;
    },
    jar(id, p) {
      return `${shadow(id, 200, 120)}
        <rect x="104" y="214" width="192" height="62" rx="16" fill="url(#${id}m)"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `<rect x="${114 + i * 17}" y="222" width="3" height="46" rx="1.5" fill="${INK}" fill-opacity=".08"/>`).join("")}
        <rect x="96" y="268" width="208" height="174" rx="30" fill="#FFF8F2"/>
        <rect x="96" y="268" width="208" height="174" rx="30" fill="none" stroke="${p.color}" stroke-opacity=".25" stroke-width="2"/>
        <rect x="96" y="310" width="208" height="96" fill="url(#${id}g)"/>
        <text x="200" y="350" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="26" letter-spacing="-0.5" fill="#fff">wepink</text>
        <text x="200" y="374" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="13" fill="#fff">${esc(p.line)}</text>
        <text x="200" y="392" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="8" letter-spacing="1.6" fill="#fff" fill-opacity=".85">BODY BUTTER · ${esc(p.sizeText)}</text>
        <rect x="110" y="282" width="12" height="146" rx="6" fill="#fff" fill-opacity=".5"/>`;
    },
    set(id, p) {
      return `${shadow(id, 200, 132)}
        <rect x="86" y="236" width="228" height="204" rx="14" fill="url(#${id}g)"/>
        <rect x="76" y="198" width="248" height="58" rx="12" fill="${p.color}"/>
        <rect x="76" y="198" width="248" height="58" rx="12" fill="#000" fill-opacity=".12"/>
        <rect x="186" y="198" width="28" height="242" fill="${p.color2}"/>
        <rect x="186" y="198" width="28" height="242" fill="#fff" fill-opacity=".25"/>
        <path d="M200 200 C 168 150, 120 166, 140 196 C 150 210, 182 206, 200 200 Z" fill="${p.color2}"/>
        <path d="M200 200 C 232 150, 280 166, 260 196 C 250 210, 218 206, 200 200 Z" fill="${p.color2}"/>
        <path d="M200 200 C 176 168, 146 176, 152 192" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
        <circle cx="200" cy="200" r="13" fill="${p.color2}"/>
        <circle cx="200" cy="200" r="13" fill="#000" fill-opacity=".08"/>
        <rect x="98" y="248" width="10" height="176" rx="5" fill="#fff" fill-opacity=".25"/>
        ${label(232, 300, 70, 92, p.color, p.line.split(" ")[0], "Gift set", "", { fs: 14, ls: 10, ts: 6, rx: 8 })}`;
    },
  };

  function art(p, opts) {
    const o = opts || {};
    if (p.image && !o.noImage) {
      return `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">`;
    }
    const id = "a" + ++uid;
    const shape = shapes[p.art] || shapes.splash;
    const pp = Object.assign({}, p, { sizeText: typeof p.size === "string" ? p.size : "" });
    return `<svg class="art" viewBox="0 0 400 480" direction="ltr" aria-hidden="true" focusable="false">${defs(id, p.color, p.color2)}${shape(id, pp)}</svg>`;
  }

  return { art };
})();
