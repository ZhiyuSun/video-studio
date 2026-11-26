# 《宇宙只有一个月亮》MV

一首写给妻子的生日歌，和它的 MV（5:58，1920×1080，30 fps）。歌名里的「宇」「月」各取自两人名字中的一个字。

- 画面：纯 JavaScript + Canvas 2D 逐帧绘制，剪纸层叠风格、彩色小人、真实月相
- 歌词对齐：Whisper large-v3 + Demucs 人声分离 + 能量起音检测 + 副歌两小节网格
- 代码、分镜、封面由 Claude Opus 5.5 完成

> 本目录是**公开版（脱敏版）**：画面上不出现两人的名字，渲染出来就是 B 站发布的版本。带名字的私人版本不在仓库里。

---

## 给接手修改的 agent

一支 5 分 58 秒、1920×1080 @30fps 的 MV。画面全部由 JavaScript 在一张 `<canvas>` 上逐帧绘制（剪纸层叠风格 + 彩色小人），用无头 Chrome 按时间 `t` 截帧，ffmpeg 编码，最后合上歌曲音轨。没有素材图片、没有视频剪辑软件，一切都在代码里。

> 修改前请先读完「1. 架构」和「4. 坑」。最容易犯的错是：改了一个函数，但它在后面的文件里又被覆盖了，所以改动不生效。

---

## 0. 目录

```
src/            画面代码（浏览器里运行）
  mv.html         入口：canvas + 基础工具 + 开头/火锅/外滩的最早版本；按顺序加载下面的 js
  scenes2.js      时间轴 SEC、歌词 LYR、第一版全部场景、总调度（后被覆盖）
  s3_base.js      剪纸工具：PTEX 纸纹、paperL/L 图层缓存、put、glw、moonP、doll(旧)、couple、stampP、bld
  s3_a.js         火锅/外滩/预副歌1/副歌镜头/旅行地图(CITIES2)/路
  s3_b.js         樱花/玻璃罩向日葵/嵊泗/哈尔滨/演唱会/求婚/小满/婚礼(旧)/敦煌
  s3_c.js         白天日常/桥段/最终副歌/纪念日 MEM2/尾声(旧)；**歌词时间 R** 与 SCENES 表在这里建立
  s4.js           新月画法、中午火锅、南京东路过场 sWalk、霓虹外滩、小星球、柴米油盐标签；改 SCENES（插入 sWalk）
  s5.js           一镜到底结尾 sEnding（月相弧线 → 满月 → 拉进水晶球 → 生日快乐）；改 SCENES
  s6.js           **镜头/视差/转场总调度 render6**、副歌分时期背景、地图全城市、婚礼(新)、开头云海、房间装饰、桥段窗户
  s7.js           **小人最终版 doll()**：呼吸、摇摆、歪头、蹦跳、边光、长影子；分场景表演表 DIRECT
cover/
  cover.html/.js  B 站封面（1920×1080；4:3 封面 = 中间 1440×1080 裁出缩到 1200×900）
  album.html/.js  网易云专辑封面（3000×3000）
  *.jpg           已导出的封面
tools/
  render.js       渲染视频片段或单帧
  errcheck.js     全片 JS 报错扫描
  probe.js        在页面里执行表达式（查时间轴等）
  shot_page.js    把封面页面渲染成 PNG
  asr/run.py, asr/align_onsets.py   歌词对齐的做法（一般不用重跑）
data/lyric_times.json    当前使用的逐句开始时间（已写进 s3_c.js 的 const R）
data/whisper_large_v3_mix.json   原始识别结果（参考）
assets/song.mp3, assets/lyrics.txt
```

渲染出的 mp4 不进仓库（见根目录 .gitignore），另存网盘。

## 1. 架构（必读）

### 1.1 全局脚本 + 后者覆盖前者
所有文件都是普通 `<script>`，共享全局作用域，加载顺序是：
`mv.html 内联 → scenes2 → s3_base → s3_a → s3_b → s3_c → s4 → s5 → s6 → s7`

同名函数在后面的文件里被重新赋值（`sHotpot = function…`、`doll = function…`），**后加载的版本生效**。很多覆盖是「包一层」：`const _x = x; x = function(){ … _x(…) … }`。

**改某个东西前，先找它最后一次被定义的位置**：
```bash
grep -n "sWedding\s*=\|function sWedding" src/*.js src/mv.html
```

各场景当前生效的定义位置：

