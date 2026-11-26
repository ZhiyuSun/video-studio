# 龙场 · 王阳明，一五〇八 —— 源代码与使用说明

5 分 26 秒的水墨短片，1920×1080，24 fps。**每一帧都是代码画的**：Canvas2D 毛笔引擎负责笔触，WebGL 着色器把它合成到宣纸上。旁白用 MiniMax 语音合成，配乐（古琴、箫）和所有音效也都由代码生成。

这个项目建立在 **Lemo-Opuscar 风格库**（github.com/lemomo-ai/lemo-opuscar）之上，用的是其中的"中国水墨"风格。渲染、语音校对、采样器、混音工具都来自那个库，本文件夹只放这支片子自己的内容。

> **给 AI agent：**先读完本文件，再读库里的 `AGENTS.md`、`TECHNIQUE.md` 和 `styles/ink-wash/STYLE.md`，然后才动代码。改完一定要用 `still.mjs` 渲染几帧，亲眼看过再交付。

---

## 1. 目录结构

```
longchang-wuyi/
├── README.md            本说明
├── TREATMENT.md         剧本：史实依据、分镜表、35 句旁白、配乐和声音设计
├── CREDITS              第三方素材及其授权
├── LICENSE-engine-MIT.txt  引擎代码的 MIT 许可（改自 Lemo-Opuscar）
├── build.sh             一条命令从头重建整片
│
├── lines.json           35 句旁白（id / shot / text / say / asr）
├── voices/              .cache/（MiniMax 原始 mp3，35 句全在）、dur.json（每句时长）、words.json（逐字时间戳）
│                        L01–L35.wav 不入库：build.sh 第 1 步从 .cache 直接生成，不调用 API
├── story.json           ★ 时间线：镜头起止、每句旁白起点、字幕切分、关键时刻（由 tools/timeline.py 生成）
├── events.json          声音事件表（由页面导出，供配乐和混音用）
├── cues.json / subtitles_zh.srt   字幕
│
├── index.html           页面入口（加载字体、src/main.js）
├── fonts/               Ma Shan Zheng（书法骨架、题字、印章）、霞鹜文楷（字幕）+ OFL 许可
├── src/
│   ├── main.js          入口：?board=N 是分镜帧，否则是正片
│   ├── film.js          ★ 正片：18 个画面段落（PARTS）、转场、字幕、声音事件
│   ├── scenes.js        场景零件：人物姿势、万山、雨、灶火、斧头、宫殿屋檐、石棺、竹子、草堂、高楼、乱麻线团
│   ├── script.js        书法："心"字逐笔书写（writeGlyph）、竖排题字（inscribe）、题跋式字幕（subZh）
│   ├── board.js         9 帧分镜（storyboard.jpg 就是用它渲染的）
│   ├── ink.js           毛笔引擎（笔触、墨块、墨点）            ┐
│   ├── comp.js          WebGL 宣纸合成（晕染、纸纹、转场）      │ 改自库里的
│   ├── land.js          山、皴法、松、芦苇、水纹               │ 水墨样片
│   ├── hero.js          人物骨架（改成方巾文人，另有现代短发）  │
│   └── seal.js          朱印（白文，刻真字）                    ┘
├── tools/
│   ├── tts_minimax.py   MiniMax 语音合成（带古文读音字典）
│   └── timeline.py      ★ 由旁白时长排出 story.json
├── music/
│   ├── score.py         原创配乐（按 A–M 段落写，对齐 story.json 的时间点）
│   └── score.json       配乐的关键时刻和自检结果
├── mix.py               混音：旁白 + 配乐 + 合成音效 + 环境声
├── storyboard.jpg / poster.jpg
└── bilibili/            B 站封面和简介
```

## 2. 环境准备

1. **Lemo-Opuscar 库**，默认放在 `~/lemo-opuscar`，放在别处就设置 `LIB=<路径>`。在库里运行 `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music`，会装好 Node 依赖、Python 虚拟环境（`.venv`）、whisper 和采样库。
2. **ffmpeg 7 或更高版本**，要放在 PATH 里。`mux.sh` 需要 7 以上。如果系统自带的版本太老，可以 `pip install imageio-ffmpeg`，再把它包里的 ffmpeg 链接到一个放在 PATH 最前面的目录。
3. **Node 18+、Python 3.10+。**
4. **MiniMax API key**：只有改了旁白文字、声音或语速时才需要。放在环境变量 `MINIMAX_API_KEY`，或者文件 `~/.minimax_key` 里。**不要放进仓库。**`voices/.cache` 里已经有全部 35 句的原始音频，不改旁白就用不到 key。

