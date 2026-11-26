# 古人与心理学（系列名待定）

一个古人、一段经历，配上一个有研究支持的现代心理学方法，最后给观众一件能马上去做的小事。全片中国水墨画风，每一帧都由代码绘制，旁白用 AI 语音合成，配乐是原创的古琴和箫。

制作工具是 Lemo-Opuscar 风格库（github.com/lemomo-ai/lemo-opuscar）的"中国水墨"风格。每一期是一个独立的项目文件夹，可以单独重建。

## 各期

| 期 | 文件夹 | 主题 | 状态 |
|---|---|---|---|
| 1 | [`ep01-longchang/`](ep01-longchang/) | 王阳明在龙场：一无所有时，怎么重新找到方向（所罗门悖论 / 自我抽离、行为激活） | 已完成（5:26），源代码已入库，准备发布 B 站 |
| 2 | [`ep02-taoyuanming/`](ep02-taoyuanming/) | 陶渊明辞官：gap 和"躺平"有什么不一样（自我和谐模型、Jahoda 潜在剥夺模型） | 已完成（5:39），源代码已入库，准备发布 B 站 |
| 3 | `ep03-…/` | 苏轼在黄州 | 已制作，源代码待从对应会话上传 |

## 每一期的文件夹约定

参照 `ep01-longchang/`：

- `README.md`：给人和 agent 看的使用说明，包括目录、环境、一条命令重建、数据流、常见修改、踩过的坑
- `AGENTS.md`：给 agent 的简短入口
- `TREATMENT.md`：剧本，包括史实和研究依据、分镜表、旁白稿、配乐设计
- `build.sh`：从头重建整片
- `CREDITS`：第三方素材的授权
- `src/`：画面代码
- `tools/`：配音、时间线等工具
- `music/`：配乐脚本
- `mix.py`：混音脚本
- `lines.json`：旁白
- `story.json`：时间线
- `voices/.cache/`：配音原始音频，有它就不需要 API key 也能重建配音
- `fonts/`：字体
- `bilibili/`：B 站封面和简介

**不入库**：成片 mp4、所有 wav、渲染输出 `out/`（见根目录 `.gitignore`）。这些都能由 `build.sh` 重新生成，成片另存网盘。**API key 永远不入库。**

## 给另一个会话或 agent：怎么上传第 2、3 期

1. 在做那一期的会话里，把本仓库加进来并克隆，然后从 `main` 新建一个分支。
2. 把该期项目文件夹复制到 `series/ancient-minds/ep0N-<英文或拼音短名>/`，例如 `ep02-taoyuanming`、`ep03-huangzhou`。复制时排除 `out/`、`*.mp4`、`*.wav`、测试帧和试听文件；保留 `voices/.cache/`。
3. 照 `ep01-longchang/README.md` 的结构，给这一期写 `README.md` 和 `AGENTS.md`。
4. 确认里面没有 API key（可以用 `grep -r "sk-api"` 检查）。
5. 更新上面"各期"表格里这一期的那一行。
6. 提交、推送，开 PR 合进 `main`。
