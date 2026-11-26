# Video Studio

用代码制作的短片与视频系列。剧本、分镜、源代码、配乐都放在这里；渲染出的成片体积大，不进仓库，另存网盘。

## 目录

```
films/                    单部短片
  next-frame/             《下一帧 THE NEXT FRAME》
    storyboard/           剧本与分镜页（index.html）及各版关键帧 kf/ kf2/ kf4/
    src/                  动画代码（shots.js 是时间线）
    audio/                配乐与音效（score.py）
    cover/                B 站封面
    render.py             逐镜头渲染
    renders/              渲染输出（已被 .gitignore 忽略）
  shadow-strike/          《影子罢工》（筹备中，见 BRIEF.md）
  only-one-moon/          《宇宙只有一个月亮》生日歌 MV（公开脱敏版）
    src/                  画面代码（Canvas 2D 剪纸风格，逐帧绘制）
    cover/                B 站封面、网易云专辑封面
    tools/                渲染、报错扫描、歌词对齐
    assets/               歌曲与歌词
series/                   系列节目
  shape-of-poems/         《诗的形状》
    season-1.md           第一季选题
    production-guide.md   视觉语言、单集结构、分工
docs/
  workflow.md             工作流程与备份约定
```

## 项目状态

| 项目 | 状态 | 线上页面 |
|---|---|---|
| 《下一帧》 | 已完成全片（4:53），源代码、配乐、封面已入库，准备发布 B 站 | https://claude.ai/artifact/L9PPq1ZDRD6g6hfLCJ3qJZ |
| 《影子罢工》 | 方案已定（皮影戏风格，约 4 分钟），见 `films/shadow-strike/BRIEF.md`，待在 Claude Code 里制作 | — |
| 《宇宙只有一个月亮》MV | 已完成全片（5:58），公开脱敏版源代码、歌曲、封面已入库；已准备 B 站与网易云发布 | — |
| 古人与心理学 | 已迁到独立仓库 https://github.com/ZhiyuSun/ancient-minds（含第 1–3 期及提交历史） | — |
| 《诗的形状》第一季 | 选题已定 8 集，未开拍 | https://claude.ai/artifact/1iPn6cgCNG2CTuJ1n7Jicx |
