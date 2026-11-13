import { G, clamp } from './state.js';
import * as THREE from '../lib/three.module.js';

/* Fully synthesised sound: no audio files needed. */
export class AudioEngine {
  constructor() { this.ctx = null; this.muted = false; this._v = new THREE.Vector3(); }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain(); this.master.gain.value = 0.75;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    this.master.connect(comp); comp.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const irLen = (ctx.sampleRate * 1.8) | 0;
    const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const ch = ir.getChannelData(c); for (let i = 0; i < irLen; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3.4); }
    this.reverb = ctx.createConvolver(); this.reverb.buffer = ir;
    const rg = ctx.createGain(); rg.gain.value = 0.5; this.reverb.connect(rg); rg.connect(this.master);
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  _bus(vol, pan, wet) {
    const ctx = this.ctx, g = ctx.createGain(); g.gain.value = vol;
    let node = g;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); node = p; }
    node.connect(this.master);
    if (wet > 0) { const s = ctx.createGain(); s.gain.value = wet; node.connect(s); s.connect(this.reverb); }
    return g;
  }
  _noise(dest, t, dur, type, f0, f1, q, gain) {
    const ctx = this.ctx, src = ctx.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  _tone(dest, t, dur, f0, f1, gain, type = 'sine') {
    const ctx = this.ctx, o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }

  // compute volume / pan for a world position relative to the camera
  spatial(pos, ref = 14) {
    const cam = G.camera;
    if (!pos || !cam) return { vol: 1, pan: 0, wet: 0.25 };
    const v = this._v.copy(pos).sub(cam.position);
    const d = v.length();
    v.applyQuaternion(cam.quaternion.clone().invert());
    const pan = d > 0.5 ? v.x / d : 0;
    return { vol: clamp(ref / (d + ref * 0.6), 0, 1), pan: pan * 0.9, wet: 0.2 + clamp(d / 90, 0, 0.55), d };
  }

  shot(kind, pos = null, boost = 1) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, sp = this.spatial(pos);
    const own = pos ? 0.8 : 1.0;
    const out = this._bus(sp.vol * own * boost, sp.pan, sp.wet);
    switch (kind) {
      case 'ar':
        this._noise(out, t, 0.16, 'bandpass', 3400, 700, 0.6, 1.0);
        this._noise(out, t, 0.03, 'highpass', 5000, 3000, 0.5, 0.8);
        this._tone(out, t, 0.14, 190, 45, 0.9);
        break;
      case 'smg':
        this._noise(out, t, 0.11, 'bandpass', 4200, 1200, 0.7, 0.9);
        this._noise(out, t, 0.025, 'highpass', 6000, 3500, 0.5, 0.7);
        this._tone(out, t, 0.09, 230, 70, 0.6);
        break;
      case 'pistol':
        this._noise(out, t, 0.2, 'bandpass', 2800, 500, 0.8, 1.0);
        this._noise(out, t, 0.03, 'highpass', 4500, 2500, 0.5, 0.8);
        this._tone(out, t, 0.18, 160, 40, 0.9);
        break;
      case 'shotgun':
        this._noise(out, t, 0.5, 'lowpass', 3200, 150, 0.7, 1.3);
        this._noise(out, t, 0.05, 'highpass', 3000, 1500, 0.5, 0.9);
        this._tone(out, t, 0.4, 110, 28, 1.2);
        break;
      case 'sniper':
        this._noise(out, t, 0.9, 'lowpass', 4500, 120, 0.6, 1.4);
        this._noise(out, t, 0.06, 'highpass', 3500, 1500, 0.5, 1.0);
        this._tone(out, t, 0.7, 90, 22, 1.5);
        break;
    }
  }
  click(kind, pos = null, vol = 0.5) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx, t = ctx.currentTime, sp = this.spatial(pos, 8);
    const out = this._bus(sp.vol * vol, sp.pan, 0.05);
    if (kind === 'empty') { this._noise(out, t, 0.04, 'highpass', 3500, 2500, 1, 0.6); this._tone(out, t, 0.04, 1800, 900, 0.15, 'square'); }
    else if (kind === 'magout') { this._noise(out, t, 0.07, 'bandpass', 1600, 800, 2, 0.7); this._tone(out, t, 0.06, 420, 200, 0.3, 'triangle'); }
    else if (kind === 'magin') { this._noise(out, t, 0.05, 'bandpass', 2400, 1200, 2, 0.9); this._tone(out, t, 0.08, 300, 120, 0.5, 'triangle'); }
    else if (kind === 'bolt') { this._noise(out, t, 0.06, 'bandpass', 2200, 900, 3, 0.9); this._tone(out, t + 0.07, 0.05, 520, 260, 0.3, 'square'); }
    else if (kind === 'switch') { this._noise(out, t, 0.05, 'bandpass', 1800, 900, 2, 0.5); }
    else if (kind === 'shell') { this._tone(out, t, 0.05, 3400, 2600, 0.12, 'triangle'); }
    else if (kind === 'pin') { this._tone(out, t, 0.05, 1500, 900, 0.3, 'triangle'); this._noise(out, t, 0.04, 'highpass', 4000, 3000, 1, 0.4); }
  }
  hit(head) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, out = this._bus(0.5, 0, 0);
    this._tone(out, t, 0.06, head ? 2600 : 1700, head ? 2000 : 1300, 0.5, 'triangle');
  }
  kill(head) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, out = this._bus(0.65, 0, 0.1);
    this._tone(out, t, 0.18, 880, 700, 0.5, 'triangle');
    this._tone(out, t + 0.07, 0.3, 1320, 1100, 0.45, 'triangle');
    if (head) this._tone(out, t + 0.14, 0.4, 1760, 1500, 0.35, 'triangle');
  }
  hurt() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, out = this._bus(0.9, 0, 0.1);
    this._tone(out, t, 0.2, 120, 50, 0.8); this._noise(out, t, 0.12, 'lowpass', 900, 200, 1, 0.5);
  }
  whiz(pos) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, sp = this.spatial(pos, 4), out = this._bus(0.35, sp.pan, 0);
    this._noise(out, t, 0.18, 'bandpass', 5000, 1500, 4, 0.8);
  }
  step(pos = null, vol = 0.22) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, sp = this.spatial(pos, 6), out = this._bus(sp.vol * vol, sp.pan, 0.02);
    this._noise(out, t, 0.07, 'lowpass', 700, 150, 1, 0.9);
  }
  explosion(pos) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, sp = this.spatial(pos, 30), out = this._bus(Math.max(0.35, sp.vol) * 1.3, sp.pan, 0.5);
    this._noise(out, t, 1.4, 'lowpass', 2600, 60, 0.7, 1.6);
    this._tone(out, t, 1.0, 80, 18, 1.8);
    this._noise(out, t, 0.12, 'highpass', 2500, 1500, 0.5, 1.0);
  }
  thud(pos) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, sp = this.spatial(pos, 8), out = this._bus(sp.vol * 0.5, sp.pan, 0.05);
    this._tone(out, t, 0.12, 260, 90, 0.8, 'triangle');
  }
  beep() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, out = this._bus(0.3, 0, 0);
    this._tone(out, t, 0.12, 980, 980, 0.4, 'square');
  }
  streak() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, out = this._bus(0.5, 0, 0.2);
    this._tone(out, t, 0.12, 440, 440, 0.4, 'sawtooth'); this._tone(out, t + 0.1, 0.12, 660, 660, 0.4, 'sawtooth'); this._tone(out, t + 0.2, 0.3, 880, 880, 0.4, 'sawtooth');
  }
}