| SCENES 下标 | 时间(秒) | 内容 | 生效定义 |
|---|---|---|---|
| 0 | 0–19 | 开头标题、星→蛾眉月 | `sIntro`（mv.html）+ s6 云海包装 |
| 1 | 18.9–36.1 | 中午来福士火锅 | `sHotpot`（s4） |
| 2 | 36.1–40.6 | 南京东路→晚饭→外滩 过场 | `sWalk`（s4） |
| 3 | 40.6–54.7 | 霓虹外滩（第一次见面，不牵手） | `sBund`/`bundDraw`/`bundMid`（s4） |
| 4 | 54.7–72.7 | 后来每个周末 | `sPre1`（s3_a） |
| 5 | 72.7–108.7 | 副歌1（上海夜） | `sChorus` + `chorusShot`（scenes2 → s3_a → s4 → s6 层层包装） |
| 6 | 108.7–116.1 | 樱花 | `sCherry`（s3_b） |
| 7 | 116.1–122.9 | 玻璃罩永生花向日葵 + 她的特写 | `sSunflower`/`domeGift`（s3_b） |
| 8 | 122.9–129.1 | 嵊泗追夕阳 | `sShengsi`（s3_b） |
| 9 | 129.1–166.1 | 副歌2（嵊泗晚霞） | 同 5 |
| 10 | 166.1–167.9 | 哈尔滨跨年 | `sHarbin`（s3_b） |
| 11 | 167.9–170.2 | 张韶涵演唱会 | `sConcert`（s3_b） |
| 12 | 170.2–183.9 | 星空求婚、625 天 | `sProposal`（s3_b） |
| 13 | 183.9–188.6 | 小满领证 | `sXiaoman`（s3_b） |
| 14 | 188.6–194.2 | 婚礼（玫瑰金、螺旋、马蹄莲、镜面） | `sWedding`（s6，并写回 `SCENES[14][2]`） |
| 15 | 194.2–201.4 | 敦煌鸣沙山（新月、银河、万人灯海） | `sDunhuang`/`dunesDraw`（s3_b） |
| 16 | 201.4–237.9 | 副歌3（大漠银河） | 同 5 |
| 17 | 237.9–245.1 | 周末没有早上 / 拖去展览 | `sMorning`（s3_c） |
| 18 | 245.1–254.3 | 百万阳光房 / 乱放→收拾 | `sSunroom`（s3_c） |
| 19 | 254.3–267.2 | 夜里起身一趟又一趟 | `sNight4`（s3_c） |
| 20 | 267.2–307.6 | 桥段（两盏灯） | `sBridge`（s3_c）+ s6 `homeNight` 窗户 |
| 21 | 307.6–330.1 | 最终副歌前 5 句 | `sFinal`（scenes2）调 `finalShot`（s3_c → s4） |
| 22 | 330.1–358.4 | 一镜到底结尾 | `sEnding`（s5） |

用 `node tools/probe.js src/mv.html "SCENES.map((s,i)=>i+' '+s[0].toFixed(2)+'-'+s[1].toFixed(2)).join('\n')"` 可以随时核对。

### 1.2 每一帧怎么画（s6 `render6`）
1. 找出当前场景 `cur` 与下一场景；按 `TRANS[下一场景下标]` 决定转场：`fade`、`iris`（圆形展开，带月光圈）、`wipe`（横向擦除）、`flash`（金白闪）、`dip`/`dipw`（暗场/白场）。
2. `drawScene(k,t)`：设置镜头 `CAMV = sceneCam(k,t)`（缓慢推/拉/横移/上移 + 副歌每句开头和每小节的轻推），然后调用 `SCENES[k][2](t)`。
3. 叠歌词 `caption(t)`、颗粒、纸纹、整片首尾淡入淡出。

场景函数拿到的是**整首歌的绝对时间 t（秒）**，内部用 `SEC.xx.st[i]`（第 i 句开始时间）安排动作。

### 1.3 时间轴
- `SEC`：每段的逐句开始时间 `st` 和歌词 `txt`。键：`v1 pre1 c1 v2 c2 v3 pre2 c3 v4 br fin out`。
- **实际生效的时间在 `s3_c.js` 末尾的 `const R = {…}`**（= `data/lyric_times.json`）。那段 IIFE 会用 R 覆盖 `SEC.*.st`、重建歌词 `LYR`、重建 `SCENES`。
- `LYR`：`[开始秒, 文本|null]` 列表，`caption()` 自动显示，下一条开始前淡出；`null` 表示这段时间不显示字幕。
- 场景边界大多是用 `SEC` 算出来的，所以**改歌词时间，画面动作会跟着移动**。
- 节拍：106 BPM，`BEAT = 60/106`，`BAR = 4*BEAT`，`T0 = 0.136`（第一拍）。副歌每句正好 2 小节（4.528 秒）。

