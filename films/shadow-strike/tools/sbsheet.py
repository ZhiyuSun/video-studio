"""Storyboard sheet: 3×3 panels with Chinese captions → storyboard/storyboard.jpg"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
CAP = [
 ('S1', '0:03', '中景 · 跟拍 + 锣点急推', '7 s', '戏正热闹：英雄一刀，妖翻跟头，大锣"哐"'),
 ('S5', '0:46', '幕后特写（镜像）· 随刀甩摇进入', '5 s', '年轻的手劈下；老人的手停了半拍'),
 ('S6', '0:49', '中景 · 固定', '9 s', '彩色皮偶倒下，没有颜色的影子还站着；全场寂静'),
 ('S10', '1:30', '全景 · 横向长摇（一镜）', '36 s', '它试着当一棵树，鸟落在它手上；台下笑成一片'),
 ('S11', '2:04', '中景 · 停摇固定', '12 s', '撞上木框，手掌贴在框上，出不去；笑声停了'),
 ('S13', '2:40', '全景 · 极慢推向灯', '32 s', '它走向灯，成了幕布上最大的东西；实心脸被光吃透'),
 ('S14', '2:50', '幕后全景（镜像）· 缓慢横移', '13 s', '第一次露出老艺人；竹架上一排越来越旧的妖头'),
 ('S15', '3:10', '连续后拉', '24 s', '他也是一块更大幕布上的影子，腕上的线通向黑暗'),
 ('S18', '3:46', '近景 · 固定', '12 s', '两只手掌隔着一层布，第一次见面'),
]
w, cols = 760, 3; h = w * 804 // 1920; ch = 78; pad = 16
rows = (len(CAP) + cols - 1) // cols
Wt, Ht = cols * w + (cols + 1) * pad, rows * (h + ch) + (rows + 1) * pad + 70
S = Image.new('RGB', (Wt, Ht), (18, 14, 12)); d = ImageDraw.Draw(S)
fT, fB, fS = ImageFont.truetype(FONT, 34), ImageFont.truetype(FONT, 22), ImageFont.truetype(FONT, 19)
d.text((pad, 16), '《半拍》分镜 · 9 格（引擎实渲）', font=fT, fill=(236, 214, 170))
for k, (sh, tc, fr, du, line) in enumerate(CAP):
    x = pad + (k % cols) * (w + pad); y = 70 + pad + (k // cols) * (h + ch + pad)
    im = Image.open(os.path.join(HERE, 'storyboard', f'p{k+1}.jpg')).convert('RGB').resize((w, h), Image.LANCZOS)
    S.paste(im, (x, y))
    d.text((x, y + h + 8), f'{k+1}  {sh}  {tc}  ·  {fr}  ·  {du}', font=fS, fill=(200, 170, 120))
    d.text((x, y + h + 36), line, font=fB, fill=(238, 228, 210))
S.save(os.path.join(HERE, 'storyboard', 'storyboard.jpg'), quality=90); print(S.size)
