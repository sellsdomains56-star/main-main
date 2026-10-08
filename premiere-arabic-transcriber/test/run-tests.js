/*
 * Tests for everything that can run outside Premiere: audio preparation,
 * caption building, both engines (against a mock API and a fake whisper.cpp)
 * and host/index.jsx against a mocked Premiere scripting model.
 *
 *   node test/run-tests.js
 */
'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var http = require('http');
var vm = require('vm');

var wav = require('../js/lib/wav.js');
var captions = require('../js/lib/captions.js');
var engines = require('../js/lib/engines.js');

var ROOT = path.join(__dirname, '..');
var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'at-test-'));
var tests = [];
function test(name, fn) { tests.push({ name: name, fn: fn }); }

// Writes a WAV file. signal(t) returns a sample in [-1, 1] for time t in seconds.
function writeWav(file, opts, signal) {
  var rate = opts.rate, channels = opts.channels, bits = opts.bits, float = !!opts.float;
  var frames = Math.round(opts.seconds * rate);
  var bytes = bits / 8;
  var data = Buffer.alloc(frames * channels * bytes);
  for (var i = 0; i < frames; i++) {
    var x = signal(i / rate);
    for (var c = 0; c < channels; c++) {
      var o = (i * channels + c) * bytes;
      if (float) data.writeFloatLE(x, o);
      else if (bits === 16) data.writeInt16LE(Math.round(x * 32767), o);
      else if (bits === 24) data.writeIntLE(Math.round(x * 8388607), o, 3);
    }
  }
  var h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(float ? 3 : 1, 20);
  h.writeUInt16LE(channels, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * channels * bytes, 28);
  h.writeUInt16LE(channels * bytes, 32); h.writeUInt16LE(bits, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

// "Speech": 440 Hz tone, with pauses at 6.0-6.6 s and 11.5-12.1 s.
function speechLike(t) {
  if ((t >= 6 && t < 6.6) || (t >= 11.5 && t < 12.1)) return 0;
  return 0.5 * Math.sin(2 * Math.PI * 440 * t);
}

function readMono16(file) {
  var fd = fs.openSync(file, 'r');
  var info = wav.readWavInfo(fd);
  fs.closeSync(fd);
  return info;
}

/* ---------- audio ---------- */

[
  { label: '48 kHz stereo 16-bit', rate: 48000, channels: 2, bits: 16 },
  { label: '44.1 kHz mono 24-bit', rate: 44100, channels: 1, bits: 24 },
  { label: '48 kHz stereo 32-bit float', rate: 48000, channels: 2, bits: 32, float: true },
  { label: '8 kHz mono 16-bit (upsampled)', rate: 8000, channels: 1, bits: 16 }
].forEach(function (fmt) {
  test('splits ' + fmt.label + ' into 16 kHz mono parts at quiet points', async function () {
    var dir = fs.mkdtempSync(path.join(tmp, 'wav-'));
    var input = path.join(dir, 'in.wav');
    writeWav(input, Object.assign({ seconds: 17 }, fmt), speechLike);
    var progressCalls = 0;
    var res = await wav.splitForSpeech(input, dir, { chunkSec: 7, searchSec: 3 }, function () { progressCalls++; });

    assert.ok(Math.abs(res.durationSec - 17) < 0.01);
    assert.ok(progressCalls >= 1);
    assert.strictEqual(res.chunks.length, 3);
    var total = res.chunks.reduce(function (s, c) { return s + c.durationSec; }, 0);
    assert.ok(Math.abs(total - 17) < 0.01, 'parts add up to the whole: ' + total);
    // Cuts land in the middle of the pauses, not mid-"word".
    var cut1 = res.chunks[1].startSec;
    var cut2 = res.chunks[2].startSec;
    assert.ok(Math.abs(cut1 - 6.3) < 0.05, 'first cut in the middle of the pause: ' + cut1);
    assert.ok(Math.abs(cut2 - 11.8) < 0.05, 'second cut in the middle of the pause: ' + cut2);
    res.chunks.forEach(function (c) {
      var info = readMono16(c.path);
      assert.strictEqual(info.sampleRate, 16000);
      assert.strictEqual(info.channels, 1);
      assert.strictEqual(info.bitsPerSample, 16);
      assert.ok(Math.abs(info.durationSec - c.durationSec) < 0.001);
      assert.strictEqual(c.silent, false);
    });
  });
});

test('keeps the level and pitch of the audio when resampling', async function () {
  var dir = fs.mkdtempSync(path.join(tmp, 'wav-'));
  var input = path.join(dir, 'in.wav');
  writeWav(input, { seconds: 1, rate: 48000, channels: 2, bits: 16 }, function (t) { return 0.5 * Math.sin(2 * Math.PI * 300 * t); });
  var res = await wav.splitForSpeech(input, dir, {});
  var buf = fs.readFileSync(res.chunks[0].path);
  var n = (buf.length - 44) / 2;
  var sumSq = 0, crossings = 0, prev = 0;
  for (var i = 0; i < n; i++) {
    var s = buf.readInt16LE(44 + i * 2) / 32768;
    sumSq += s * s;
    if (i && (prev < 0) !== (s < 0)) crossings++;
    prev = s;
  }
  var rms = Math.sqrt(sumSq / n);
  assert.ok(Math.abs(rms - 0.5 / Math.SQRT2) < 0.01, 'rms ' + rms);
  assert.ok(Math.abs(crossings - 600) <= 4, 'zero crossings ' + crossings); // 300 Hz -> 600 per second
});

test('marks silent parts so they are not sent for transcription', async function () {
  var dir = fs.mkdtempSync(path.join(tmp, 'wav-'));
  var input = path.join(dir, 'in.wav');
  writeWav(input, { seconds: 12, rate: 48000, channels: 2, bits: 16 }, function (t) {
    return t < 6 ? 0.0001 * Math.sin(t * 1000) : 0.3 * Math.sin(2 * Math.PI * 200 * t);
  });
  var res = await wav.splitForSpeech(input, dir, { chunkSec: 6, searchSec: 1 });
  assert.strictEqual(res.chunks[0].silent, true);
  assert.strictEqual(res.chunks[res.chunks.length - 1].silent, false);
});

test('stops when cancelled', async function () {
  var dir = fs.mkdtempSync(path.join(tmp, 'wav-'));
  var input = path.join(dir, 'in.wav');
  writeWav(input, { seconds: 5, rate: 48000, channels: 2, bits: 16 }, speechLike);
  var token = new engines.CancelToken();
  token.cancel();
  await assert.rejects(wav.splitForSpeech(input, dir, {}, null, token), function (e) { return e.cancelled === true; });
});

test('rejects files that are not WAV', async function () {
  var file = path.join(tmp, 'not.wav');
  fs.writeFileSync(file, 'ID3 this is an mp3');
  await assert.rejects(wav.splitForSpeech(file, tmp, {}), /not a WAV file/);
});

/* ---------- captions ---------- */

var LONG_AR = 'مرحبا بكم في هذا الفيديو، اليوم سنتحدث عن تحرير الفيديو باستخدام أدوبي بريميير. هذه الإضافة تقوم بتفريغ الكلام العربي إلى نص مكتوب ثم تضيفه كترجمة على الخط الزمني.';

test('cleans Arabic text', function () {
  assert.strictEqual(captions.cleanText('  مَرْحَبًا   بِكُم ، كيف الحال ؟ ', { removeDiacritics: true }), 'مرحبا بكم، كيف الحال؟');
  assert.strictEqual(captions.cleanText('‏مرحبا‎ بكم'), 'مرحبا بكم');
  assert.strictEqual(captions.cleanText('مَرْحَبًا'), 'مَرْحَبًا', 'diacritics kept unless asked');
  assert.strictEqual(captions.cleanText('الـــعربية', { removeDiacritics: true }), 'العربية', 'tatweel removed');
});

test('drops hallucinations, repeats and non-speech; fixes overlaps', function () {
  var out = captions.cleanSegments([
    { start: 5, end: 9, text: ' كيف حالك؟' },
    { start: 0, end: 5.5, text: ' السلام عليكم' },
    { start: 9, end: 12, text: 'ترجمة نانسي قنقر' },
    { start: 12, end: 14, text: 'كيف حالك؟' },
    { start: 14, end: 16, text: 'موسيقى', noSpeechProb: 0.9, avgLogprob: -1.5 },
    { start: 16, end: 18, text: '   ' },
    { start: 18, end: 20, text: 'شكرا لكم' }
  ], { filterHallucinations: true });
  assert.deepStrictEqual(out.map(function (s) { return s.text; }), ['السلام عليكم', 'كيف حالك؟', 'شكرا لكم']);
  assert.strictEqual(out[0].end, 5, 'overlap trimmed');

  var kept = captions.cleanSegments([{ start: 0, end: 1, text: 'ترجمة نانسي قنقر' }], { filterHallucinations: false });
  assert.strictEqual(kept.length, 1);
});

test('splits long segments into balanced captions within the line limit', function () {
  var caps = captions.toCaptions([{ start: 10, end: 22, text: LONG_AR }], { maxCharsPerLine: 42, maxLines: 2 });
  assert.ok(caps.length >= 2);
  var words = [];
  caps.forEach(function (c, i) {
    assert.ok(c.lines.length >= 1 && c.lines.length <= 2);
    c.lines.forEach(function (l) { assert.ok(l.length <= 42, 'line too long: ' + l.length); });
    words = words.concat(c.lines.join(' ').split(' '));
    if (i) assert.ok(Math.abs(c.start - caps[i - 1].end) < 1e-9, 'captions are back to back');
  });
  assert.strictEqual(words.join(' '), LONG_AR, 'no words lost or reordered');
  assert.strictEqual(caps[0].start, 10);
  assert.strictEqual(caps[caps.length - 1].end, 22);
  var lengths = caps.map(function (c) { return c.lines.join(' ').length; });
  assert.ok(Math.max.apply(null, lengths) - Math.min.apply(null, lengths) < 40, 'even lengths: ' + lengths);
});

test('one-line captions and short segments', function () {
  var one = captions.toCaptions([{ start: 0, end: 12, text: LONG_AR }], { maxCharsPerLine: 30, maxLines: 1 });
  one.forEach(function (c) { assert.strictEqual(c.lines.length, 1); assert.ok(c.lines[0].length <= 30); });
  var short = captions.toCaptions([{ start: 1, end: 1.2, text: 'نعم' }, { start: 3, end: 4, text: 'لا' }], {});
  assert.deepStrictEqual(short[0].lines, ['نعم']);
  assert.ok(Math.abs(short[0].end - 1.8) < 1e-9, 'very short captions are held on screen a little longer');
  var overlong = captions.toCaptions([{ start: 0, end: 2, text: 'كلمة' + new Array(60).join('ة') + ' قصيرة' }], { maxCharsPerLine: 20, maxLines: 2 });
  assert.strictEqual(overlong.length, 2, 'a word longer than a line gets its own caption');
});

test('writes valid SRT with optional right-to-left marks', function () {
  var caps = [{ start: 0.5, end: 2.25, lines: ['السلام عليكم'] }, { start: 3661.001, end: 3662, lines: ['سطر أول', 'سطر ثان'] }];
  assert.strictEqual(captions.toSrt(caps),
    '1\r\n00:00:00,500 --> 00:00:02,250\r\nالسلام عليكم\r\n\r\n2\r\n01:01:01,001 --> 01:01:02,000\r\nسطر أول\r\nسطر ثان\r\n');
  var rtl = captions.toSrt(caps, { rtlMark: true });
  assert.ok(rtl.indexOf('\r\n‏سطر أول\r\n‏سطر ثان') > 0);
  assert.strictEqual(captions.clock(75), '1:15');
  assert.strictEqual(captions.clock(3725), '1:02:05');
  assert.strictEqual(captions.toPlainText([{ start: 65, text: 'مرحبا' }], true), '[1:05] مرحبا');
});

/* ---------- engines ---------- */

function startMockApi(handler) {
  return new Promise(function (resolve) {
    var server = http.createServer(function (req, res) {
      var body = [];
      req.on('data', function (d) { body.push(d); });
      req.on('end', function () { handler(req, Buffer.concat(body), res); });
    });
    server.listen(0, '127.0.0.1', function () { resolve(server); });
  });
}

function makeChunk() {
  var file = path.join(tmp, 'chunk-' + Math.random().toString(16).slice(2) + '.wav');
  fs.writeFileSync(file, wav.encodeWav16(new Int16Array(1600), 16000));
  return file;
}

test('API engine sends a proper multipart request and reads segments', async function () {
  var seen = null;
  var server = await startMockApi(function (req, body, res) {
    seen = { method: req.method, url: req.url, headers: req.headers, body: body.toString('latin1') };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ text: 'مرحبا', segments: [{ start: 0, end: 1.5, text: ' مرحبا', no_speech_prob: 0.01, avg_logprob: -0.2 }] }));
  });
  try {
    var segs = await engines.transcribeApi(makeChunk(), {
      apiBaseUrl: 'http://127.0.0.1:' + server.address().port + '/v1/', apiKey: 'test-key', apiModel: 'whisper-1', language: 'ar', prompt: 'دبي'
    });
    assert.deepStrictEqual(segs, [{ start: 0, end: 1.5, text: ' مرحبا', noSpeechProb: 0.01, avgLogprob: -0.2 }]);
    assert.strictEqual(seen.method, 'POST');
    assert.strictEqual(seen.url, '/v1/audio/transcriptions');
    assert.strictEqual(seen.headers.authorization, 'Bearer test-key');
    var boundary = /boundary=(.+)$/.exec(seen.headers['content-type'])[1];
    function field(name) {
      var m = new RegExp('--' + boundary + '\\r\\nContent-Disposition: form-data; name="' + name.replace(/[[\]]/g, '\\$&') + '"\\r\\n\\r\\n([^\\r]*)\\r\\n').exec(seen.body);
      return m && Buffer.from(m[1], 'latin1').toString('utf8');
    }
    assert.strictEqual(field('model'), 'whisper-1');
    assert.strictEqual(field('language'), 'ar');
    assert.strictEqual(field('response_format'), 'verbose_json');
    assert.strictEqual(field('timestamp_granularities[]'), 'segment');
    assert.strictEqual(field('prompt'), 'دبي');
    assert.ok(seen.body.indexOf('name="file"; filename="') > 0 && seen.body.indexOf('RIFF') > 0, 'audio attached');
    assert.ok(seen.body.endsWith('--' + boundary + '--\r\n'));
  } finally {
    server.close();
  }
});

