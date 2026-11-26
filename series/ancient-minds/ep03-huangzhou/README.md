# 苏轼在黄州：人生低谷时，怎么不被情绪吞掉 —— 源代码与使用说明

8 分 41 秒的水墨短片，1920×1080，24 fps，共 25 个镜头。**每一帧都是代码画的**：Canvas2D 毛笔引擎负责笔触，WebGL 着色器把它合成到宣纸上。旁白用 MiniMax 语音合成（沉稳中年），配乐（古琴、箫）和所有音效也都由代码生成。

这个项目建立在 **Lemo-Opuscar 风格库**（github.com/lemomo-ai/lemo-opuscar）之上，用的是其中的"中国水墨"风格。渲染、语音校对、采样器、混音工具都来自那个库，本文件夹只放这支片子自己的内容。

> **给 AI agent：**先读完本文件，再读库里的 `AGENTS.md`、`TECHNIQUE.md` 和 `styles/ink-wash/STYLE.md`，然后才动代码。改完一定要用 `still.mjs` 渲染几帧，亲眼看过再交付。

---

## 1. 目录结构

```
ep03-huangzhou/
├── README.md            本说明
├── AGENTS.md            给 agent 的简短入口
├── TREATMENT.md         剧本：结构选择、分镜表、旁白稿、配乐和声音设计、史实与引文核对
│                        （剧本写的是 16 个镜头、约 6 分半；成片按实际旁白时长扩成 25 个镜头、8:41，以 story.json 为准）
├── CREDITS              第三方素材及其授权
├── LICENSE-engine-MIT.txt  引擎代码的 MIT 许可（改自 Lemo-Opuscar）
├── build.sh             一条命令从头重建整片
│
├── lines.json           68 句旁白（id / text / speed / quote / tone）
├── voices/              .cache/（MiniMax 原始 mp3，68 句全在）、dur.json（每句时长）、words.json（逐字时间戳）
│                        L01–L68.wav 不入库：build.sh 第 1 步从 .cache 直接生成，不调用 API
├── story.json           ★ 时间线：镜头起止和转场方式、每句旁白起点、字幕切分（由 tools/timeline.py 生成）
├── events.json          声音事件表（由页面导出，供混音用）
├── cues.json / subtitles_zh.srt   字幕
│
├── index.html           页面入口（加载字体、src/main.js）
├── fonts/               Ma Shan Zheng（题字、印章）、霞鹜文楷（字幕）+ OFL 许可
├── src/
│   ├── main.js          入口：按 story.json 调度镜头、墨晕转场、字幕、导出声音事件（EV）
│   ├── film.js          ★ 25 个镜头函数（SHOTS）和每个镜头的字幕位置（SUBPOS）
│   ├── kit.js           零件：图层缓存、竖排题字、题跋式字幕、朱印、雨、竹子、小屋、船、月、孤鸿、乌鸦、坐姿人物、苏轼的姿势
│   ├── figure.js        人物骨架（改自库里的 hero.js：去掉剑，加东坡巾、竹杖和朱红小酒葫芦）┐
│   ├── ink.js           毛笔引擎（笔触、墨块、墨点）                                       │ 改自库里的
│   ├── comp.js          WebGL 宣纸合成（晕染、纸纹、转场）                                 │ 水墨样片
│   └── land.js          山、皴法、悬崖、松、芦苇、水纹                                     ┘
├── tools/
│   ├── make_lines.py    旁白原文 + 读音字典 → lines.json（改旁白就改这里）
│   ├── tts_minimax.py   MiniMax 语音合成（按 文字+声音+语速+读音 缓存）
│   └── timeline.py      ★ 由旁白时长排出 story.json
├── music/
│   └── score.py         原创配乐，所有时间点取自 story.json
├── mix.py               混音：旁白 + 配乐 + 合成音效 + 环境声
├── poster.jpg           无字幕的海报帧（31 秒处：竹杖、红葫芦、水洼）
└── bilibili/            B 站封面（16:9、4:3）和标题、简介
```

## 2. 环境准备

1. **Lemo-Opuscar 库**，默认放在 `~/lemo-opuscar`，放在别处就设置 `LIB=<路径>`。在库里运行 `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music`，会装好 Node 依赖、Python 虚拟环境（`.venv`）、whisper 和采样库。
2. **ffmpeg 7 或更高版本**，要放在 PATH 里。`mux.sh` 需要 7 以上。如果系统自带的版本太老，可以在库的 `.venv` 里 `pip install imageio-ffmpeg`，把它包里 `binaries/` 下的 ffmpeg 链接到一个目录（比如 `~/ffbin`），再把这个目录放在 PATH 最前面。
3. **Node 18+、Python 3.10+。**
4. **MiniMax API key**：只有改了旁白文字、声音、语速或读音时才需要。放在环境变量 `MINIMAX_API_KEY`，或者文件 `~/.minimax_key` 里。**不要放进仓库。**`voices/.cache` 里已经有全部 68 句的原始音频，不改旁白就用不到 key。