### 1.4 剪纸图层与视差
- `L(key, fn, opts)`：第一次调用时用 `fn(ctx)` 画一张 1920×1080 的图层，叠上纸纹和投影后缓存；之后直接复用。`opts='raw'` 表示不加纸纹/投影。缓存 12 秒没用到会被清掉（`evict`）。**key 必须唯一**；同一个 key 换了画法，要改 key。
- `put(canvas, dx, dy, alpha)`：画一个图层。**同一场景里 put 的调用顺序就是远近**：第 1 个最远（视差系数 0.25），往后依次 0.5、0.75、1。`doll()` 等直接绘制的内容跟镜头完全同步。
- `layer(fn, alpha)`：把 `fn` 画进离屏画布后按透明度叠上来（用于场景内部的淡入淡出），会自动带上当前镜头。

### 1.5 小人 `doll(x, y, h, who, o)`（最终版在 s7）
- `who`：`'he'`（奶油色 #f3d9a4）或 `'she'`（粉色 #f7b9aa，带发髻）；`(x,y)` 是脚底；`h` 是身高像素。
- 常用参数：`armL/armR:[dx,dy]`（手的位置；`null` 表示不画这只手）、`smile`、`sleep`、`run`（走路相位）、`bob`、`lean`（整体倾斜）、`tilt`（歪头）、`hop`（跳起像素）、`kneel`、`veil`、`scarf`、`ears`（猫耳）、`col`（换颜色）、`light`（头顶轮廓光）、`rimL/rimR`（左右彩色边光 'r,g,b'）、`longShadow:[dx,dy]`、`dapple`（星光流过）、`noShadow`。
- `couple(x, y, h, o)`：两人并排牵手。**注意：第一次见面（火锅、南京东路、外滩）不能牵手，要分开画两个 doll。**
- **分场景的表演**写在 s7 的 `DIRECT[场景下标] = (who, t, x) => ({…额外参数})`，会自动合并进该场景里每次 doll 调用。加小动作优先改这里，不用动场景代码。

### 1.6 其他常用工具
`T(text,x,y,size,color,alpha,{w,glow,blur,align})` 写字 · `stampP(t,alpha,line1,line2)` 左上角日期标注（不随镜头动）· `glw(x,y,r,'r,g,b',a)` 加亮光晕 · `glowDot` 星点 · `moonP(x,y,r,亮面比例,是否亏月,光晕,alpha)`（亮面 <0.03 时画成带地照的新月）· `heartPath` · `bubble` 对话气泡 · `finish(暗角强度)` · `beatPulse(t)` 拍点脉冲 · `ramp(t,a,b)` / `ease` / `clamp` / `lerp` / `rng(seed)`（确定性随机，保证每次渲染一致）。

---

## 2. 渲染

依赖：Node 18+、`npm i playwright`、ffmpeg、字体 **Noto Serif CJK SC（思源宋体）**。缺了字体，浏览器会换别的字体，字形和排版都会变。

```bash
cd films/only-one-moon

# 检查脚本错误（每次改完都跑）
node tools/errcheck.js src/mv.html

# 看几帧
node tools/render.js src/mv.html stills 45,120.5,333

# 全片（双核机器分两半并行，大约 10 分钟）
node tools/render.js src/mv.html partA.mp4 0 180 &
node tools/render.js src/mv.html partB.mp4 180 358.44
printf "file 'partA.mp4'\nfile 'partB.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy video.mp4
ffmpeg -i video.mp4 -i assets/song.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart MV.mp4
```

### 只重渲一小段再拼回去（省时间，推荐）
帧号 = 秒 × 30。重渲 `[a, b)`，比如 a=94.5、b=100.3，对应帧 2835 到 3009：
```bash
node tools/render.js src/mv.html seg.mp4 94.5 100.3
ffmpeg -i video.mp4 -i seg.mp4 -filter_complex "[0:v]split[v0][v1];[v0]trim=end_frame=2835,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[v1]trim=start_frame=3009,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0[out]" -map "[out]" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p video2.mp4
```
重渲的范围要把前后的转场都包进去（转场最长约 1 秒），拼完核对总帧数是否为 10753。

### 质检
```bash
ffmpeg -i MV.mp4 -vf "fps=1,scale=384:216" qa/f_%03d.jpg   # 每秒一帧，拼成大图逐张看
```
重点看：转场瞬间、镜头横移时画面边缘有没有露出空白、文字有没有被裁切或遮挡、字幕和演唱是否对齐。

---

## 3. 常见修改怎么做

