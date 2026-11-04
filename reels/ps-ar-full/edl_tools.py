"""Where exactly is the silence between a phrase to keep and something to cut (retake, aside in another language, director chat)?
   python3 -I edl_tools.py env <raw_audio.wav> <a> <b>       print the 20 ms energy (dB) between a and b seconds -> cut at the deepest valley
   python3 -I edl_tools.py quiet <raw_audio.wav> <lo> <hi>   print the quietest instant in [lo, hi]
   Make the wav first:  ffmpeg -i raw.mp4 -vn -ac 2 -ar 48000 -c:a pcm_s16le a48.wav"""
import wave, sys
import numpy as np
def load(path):
    w = wave.open(path); sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, ch).astype(np.float32).mean(1) / 32768
    return x, sr
def envelope(x, sr, hop=0.005, win=0.015):
    n = int(win * sr); h = int(hop * sr); e = np.array([np.sqrt((x[i:i + n] ** 2).mean() + 1e-12) for i in range(0, len(x) - n, h)])
    return 20 * np.log10(e + 1e-9), hop
def quietest(env, hop, lo, hi, smooth=0.02):
    k = max(1, int(smooth / hop)); sm = np.convolve(env, np.ones(k) / k, mode='same'); i0, i1 = int(lo / hop), max(int(lo / hop) + 1, int(hi / hop))
    return (i0 + int(np.argmin(sm[i0:i1]))) * hop
if __name__ == '__main__':
    mode, path, a, b = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]); x, sr = load(path); env, hop = envelope(x, sr)
    if mode == 'env':
        for t in np.arange(a, b, 0.02): print('%.2f %.0f' % (t, env[int(t / hop)]), end=' | ')
        print()
    else: print('quietest at %.3f s' % quietest(env, hop, a, b))
