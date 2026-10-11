"""Step 2 of the speaker cutout: temporal blend, edge refinement, per-frame alpha PNG.
   python3 -I matte_post.py [first] [last]    -> build/matte/m_#####.png (1080x1920 RGBA, alpha = person)"""
import os, sys, numpy as np, cv2
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = f'{HERE}/build/matte_raw'; FOOT = f'{HERE}/build/footage'; OUT = f'{HERE}/build/matte'
os.makedirs(OUT, exist_ok=True)
_cache = {}
def raw(k):
    p = f'{RAW}/r_{k:05d}.png'
    if not os.path.exists(p): return None
    if k not in _cache:
        if len(_cache) > 12: _cache.pop(next(iter(_cache)))
        _cache[k] = cv2.imread(p, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
    return _cache[k]
def blend(k):
    parts = [(k - 2, .25), (k, .5), (k + 2, .25)] if k % 2 == 0 else [(k - 1, .5), (k + 1, .5)]
    acc, wsum = 0, 0
    for kk, w in parts:
        r = raw(kk)
        if r is not None: acc = acc + r * w; wsum += w
    return None if wsum == 0 else acc / wsum
def smooth(x, a, b): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def work(k):
    m = blend(k)
    if m is None: return
    m = cv2.resize(m, (1080, 1920), interpolation=cv2.INTER_CUBIC)
    g = cv2.resize(cv2.imread(f'{FOOT}/f_{min(k, 1399):05d}.jpg'), (1080, 1920), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    m = cv2.ximgproc.guidedFilter(g, m.astype(np.float32), 10, 2e-3)
    m = smooth(np.clip(m, 0, 1), 0.12, 0.88)
    rgba = np.dstack([np.full(m.shape, 255, np.uint8)] * 3 + [(m * 255).astype(np.uint8)])
    cv2.imwrite(f'{OUT}/m_{k:05d}.png', rgba, [cv2.IMWRITE_PNG_COMPRESSION, 1])
if __name__ == '__main__':
    a = int(sys.argv[1]) if len(sys.argv) > 1 else 120; b = int(sys.argv[2]) if len(sys.argv) > 2 else 1399
    with Pool(int(os.environ.get('POST_PROCS', '3'))) as p:
        for i, _ in enumerate(p.imap(work, range(a, b + 1), chunksize=8)):
            if i % 200 == 0: print(f'{i}/{b - a + 1}', flush=True)
    print('done')