## 3. 从头重建

```sh
cd ep03-huangzhou
LIB=~/lemo-opuscar PATH=~/ffbin:$PATH sh build.sh
```

脚本分 8 步：配音 → whisper 校对 → 时间线 → 导出声音事件 → 配乐和混音 → 渲染画面 → 合成音画（−14 LUFS）→ 字幕和海报。最后输出 `sushi-huangzhou.mp4`。

第 2 步 whisper 校对会报出不少差异，几乎都是古文的同音字（"苏轼"听成"苏氏"、"寒食"听成"韩式"、"竹杖"听成"逐帐"），已经逐句确认过读音，`build.sh` 不会因此中断。

成片、`mix.wav`、`music/score.wav` 和 `out/` 都不入库（见仓库根目录的 `.gitignore`），都可以由 `build.sh` 重新生成。成片另存网盘。

在 2 核机器上，渲染一步大约要 1 小时 35 分钟（12513 帧，前半段竹林和雨最慢）。

## 4. 数据怎么流动（改任何东西前先看懂这张图）

```
tools/make_lines.py ──▶ lines.json ──tts_minimax.py──▶ voices/*.wav + dur.json
                                              └─asr_check.py──▶ voices/words.json
dur.json ──timeline.py──▶ story.json   ◀── 唯一的时间来源
story.json ──▶ src/main.js + film.js（画面、字幕）
            ├─▶ events.mjs ──▶ events.json ──▶ mix.py ──▶ mix.wav
            └─▶ music/score.py ──▶ music/score.wav ──┘
main.js ──video.mjs──▶ out/video.mp4 ──mux.sh(+mix.wav)──▶ sushi-huangzhou.mp4
```

**规则：**`story.json` 是唯一的时间来源。镜头里用 `C.V('L05')`（这句旁白在本镜头内的开始时间）、`C.E('L05')`（结束时间）、`C.dur('L05')`、`C.d`（镜头长度）；配乐里用 `T0('shot')`、`V('L05')`。**画面、配乐、混音里都不要写死全片的时间秒数。**

## 5. 常见修改

所有命令都在库根目录（`cd $LIB`）运行。`P` 代表本文件夹的绝对路径，`PY=$LIB/.venv/bin/python`。

### 改一句旁白
1. 在 `tools/make_lines.py` 的 `R` 列表里改这一句：文字、是否原文引用（`1` 表示原文，语速放慢到 0.86，字幕用浓墨）、读音字典（格式 `"九重/(jiu3)(chong2)"`，只对这一句生效）。然后 `python3 $P/tools/make_lines.py` 重新生成 `lines.json`。
2. 重新合成：`PATH=~/ffbin:$PATH $PY $P/tools/tts_minimax.py $P/lines.json $P/voices`。没改过的句子直接用缓存，只有改动的那句会调用 API。
3. 校对：`$PY core/tts/asr_check.py $P/lines.json $P/voices --lang zh`，同音字不用管，真读错了就在第 1 步加读音字典。
4. 然后依次重跑：`python3 $P/tools/timeline.py` → `node core/render/events.mjs $P` → `$PY $P/music/score.py` → `$PY $P/mix.py` → 渲染 → 合成。

已经处理过的易错读音：九重 chóng、卒莫 zú、消长 zhǎng、曾不 zēng、知夫 fú、更酌 gēng、省察 xǐng、种麦 zhòng、数着 shǔ、便宜 pián、看管 kān、行书 xíng。

### 换配音声音或语速
声音在 `tools/tts_minimax.py` 的 `VOICE`（默认 `Chinese (Mandarin)_Reliable_Executive`，沉稳中年）；语速在每句的 `speed`。缓存按"文字 + 声音 + 模型 + 语速 + 读音"区分，不会混用。

### 调整停顿和节奏
`tools/timeline.py` 里的 `SHOTS` 列表管着每个镜头：`(镜头名, 旁白句号列表, 开头留白, 结尾留白, 句间间隔, 无旁白时的固定长度, 转场方式)`。转场方式有 `cut`（直切）、`hard`（硬切）、`bloom`（墨晕，1.1 秒）、`open`（开场）。改完从 `timeline.py` 开始重跑。

