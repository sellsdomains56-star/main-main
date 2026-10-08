/*
 * Panel controller: settings, the transcription run, and the result list.
 */
(function () {
  'use strict';

  var AT = window.AT;
  var nodeRequire = window.cep_node && window.cep_node.require ? window.cep_node.require : require;
  var fs = nodeRequire('fs');
  var os = nodeRequire('os');
  var path = nodeRequire('path');

  var SETTINGS_KEY = 'arabicTranscriber.settings.v1';
  var RESULT_KEY = 'arabicTranscriber.lastResult.v1';
  var DEFAULTS = {
    engine: 'api',
    apiService: 'openai',
    apiKey: '',
    apiBaseUrl: AT.engines.API_PRESETS.openai.baseUrl,
    apiModel: AT.engines.API_PRESETS.openai.model,
    whisperBinary: '',
    whisperModel: '',
    language: 'ar',
    prompt: '',
    filterHallucinations: true,
    maxCharsPerLine: 42,
    maxLines: 2,
    removeDiacritics: false,
    rtlMark: false,
    presetPath: '',
    partMinutes: 10
  };

  var settings = loadJson(SETTINGS_KEY, {});
  Object.keys(DEFAULTS).forEach(function (k) {
    if (settings[k] === undefined) settings[k] = DEFAULTS[k];
  });
  var context = null; // reply of AT_getContext
  var result = loadJson(RESULT_KEY, null); // { sequenceId, sequenceName, segments }
  var token = null; // CancelToken while a run is in progress

  function $(id) {
    return document.getElementById(id);
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full or blocked: not fatal */ }
  }

  /* ---------- messages and progress ---------- */

  function showMessage(text, kind) {
    var el = $('message');
    el.textContent = text;
    el.className = 'message ' + (kind || 'info');
    el.hidden = false;
  }

  function hideMessage() {
    $('message').hidden = true;
  }

  // fraction null shows a moving bar for steps without measurable progress.
  function progress(text, fraction) {
    $('progress-text').textContent = text;
    var fill = $('progress-fill');
    if (fraction == null) {
      fill.classList.add('indeterminate');
    } else {
      fill.classList.remove('indeterminate');
      fill.style.width = Math.round(Math.max(0, Math.min(1, fraction)) * 100) + '%';
    }
  }

  function setBusy(busy) {
    $('progress').hidden = !busy;
    $('transcribe').disabled = busy;
    ['add-captions', 'add-markers', 'save-srt', 'copy-text', 'clear'].forEach(function (id) {
      $(id).disabled = busy;
    });
    if (busy) progress('', 0);
  }

  /* ---------- settings ---------- */

  function bindSettings() {
    var inputs = document.querySelectorAll('[data-setting]');
    Array.prototype.forEach.call(inputs, function (el) {
      var key = el.getAttribute('data-setting');
      el.addEventListener('change', function () {
        if (el.type === 'checkbox') settings[key] = el.checked;
        else if (el.type === 'radio') {
          if (el.checked) settings[key] = el.value;
        } else if (el.type === 'number' || el.getAttribute('data-type') === 'number') {
          settings[key] = Number(el.value) || DEFAULTS[key];
        } else settings[key] = el.value.trim();

        if (key === 'apiService' && AT.engines.API_PRESETS[el.value]) {
          settings.apiBaseUrl = AT.engines.API_PRESETS[el.value].baseUrl;
          settings.apiModel = AT.engines.API_PRESETS[el.value].model;
        }
        if (key === 'apiBaseUrl' || key === 'apiModel') settings.apiService = serviceFor(settings.apiBaseUrl);
        saveJson(SETTINGS_KEY, settings);
        renderSettings();
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-choose]'), function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-choose');
        AT.host.call('AT_chooseFile', 'Choose a file').then(function (res) {
          if (!res.path) return;
          settings[key] = res.path;
          saveJson(SETTINGS_KEY, settings);
          renderSettings();
        }).catch(function (e) { showMessage(e.message, 'error'); });
      });
    });
  }

  function serviceFor(baseUrl) {
    var presets = AT.engines.API_PRESETS;
    for (var name in presets) {
      if (presets[name].baseUrl === String(baseUrl).replace(/\/+$/, '')) return name;
    }
    return 'custom';
  }

  function renderSettings() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-setting]'), function (el) {
      var value = settings[el.getAttribute('data-setting')];
      if (el.type === 'checkbox') el.checked = !!value;
      else if (el.type === 'radio') el.checked = value === el.value;
      else if (document.activeElement !== el) el.value = value == null ? '' : value;
    });
    $('api-settings').hidden = settings.engine !== 'api';
    $('whisper-settings').hidden = settings.engine !== 'whisper';

    var engine = settings.engine === 'whisper'
      ? 'whisper.cpp on this computer' + (settings.whisperModel ? ' (' + path.basename(settings.whisperModel) + ')' : '')
      : (settings.apiService === 'custom' ? 'API' : $('api-service').selectedOptions[0].textContent.split(' (')[0]) + ' · ' + settings.apiModel;
    $('engine-summary').textContent = 'Engine: ' + engine + ' · ' + (settings.language === 'ar' ? 'Arabic' : 'auto-detect') + '  ›  change';
  }

  function settingsProblem() {
    if (settings.engine === 'whisper') {
      if (!settings.whisperBinary) return 'Choose the whisper.cpp program in Settings.';
      if (!settings.whisperModel) return 'Choose a whisper.cpp model file in Settings.';
    } else if (!settings.apiKey) {
      return 'Add your API key in Settings (or switch to offline whisper.cpp).';
    }
    return '';
  }

  function openSettings() {
    $('settings').open = true;
    $('settings').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- sequence ---------- */

  function refreshContext() {
    return AT.host.call('AT_getContext').then(function (ctx) {
      context = ctx;
      renderContext();
      return ctx;
    }).catch(function (e) {
      context = null;
      $('seq-name').textContent = '—';
      $('seq-range').textContent = e.message;
    });
  }

  function renderContext() {
    var seq = context && context.sequence;
    if (!seq) {
      $('seq-name').textContent = 'No sequence open';
      $('seq-range').textContent = 'Open a sequence in the Timeline.';
      return;
    }
    var clock = AT.captions.clock;
    $('seq-name').textContent = seq.name;
    $('seq-range').textContent = seq.hasInOut
      ? 'In to Out: ' + clock(seq.inSec) + ' – ' + clock(seq.outSec) + ' (' + clock(seq.outSec - seq.inSec) + ')'
      : 'Whole sequence (' + clock(seq.endSec) + '). Set In/Out to transcribe part of it.';
  }

  /* ---------- transcription ---------- */

  function checkCancelled() {
    if (token && token.cancelled) {
      var e = new Error('Cancelled.');
      e.cancelled = true;
      throw e;
    }
  }

  async function transcribe() {
    if (token) return;
    hideMessage();
    var problem = settingsProblem();
    if (problem) {
      showMessage(problem, 'error');
      openSettings();
      return;
    }

    token = new AT.engines.CancelToken();
    setBusy(true);
    var workDir = null;
    try {
      progress('Checking the sequence…', null);
      context = await AT.host.call('AT_getContext');
      renderContext();
      var seq = context.sequence;
      if (!seq) throw new Error('Open a sequence in the Timeline first.');
      if (seq.outSec - seq.inSec < 0.5) throw new Error('The sequence (or its In/Out range) is empty.');

      workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arabic-transcriber-'));
      progress('Exporting the sequence audio from Premiere…', null);
      var exported = await AT.host.call('AT_exportAudio', path.join(workDir, 'sequence.wav'), settings.presetPath || '');
      checkCancelled();

      // 12 minutes of 16 kHz mono is about 23 MB, just under the usual 25 MB upload limit.
      var partMinutes = Math.min(12, Math.max(1, Number(settings.partMinutes) || DEFAULTS.partMinutes));
      var prepared = await AT.wav.splitForSpeech(exported.path, workDir, { chunkSec: partMinutes * 60 }, function (p) {
        progress('Preparing audio…', p * 0.05);
      }, token);
      var parts = prepared.chunks.filter(function (c) { return !c.silent; });
      if (!parts.length) throw new Error('The sequence audio is silent. Check that the audio tracks are not muted.');

      var totalSec = parts.reduce(function (sum, c) { return sum + c.durationSec; }, 0);
      var doneSec = 0;
      var raw = [];
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        var label = parts.length > 1 ? 'Transcribing part ' + (i + 1) + ' of ' + parts.length + '…' : 'Transcribing…';
        progress(label, 0.05 + 0.95 * doneSec / totalSec);
        var segments = await AT.engines.transcribe(part.path, settings, token, function (p) {
          progress(label, 0.05 + 0.95 * (doneSec + p * part.durationSec) / totalSec);
        });
        var offset = exported.inSec + part.startSec;
        segments.forEach(function (s) {
          raw.push({ start: s.start + offset, end: s.end + offset, text: s.text, noSpeechProb: s.noSpeechProb, avgLogprob: s.avgLogprob });
        });
        doneSec += part.durationSec;
      }

      var clean = AT.captions.cleanSegments(raw, { filterHallucinations: settings.filterHallucinations });
      if (!clean.length) throw new Error('No speech was recognised in the sequence audio.');
      result = { sequenceId: seq.id, sequenceName: seq.name, segments: clean };
      saveJson(RESULT_KEY, result);
      renderResult();
      showMessage('Done: ' + clean.length + ' lines. Check the text, then add it to the sequence.', 'success');
    } catch (e) {
      if (e.cancelled) showMessage('Cancelled.', 'info');
      else {
        showMessage(e.message || String(e), 'error');
        if (e.code === 'NO_PRESET') openSettings();
      }
    } finally {
      token = null;
      setBusy(false);
      if (workDir) removeFolder(workDir);
    }
  }

  function removeFolder(dir) {
    try {
      fs.readdirSync(dir).forEach(function (name) { fs.unlinkSync(path.join(dir, name)); });
      fs.rmdirSync(dir);
    } catch (e) { /* temp files; the OS cleans up eventually */ }
  }

  /* ---------- results ---------- */

  function renderResult() {
    var list = $('segments');
    list.textContent = '';
    if (!result || !result.segments.length) {
      $('results').hidden = true;
      return;
    }
    $('results').hidden = false;
    $('results-title').textContent = result.segments.length + ' lines · ' + result.sequenceName;

    result.segments.forEach(function (seg, index) {
      var row = document.createElement('div');
      row.className = 'segment';

      var time = document.createElement('button');
      time.className = 'time';
      time.type = 'button';
      time.title = 'Move the playhead here';
      time.textContent = AT.captions.clock(seg.start);
      time.addEventListener('click', function () {
        AT.host.call('AT_setPlayhead', seg.start).catch(function (e) { showMessage(e.message, 'error'); });
      });

      var text = document.createElement('div');
      text.className = 'text';
      text.lang = 'ar';
      text.dir = 'rtl';
      text.setAttribute('contenteditable', 'plaintext-only');
      if (text.contentEditable !== 'plaintext-only') text.contentEditable = 'true';
      text.spellcheck = false;
      text.textContent = seg.text;
      text.addEventListener('input', function () {
        seg.text = text.textContent.replace(/\s+/g, ' ').trim();
        saveJson(RESULT_KEY, result);
      });

      var remove = document.createElement('button');
      remove.className = 'remove';
      remove.type = 'button';
      remove.title = 'Remove this line';
      remove.textContent = '×';
      remove.addEventListener('click', function () {
        result.segments.splice(index, 1);
        saveJson(RESULT_KEY, result);
        renderResult();
      });

      row.appendChild(time);
      row.appendChild(text);
      row.appendChild(remove);
      list.appendChild(row);
    });
  }

  // Segments as they should go out: edited text, empty lines dropped, diacritics removed if asked.
  function outputSegments() {
    return result.segments.map(function (s) {
      return { start: s.start, end: s.end, text: AT.captions.cleanText(s.text, { removeDiacritics: settings.removeDiacritics }) };
    }).filter(function (s) { return s.text; });
  }

  function buildSrt() {
    var captions = AT.captions.toCaptions(outputSegments(), { maxCharsPerLine: settings.maxCharsPerLine, maxLines: settings.maxLines });
    // The byte-order mark helps Premiere and other apps read the file as UTF-8.
    return '﻿' + AT.captions.toSrt(captions, { rtlMark: settings.rtlMark });
  }

  function safeName(name) {
    return String(name).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Sequence';
  }

  function timestamp() {
    var d = new Date();
    function p(n) { return ('0' + n).slice(-2); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }

  function makeFolder(dir) {
    if (fs.existsSync(dir)) return;
    makeFolder(path.dirname(dir));
    fs.mkdirSync(dir);
  }

  // Captions are kept next to the project (Premiere links to the file), or in Documents for unsaved projects.
  function transcriptsFolder(projectPath) {
    if (projectPath && /\.prproj$/i.test(projectPath)) return path.join(path.dirname(projectPath), 'Arabic Transcripts');
    return path.join(os.homedir(), 'Documents', 'Arabic Transcripts');
  }

  async function addCaptions() {
    var ctx = await AT.host.call('AT_getContext');
    if (!ctx.sequence) throw new Error('Open the sequence you transcribed in the Timeline first.');
    var folder = transcriptsFolder(ctx.projectPath);
    makeFolder(folder);
    var file = path.join(folder, safeName(result.sequenceName) + ' - Arabic ' + timestamp() + '.srt');
    fs.writeFileSync(file, buildSrt(), 'utf8');

    var res = await AT.host.call('AT_importCaptions', file, true);
    var note = ctx.sequence.id !== result.sequenceId
      ? '\nNote: this transcript was made from "' + result.sequenceName + '", not "' + ctx.sequence.name + '".'
      : '';
    if (res.trackAdded) {
      showMessage('Added an Arabic caption track to "' + ctx.sequence.name + '". The SRT is saved in ' + folder + '.' + note +
        '\nIf letters look disconnected, set Preferences › Graphics › Text Engine to "South Asian and Middle Eastern".', 'success');
    } else {
      showMessage('Imported "' + res.itemName + '" into the "Arabic Transcripts" bin. ' + res.trackError +
        ' Drag it onto the timeline to add the captions.' + note, 'info');
    }
  }

  async function addMarkers() {
    var ctx = await AT.host.call('AT_getContext');
    if (!ctx.sequence) throw new Error('Open the sequence you transcribed in the Timeline first.');
    var res = await AT.host.call('AT_addMarkers', JSON.stringify(outputSegments()));
    showMessage('Added ' + res.count + ' markers to "' + ctx.sequence.name + '".', 'success');
  }

  async function saveSrt() {
    var res = await AT.host.call('AT_chooseSaveFile', 'Save Arabic captions', safeName(result.sequenceName) + ' - Arabic.srt');
    if (!res.path) return;
    var file = /\.srt$/i.test(res.path) ? res.path : res.path + '.srt';
    fs.writeFileSync(file, buildSrt(), 'utf8');
    showMessage('Saved ' + file, 'success');
  }

  function copyText() {
    var area = document.createElement('textarea');
    area.value = AT.captions.toPlainText(outputSegments(), false);
    document.body.appendChild(area);
    area.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(area);
    showMessage(ok ? 'Transcript copied.' : 'Could not copy. Use Save SRT instead.', ok ? 'success' : 'error');
  }

  // Runs a button action, showing its error in the panel.
  function action(fn) {
    return function () {
      if (token) return;
      hideMessage();
      Promise.resolve().then(fn).catch(function (e) { showMessage(e.message || String(e), 'error'); });
    };
  }

  /* ---------- start ---------- */

  bindSettings();
  renderSettings();
  renderResult();
  refreshContext();

  $('refresh').addEventListener('click', refreshContext);
  window.addEventListener('focus', refreshContext);
  $('engine-summary').addEventListener('click', openSettings);
  $('transcribe').addEventListener('click', transcribe);
  $('cancel').addEventListener('click', function () {
    if (token) {
      token.cancel();
      progress('Cancelling…', null);
    }
  });
  $('add-captions').addEventListener('click', action(addCaptions));
  $('add-markers').addEventListener('click', action(addMarkers));
  $('save-srt').addEventListener('click', action(saveSrt));
  $('copy-text').addEventListener('click', action(copyText));
  $('clear').addEventListener('click', action(function () {
    result = null;
    saveJson(RESULT_KEY, null);
    renderResult();
  }));
})();