test('API engine explains auth errors and models without timings', async function () {
  var reply = { status: 401, body: { error: { message: 'Incorrect API key provided' } } };
  var server = await startMockApi(function (req, body, res) {
    res.statusCode = reply.status;
    res.end(JSON.stringify(reply.body));
  });
  var settings = { apiBaseUrl: 'http://127.0.0.1:' + server.address().port, apiKey: 'bad', language: 'ar' };
  try {
    await assert.rejects(engines.transcribeApi(makeChunk(), settings), /API key was rejected.*Incorrect API key/);
    reply = { status: 200, body: { text: 'مرحبا' } };
    await assert.rejects(engines.transcribeApi(makeChunk(), Object.assign({}, settings, { apiModel: 'gpt-4o-transcribe' })), /without timings/);
    await assert.rejects(engines.transcribeApi(makeChunk(), { apiKey: '' }), /API key/);
  } finally {
    server.close();
  }
});

test('API engine retries when rate limited and can be cancelled', async function () {
  var calls = 0;
  var server = await startMockApi(function (req, body, res) {
    calls++;
    if (calls === 1) { res.statusCode = 429; res.end('{}'); return; }
    res.end(JSON.stringify({ segments: [{ start: 0, end: 1, text: 'تم' }] }));
  });
  var settings = { apiBaseUrl: 'http://127.0.0.1:' + server.address().port, apiKey: 'k' };
  try {
    var segs = await engines.transcribeApi(makeChunk(), settings);
    assert.strictEqual(calls, 2);
    assert.strictEqual(segs[0].text, 'تم');

    calls = 0;
    var token = new engines.CancelToken();
    var pending = engines.transcribeApi(makeChunk(), settings, token); // first call gets 429, then waits
    setTimeout(function () { token.cancel(); }, 200);
    await assert.rejects(pending, function (e) { return e.cancelled === true; });
  } finally {
    server.close();
  }
});

