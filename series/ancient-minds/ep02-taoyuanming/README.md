# 归去来 · 陶渊明，四〇五 —— 源代码与使用说明

5 分 39 秒的水墨短片，1920×1080，24 fps，−14 LUFS。主题：陶渊明辞官以后，gap 和"躺平"有什么不一样。

**每一帧都是代码画的**：Canvas2D 毛笔引擎负责笔触，WebGL 着色器把它合成到宣纸上。旁白用 MiniMax 语音合成，配乐（古琴、箫）和所有音效也都由代码生成。

本项目建立在 **Lemo-Opuscar 风格库**（github.com/lemomo-ai/lemo-opuscar）的"中国水墨"风格上。渲染、语音校对、采样器和混音工具都来自那个库，本文件夹只放这支片子自己的内容。画风、字幕和配乐体系与第 1 期 `ep01-longchang/` 保持一致，但画面代码是重写的，结构和第 1 期不同（见第 5 节）。

> **给 AI agent：**先读完本文件，再读库里的 `AGENTS.md`、`TECHNIQUE.md` 和 `styles/ink-wash/STYLE.md`，然后才动代码。改完一定要用 `still.mjs` 渲染几帧，亲眼看过再交付。

---

## 1. 目录结构

```
ep02-taoyuanming/
├── README.md / AGENTS.md
├── TREATMENT.md         剧本：史实与研究依据、分镜表、旁白稿（第 5 节）、配乐和声音设计
├── CREDITS              第三方素材及其授权
├── LICENSE-engine-MIT.txt  引擎代码的 MIT 许可（改自 Lemo-Opuscar）
├── build.sh             一条命令从头重建整片
│
├── lines.json           39 句旁白（id / text / say / tone / asr）
├── voices/              .cache/（MiniMax 原始 mp3，39 句全在）、dur.json、words.json
│                        L01–L39.wav 不入库：build.sh 第 1 步从 .cache 直接生成，不调用 API
├── story.json           ★ 时间线：镜头起止、每句旁白起点、字幕切分（由 tools/timeline.py 生成）
├── events.json          声音事件表（由页面导出，供配乐和混音使用）
├── cues.json / subtitles_zh.srt   字幕
│
├── index.html           页面入口（加载字体和 src/main.js）
├── fonts/               Ma Shan Zheng（题字、印章）、霞鹜文楷（字幕、手写、标签），附 OFL 许可
├── src/
│   ├── main.js          入口：按时间选场景、处理墨晕转场、画字幕
│   ├── film.js          ★ 全部 23 个场景（SCN.<id>）、场景切分和转场（init）、字幕位置（SUBP）、声音事件（events）
│   ├── kit.js           题字、字幕、印章、远山缓存、人物姿势 P，以及所有道具
│   ├── figure.js        人物骨架（改自库里的 hero.js：文士发髻和巾 / 现代短发，支持旋转）
│   ├── ink.js           毛笔引擎                     ┐
│   ├── comp.js          WebGL 宣纸合成、墨晕转场     │ 照搬库里的水墨样片
│   └── land.js          远山、皴法、松、芦苇、水纹    ┘
├── tools/
│   ├── make_lines.py    从 TREATMENT.md 第 5 节生成 lines.json（会覆盖手工加的 tone / asr，慎用）
│   ├── tts_minimax.py   MiniMax 语音合成，按"文字 + 声音 + 语速 + 注音"缓存
│   └── timeline.py      ★ 由旁白时长排出 story.json
├── music/
│   ├── score.py         原创配乐（14 个段落，时间取自 events.json 和 story.json）
│   └── score.json       配乐的关键时刻和自检结果
├── mix.py               混音：旁白 + 配乐 + 合成音效 + 环境声
├── poster.jpg           片名帧
└── bilibili/            B 站封面（16:9、4:3）、cover.py、description.md（标题、简介、分区、标签）
```

## 2. 环境准备

1. **Lemo-Opuscar 库**：默认放在 `~/lemo-opuscar`，放在别处就设置 `LIB=<路径>`。在库里运行 `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music`。
2. **ffmpeg 7 或更高版本**，要在 PATH 里。系统自带的版本太老时，可以用 imageio-ffmpeg 包附带的 ffmpeg：
   ```sh
   $LIB/.venv/bin/pip install imageio-ffmpeg
   mkdir -p ~/ffbin && ln -sf "$($LIB/.venv/bin/python -c 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())')" ~/ffbin/ffmpeg
   export PATH=~/ffbin:$PATH
   ```
