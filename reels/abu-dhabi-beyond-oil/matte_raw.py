"""Step 1 of the speaker cutout: run a background-removal network (RMBG-1.4, ONNX) on every other footage frame.
   python3 -I matte_raw.py [first_frame] [last_frame]      -> build/matte_raw/r_#####.png (1024x1024, 8-bit)"""
import sys, os, numpy as np, onnxruntime as ort
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); FOOT = f'{HERE}/build/footage'; OUT = f'{HERE}/build/matte_raw'
a = int(sys.argv[1]) if len(sys.argv) > 1 else 120; b = int(sys.argv[2]) if len(sys.argv) > 2 else 1399
so = ort.SessionOptions(); so.intra_op_num_threads = int(os.environ.get('MATTE_THREADS', '4'))
sess = ort.InferenceSession(f'{HERE}/build/rmbg14.onnx', so, providers=['CPUExecutionProvider']); inp = sess.get_inputs()[0].name
os.makedirs(OUT, exist_ok=True)
frames = list(range(a - a % 2, b + 1, 2)) + ([b] if b % 2 else [])
for n, k in enumerate(frames):
    p = f'{OUT}/r_{k:05d}.png'
    if os.path.exists(p): continue
    x = np.asarray(Image.open(f'{FOOT}/f_{k:05d}.jpg').convert('RGB').resize((1024, 1024), Image.BILINEAR), np.float32) / 255.0
    y = sess.run(None, {inp: ((x - 0.5)).transpose(2, 0, 1)[None]})[0][0, 0]
    y = (y - y.min()) / (y.max() - y.min() + 1e-8)
    Image.fromarray((y * 255).astype(np.uint8)).save(p)
    if n % 40 == 0: print(f'{n}/{len(frames)}', flush=True)
print('done')
