"""HAVA logo set, redrawn as clean vectors from the brand book (water_final.pdf).

Measured from the brand book at 150 dpi (letter height 412 units):
  H stems 42 wide, crossbar 38 high; the A is drawn without a crossbar (a peak) and V is the
  same shape upside down, both with a 45-unit horizontal stroke; an underline runs the full width.
  Tagline "THE ESSENCE OF SWEDEN." is Montserrat Regular, widely tracked, under the line.

Run:  python3 logos.py /path/to/Montserrat[wght].ttf
Writes logo/svg/*.svg and logo/manifest.json (render.js turns them into PNG and PDF).
The font is only needed to outline the tagline; the SVGs have no font dependency.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'logo')

COLOURS = {
    'deepwater': '#0D2B45',  # Deep Water, for light backgrounds
    'white': '#FFFFFF',      # for Deep Water, dark photos and the films
    'ink': '#1A1A1A',        # single-colour print, stamps, embossing
    'gold': '#C9A66B',       # packaging gold, on Deep Water only
}

CAP = 412.0      # letter height
STEM = 42.0      # H stems
BAR = 38.0       # H crossbar
BAR_Y = 177.0    # top of the crossbar
W = 45.0         # horizontal stroke of the peaks and the V
HW = 341.0       # width of the H
PEAK = 208.8     # half the base of a peak (A)
VEE = 202.8      # half the top of the V
UL_Y, UL_H = 561.0, 6.5


def f(n):
    return f'{n:.2f}'.rstrip('0').rstrip('.')


def poly(pts):
    return 'M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in pts) + 'Z'


def letter_h(x, y=0.0, k=1.0):
    s, h, b, by, wd = STEM * k, CAP * k, BAR * k, BAR_Y * k, HW * k
    return [
        poly([(x, y), (x + s, y), (x + s, y + h), (x, y + h)]),
        poly([(x + wd - s, y), (x + wd, y), (x + wd, y + h), (x + wd - s, y + h)]),
        poly([(x, y + by), (x + wd, y + by), (x + wd, y + by + b), (x, y + by + b)]),
    ]


def letter_peak(c, y=0.0, k=1.0):
    """The HAVA 'A': two strokes meeting in a flat-topped peak, no crossbar."""
    h, b, w = CAP * k, PEAK * k, W * k
    apex = (w / 2) / (b - w / 2) * h          # where the inner edges meet
    return [poly([(c - b, y + h), (c - w / 2, y), (c + w / 2, y), (c + b, y + h),
                  (c + b - w, y + h), (c, y + apex), (c - b + w, y + h)])]


def letter_v(c, y=0.0, k=1.0):
    h, t, w = CAP * k, VEE * k, W * k
    inner = (t - w) / (t - w / 2) * h
    return [poly([(c - t, y), (c - t + w, y), (c, y + inner), (c + t - w, y), (c + t, y),
                  (c + w / 2, y + h), (c - w / 2, y + h)])]


def rect(x, y, w, h):
    return poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])


def wordmark_paths(underline=True):
    # Letter centres and spacing as measured (x from the left end of the underline).
    p = letter_h(1.0) + letter_peak(623.2) + letter_v(1017.5) + letter_peak(1409.9)
    if underline:
        p.append(rect(0, UL_Y, 1619.0, UL_H))
    return p


def tagline_path(font_file, left, baseline, cap, width):
    """Outline 'THE ESSENCE OF SWEDEN.' in Montserrat Regular, tracked to the given width."""
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.boundsPen import BoundsPen

    font = instancer.instantiateVariableFont(TTFont(font_file), {'wght': 400})
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    s = cap / font['OS/2'].sCapHeight
    text = 'THE ESSENCE OF SWEDEN.'
    names = [cmap[ord(ch)] for ch in text]

    def bounds(n):
        bp = BoundsPen(gs)
        gs[n].draw(bp)
        return bp.bounds

    lsb = bounds(names[0])[0]
    last_xmax = bounds(names[-1])[2]
    natural = sum(hmtx[n][0] for n in names[:-1]) * s + (last_xmax - lsb) * s
    track = (width - natural) / (len(names) - 1)

    out = []
    x = left - lsb * s
    for n in names:
        if gs[n].width and n != 'space':
            pen = SVGPathPen(gs, ntos=lambda v: f(v))
            gs[n].draw(TransformPen(pen, (s, 0, 0, -s, x, baseline)))
            out.append(pen.getCommands())
        x += hmtx[n][0] * s + track
    return ''.join(out)


def svg(view_w, view_h, paths, colour, title, extra=''):
    d = ''.join(paths)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(view_w)} {f(view_h)}" '
            f'width="{f(view_w)}" height="{f(view_h)}" role="img" aria-label="{title}">\n'
            f'  <title>{title}</title>\n'
            f'  <g fill="{colour}">{extra}<path d="{d}"/></g>\n</svg>\n')


def build(font_file):
    os.makedirs(os.path.join(OUT, 'svg'), exist_ok=True)
    manifest = []

    # Padding around each file: half the letter height is the brand's clear space,
    # so the files carry a small margin only (users add clear space when placing it).
    pad = 0.0

    designs = {}
    designs['wordmark'] = (1619.0, UL_Y + UL_H, wordmark_paths(), '')
    designs['wordmark-plain'] = (1619.0, CAP, wordmark_paths(underline=False), '')

    tag = tagline_path(font_file, left=1.0, baseline=788.0, cap=69.0, width=1648.0)
    designs['wordmark-tagline'] = (1650.0, 788.0, wordmark_paths() + [tag], '')

    # Stacked, as on the bottle: one letter per line, line underneath.
    width, pitch = 597.0, 593.0
    cx = width / 2
    p = letter_h(cx - HW / 2, 0) + letter_peak(cx, pitch) + letter_v(cx, 2 * pitch) + letter_peak(cx, 3 * pitch)
    bottom = 3 * pitch + CAP
    p.append(rect(0, bottom + 185.0, width, 10.3))
    designs['wordmark-vertical'] = (width, bottom + 185.0 + 10.3, p, '')

    # Icon: the peak inside a thin ring.  Monogram: the H inside the same ring.
    D, ring = 687.0, 12.5
    k = 293.5 / CAP
    r = (D - ring) / 2
    ring_svg = (f'<circle cx="{f(D / 2)}" cy="{f(D / 2)}" r="{f(r)}" fill="none" '
                f'stroke="currentColor" stroke-width="{f(ring)}"/>')
    top = D / 2 - 293.5 / 2 - 3.25
    designs['icon'] = (D, D, letter_peak(D / 2, top, k), ring_svg)
    designs['monogram'] = (D, D, letter_h(D / 2 - HW / 2 * k, D / 2 - 293.5 / 2, k), ring_svg)

    titles = {
        'wordmark': 'HAVA', 'wordmark-plain': 'HAVA', 'wordmark-tagline': 'HAVA. The essence of Sweden.',
        'wordmark-vertical': 'HAVA', 'icon': 'HAVA icon', 'monogram': 'HAVA monogram',
    }
    for name, (vw, vh, paths, extra) in designs.items():
        for cname, colour in COLOURS.items():
            fn = f'hava-{name}-{cname}'
            body = svg(vw + 2 * pad, vh + 2 * pad, paths, colour, titles[name],
                       extra.replace('currentColor', colour))
            with open(os.path.join(OUT, 'svg', fn + '.svg'), 'w') as fh:
                fh.write(body)
            manifest.append({'file': fn, 'design': name, 'colour': cname, 'w': vw, 'h': vh})

    with open(os.path.join(OUT, 'manifest.json'), 'w') as fh:
        json.dump(manifest, fh, indent=1)
    print(f'{len(manifest)} SVG files written to {OUT}/svg')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: python3 logos.py /path/to/Montserrat[wght].ttf')
    build(sys.argv[1])
