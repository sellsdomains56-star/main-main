/*
 * Premiere Pro side of the Arabic Transcriber panel (ExtendScript, ES3).
 *
 * Every function returns a JSON string: {"ok":true,...} or {"ok":false,"error":"..."}.
 * Non-ASCII text is escaped as \uXXXX both ways so Arabic survives the bridge.
 * Times are in seconds from the start of the active sequence.
 */

var AT_TICKS_PER_SECOND = 254016000000;
var AT_BIN_NAME = 'Arabic Transcripts';

function AT_quote(s) {
  var out = '"';
  s = String(s);
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c === 34) out += '\\"';
    else if (c === 92) out += '\\\\';
    else if (c < 32 || c > 126) {
      var h = c.toString(16);
      while (h.length < 4) h = '0' + h;
      out += '\\u' + h;
    } else out += s.charAt(i);
  }
  return out + '"';
}

function AT_json(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return isFinite(v) ? String(v) : 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return AT_quote(v);
  var parts = [];
  var i;
  if (v instanceof Array) {
    for (i = 0; i < v.length; i++) parts.push(AT_json(v[i]));
    return '[' + parts.join(',') + ']';
  }
  for (i in v) {
    if (v.hasOwnProperty(i)) parts.push(AT_quote(i) + ':' + AT_json(v[i]));
  }
  return '{' + parts.join(',') + '}';
}

function AT_ok(data) {
  data = data || {};
  data.ok = true;
  return AT_json(data);
}

function AT_fail(error, code) {
  return AT_json({ ok: false, error: String(error), code: code || '' });
}

function AT_ping() {
  return AT_ok({ version: '1.0.0' });
}

function AT_sequenceTimes(seq) {
  var endSec = parseFloat(seq.end) / AT_TICKS_PER_SECOND;
  var inSec = seq.getInPointAsTime ? seq.getInPointAsTime().seconds : parseFloat(seq.getInPoint());
  var outSec = seq.getOutPointAsTime ? seq.getOutPointAsTime().seconds : parseFloat(seq.getOutPoint());
  if (!(inSec > 0)) inSec = 0;
  if (!(outSec > inSec) || outSec > endSec) outSec = endSec;
  return {
    inSec: inSec,
    outSec: outSec,
    endSec: endSec,
    hasInOut: inSec > 0.001 || outSec < endSec - 0.01
  };
}

/** Project and active sequence details for the panel. */
function AT_getContext() {
  try {
    if (!app.project) return AT_fail('Open a project first.');
    var seq = app.project.activeSequence;
    var data = { projectPath: app.project.path || '', sequence: null };
    if (seq) {
      var t = AT_sequenceTimes(seq);
      data.sequence = { name: seq.name, id: seq.sequenceID, inSec: t.inSec, outSec: t.outSec, endSec: t.endSec, hasInOut: t.hasInOut };
    }
    return AT_ok(data);
  } catch (e) {
    return AT_fail(e);
  }
}

function AT_isWavPresetName(name) {
  return /wav/i.test(name);
}

function AT_pickPreset(files) {
  var fallback = null;
  for (var i = 0; i < files.length; i++) {
    if (!(files[i] instanceof File)) continue;
    var name = decodeURI(files[i].name);
    if (/48/.test(name) && /16/.test(name)) return files[i].fsName;
    if (!fallback) fallback = files[i].fsName;
  }
  return fallback;
}

/** Finds a Waveform Audio (.wav) export preset that ships with Premiere. */
function AT_findWavPreset() {
  var roots = [];
  var appDir = new Folder(app.path);
  roots.push(new Folder(appDir.fsName + '/MediaIO/systempresets'));
  roots.push(new Folder(appDir.fsName + '/Contents/MediaIO/systempresets'));
  if (appDir.parent) roots.push(new Folder(appDir.parent.fsName + '/MediaIO/systempresets'));

  for (var r = 0; r < roots.length; r++) {
    if (!roots[r].exists) continue;
    var folders = roots[r].getFiles();
    var i, found;
    // Preset folders are named after the format's four-character code; WAVE is 57415645.
    for (i = 0; i < folders.length; i++) {
      if (folders[i] instanceof Folder && /57415645/i.test(folders[i].name)) {
        found = AT_pickPreset(folders[i].getFiles('*.epr'));
        if (found) return found;
      }
    }
    for (i = 0; i < folders.length; i++) {
      if (!(folders[i] instanceof Folder)) continue;
      var eprs = folders[i].getFiles('*.epr');
      for (var k = 0; k < eprs.length; k++) {
        if (eprs[k] instanceof File && AT_isWavPresetName(decodeURI(eprs[k].name))) return eprs[k].fsName;
      }
    }
  }
  return '';
}