test('whisper.cpp engine runs the program and reads its JSON', async function () {
  if (process.platform === 'win32') return;
  var fake = path.join(tmp, 'fake-whisper-cli');
  fs.writeFileSync(fake, '#!/usr/bin/env node\n' +
    'var a = process.argv.slice(2), get = function (f) { return a[a.indexOf(f) + 1]; };\n' +
    'require("fs").writeFileSync(get("-of") + ".argv", JSON.stringify(a));\n' +
    'process.stderr.write("whisper_print_progress_callback: progress =  50%\\n");\n' +
    'require("fs").writeFileSync(get("-of") + ".json", JSON.stringify({ result: { language: get("-l") }, transcription: [\n' +
    '  { timestamps: { from: "00:00:00,000", to: "00:00:02,500" }, offsets: { from: 0, to: 2500 }, text: " السلام عليكم" },\n' +
    '  { timestamps: { from: "00:00:02,500", to: "00:00:04,000" }, offsets: { from: 2500, to: 4000 }, text: " ورحمة الله" } ] }));\n');
  fs.chmodSync(fake, 493);
  var model = path.join(tmp, 'ggml-test.bin');
  fs.writeFileSync(model, 'x');
  var chunk = makeChunk();
  var progress = [];
  var segs = await engines.transcribe(chunk, { engine: 'whisper', whisperBinary: fake, whisperModel: model, language: 'ar', prompt: 'دبي' },
    new engines.CancelToken(), function (p) { progress.push(p); });
  assert.deepStrictEqual(segs, [{ start: 0, end: 2.5, text: ' السلام عليكم' }, { start: 2.5, end: 4, text: ' ورحمة الله' }]);
  assert.deepStrictEqual(progress, [0.5]);
  var argv = JSON.parse(fs.readFileSync(chunk.replace(/\.wav$/, '.argv'), 'utf8'));
  assert.deepStrictEqual(argv.slice(0, 8), ['-m', model, '-f', chunk, '-l', 'ar', '-oj', '-of']);
  assert.ok(argv.indexOf('--prompt') > 0 && argv[argv.indexOf('--prompt') + 1] === 'دبي');

  var failing = path.join(tmp, 'failing-whisper');
  fs.writeFileSync(failing, '#!/bin/sh\necho "error: failed to load model" >&2\nexit 3\n');
  fs.chmodSync(failing, 493);
  await assert.rejects(engines.transcribeWhisperCpp(chunk, { whisperBinary: failing, whisperModel: model }), /code 3[\s\S]*failed to load model/);
  await assert.rejects(engines.transcribeWhisperCpp(chunk, { whisperBinary: '/nope/whisper-cli', whisperModel: model }), /Choose the whisper.cpp program/);
});