## 3. 从头重建

```sh
cd longchang-wuyi
LIB=~/lemo-opuscar sh build.sh
```

脚本分 8 步：配音 → whisper 校对 → 时间线 → 导出声音事件 → 配乐和混音 → 渲染画面 → 合成音画（−14 LUFS）→ 字幕和海报。最后输出 `longchang.mp4`。

成片、`mix.wav`、`music/score.wav` 和 `out/` 都不入库（见仓库根目录的 `.gitignore`），都可以由 `build.sh` 重新生成。成片另存网盘。

在 2 核机器上，渲染一步大约要 50 分钟。

## 4. 数据怎么流动（改任何东西前先看懂这张图）

```
lines.json ──tts_minimax.py──▶ voices/*.wav + dur.json
                         └─asr_check.py──▶ voices/words.json
dur.json + words.json ──timeline.py──▶ story.json   ◀── 唯一的时间来源
story.json ──▶ src/film.js（画面）
            └─▶ events.mjs ──▶ events.json ──▶ music/score.py ──▶ score.wav
                                            └─▶ mix.py ──▶ mix.wav
film.js ──video.mjs──▶ out/video.mp4 ──mux.sh(+mix.wav)──▶ longchang.mp4
```

**规则：**`story.json` 是唯一的时间来源。动了旁白或停顿，就要从 `timeline.py` 开始，按顺序往下重跑每一步。**画面、配乐、混音里都不要写死时间秒数**，只能用 `story.json` 里的 `VO.Lxx.t`、`SH.sx.t0` 和 `M.<mark>`。

## 5. 常见修改

所有命令都在库根目录（`cd $LIB`）运行。`P` 代表本文件夹的绝对路径，`PY=$LIB/.venv/bin/python`。

### 改一句旁白
1. 在 `lines.json` 里改这一句的 `text`（字幕和校对都用它），以及 `say`（实际朗读的文字，读音要调时可以和 `text` 不同）。
2. 只重新合成这一句：`$PY $P/tools/tts_minimax.py $P/lines.json $P/voices --only L05`
3. 校对：`$PY core/tts/asr_check.py $P/lines.json $P/voices --lang zh`。
   whisper 常把古文专名听成同音字，比如"刘瑾"听成"刘锦"、"俟"听成"四"。确认读音没问题，就把 whisper 听到的那句写进这一句的 `asr` 字段。真读错了的话，在 `tools/tts_minimax.py` 的 `PRON` 读音字典里加一条（格式是 `"处此/(chu3)(ci3)"`）。
4. 然后依次重跑：`python3 $P/tools/timeline.py` → `node core/render/events.mjs $P` → `$PY $P/music/score.py` → `$PY $P/mix.py` → 渲染 → 合成。

### 换配音声音或语速
`tools/tts_minimax.py --voice <voice_id> --speed 0.92`，重新生成全部 35 句，然后按上面第 4 步往下跑。缓存按"声音 + 语速 + 文字"区分，不会混用。

### 调整停顿和节奏
`tools/timeline.py` 里的 `SHOTS` 列表管着每个镜头：`('pad', 秒)` 是停顿，`('L', 'L05', 句后间隔)` 是一句旁白，`('mark', 名字)` 是一个可以被引用的时间点，比如 `title`、`fall`、`hush`、`stroke`、`xin`、`end`。改完从 `timeline.py` 开始重跑。

### 改画面
- **`src/film.js` 最底部的 `PARTS` 数组**决定画面顺序。每一项包含：开始时间 `t0`、绘制函数 `f`、字幕位置 `sub:[x,y]`、转场墨晕的中心 `at:[x,y]`。黑夜段用的是 `light`，表示浅色字幕。
- 每个画面是一个 `sceneXxx(A, lt, t)` 函数，`lt` 是这一段内的时间，`t` 是全片时间。函数里用 `cam(A, 缩放, 焦点, 屏幕位置)` 运镜，画完调用 `reset(A)`。最后返回合成参数（`bleed` 晕染、`rim` 墨边、`paper` 让纸纹跟随镜头、`vig` 暗角、`fade` 淡出、`rev` 开场显影）。
- 人物：`S.figure(L, 姿势, {x, y, s, dir, cap, am, t, boil})`。`cap` 可选 `'scholar'`（方巾，默认）或 `'modern'`（现代短发）。姿势在 `scenes.js` 的 `P` 里，两个姿势之间用 `mixPose` 过渡。人物按每秒 12 帧走动（`q12`）。
- 竖排题字：`ins(A, id, [列…], x, y, 字号, 进度k)`。`k` 从 0 到 1，字逐个写出。会自动登记给 readcheck，用来检查题字停留的时间够不够读。
- 大字"心"的笔顺骨架在 `script.js` 的 `GLYPHS` 里。想加别的字，要先描出它的骨架，方法见文件开头的注释。
- 全片朱红只用在三处：印章、灶下火苗、结尾小人手里的火。这是风格规则，加别的红色会破坏它。

