#!/usr/bin/env python3
"""Builds the single-file game (IronHorizon.html, assets embedded) and dist/ (page + bundle, assets fetched)."""
import base64, os, subprocess, sys, json
here = os.path.dirname(os.path.abspath(__file__))
esbuild = sys.argv[1] if len(sys.argv) > 1 else 'esbuild'
out = subprocess.run([esbuild, 'js/main.js', '--bundle', '--minify', '--format=iife',
                      '--alias:three=./lib/three.module.js', '--alias:three/addons=./lib/addons'],
                     cwd=here, capture_output=True, text=True, check=True).stdout.replace('</script>', '<\\/script>')
html = open(os.path.join(here, 'index.html')).read()
a = html.index('<script type="importmap">'); b = html.index('</script>', html.index('<script type="module"')) + 9
assets = {}
for root, _, files in os.walk(os.path.join(here, 'assets')):
    for f in files:
        p = os.path.join(root, f)
        assets[os.path.relpath(p, os.path.join(here, 'assets')).replace(os.sep, '/')] = base64.b64encode(open(p, 'rb').read()).decode()
single = html[:a] + '<script>window.__ASSETS=' + json.dumps(assets) + '</script>\n<script>' + out + '</script>' + html[b:]
open(os.path.join(here, 'IronHorizon.html'), 'w').write(single)
os.makedirs(os.path.join(here, 'dist'), exist_ok=True)
open(os.path.join(here, 'dist', 'game.js'), 'w').write(out)
print('IronHorizon.html', len(single) // 1024, 'KB; bundle', len(out) // 1024, 'KB')