/* ---------- host/index.jsx against a mocked Premiere ---------- */

function loadHostBridge() {
  var sandbox = { window: { location: { pathname: '/ext/index.html' } }, JSON: JSON, Promise: Promise };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/host.js'), 'utf8'), sandbox);
  return sandbox.window.AT.host;
}

function makePremiere(appDir) {
  function FileMock(p) { this.fsName = path.resolve(String(p)); this.name = encodeURI(path.basename(this.fsName)); }
  Object.defineProperty(FileMock.prototype, 'exists', { get: function () { return fs.existsSync(this.fsName) && fs.statSync(this.fsName).isFile(); } });
  Object.defineProperty(FileMock.prototype, 'length', { get: function () { return fs.statSync(this.fsName).size; } });
  FileMock.prototype.remove = function () { fs.unlinkSync(this.fsName); return true; };

  function FolderMock(p) { this.fsName = path.resolve(String(p)); this.name = encodeURI(path.basename(this.fsName)); }
  Object.defineProperty(FolderMock.prototype, 'exists', { get: function () { return fs.existsSync(this.fsName) && fs.statSync(this.fsName).isDirectory(); } });
  Object.defineProperty(FolderMock.prototype, 'parent', { get: function () { return new FolderMock(path.dirname(this.fsName)); } });
  FolderMock.prototype.getFiles = function (mask) {
    var dir = this.fsName;
    var re = mask ? new RegExp('^' + mask.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i') : null;
    return fs.readdirSync(dir).filter(function (n) { return !re || re.test(n); }).map(function (n) {
      var full = path.join(dir, n);
      return fs.statSync(full).isDirectory() ? new FolderMock(full) : new FileMock(full);
    });
  };

  var captionTracks = [];
  var markers = [];
  function Bin(name) { this.name = name; this.type = 2; this.items = []; var self = this; this.children = { get numItems() { return self.items.length; } }; }
  Bin.prototype.sync = function () { for (var i = 0; i < this.items.length; i++) this.children[i] = this.items[i]; };
  var rootItem = new Bin('root');
  rootItem.createBin = function (name) { rootItem.items.push(new Bin(name)); rootItem.sync(); };

  var seq = {
    name: 'مقابلة 1', sequenceID: 'seq-1', end: String(254016000000 * 120),
    getInPointAsTime: function () { return { seconds: 10 }; },
    getOutPointAsTime: function () { return { seconds: 70 }; },
    exportAsMediaDirect: function (out, preset, range) {
      seq.lastExport = { out: out, preset: preset, range: range };
      writeWav(out, { seconds: 1, rate: 48000, channels: 2, bits: 16 }, speechLike);
      return 'No Error';
    },
    createCaptionTrack: function (item, start) { captionTracks.push({ item: item, start: start }); },
    setPlayerPosition: function (ticks) { seq.playhead = ticks; },
    markers: { createMarker: function (t) { var m = { start: t }; markers.push(m); return m; } }
  };
  var app = {
    path: appDir,
    encoder: { ENCODE_IN_TO_OUT: 1 },
    project: {
      path: '/projects/demo.prproj', activeSequence: seq, rootItem: rootItem,
      importFiles: function (paths, quiet, bin) {
        paths.forEach(function (p) { bin.items.push({ name: path.basename(p), path: p }); });
        bin.sync();
        return true;
      }
    }
  };
  var context = vm.createContext({ app: app, File: FileMock, Folder: FolderMock, ProjectItemType: { BIN: 2 } });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'host/index.jsx'), 'utf8'), context);
  return { context: context, seq: seq, captionTracks: captionTracks, markers: markers, rootItem: rootItem };
}

