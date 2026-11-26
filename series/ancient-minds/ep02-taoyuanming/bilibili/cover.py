"""B站 covers from two clean film frames (frame_117.6.jpg, frame_334.jpg: still.mjs … --q nosub=1).
Run from this folder: python3 cover.py  → cover_A.jpg (unused option), cover_16x9_1920x1080.jpg, cover_4x3_1440x1080.jpg"""
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFont, ImageFilter
F = '../fonts/'; INK = (24, 22, 20); VERM = (178, 42, 30)
def font(n, s): return ImageFont.truetype(F + n, s)
def ink_text(im, xy, text, f, fill=INK, anchor='la'):
    # a soft wet halo under crisp text, like ink on rice paper
    halo = Image.new('L', im.size, 0); ImageDraw.Draw(halo).text(xy, text, font=f, fill=90, anchor=anchor)
    halo = halo.filter(ImageFilter.GaussianBlur(3)); im.paste(Image.new('RGB', im.size, fill), (0, 0), halo)
    ImageDraw.Draw(im).text(xy, text, font=f, fill=fill, anchor=anchor)
def seal(im, x, y, S, txt):
    d = ImageDraw.Draw(im); d.rectangle([x, y, x + S, y + S], fill=VERM)
    f = font('MaShanZheng-Regular.ttf', int(S * .44)); paper = im.getpixel((5, 5))
    for i, ch in enumerate(txt): d.text((x + S / 2, y + S * (.29 + i * .45)), ch, font=f, fill=paper, anchor='mm')
MS, WK = 'MaShanZheng-Regular.ttf', 'LXGWWenKai-Regular.ttf'

# A — the road home after the ink lifts (unused option; run `python3 cover.py A` to make it)
import sys
if 'A' in sys.argv:
  im = Image.open('frame_117.6.jpg').convert('RGB')
  ink_text(im, (960, 250), 'gap 还是躺平？', font(MS, 190), anchor='mm')
  ink_text(im, (960, 420), '陶渊明辞官以后的日子', font(WK, 64), fill=(70, 64, 58), anchor='mm')
  seal(im, 1230, 820, 110, '归来')
  im.save('cover_A.jpg', quality=94)

# B — the fence and the chrysanthemums he planted himself
im = Image.open('frame_334.jpg').convert('RGB')
ink_text(im, (130, 150), '辞职以后', font(MS, 200))
ink_text(im, (140, 390), '他没有躺平', font(MS, 140))
ink_text(im, (150, 555), '陶渊明的 gap 期', font(WK, 60), fill=(70, 64, 58))
im.save('cover_16x9_1920x1080.jpg', quality=94)
print('ok')

# B in 4:3 (1440×1080): crop to the fence, figure, inscription and seal; set the title again for the narrower frame
im = Image.open('frame_334.jpg').convert('RGB').crop((480, 0, 1920, 1080))
patch = im.crop((0, 40, 170, 340)); m = Image.new('L', patch.size, 0); ImageDraw.Draw(m).rectangle([0, 30, 140, 270], fill=255)
im.paste(patch, (0, 590), m.filter(ImageFilter.GaussianBlur(14)))   # cover the cut-off edge of the hut with plain paper
ink_text(im, (90, 150), '辞职以后', font(MS, 200))
ink_text(im, (100, 390), '他没有躺平', font(MS, 140))
ink_text(im, (110, 555), '陶渊明的 gap 期', font(WK, 60), fill=(70, 64, 58))
im.save('cover_4x3_1440x1080.jpg', quality=94)
