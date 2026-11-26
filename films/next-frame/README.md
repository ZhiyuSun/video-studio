# 《下一帧 THE NEXT FRAME》

一个能预测一切的 AI，回到宇宙的第一刻，寻找它唯一算不出来的东西：一个人。

- 时长 4:53，2.39:1（1920×1080 画幅内 1920×804 有效画面），24 fps
- 画面：Three.js 0.170 + 自写后期（HDR bloom、变形光晕、ACES、色差、颗粒、运动模糊、金色“预测线”幽灵层）
- 声音：numpy / scipy 逐采样合成，-14 LUFS
- 剧本、分镜、代码、配乐全部由 Claude Opus 5.5 完成

B 站标题：Claude Opus 5.5 原创短片《下一帧》｜算尽宇宙，算不出你

## 目录

```
src/
  index.html      画布、HUD、字幕卡样式
  engine.js       渲染器、后期链、镜头调度、字幕卡、预测幽灵层、HUD
  shots.js        ★ 时间线：镜头表、字幕卡、可预测度曲线、开头/结尾选词、聊天戏数据
  scenes/*.js     每个场景一个文件（token、singularity、bang、web……human、ascend、reveal）
  glsl.js util.js spectrum.js
audio/score.py    配乐与音效（读取 src/shots.js 对齐字幕与镜头）
render.py         逐镜头渲染成 mp4（无头 Chrome + SwiftShader）
sheet.py          关键帧拼图
concat.txt        成片镜头顺序
cover/            B 站封面（cover.html + render_cover.py）
storyboard/       剧本与分镜页
```

## 重新生成成片

需要：Node、Python 3（playwright、numpy、scipy、pyloudnorm、Pillow）、ffmpeg、Google Chrome（render.py 里写的是 `/usr/bin/google-chrome`，换机器时改这一行）。

```bash
cd films/next-frame
npm install                                  # three + 字体
python3 render.py stills 172 230             # 先抽几帧检查
python3 render.py shots all                  # 全部镜头 -> shots/*.mp4（无 GPU 约 2–3 小时）
python3 audio/score.py audio/score.wav       # 配乐
ffmpeg -f concat -safe 0 -i concat.txt -c copy /tmp/v.mp4
ffmpeg -i /tmp/v.mp4 -i audio/score.wav -map 0:v -map 1:a -c:v libx264 -preset veryfast -crf 21 \
  -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart -shortest 下一帧_TheNextFrame.mp4
```

只改了某个镜头：`python3 render.py shots H01`，再重新拼接即可。
只改了字幕或声音：改 `src/shots.js` / `audio/score.py`，字幕所在镜头重渲，声音单独重生成后重新混流。

成片与 wav 体积大，不进仓库（见 .gitignore），另存网盘。
