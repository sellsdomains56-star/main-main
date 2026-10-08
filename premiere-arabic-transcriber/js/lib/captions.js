/*
 * Turning raw transcription segments into clean Arabic captions:
 * text cleanup, removal of well-known Whisper hallucinations, splitting long
 * segments into readable one- or two-line captions, and SRT / text output.
 */
(function (root) {
  'use strict';

  // Harakat, Quranic annotation marks and tatweel.
  var DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/g;
  var DIRECTION_MARKS = /[‎‏‪-‮⁦-⁩]/g;
  var RLM = '‏';
  var ENDS_WITH_PUNCTUATION = /[.!?؟،,؛;:…]$/;

  // Phrases Whisper is known to invent for Arabic over silence or music, mostly
  // subtitle credits from its training data. Real speech almost never contains them.
  var HALLUCINATIONS = [
    /نانسي\s*قنقر/, // نانسي قنقر
    /nancy\s*qanqar/i,
    /(?:ترجمة|الترجمة)\s*(?:بواسطة|:)/, // ترجمة بواسطة / الترجمة:
    /amara\.org/i
  ];

  function cleanText(text, opts) {
    var t = String(text || '');
    if (opts && opts.removeDiacritics) t = t.replace(DIACRITICS, '');
    t = t.replace(DIRECTION_MARKS, '');
    t = t.replace(/\s+/g, ' ').trim();
    t = t.replace(/\s+([.!?؟،,؛;:])/g, '$1');
    return t;
  }

  function isHallucination(text) {
    for (var i = 0; i < HALLUCINATIONS.length; i++) if (HALLUCINATIONS[i].test(text)) return true;
    return false;
  }

  /**
   * Normalises engine output ({ start, end, text, noSpeechProb?, avgLogprob? })
   * into sorted, non-overlapping segments with clean text.
   */
  function cleanSegments(segments, opts) {
    opts = opts || {};
    var sorted = segments.slice().sort(function (a, b) { return a.start - b.start; });
    var out = [];
    for (var i = 0; i < sorted.length; i++) {
      var seg = sorted[i];
      var text = cleanText(seg.text, opts);
      if (!text) continue;
      if (opts.filterHallucinations) {
        if (isHallucination(text)) continue;
        // Whisper's own rule for "this was probably not speech".
        if (seg.noSpeechProb > 0.6 && seg.avgLogprob < -1) continue;
        // Repetition loops: the same line over and over.
        if (out.length && out[out.length - 1].text === text) continue;
      }
      var start = Math.max(0, Number(seg.start) || 0);
      var end = Math.max(start + 0.1, Number(seg.end) || 0);
      var prev = out[out.length - 1];
      if (prev && prev.end > start) prev.end = Math.max(prev.start + 0.1, start);
      out.push({ start: start, end: end, text: text });
    }
    return out;
  }

  // The lines for a set of words shown as one caption, or null if they don't fit.
  // Two-line captions are split where both lines are closest in length,
  // preferring to break after punctuation.
  function layout(words, maxChars, maxLines) {
    var text = words.join(' ');
    if (text.length <= maxChars || words.length === 1) return [text];
    if (maxLines < 2) return null;
    var best = null;
    for (var k = 1; k < words.length; k++) {
      var a = words.slice(0, k).join(' ');
      var b = words.slice(k).join(' ');
      if (a.length > maxChars || b.length > maxChars) continue;
      var score = Math.abs(a.length - b.length) - (ENDS_WITH_PUNCTUATION.test(words[k - 1]) ? 8 : 0);
      if (!best || score < best.score) best = { score: score, lines: [a, b] };
    }
    return best ? best.lines : null;
  }

  // Splits a segment's words into the fewest captions that fit, then evens out
  // their lengths so there are no one-word leftovers.
  function groupWords(words, maxChars, maxLines) {
    var count = 0;
    var i = 0;
    while (i < words.length) {
      var j = i + 1;
      while (j < words.length && layout(words.slice(i, j + 1), maxChars, maxLines)) j++;
      count++;
      i = j;
    }
    if (count <= 1) return [words];

    var n = words.length;
    var punctuationBonus = maxChars * maxChars / 4;
    var cost = [];
    var back = [];
    for (var g = 0; g <= count; g++) {
      cost.push(new Array(n + 1).fill(Infinity));
      back.push(new Array(n + 1).fill(-1));
    }
    cost[0][0] = 0;
    for (g = 1; g <= count; g++) {
      for (var end = 1; end <= n; end++) {
        for (var start = end - 1; start >= 0; start--) {
          var part = words.slice(start, end);
          if (!layout(part, maxChars, maxLines)) break; // adding words only makes it longer
          if (cost[g - 1][start] === Infinity) continue;
          var len = part.join(' ').length;
          var c = cost[g - 1][start] + len * len - (ENDS_WITH_PUNCTUATION.test(words[end - 1]) ? punctuationBonus : 0);
          if (c < cost[g][end]) {
            cost[g][end] = c;
            back[g][end] = start;
          }
        }
      }
    }

    var groups = [];
    var at = n;
    for (g = count; g > 0; g--) {
      var from = back[g][at];
      groups.unshift(words.slice(from, at));
      at = from;
    }
    return groups;
  }

  /**
   * Builds captions ({ start, end, lines }) from clean segments.
   * opts: maxCharsPerLine (default 42), maxLines (1 or 2, default 2), minDuration (default 0.8 s).
   */
  function toCaptions(segments, opts) {
    opts = opts || {};
    var maxChars = Math.max(10, Number(opts.maxCharsPerLine) || 42);
    var maxLines = Number(opts.maxLines) === 1 ? 1 : 2;
    var minDuration = opts.minDuration == null ? 0.8 : opts.minDuration;
    var captions = [];

    segments.forEach(function (seg) {
      var words = String(seg.text).split(' ').filter(Boolean);
      if (!words.length) return;
      var groups = groupWords(words, maxChars, maxLines);
      var weights = groups.map(function (g) { return g.join(' ').length + 1; });
      var total = weights.reduce(function (a, b) { return a + b; }, 0);
      var duration = seg.end - seg.start;
      var t = seg.start;
      groups.forEach(function (group, gi) {
        var end = gi === groups.length - 1 ? seg.end : t + duration * weights[gi] / total;
        captions.push({ start: t, end: end, lines: layout(group, maxChars, maxLines) || [group.join(' ')] });
        t = end;
      });
    });

    for (var i = 0; i < captions.length; i++) {
      var cap = captions[i];
      var next = captions[i + 1];
      if (cap.end - cap.start < minDuration) cap.end = cap.start + minDuration;
      if (next && cap.end > next.start) cap.end = Math.max(next.start, cap.start + 0.05);
    }
    return captions;
  }

  function pad(n, width) {
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

  function srtTime(sec) {
    var ms = Math.max(0, Math.round(sec * 1000));
    var h = Math.floor(ms / 3600000);
    var m = Math.floor(ms / 60000) % 60;
    var s = Math.floor(ms / 1000) % 60;
    return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ',' + pad(ms % 1000, 3);
  }

  // Short clock for the panel: 1:02 or 1:02:03.
  function clock(sec) {
    var total = Math.max(0, Math.floor(sec));
    var h = Math.floor(total / 3600);
    var m = Math.floor(total / 60) % 60;
    var s = total % 60;
    return h ? h + ':' + pad(m, 2) + ':' + pad(s, 2) : m + ':' + pad(s, 2);
  }

  /** SRT text. opts.rtlMark puts a right-to-left mark at the start of every line. */
  function toSrt(captions, opts) {
    var rtl = opts && opts.rtlMark;
    return captions.map(function (cap, i) {
      var lines = cap.lines.map(function (line) { return rtl ? RLM + line : line; });
      return (i + 1) + '\r\n' + srtTime(cap.start) + ' --> ' + srtTime(cap.end) + '\r\n' + lines.join('\r\n');
    }).join('\r\n\r\n') + '\r\n';
  }

  function toPlainText(segments, withTimes) {
    return segments.map(function (seg) {
      return withTimes ? '[' + clock(seg.start) + '] ' + seg.text : seg.text;
    }).join('\n');
  }

  var api = {
    cleanText: cleanText,
    cleanSegments: cleanSegments,
    isHallucination: isHallucination,
    toCaptions: toCaptions,
    toSrt: toSrt,
    toPlainText: toPlainText,
    srtTime: srtTime,
    clock: clock
  };
  root.AT = root.AT || {};
  root.AT.captions = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : global);
