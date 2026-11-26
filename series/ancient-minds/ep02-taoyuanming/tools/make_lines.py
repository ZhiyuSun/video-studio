import re, json
t = open('TREATMENT.md').read()
sec = t[t.index('## 5. 旁白稿'):t.index('## 6.')]
L = []
for m in re.finditer(r'^(\d+)\. (.+)$', sec, re.M):
    txt = m.group(2).strip()
    if txt.startswith('（'): continue
    L.append({'id': f'L{len(L)+1:02d}', 'text': txt})
say = {'公元 405 年冬天': '公元四百零五年冬天', 'gap': 'gap'}
for l in L:
    s = l['text']
    for a, b in say.items(): s = s.replace(a, b)
    l['say'] = s.replace(' ', '') if 'gap' not in s else s
    l['text'] = l['text'].replace('公元 405 年', '公元405年')
    tone = []
    if '荷锄' in s: tone.append('荷/(he4)')
    if '数晨夕' in s: tone.append('数/(shuo4)')
    if tone: l['tone'] = tone
json.dump(L, open('lines.json', 'w'), ensure_ascii=False, indent=1)
print(len(L)); [print(l['id'], l['say']) for l in L]
