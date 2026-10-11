"""Cut the presenter out of the on-camera clips: RMBG-1.4 matte -> guided-filter refinement -> RGBA PNGs.
   python3 -I matte_cam.py   (reads build/cam/{hook,closer}_#####.jpg, writes build/cam/m_{hook,closer}_#####.png)"""
import os, glob, numpy as np, cv2, onnxruntime as ort
HERE = os.path.dirname(os.path.abspath(__file__)); CAM = f'{HERE}/build/cam'
so = ort.SessionOptions(); so.intra_op_num_threads = int(os.environ.get('MATTE_THREADS', '4'))
sess = ort.InferenceSession(f'{HERE}/build/rmbg14.onnx', so, providers=['CPUExecutionProvider']); inp = sess.get_inputs()[0].name
def smooth(x, a, b): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
for clip in ('hook', 'closer'):
    files = sorted(glob.glob(f'{CAM}/{clip}_*.jpg')); raw = {}
    for i in range(0, len(files), 2):                       # network on every other frame, blend neighbours for the rest
        x = cv2.resize(cv2.imread(files[i]), (1024, 1024), interpolation=cv2.INTER_AREA)[..., ::-1].astype(np.float32) / 255 - 0.5
        y = sess.run(None, {inp: x.transpose(2, 0, 1)[None]})[0][0, 0]; raw[i] = (y - y.min()) / (y.max() - y.min() + 1e-8)
    last = max(raw)
    for i, f in enumerate(files):
        nb = [raw[k] for k in (i - 1, i, i + 1) if k in raw] or [raw[last]]
        m = cv2.resize(np.mean(nb, axis=0).astype(np.float32), (1080, 1920), interpolation=cv2.INTER_CUBIC)
        g = cv2.resize(cv2.imread(f), (1080, 1920), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        m = smooth(np.clip(cv2.ximgproc.guidedFilter(g, m, 10, 2e-3), 0, 1), 0.12, 0.88)
        cv2.imwrite(f'{CAM}/m_{clip}_{i:05d}.png', np.dstack([np.full(m.shape, 255, np.uint8)] * 3 + [(m * 255).astype(np.uint8)]), [cv2.IMWRITE_PNG_COMPRESSION, 1])
    print(clip, len(files), 'frames matted', flush=True)