3. **Node 18+、Python 3.10+。**
4. **MiniMax API key**：只有改了旁白文字、声音、语速或注音时才需要。放在环境变量 `MINIMAX_API_KEY`，或文件 `~/.minimax_key` 里。**不要放进仓库。**用的是国内站 api.minimaxi.com，声音 `Chinese (Mandarin)_Reliable_Executive`（沉稳中年），语速 0.92。

## 3. 从头重建

```sh
cd ep02-taoyuanming
LIB=~/lemo-opuscar sh build.sh
```

脚本分 8 步：

1. 配音
2. whisper 校对
3. 生成时间线
4. 导出声音事件
5. 配乐和混音
6. 渲染画面
7. 合成音画（−14 LUFS）
8. 导出字幕和海报

最后输出 `guiqulai.mp4`。

- 成片、`mix.wav`、`music/score.wav`、`out/` 都不入库，都能重新生成。
- 在 2 核机器上，渲染画面这一步大约要 1 小时，其他步骤加起来几分钟。

## 4. 数据怎么流动

```
lines.json ──tts_minimax.py──▶ voices/*.wav + dur.json
                         └─asr_check.py──▶ voices/words.json
dur.json ──timeline.py──▶ story.json   ◀── 唯一的时间来源
story.json ──▶ src/film.js（画面，init 在这里再切分镜头、定转场）
            └─▶ events.mjs ──▶ events.json ──▶ music/score.py ──▶ score.wav
                                            └─▶ mix.py ──▶ mix.wav
film.js ──video.mjs──▶ out/video.mp4 ──mux.sh(+mix.wav)──▶ guiqulai.mp4
```

**规则：**全片的时间点不要写死秒数。

- 要对齐某句旁白：
  - `vt('L14', k)`：这句开始后、占它时长比例 k 的时刻；
  - `pr(t, 'L14', k0, k1)`：在这句的 k0 到 k1 之间，从 0 走到 1。
- 场景函数里可以用镜头内的相对秒数 `u`，比如火灾在 `u=6.5` 时塌屋顶。这些时间点和 `events()` 里的音效、`score.py` 里的鼓点是一一对应的，改一处就要同步改另两处。

## 5. 画面代码怎么组织（和第 1 期不同）

- **`tools/timeline.py` 的 `SHOTS`**：一共 19 个"旁白镜头"。每一行写着：镜头 id、包含哪几句、第一句之前留多少秒、最后一句之后留多少秒、句与句之间隔多少秒。
  - `lift`（标志镜头）没有旁白，固定 8 秒。
- **`src/film.js` 的 `init()`**：把这 19 个镜头再切成 23 个场景（`cuts` 列表）：
  - `songshu` 在第 5 句 80% 处硬切到官印特写 `yin`；
  - `spring` 在第 20 句开始后 3 秒切到月下 `moon`；
  - `autumn` 在第 23 句前切到南村 `village`；
  - `keep` 在第 36 句 60% 处切到喝茶 `tea`。
  - 转场默认是墨晕，持续 1.4 秒，中心点在 `FOCUS` 里设。标成 `'cut'` 的是有意的硬切：`yin`、`lift`、`spring`。
- **场景函数** `SCN.<id>(A, L, u, D, t, T, T2)`：
  - `A` 是图层组，`L = A.ink`，`u` 是镜头内秒数，`D` 是镜头时长，`T`、`T2` 是临时图层；
  - 坐标按 1920×1080 画面写；
  - `cam(A, 缩放, 焦点x, 焦点y)` 推镜；`scroll`、`fork`、`fence` 三个镜头用 `A.xf(1, tx, 0)` 横移，它们的世界坐标比画面宽；
  - 返回 `{ paper, bleed, rim }`。
- **`kit.js`**：
  - 人物：`fig(L, 姿势, {x, y, s, dir, rot, p, t})`。
  - 姿势在 `P` 里：stand、walk1/2、front、back、sit（跪坐）、sitChair、hoeUp/Down、bend、bow、carry1/2、sitFront。`modern(pose)` 把姿势换成现代短发、短衣。`walkPose(t)` 是走路循环。
  - 手持道具：用 `at(点, X)` 算出手在画面上的位置，再画道具。
  - 题字：`inscribe(A, [列…], x, y, 字号, 进度, {world:true})`。
- **字幕位置**：每个场景一个，写在 `SUBP` 里。要放在画面留白处，不能压住人物或题字。

## 6. 常见修改

所有命令都在库根目录（`cd $LIB`）运行。`P` 代表本文件夹的绝对路径，`PY=$LIB/.venv/bin/python`。