### 改字幕
文字来自 `lines.json`，切分规则在 `timeline.py` 的 `chunks()` 和 `wrap()`：每行最多 17 个字，每段最多两行，至少停留 1.8 秒。字幕的位置在 `PARTS` 的 `sub` 里。改完要重新生成 `subtitles_zh.srt`（见 `build.sh` 第 8 步）。

### 改配乐
`music/score.py` 按段落 A–M 写，每段开头的注释写着它对应哪个镜头。所有时间都取自 `story.json` 的 `marks` 和 `VO`，劈柴的鼓点取自 `events.json` 里的 `chop` 事件。乐器用的是 `pluck.py` 的古琴物理模型，加上 `sampler.py` 里的 flute（当箫用）、gran_cassa、timpani、frame_drum、gong2 和 contrabass。

### 改音量平衡
`mix.py` 末尾控制各轨音量：旁白统一到 RMS 0.16；配乐在没有旁白的段落是 0.085，有旁白时再压低 50%；音效乘 0.9，环境声乘 0.8。`silence` 事件所在的区间会被强制压成绝对静音，只留一声滴水。最终响度由 `mux.sh` 统一到 −14 LUFS。

## 6. 预览和局部重渲染

```sh
# 渲染单帧（秒）检查，结果是 jpg
node core/render/still.mjs $P 45 122.6 300 --out /tmp/chk
# 看分镜第 7 帧
node core/render/still.mjs $P 0 --q board=7 --out /tmp/chk
# 无字幕的帧（海报用）
node core/render/still.mjs $P 131 --q nosub=1 --out /tmp/chk
# 把几张拼成一张对照图
$PY core/render/sheet.py /tmp/sheet.jpg /tmp/chk/*.jpg --cols 3 --w 640
```

**只改了一小段时，不必重渲染整片。**先按每 1/24 秒渲染这一段：

```sh
node core/render/still.mjs $P --range 36.6667:51.4583:0.0416667 --out fix --prefix c_
```

然后按时间顺序重新编号成 `fix/seq/00000.jpg…`，用 ffmpeg 覆盖到原视频对应的帧上：

```sh
ffmpeg -i out/video.mp4 -framerate 24 -itsoffset 36.666667 -i fix/seq/%05d.jpg \
  -filter_complex "[0:v][1:v]overlay=eof_action=pass:enable='between(n,880,1234)'[v]" \
  -map "[v]" -c:v libx264 -crf 14 -pix_fmt yuv420p out/video_fixed.mp4
```

最后用 `video_fixed.mp4` 重新跑 `mux.sh`。

## 7. 已知的坑

- `film.js` 用 `fetch('../story.json')` 读时间线，所以页面必须通过库的渲染工具打开，项目以 `/@film/` 挂载，库里的文件用 `/core/…` 这样的绝对路径引用。**直接双击 index.html 打不开。**
- WebGL 在没有显卡的机器上走软件渲染。每帧大约 0.5 秒，2 核机器上全片约 50 分钟，所以改动后先渲染单帧检查。
- `mountainLayer` 是逐像素计算的，很慢，必须在 `init()` 里算一次缓存起来（看 `film.js` 的 `C`），不能放进每帧都跑的代码里。
- 宽笔刷"擦除"（飞白劈开黑夜）的做法是：把绘制模式切到 `destination-out`，再用笔触去画，等于用笔触在墨里擦出纸白。笔画没画完时，要在笔尖补一个圆形，否则笔头是方的（见 `sceneNight`）。
- 夜景是深色底，字幕要用 `light` 模式，把纸色的字写进颜色层，否则黑字落在黑底上看不见。
- 桌子后面的人物，要先用 `underDesk()` 擦掉腿，再画桌子，否则看起来像站着。

## 8. 授权

- 引擎代码改自 Lemo-Opuscar（MIT），见 `LICENSE-engine-MIT.txt`。
- 字体是 OFL 授权；采样是 CC0。
- 旁白的使用受 MiniMax 服务条款约束。
- 剧本、分镜、书法笔画骨架和配乐是这支片子原创的。

详见 `CREDITS`。
