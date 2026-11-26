import json, sys, time
from faster_whisper import WhisperModel
size=sys.argv[1]
m=WhisperModel(size, device='cpu', compute_type='int8', cpu_threads=2)
t0=time.time()
import numpy as np
audio=np.fromfile(sys.argv[2] if len(sys.argv)>2 else 'song16.raw',dtype=np.float32)
segs,info=m.transcribe(audio, language='zh', word_timestamps=True, vad_filter=False,
  initial_prompt='以下是普通话歌词：宇宙那么大，只有一个月亮。', beam_size=5, condition_on_previous_text=False)
out=[]
for s in segs:
    out.append({'s':s.start,'e':s.end,'text':s.text,'words':[[w.start,w.end,w.word] for w in s.words]})
    print(f'{s.start:7.2f} {s.end:7.2f} {s.text}', flush=True)
json.dump(out,open(f'/home/claude/asr/{size}_'+(sys.argv[2] if len(sys.argv)>2 else 'mix').replace('.raw','')+'.json','w'),ensure_ascii=False)
print('done',time.time()-t0)
