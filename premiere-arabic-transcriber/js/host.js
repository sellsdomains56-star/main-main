/*
 * Bridge to host/index.jsx. AT.host.call('AT_fn', arg1, arg2) runs the
 * ExtendScript function in Premiere and resolves with its parsed JSON reply.
 */
(function (root) {
  'use strict';

  // A JSON literal that is also valid ES3, with non-ASCII escaped for the bridge.
  function literal(value) {
    return JSON.stringify(value).replace(/[\u007f-￿]/g, function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });
  }

  function evalScript(script) {
    return new Promise(function (resolve, reject) {
      if (!root.__adobe_cep__) {
        reject(new Error('This panel only works inside Adobe Premiere Pro.'));
        return;
      }
      root.__adobe_cep__.evalScript(script, resolve);
    });
  }

  function extensionPath() {
    var p = decodeURIComponent(root.location.pathname).replace(/\/[^/]*$/, '');
    return /^\/[A-Za-z]:/.test(p) ? p.slice(1) : p;
  }

  // Premiere normally loads host/index.jsx itself; load it by hand if it didn't.
  var ready = null;
  function ensureLoaded() {
    if (!ready) {
      ready = evalScript('typeof AT_ping').then(function (type) {
        if (type === 'function') return;
        return evalScript('$.evalFile(' + literal(extensionPath() + '/host/index.jsx') + ')');
      });
    }
    return ready;
  }

  function call(fn) {
    var args = Array.prototype.slice.call(arguments, 1).map(literal).join(', ');
    return ensureLoaded().then(function () {
      return evalScript(fn + '(' + args + ')');
    }).then(function (result) {
      var data;
      try {
        data = JSON.parse(result);
      } catch (e) {
        throw new Error('Premiere scripting error in ' + fn + (result ? ': ' + result : '.'));
      }
      if (!data.ok) {
        var err = new Error(data.error || 'Premiere reported an error.');
        err.code = data.code;
        throw err;
      }
      return data;
    });
  }

  root.AT = root.AT || {};
  root.AT.host = { call: call, literal: literal };
})(window);