/**
 * Renders the active sequence's audio mix (In to Out, or all of it) to a WAV file.
 * presetPath may be empty to use Premiere's built-in WAV preset.
 */
function AT_exportAudio(outPath, presetPath) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return AT_fail('Open a sequence first.');
    var preset = presetPath || AT_findWavPreset();
    if (!preset || !new File(preset).exists) {
      return AT_fail('Could not find a WAV export preset. Choose one under Settings > Audio export preset.', 'NO_PRESET');
    }
    var out = new File(outPath);
    if (out.exists) out.remove();

    var times = AT_sequenceTimes(seq);
    var range = app.encoder && app.encoder.ENCODE_IN_TO_OUT !== undefined ? app.encoder.ENCODE_IN_TO_OUT : 1;
    var result = seq.exportAsMediaDirect(outPath, preset, range);
    out = new File(outPath);
    if (!out.exists || out.length < 44) {
      return AT_fail('Premiere did not write the audio file' + (result ? ' (' + result + ')' : '') + '. Make sure the export preset is a WAV preset.');
    }
    return AT_ok({ path: outPath, inSec: times.inSec, outSec: times.outSec, preset: preset });
  } catch (e) {
    return AT_fail(e);
  }
}

function AT_findBin(name) {
  var root = app.project.rootItem;
  for (var i = 0; i < root.children.numItems; i++) {
    var child = root.children[i];
    if (child && child.type === ProjectItemType.BIN && child.name === name) return child;
  }
  return null;
}

// Last item in the bin named after the file, with or without its extension.
function AT_findChildByName(bin, fileName) {
  var bare = fileName.replace(/\.[^.]+$/, '');
  var match = null;
  for (var i = 0; i < bin.children.numItems; i++) {
    var child = bin.children[i];
    if (child && (child.name === fileName || child.name === bare)) match = child;
  }
  return match;
}

/**
 * Imports an SRT file into the "Arabic Transcripts" bin and, if asked, adds it
 * to the active sequence as a caption track starting at the sequence start.
 */
function AT_importCaptions(srtPath, addTrack) {
  try {
    var project = app.project;
    var file = new File(srtPath);
    if (!file.exists) return AT_fail('The captions file is missing: ' + srtPath);

    var bin = AT_findBin(AT_BIN_NAME);
    if (!bin) {
      project.rootItem.createBin(AT_BIN_NAME);
      bin = AT_findBin(AT_BIN_NAME);
    }
    project.importFiles([file.fsName], true, bin || project.rootItem, false);
    var item = AT_findChildByName(bin || project.rootItem, decodeURI(file.name));
    if (!item) return AT_fail('Premiere could not import the captions file.');

    var trackAdded = false;
    var trackError = '';
    if (addTrack) {
      var seq = project.activeSequence;
      if (!seq) trackError = 'No active sequence.';
      else if (!seq.createCaptionTrack) trackError = 'This version of Premiere cannot add caption tracks from a panel.';
      else {
        try {
          seq.createCaptionTrack(item, 0);
          trackAdded = true;
        } catch (e) {
          trackError = String(e);
        }
      }
    }
    return AT_ok({ itemName: item.name, trackAdded: trackAdded, trackError: trackError });
  } catch (e) {
    return AT_fail(e);
  }
}

/** Adds one sequence marker per segment. segmentsJson: [{start,end,text}]. */
function AT_addMarkers(segmentsJson) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return AT_fail('Open a sequence first.');
    var segments = eval('(' + segmentsJson + ')');
    var markers = seq.markers;
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i];
      var marker = markers.createMarker(s.start);
      marker.name = s.text.length > 60 ? s.text.substring(0, 60) + '…' : s.text;
      marker.comments = s.text;
      if (s.end > s.start) marker.end = s.end;
    }
    return AT_ok({ count: segments.length });
  } catch (e) {
    return AT_fail(e);
  }
}

function AT_setPlayhead(seconds) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return AT_fail('Open a sequence first.');
    seq.setPlayerPosition(String(Math.round(seconds * AT_TICKS_PER_SECOND)));
    return AT_ok({});
  } catch (e) {
    return AT_fail(e);
  }
}

function AT_chooseFile(prompt) {
  var f = File.openDialog(prompt);
  return AT_ok({ path: f ? f.fsName : '' });
}

function AT_chooseSaveFile(prompt, defaultName) {
  var f = new File(Folder.desktop.fsName + '/' + defaultName).saveDlg(prompt);
  return AT_ok({ path: f ? f.fsName : '' });
}
