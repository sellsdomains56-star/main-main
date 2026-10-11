"""Helpers for building the edit list of the raw talk: where exactly is the silence between a phrase he wants and the stuff he doesn't (retakes, Arabic asides)?
   python3 -I edl_tools.py env <a> <b>   -> print the 10 ms energy (dB) of the raw voice between a and b seconds"""
import wave, sys, json
import numpy as np
RAW = '/tmp/claude-0/-home-user-main-main/be3abcf9-0f5c-57e1-887a-062f3550b887/scratchpad/in4/a48.wav'
def load():
    w = wave.open(RAW); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32).mean(1) / 32768
    return x, sr
def envelope(x, sr, hop=0.005, win=0.015):
    n = int(win * sr); h = int(hop * sr); e = np.array([np.sqrt((x[i:i + n] ** 2).mean() + 1e-12) for i in range(0, len(x) - n, h)])
    return 20 * np.log10(e + 1e-9), hop
def quietest(env, hop, lo, hi, smooth=0.02):
    """time in [lo, hi] where the (smoothed) energy is lowest"""
    k = max(1, int(smooth / hop)); sm = np.convolve(env, np.ones(k) / k, mode='same'); i0, i1 = int(lo / hop), max(int(lo / hop) + 1, int(hi / hop))
    return (i0 + int(np.argmin(sm[i0:i1]))) * hop
if __name__ == '__main__':
    x, sr = load(); env, hop = envelope(x, sr)
    a, b = float(sys.argv[2]), float(sys.argv[3])
    for t in np.arange(a, b, 0.02): print('%.2f %.0f' % (t, env[int(t / hop)]), end=' | ')
    print()
