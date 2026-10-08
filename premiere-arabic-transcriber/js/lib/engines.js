/*
 * Speech-to-text engines. Both return segments as [{ start, end, text }] in
 * seconds, relative to the start of the audio file they were given.
 *
 *  - api:     any OpenAI-compatible /audio/transcriptions endpoint
 *             (OpenAI whisper-1, Groq whisper-large-v3, a self-hosted server...)
 *  - whisper: a local whisper.cpp binary (whisper-cli), fully offline
 */
(function (root) {
  'use strict';

  var nodeRequire = root.cep_node && root.cep_node.require ? root.cep_node.require : require;
  var fs = nodeRequire('fs');
  var os = nodeRequire('os');
  var path = nodeRequire('path');
  var http = nodeRequire('http');
  var https = nodeRequire('https');
  var URL = nodeRequire('url').URL;
  var childProcess = nodeRequire('child_process');

  var API_PRESETS = {
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'whisper-1' },
    groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'whisper-large-v3' }
  };

  function CancelToken() {
    this.cancelled = false;
    this.handlers = [];
  }

  CancelToken.prototype.cancel = function () {
    if (this.cancelled) return;
    this.cancelled = true;
    this.handlers.slice().forEach(function (fn) {
      try { fn(); } catch (e) { /* ignore */ }
    });
  };

  // Registers fn to run on cancel; returns a function that unregisters it.
  CancelToken.prototype.onCancel = function (fn) {
    var handlers = this.handlers;
    handlers.push(fn);
    return function () {
      var i = handlers.indexOf(fn);
      if (i >= 0) handlers.splice(i, 1);
    };
  };

  function cancelledError() {
    var e = new Error('Cancelled.');
    e.cancelled = true;
    return e;
  }

  function delay(ms, token) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { off(); resolve(); }, ms);
      var off = token ? token.onCancel(function () { clearTimeout(timer); reject(cancelledError()); }) : function () {};
    });
  }

  function multipart(fields, file) {
    var boundary = '----ArabicTranscriber' + Date.now().toString(16) + Math.random().toString(16).slice(2);
    var parts = [];
    fields.forEach(function (field) {
      parts.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + field[0] + '"\r\n\r\n' + field[1] + '\r\n', 'utf8'));
    });
    parts.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="' + file.name + '"\r\nContent-Type: ' + file.type + '\r\n\r\n', 'utf8'));
    parts.push(file.data);
    parts.push(Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8'));
    return { contentType: 'multipart/form-data; boundary=' + boundary, body: Buffer.concat(parts) };
  }

  function post(urlString, headers, body, token, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var url = new URL(urlString);
      var lib = url.protocol === 'http:' ? http : https;
      var settled = false;
      function finish(fn, value) {
        if (settled) return;
        settled = true;
        off();
        fn(value);
      }
      var req = lib.request({
        method: 'POST',
        hostname: url.hostname,
        port: url.port || undefined,
        path: url.pathname + url.search,
        headers: Object.assign({ 'Content-Length': body.length }, headers)
      }, function (res) {
        var received = [];
        res.on('data', function (d) { received.push(d); });
        res.on('end', function () {
          finish(resolve, { status: res.statusCode, body: Buffer.concat(received).toString('utf8') });
        });
        res.on('error', function (e) { finish(reject, e); });
      });
      var off = token ? token.onCancel(function () { req.abort(); finish(reject, cancelledError()); }) : function () {};
      req.on('error', function (e) { finish(reject, e); });
      req.setTimeout(timeoutMs, function () {
        req.abort();
        finish(reject, new Error('The transcription service did not answer in time.'));
      });
      req.end(body);
    });
  }

  function apiErrorMessage(status, json, body) {
    var detail = json && json.error ? (json.error.message || json.error) : String(body || '').slice(0, 300);
    if (status === 401) return 'The API key was rejected (401). Check it in Settings. ' + detail;
    if (status === 413) return 'The audio part was too large for this service (413). Lower "Part length" in Settings.';
    return 'Transcription service error ' + status + ': ' + detail;
  }

  /** Transcribes one WAV file with an OpenAI-compatible API. */
  async function transcribeApi(file, settings, token) {
    if (!settings.apiKey) throw new Error('Add your API key in Settings first.');
    var base = String(settings.apiBaseUrl || API_PRESETS.openai.baseUrl).replace(/\/+$/, '');
    var model = settings.apiModel || API_PRESETS.openai.model;
    var fields = [
      ['model', model],
      ['response_format', 'verbose_json'],
      ['timestamp_granularities[]', 'segment'],
      ['temperature', '0']
    ];
    if (settings.language && settings.language !== 'auto') fields.push(['language', settings.language]);
    if (settings.prompt) fields.push(['prompt', settings.prompt]);
    var form = multipart(fields, { name: path.basename(file), type: 'audio/wav', data: fs.readFileSync(file) });
    var headers = { 'Content-Type': form.contentType, Authorization: 'Bearer ' + settings.apiKey, Accept: 'application/json' };

    for (var attempt = 1; ; attempt++) {
      var res;
      try {
        res = await post(base + '/audio/transcriptions', headers, form.body, token, 10 * 60 * 1000);
      } catch (e) {
        if (e.cancelled || attempt >= 3) throw e;
        await delay(attempt * 3000, token);
        continue;
      }
      if ((res.status === 429 || res.status >= 500) && attempt < 4) {
        await delay(attempt * 4000, token);
        continue;
      }
      var json = null;
      try { json = JSON.parse(res.body); } catch (e) { /* handled below */ }
      if (res.status >= 400) throw new Error(apiErrorMessage(res.status, json, res.body));
      if (!json) throw new Error('The transcription service sent an unreadable reply.');
      if (!json.segments) {
        if (json.text) {
          throw new Error('The model "' + model + '" returned text without timings, so it cannot make captions. ' +
            'Use whisper-1 (OpenAI) or whisper-large-v3 (Groq).');
        }
        return [];
      }
      return json.segments.map(function (s) {
        return { start: Number(s.start), end: Number(s.end), text: String(s.text || ''), noSpeechProb: s.no_speech_prob, avgLogprob: s.avg_logprob };
      });
    }
  }

  function parseWhisperCppJson(json) {
    return (json.transcription || []).map(function (t) {
      return { start: t.offsets.from / 1000, end: t.offsets.to / 1000, text: String(t.text || '') };
    });
  }

  function lastLines(text, n) {
    return String(text).trim().split(/\r?\n/).slice(-n).join('\n');
  }

  /** Transcribes one WAV file with a local whisper.cpp binary. */
  function transcribeWhisperCpp(file, settings, token, onProgress) {
    return new Promise(function (resolve, reject) {
      var bin = settings.whisperBinary;
      var model = settings.whisperModel;
      if (!bin || !fs.existsSync(bin)) return reject(new Error('Choose the whisper.cpp program (whisper-cli) in Settings.'));
      if (!model || !fs.existsSync(model)) return reject(new Error('Choose a whisper.cpp model file (ggml-*.bin) in Settings.'));

      var outBase = file.replace(/\.wav$/i, '');
      var threads = Math.max(1, Math.min(8, os.cpus().length));
      var args = ['-m', model, '-f', file, '-l', settings.language || 'ar', '-oj', '-of', outBase, '-t', String(threads), '-pp'];
      if (settings.prompt) args.push('--prompt', settings.prompt);

      var child;
      try {
        child = childProcess.spawn(bin, args, { windowsHide: true });
      } catch (e) {
        return reject(new Error('Could not start whisper.cpp: ' + e.message));
      }
      var log = '';
      var off = token ? token.onCancel(function () { child.kill(); }) : function () {};
      child.stdout.on('data', function (d) { log = (log + d).slice(-4000); });
      child.stderr.on('data', function (d) {
        var text = String(d);
        log = (log + text).slice(-4000);
        var re = /progress\s*=\s*(\d+)%/g;
        var m;
        var last = null;
        while ((m = re.exec(text))) last = m;
        if (last && onProgress) onProgress(parseInt(last[1], 10) / 100);
      });
      child.on('error', function (e) {
        off();
        reject(new Error('Could not start whisper.cpp at "' + bin + '": ' + e.message));
      });
      child.on('close', function (code) {
        off();
        if (token && token.cancelled) return reject(cancelledError());
        if (code !== 0) return reject(new Error('whisper.cpp stopped with an error (code ' + code + '):\n' + lastLines(log, 6)));
        try {
          resolve(parseWhisperCppJson(JSON.parse(fs.readFileSync(outBase + '.json', 'utf8'))));
        } catch (e) {
          reject(new Error('Could not read the whisper.cpp result: ' + e.message));
        }
      });
    });
  }

  function transcribe(file, settings, token, onProgress) {
    return settings.engine === 'whisper'
      ? transcribeWhisperCpp(file, settings, token, onProgress)
      : transcribeApi(file, settings, token);
  }

  var api = {
    API_PRESETS: API_PRESETS,
    CancelToken: CancelToken,
    transcribe: transcribe,
    transcribeApi: transcribeApi,
    transcribeWhisperCpp: transcribeWhisperCpp,
    parseWhisperCppJson: parseWhisperCppJson,
    multipart: multipart
  };
  root.AT = root.AT || {};
  root.AT.engines = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : global);