// Runs a call the same way the panel does: through the bridge's literal encoding.
function hostCall(pr, bridge, fn) {
  var args = Array.prototype.slice.call(arguments, 3).map(bridge.literal).join(', ');
  var script = fn + '(' + args + ')';
  assert.ok(/^[\x20-\x7e]*$/.test(script), 'script sent to Premiere is plain ASCII');
  return JSON.parse(vm.runInContext(script, pr.context));
}

test('ExtendScript: context, preset lookup, audio export', function () {
  var appDir = path.join(tmp, 'Adobe Premiere Pro 2026');
  var presets = path.join(appDir, 'MediaIO', 'systempresets');
  fs.mkdirSync(path.join(presets, '4E4F4E45_4D504547'), { recursive: true });
  fs.writeFileSync(path.join(presets, '4E4F4E45_4D504547', 'Match Source.epr'), '');
  fs.mkdirSync(path.join(presets, '3F3F3F3F_57415645'), { recursive: true });
  fs.writeFileSync(path.join(presets, '3F3F3F3F_57415645', 'Waveform Audio 44.1kHz 24-bit.epr'), '');
  fs.writeFileSync(path.join(presets, '3F3F3F3F_57415645', 'Waveform Audio 48kHz 16-bit.epr'), '');
  var pr = makePremiere(appDir);
  var bridge = loadHostBridge();

  var ctx = hostCall(pr, bridge, 'AT_getContext');
  assert.deepStrictEqual(ctx, { ok: true, projectPath: '/projects/demo.prproj',
    sequence: { name: 'مقابلة 1', id: 'seq-1', inSec: 10, outSec: 70, endSec: 120, hasInOut: true } });

  var out = path.join(tmp, 'export dir', 'sequence.wav');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  var res = hostCall(pr, bridge, 'AT_exportAudio', out, '');
  assert.strictEqual(res.ok, true, res.error);
  assert.strictEqual(res.inSec, 10);
  assert.strictEqual(path.basename(pr.seq.lastExport.preset), 'Waveform Audio 48kHz 16-bit.epr');
  assert.strictEqual(pr.seq.lastExport.range, 1);
  assert.ok(fs.statSync(out).size > 44);

  var noPreset = makePremiere(path.join(tmp, 'nowhere'));
  var failed = hostCall(noPreset, bridge, 'AT_exportAudio', out, '');
  assert.strictEqual(failed.ok, false);
  assert.strictEqual(failed.code, 'NO_PRESET');
});