**预览单帧**（每帧约 2 秒）：
```sh
node core/render/still.mjs $P 116.8 230 --q nosub=1     # 输出到 $P/stills/t_<秒>.jpg；去掉 --q 则带字幕
$PY core/render/sheet.py /tmp/sheet.jpg $P/stills/*.jpg --cols 4 --w 480
```

**改一句旁白**
1. 改 `lines.json` 里这一句的 `text` 和 `say`，TREATMENT.md 第 5 节也同步改掉。
2. 运行 `$PY $P/tools/tts_minimax.py $P/lines.json $P/voices`。没改的句子直接用缓存。
3. 运行 `$PY core/tts/asr_check.py $P/lines.json $P/voices --lang zh`。
   - 多音字读错了：在这一句的 `tone` 里注音，比如 `["荷/(he4)"]`、`["数/(shuo4)"]`。
   - 只是 whisper 把同音字听错了：确认读音没问题后，把它听到的句子写进 `asr` 字段。
4. 依次重跑：`timeline.py` → `events.mjs` → `score.py` → `mix.py` → 渲染 → 合成。

**只改字幕**：改 `text`，然后从 `timeline.py` 开始重跑。

- 切分规则在 `chunks()` 里：每块最多约 24 个字，太短的并到下一块，被切断的引号会自动补上。
- 折成两行的规则在 `kit.wrap`。

**改某个镜头的画面**：改 `SCN.<id>`，先渲染单帧看效果，再整片重渲染。

**改节奏**：改 `SHOTS` 的 head / tail / gap，然后从 `timeline.py` 开始重跑。

**改配乐**
- `music/score.py` 按段落写，注释 1–14 对应各段。
- 静默段是 `events()` 里 `type:'silence'` 的区间。配乐和混音都会在这些区间把声音压到 0，`score.json` 的 selfcheck 会验证。
- 只改配乐或混音、不改画面时，用已经渲染好的 `out/video.mp4` 重新跑 `mux.sh` 就行：
  ```sh
  sh core/render/mux.sh $P/out/video.mp4 $P/mix.wav $P/guiqulai.mp4 24 0
  ```

**改 B 站封面**：运行 `python3 bilibili/cover.py`。底图是 `bilibili/frame_*.jpg`，两帧都是无字幕渲染的。

**加一个镜头**：
1. 在 `SHOTS` 里加一行；
2. 在 `film.js` 里加 `SCN.<id>`；
3. 在 `cuts` 里加上它；
4. 在 `FOCUS` 和 `SUBP` 里设好位置；
5. 需要的话，在 `events()` 里加环境声和拟音。

## 7. 风格约定（与第 1 期统一）

- 朱红只用三处：印章、结尾东篱的菊花、现代窗台的小盆花。
- 原文竖排题写，用 Ma Shan Zheng，从右往左。字幕是题跋式：霞鹜文楷，墨色，不加底框，行首一个朱红小方块。
- 片名只题"归去来"，开头盖"陶"印，片尾盖"渊明"印，不写系列名。
- 转场用墨晕或有意的硬切，不用普通的淡入淡出。人物动作一拍两帧（`step(t)`）。
- 全片有三处静默：标志镜头前 2.4 秒、荒田设问前、大火塌屋之后的一小段。

## 8. 已知的坑

- **用 `destination-out` 擦墨之前**，必须先设 `fillStyle='#000'` 和 `globalAlpha=1`。否则会沿用上一次的半透明填充色，只擦掉一部分。标志镜头 `lift` 一开始就是因为这个出了问题。
- **`mtn(key, …)` 远山图层**按 key 缓存，第一次是逐像素计算，很慢。同一个 key 的参数只在第一次生效，改参数要连 key 一起改。
- **`story.json` 用相对路径 `fetch('story.json')` 读取**，页面必须由库的渲染工具挂载在 `/@film/` 下打开，直接双击 index.html 打不开。
- **第 5 句改过说法。**原句以"官印"收尾，whisper 一直听成"官衣"，所以改成"当天就把官印交了出去"。
- **"gap"是直接用英文交给 TTS 读的**，whisper 有时会听成"概不齐"，这不影响读音。
- **字幕已经压在画面里**，上传 B 站时不要再传 srt。

## 9. 授权

- 引擎代码改自 Lemo-Opuscar（MIT），见 `LICENSE-engine-MIT.txt`。
- 字体是 OFL 授权，采样是 CC0。
- 旁白的使用受 MiniMax 服务条款约束。
- 剧本、分镜、道具、题字和配乐是这支片子原创的。

详见 `CREDITS`。