| 想改 | 去哪里 |
|---|---|
| 某句字幕早了/晚了 | `s3_c.js` 的 `const R`，改对应段 `st` 里那一项（秒）。画面动作会跟着移动 |
| 字幕文字 | 前 8 句在 `mv.html` 的 `LYR`；其余在 `scenes2.js` 的 `SEC.*.txt` / `CHORUS`；结尾在 `SEC.out.txt` |
| 左上角日期/地点标注 | 各场景里的 `stampP(...)` |
| 旅行城市及顺序 | `s3_a.js` 的 `CITIES2`：`[名, 经度, 纬度, 标签dx, 标签dy]`，顺序即路线顺序 |
| 纪念日列表与月相（结尾弧线） | `s3_c.js` 的 `MEM2`：`[日期, 文字, 亮面比例, 是否亏月]` |
| 某场景的画面 | 找到该场景**最后一次定义**（见 1.1 的表）直接改 |
| 小人动作/表情 | `s7.js` 的 `DIRECT`；或在场景里改 doll 的参数 |
| 转场方式/时长 | `s6.js` 的 `TRANS`：`下标: [类型, 秒, (iris 圆心 x, y)]` |
| 镜头运动 | `s6.js` 的 `sceneCam`、`camMove`、`STYLES` |
| 副歌的背景 | `s6.js` 的 `backdrop(V)`；三段的配色和月相在 `V1/V2/V3`（`scenes2.js` 定义，s3_a/s6 补充属性） |
| B 站封面 | `cover/cover.js`，`node tools/shot_page.js cover/cover.html out.png` |
| 网易云封面 | `cover/album.js`，`node tools/shot_page.js cover/album.html out.png` |

---

## 4. 坑

1. **改了没生效**：函数在后面的文件里被覆盖了（见 1.1）。另外 `SCENES` 里有的条目保存的是函数引用，覆盖函数之后还要把 `SCENES[k][2]` 换掉（s6 对婚礼就是这么做的）。
2. **画面边缘露出空白**：镜头有放大（≥1.03）和平移。全屏底图要用 `put` 或 `fillRect(0,0,W,H)` 铺满，自定义平移别超过放大留出的余量。需要大幅横移的镜头（副歌里「从外滩的霓虹到大漠的星光」那句）`sceneCam` 返回 `null`，即关掉镜头运动。
3. **不要在场景里调用 `g.setTransform(...)`**，它会冲掉镜头变换。需要局部变换时用 `g.save()/translate/restore()`。左上角标注一律用 `stampP`。
4. **缓存 key 冲突**：两个不同的图层用了同一个 `L()` key，后画的那个会直接拿到前一个的图。
5. **确定性**：随机数一律用 `rng(seed)`，不要用 `Math.random()`，否则每次渲染画面不一样，局部重渲拼接时会跳。
6. **字幕在浅色背景上看不清**：`window.capDark(t)`（s3_c）决定哪些时间段的字幕用深色字，目前用于白天的日常段落。
7. **渲染速度**：大约每秒 10 帧/进程。全片双进程约 10 分钟，所以小改动请用「局部重渲 + 拼接」。

---

## 5. 内容上的事实与约定（来自作者，改的时候别弄错）

- 2023.01.26 加上微信（那晚是 21% 的蛾眉月，开头那颗星化成的就是它）。
- 2023.02.12 第一次见面：**中午**在人民广场来福士吃火锅，下午逛南京东路，晚上在外滩附近吃饭，饭后逛外滩。第一次见面，**两人不牵手、不勾肩**。那晚的月亮半夜才升起，所以火锅和外滩画面里没有月亮。
- 2023.03.25 表白：玻璃罩里的永生花向日葵，罩子里放了一个捧红玫瑰的小王子公仔。**不要画《小王子》原作角色**（版权角色），罩子里画的是「他」的小人捧着玫瑰。
- 2023.05.01 嵊泗追夕阳，她说从那一刻起答应在一起。
- 2023.12.31 哈尔滨冰雪大世界跨年；2024.10.13 张韶涵演唱会内场比心。
- 2024.10.12 星空投影求婚，「在一起的第 625 天」。**那时阿黄和黑白（毛绒玩具）还没到家**，所以求婚画面里只有抱枕。
- 2025.05.21 小满领证（持证上岗）；2025.05.25 婚礼（两个社恐）；2025.09.23 敦煌鸣沙山（新月，银河很亮）。
- 2026.11.24 她 32 岁生日，正好是满月。
- 旅行顺序（16 站）：上海、嵊泗、苏州、嘉兴、沈阳、哈尔滨、绍兴、青岛、兰州、张掖、敦煌、西安、开封、徐州、重庆、南京。
- 不要画任何版权角色或品牌形象（比如迪士尼的达菲）。
- 本仓库是公开版：画面、文案、代码里都不要写两人的名字；标题里的「宇」「月」和水晶球底座上刻的「宇 · 月」可以保留。B 站/网易云文案也不写「老婆」和「32 岁」。