test('ExtendScript: captions import, markers and playhead with Arabic text', function () {
  var pr = makePremiere(path.join(tmp, 'nowhere'));
  var bridge = loadHostBridge();
  var srt = path.join(tmp, 'مقابلة 1 - Arabic.srt');
  fs.writeFileSync(srt, '﻿1\r\n00:00:10,000 --> 00:00:12,000\r\nالسلام عليكم\r\n');

  var res = hostCall(pr, bridge, 'AT_importCaptions', srt, true);
  assert.strictEqual(res.ok, true, res.error);
  assert.strictEqual(res.trackAdded, true);
  assert.strictEqual(res.itemName, 'مقابلة 1 - Arabic.srt');
  assert.strictEqual(pr.rootItem.items[0].name, 'Arabic Transcripts');
  assert.strictEqual(pr.captionTracks.length, 1);
  assert.strictEqual(pr.captionTracks[0].start, 0);

  hostCall(pr, bridge, 'AT_importCaptions', srt, true);
  assert.strictEqual(pr.rootItem.items.length, 1, 'bin is reused');

  var segments = [{ start: 10, end: 12.5, text: 'السلام عليكم "يا" صديقي' }, { start: 13, end: 14, text: new Array(80).join('ب') }];
  var m = hostCall(pr, bridge, 'AT_addMarkers', JSON.stringify(segments));
  assert.strictEqual(m.count, 2);
  assert.deepStrictEqual(pr.markers[0], { start: 10, name: segments[0].text, comments: segments[0].text, end: 12.5 });
  assert.strictEqual(pr.markers[1].name.length, 61, 'long marker names are shortened');

  hostCall(pr, bridge, 'AT_setPlayhead', 1.5);
  assert.strictEqual(pr.seq.playhead, String(1.5 * 254016000000));
});

/* ---------- run ---------- */

(async function () {
  var failed = 0;
  for (var i = 0; i < tests.length; i++) {
    try {
      await tests[i].fn();
      console.log('  ok  ' + tests[i].name);
    } catch (e) {
      failed++;
      console.log('FAIL  ' + tests[i].name + '\n      ' + (e && e.stack || e).toString().split('\n').join('\n      '));
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\n' + (tests.length - failed) + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