### 改画面
- 每个镜头是 `src/film.js` 里的一个函数 `(A, t, C)`，`t` 是镜头内的时间。用 `setCam(A, {x, y, z})` 运镜，`blit()` 贴缓存图层，最后返回合成参数（`bleed` 晕染、`rim` 墨边、`paper` 让纸纹跟随镜头、`vig` 暗角、`fade` 淡出、`rev` 开场显影、`flash` 提亮、`shake` 震动）。
- 静态的山水、竹林、屋子都用 `cached(key, W, H, fn)` 只画一次。`mountainLayer` 逐像素计算，很慢，**只能放在 cached 里**。
- 人物：`walker(L, t, x, y, s, {rate, dir, extra})` 是走路的苏轼（默认斗笠、竹杖、红葫芦）；`extra: {hat: 'cap'}` 换东坡巾，`{staff: null}` 去掉竹杖。`hero(L, 姿势, {...})` 画单个姿势，姿势在 `kit.js` 的 `SU`、`RUN` 和 `film.js` 的 `HOE` 里。坐着的人用 `seated(L, x, y, s, {dir, front, hat, hunch, arm, brush, tone})`。人物按每秒 12 帧动（`T12`）。
- 竖排题字：`columns(A, [列…], x, y, 进度, {size, gap, world, am, fade})`，进度从 0 到 1，字逐个写出。
- 字幕位置在 `film.js` 末尾的 `SUBPOS`，寒食小屋那个镜头前后两段位置不同，见 `subPos()`。
- 全片朱红只用在竹杖上的小酒葫芦、字幕行首的小方块和两枚"东坡"印。这是风格规则，加别的红色会破坏它。

### 改配乐
`music/score.py` 按七段写（雨中、坠落、寒食、墨被提起、三件事、赤壁、回到雨中），每段开头有注释。古琴用 `pluck.py` 的物理模型，箫用 `sampler.py` 的 flute 加低通和气声，另有 frame_drum、gran_cassa、timpani、gong2。调式是 A 羽调五声。

### 改音量平衡
`mix.py` 末尾：旁白压缩后统一 RMS 0.2；配乐乘 1.6，有旁白时压低约 8 dB；环境声在旁白下也会压低。`silence` 事件（"死灰吹不起"之后的 4 秒）整条总线静音，只留一声滴水。最终响度由 `mux.sh` 统一到 −14 LUFS（成片实测 −14.6 LUFS，峰值 −1.4 dBFS）。

## 6. 预览和局部重渲染

```sh
# 渲染单帧（秒）检查，结果是 jpg
node core/render/still.mjs $P 16 125 222 --out /tmp/chk
# 无字幕的帧（海报用）
node core/render/still.mjs $P 31 --q nosub=1 --out /tmp/chk
# 把几张拼成一张对照图
$PY core/render/sheet.py /tmp/sheet.jpg /tmp/chk/*.jpg --cols 3 --w 640
```

只改了一小段时，可以按 1/24 秒渲染这一段，再用 ffmpeg overlay 覆盖到原视频对应的帧上，方法见 `../ep01-longchang/README.md` 第 6 节。

## 7. 已知的坑

- `main.js` 用 `fetch('../story.json')` 读时间线，页面必须通过库的渲染工具打开（项目挂在 `/@film/`，库文件用 `/core/…` 绝对路径）。**直接双击 index.html 打不开。**
- 墨晕转场时两个镜头同时画（旧的在 A，新的在 B），这 1.1 秒渲染会慢一倍。
- 字幕画在图层里，所以会跟着开场的 `rev` 显影一起出现，第一句字幕开头会稍淡。
- 雨是每帧直接在屏幕坐标画的细线（`rain()`），不走毛笔引擎，否则太慢。
- `mix.py` 里合成音效时，库里 `noise()`、`brown()`、`t_()` 返回的长度可能差一个采样点，所以统一用 `fit()` / `M()` 对齐长度后再相加。
- WenKai 字体 24 MB，页面首次加载要等字体，`main.js` 开头用 `document.fonts.load` 等它。

## 8. 授权

- 引擎代码改自 Lemo-Opuscar（MIT），见 `LICENSE-engine-MIT.txt`。
- 字体是 OFL 授权；采样是 CC0。
- 旁白的使用受 MiniMax 服务条款约束。
- 剧本、分镜、题字安排和配乐是这支片子原创的；引用的苏轼诗文均为公有领域。

详见 `CREDITS`。
