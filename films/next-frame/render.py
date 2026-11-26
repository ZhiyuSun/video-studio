#!/usr/bin/env python3
"""Render driver.
  render.py stills T1 T2 ...          -> stills/f_<t>.jpg
  render.py shots S03 S04 ...         -> shots/<id>.mp4   (one encoded file per shot)
  render.py range A B NAME            -> shots/NAME.mp4
"""
import sys, os, re, json, subprocess, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
FPS = 24
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
        '--allow-file-access-from-files', '--disable-web-security', '--font-render-hinting=none']

def shots():
    src = open(os.path.join(ROOT, 'src/shots.js')).read()
    out = []
    for m in re.finditer(r"id: '(\w+)',\s*scene: '(\w+)',\s*start: ([\d.]+),\s*end: ([\d.]+)", src):
        out.append((m.group(1), m.group(2), float(m.group(3)), float(m.group(4))))
    return out

def open_page(p):
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('console', lambda m: print('[page]', m.text) if 'GL Driver' not in m.text else None)
    pg.on('pageerror', lambda e: print('[pageerror]', e))
    pg.goto('file://' + ROOT + '/src/index.html')
    pg.wait_for_function('window.engineReady === true', timeout=60000)
    pg.evaluate('document.fonts.ready.then(()=>1)')
    if os.environ.get('NOMB'): pg.evaluate('setMB(false)')
    return b, pg

def encode(pg, t0, t1, out):
    n0, n1 = round(t0 * FPS), round(t1 * FPS)
    tmp = out[:-4] + '.part.mp4'
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
    st = time.time()
    for n in range(n0, n1):
        pg.evaluate(f'renderAt({n / FPS:.6f})')
        ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
        if (n - n0) % 48 == 0:
            el = time.time() - st; done = n - n0 + 1
            print(f'  {out} {done}/{n1-n0}  {el/done:.2f}s/f', flush=True)
    ff.stdin.close(); rc = ff.wait()
    if rc == 0: os.replace(tmp, out)
    print(f'done {out} in {time.time()-st:.0f}s', flush=True)

def main():
    mode = sys.argv[1]
    with sync_playwright() as p:
        b, pg = open_page(p)
        if mode == 'stills':
            os.makedirs(os.path.join(ROOT, 'stills'), exist_ok=True)
            for a in sys.argv[2:]:
                t = float(a); st = time.time()
                pg.evaluate(f'renderAt({t})')
                pg.screenshot(path=os.path.join(ROOT, f'stills/f_{t:07.2f}.jpg'), type='jpeg', quality=92)
                print(f'still {t} {time.time()-st:.2f}s', flush=True)
        elif mode == 'shots':
            os.makedirs(os.path.join(ROOT, 'shots'), exist_ok=True)
            S = {s[0]: s for s in shots()}
            ids = sys.argv[2:] if sys.argv[2:] != ['all'] else list(S)
            for i in ids:
                _, _, a, c = S[i]
                encode(pg, a, c, os.path.join(ROOT, f'shots/{i}.mp4'))
        elif mode == 'range':
            encode(pg, float(sys.argv[2]), float(sys.argv[3]), os.path.join(ROOT, f'shots/{sys.argv[4]}.mp4'))
        b.close()

if __name__ == '__main__':
    main()
