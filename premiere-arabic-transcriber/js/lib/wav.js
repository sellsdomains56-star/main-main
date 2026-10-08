/*
 * Audio preparation.
 *
 * Premiere exports the sequence mix as a WAV file (usually 48 kHz stereo).
 * Speech models want 16 kHz mono, and APIs cap uploads at about 25 MB, so this
 * module mixes the file down, resamples it, and cuts it into parts of up to
 * ~10 minutes. Each cut is placed at the quietest moment near the limit so no
 * word is split in half. Everything streams, so long sequences use little memory.
 */
(function (root) {
  'use strict';

  var nodeRequire = root.cep_node && root.cep_node.require ? root.cep_node.require : require;
  var fs = nodeRequire('fs');
  var path = nodeRequire('path');

  var TARGET_RATE = 16000;
  var FRAME = TARGET_RATE / 50; // 20 ms
  var QUIET_WINDOW_FRAMES = 15; // look for 300 ms of quiet when choosing a cut

  function readWavInfo(fd) {
    var fileSize = fs.fstatSync(fd).size;
    var head = Buffer.alloc(12);
    fs.readSync(fd, head, 0, 12, 0);
    if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') {
      throw new Error('The exported audio is not a WAV file. Choose a Waveform Audio (.wav) export preset in Settings.');
    }

    var fmt = null;
    var dataOffset = -1;
    var dataSize = 0;
    var pos = 12;
    var chunkHead = Buffer.alloc(8);
    while (pos + 8 <= fileSize) {
      fs.readSync(fd, chunkHead, 0, 8, pos);
      var id = chunkHead.toString('ascii', 0, 4);
      var size = chunkHead.readUInt32LE(4);
      if (id === 'fmt ') {
        var b = Buffer.alloc(Math.min(size, 40));
        fs.readSync(fd, b, 0, b.length, pos + 8);
        var format = b.readUInt16LE(0);
        if (format === 0xfffe && b.length >= 26) format = b.readUInt16LE(24); // WAVE_FORMAT_EXTENSIBLE
        fmt = {
          format: format,
          channels: b.readUInt16LE(2),
          sampleRate: b.readUInt32LE(4),
          blockAlign: b.readUInt16LE(12),
          bitsPerSample: b.readUInt16LE(14)
        };
      } else if (id === 'data') {
        dataOffset = pos + 8;
        // Writers that stream sometimes leave the size at 0 or 0xFFFFFFFF.
        dataSize = size === 0 || size === 0xffffffff ? fileSize - dataOffset : Math.min(size, fileSize - dataOffset);
        break;
      }
      pos += 8 + size + (size % 2);
    }

    if (!fmt || dataOffset < 0) throw new Error('The exported WAV file is incomplete.');
    if (!fmt.channels || !fmt.sampleRate || !fmt.blockAlign) throw new Error('The exported WAV file has an invalid header.');
    fmt.bytesPerSample = fmt.blockAlign / fmt.channels;
    fmt.decode = sampleDecoder(fmt.format, fmt.bytesPerSample);
    fmt.dataOffset = dataOffset;
    fmt.dataSize = dataSize;
    fmt.frames = Math.floor(dataSize / fmt.blockAlign);
    fmt.durationSec = fmt.frames / fmt.sampleRate;
    return fmt;
  }

  // Returns a function reading one sample at a byte offset as a float in [-1, 1].
  function sampleDecoder(format, bytes) {
    if (format === 1) {
      if (bytes === 1) return function (b, o) { return (b[o] - 128) / 128; };
      if (bytes === 2) return function (b, o) { return b.readInt16LE(o) / 32768; };
      if (bytes === 3) return function (b, o) { return b.readIntLE(o, 3) / 8388608; };
      if (bytes === 4) return function (b, o) { return b.readInt32LE(o) / 2147483648; };
    } else if (format === 3) {
      if (bytes === 4) return function (b, o) { return b.readFloatLE(o); };
      if (bytes === 8) return function (b, o) { return b.readDoubleLE(o); };
    }
    throw new Error('Unsupported WAV sample format (format ' + format + ', ' + bytes * 8 + '-bit).');
  }

  // Streams samples from one rate to another. Downsampling averages the input
  // samples that fall inside each output sample (a simple low-pass that is
  // plenty for speech); upsampling repeats samples.
  function Resampler(inRate, outRate, emit) {
    this.ratio = inRate / outRate;
    this.emit = emit;
    this.inIndex = 0;
    this.outIndex = 0;
    this.acc = 0;
    this.count = 0;
  }

  Resampler.prototype.push = function (x) {
    if (this.ratio >= 1) {
      var j = Math.floor(this.inIndex / this.ratio);
      if (j !== this.outIndex && this.count > 0) {
        this.emit(this.acc / this.count);
        this.outIndex = j;
        this.acc = 0;
        this.count = 0;
      }
      this.acc += x;
      this.count++;
    } else {
      var until = Math.ceil((this.inIndex + 1) / this.ratio);
      while (this.outIndex < until) {
        this.emit(x);
        this.outIndex++;
      }
    }
    this.inIndex++;
  };

  Resampler.prototype.flush = function () {
    if (this.count > 0) this.emit(this.acc / this.count);
    this.count = 0;
    this.acc = 0;
  };

  // Collects 16 kHz samples and hands out parts of about `chunkSec` seconds,
  // each ending at the quietest moment within the last `searchSec` seconds.
  function Chunker(chunkSec, searchSec, onChunk) {
    this.target = Math.max(FRAME * QUIET_WINDOW_FRAMES * 2, Math.round(chunkSec * TARGET_RATE));
    this.search = Math.min(Math.round(searchSec * TARGET_RATE), Math.floor(this.target / 2));
    this.buf = new Int16Array(this.target);
    this.len = 0;
    this.written = 0;
    this.onChunk = onChunk;
  }

  Chunker.prototype.push = function (sample) {
    this.buf[this.len++] = sample;
    if (this.len >= this.target) this.cut(quietestPoint(this.buf, this.len - this.search, this.len));
  };

  Chunker.prototype.cut = function (at) {
    this.onChunk(this.buf.subarray(0, at), this.written);
    this.written += at;
    this.buf.copyWithin(0, at, this.len);
    this.len -= at;
  };

  Chunker.prototype.finish = function () {
    if (this.len > 0) this.cut(this.len);
  };

  function frameEnergies(samples, from, to) {
    var energies = [];
    for (var f = from; f + FRAME <= to; f += FRAME) {
      var sum = 0;
      for (var i = f; i < f + FRAME; i++) sum += samples[i] * samples[i];
      energies.push(sum);
    }
    return energies;
  }

  // Index (in samples) of the best place to cut between from and to: the
  // middle of the longest stretch of the quietest 300 ms windows.
  function quietestPoint(samples, from, to) {
    var energies = frameEnergies(samples, from, to);
    if (energies.length <= QUIET_WINDOW_FRAMES) return to;
    var sums = [];
    var windowSum = 0;
    for (var i = 0; i < energies.length; i++) {
      windowSum += energies[i];
      if (i >= QUIET_WINDOW_FRAMES) windowSum -= energies[i - QUIET_WINDOW_FRAMES];
      if (i >= QUIET_WINDOW_FRAMES - 1) sums.push(windowSum);
    }
    var min = Math.min.apply(null, sums);
    // Anything within 10% of the quietest window (or a couple of LSBs) counts as just as quiet.
    var limit = min + Math.max(min * 0.1, FRAME * QUIET_WINDOW_FRAMES * 4);
    var bestStart = 0;
    var bestLength = 0;
    var runStart = -1;
    for (var k = 0; k <= sums.length; k++) {
      if (k < sums.length && sums[k] <= limit) {
        if (runStart < 0) runStart = k;
      } else if (runStart >= 0) {
        if (k - runStart > bestLength) {
          bestLength = k - runStart;
          bestStart = runStart;
        }
        runStart = -1;
      }
    }
    var middleWindow = bestStart + Math.floor((bestLength - 1) / 2);
    return from + (middleWindow + Math.floor(QUIET_WINDOW_FRAMES / 2)) * FRAME;
  }

  // Level of the loudest 20 ms in dBFS; used to skip parts with no sound at all.
  function loudestFrameDb(samples) {
    var energies = frameEnergies(samples, 0, samples.length);
    var max = 0;
    for (var i = 0; i < energies.length; i++) if (energies[i] > max) max = energies[i];
    if (!energies.length) return -Infinity;
    var rms = Math.sqrt(max / FRAME) / 32768;
    return rms > 0 ? 20 * Math.log(rms) / Math.LN10 : -Infinity;
  }

  function encodeWav16(samples, rate) {
    var header = Buffer.alloc(44);
    var dataBytes = samples.length * 2;
    header.write('RIFF', 0, 'ascii');
    header.writeUInt32LE(36 + dataBytes, 4);
    header.write('WAVE', 8, 'ascii');
    header.write('fmt ', 12, 'ascii');
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // mono
    header.writeUInt32LE(rate, 24);
    header.writeUInt32LE(rate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36, 'ascii');
    header.writeUInt32LE(dataBytes, 40);
    var data = Buffer.alloc(dataBytes);
    for (var i = 0; i < samples.length; i++) data.writeInt16LE(samples[i], i * 2);
    return Buffer.concat([header, data]);
  }

  function pad3(n) {
    return ('00' + n).slice(-3);
  }

  function yieldToUi() {
    return new Promise(function (resolve) { setTimeout(resolve, 0); });
  }

  /**
   * Converts a WAV file into 16 kHz mono WAV parts in outDir.
   * Resolves to { durationSec, chunks: [{ path, startSec, durationSec, silent }] }.
   */
  async function splitForSpeech(inputPath, outDir, options, onProgress, token) {
    var opts = Object.assign({ chunkSec: 600, searchSec: 20, silenceDb: -50 }, options);
    var fd = fs.openSync(inputPath, 'r');
    try {
      var info = readWavInfo(fd);
      var chunks = [];
      var chunker = new Chunker(opts.chunkSec, opts.searchSec, function (samples, startSample) {
        var file = path.join(outDir, 'part-' + pad3(chunks.length + 1) + '.wav');
        fs.writeFileSync(file, encodeWav16(samples, TARGET_RATE));
        chunks.push({
          path: file,
          startSec: startSample / TARGET_RATE,
          durationSec: samples.length / TARGET_RATE,
          silent: loudestFrameDb(samples) < opts.silenceDb
        });
      });
      var resampler = new Resampler(info.sampleRate, TARGET_RATE, function (x) {
        var s = Math.round(x * 32767);
        chunker.push(s > 32767 ? 32767 : s < -32768 ? -32768 : s);
      });

      var framesPerRead = 65536;
      var buf = Buffer.alloc(framesPerRead * info.blockAlign);
      var channels = info.channels;
      var bytesPerSample = info.bytesPerSample;
      var decode = info.decode;
      var done = 0;
      var lastYield = Date.now();

      while (done < info.frames) {
        if (token && token.cancelled) {
          var cancelled = new Error('Cancelled.');
          cancelled.cancelled = true;
          throw cancelled;
        }
        var want = Math.min(framesPerRead, info.frames - done);
        var got = fs.readSync(fd, buf, 0, want * info.blockAlign, info.dataOffset + done * info.blockAlign);
        var frames = Math.floor(got / info.blockAlign);
        if (frames <= 0) break;
        for (var f = 0; f < frames; f++) {
          var base = f * info.blockAlign;
          var sum = 0;
          for (var c = 0; c < channels; c++) sum += decode(buf, base + c * bytesPerSample);
          resampler.push(sum / channels);
        }
        done += frames;
        if (Date.now() - lastYield > 50) {
          if (onProgress) onProgress(done / info.frames);
          await yieldToUi();
          lastYield = Date.now();
        }
      }
      resampler.flush();
      chunker.finish();
      if (onProgress) onProgress(1);
      return { durationSec: info.durationSec, chunks: chunks };
    } finally {
      fs.closeSync(fd);
    }
  }

  var api = {
    TARGET_RATE: TARGET_RATE,
    splitForSpeech: splitForSpeech,
    readWavInfo: readWavInfo,
    encodeWav16: encodeWav16,
    loudestFrameDb: loudestFrameDb,
    quietestPoint: quietestPoint
  };
  root.AT = root.AT || {};
  root.AT.wav = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : global);
