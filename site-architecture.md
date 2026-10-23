# DOMN 作品集网页 · 信息架构

## 0. 文档定位

本文档定义**站点结构、每页内容、详情页字段、求职应对预案**。配合 `portfolio-source/` 的素材模板使用。

- **当前阶段**：站点已实现并上线可构建（Astro，28 页）。本文档描述的是**已落地**的结构。
- **三份文档的分工**：
  - `site-architecture.md`（本文）—— **信息架构**：页面结构、每页内容、字段定义、求职预案
  - `architecture.md` —— **工程架构**：content schema、目录约定、路由映射、硬约定
  - `design.md` —— **设计系统**：色彩 / 字体 / 字阶 / 组件 / 动效 token
- **数据源关系**：`portfolio-source/projects/*/project.md` 是内容数据源，本文档定义网页如何消费这些数据。

> ⚠️ 本文档 v1（2026-09）描述的是 `/works` `/visual` `/toolkit` 三页方案与多幕式 Hero，**均已作废**。现行结构见 §2 起。§1 / §7 / §8 / §9 的定位与求职预案部分不受影响。

---

## 1. 核心定位

| 项 | 内容 |
| -- | --- |
| 目标岗位 | AI 视频导演 / AIGC 创作者 |
| 目标受众 | 招聘方（HR / 艺术总监 / 导演 / 创始人），30 秒内做匹配判断 |
| 核心叙事 | 导演思维 + 工程化底盘（跨域迁移） |
| 一句话定位 | AI 视频导演 / AIGC 创作者，建筑智能化工程背景 × AI 视频创作 × 自研工作流 |

### 三个能力支柱

| 支柱 | 作品支撑 | 对应岗位胜任力 |
| -- | --- | --- |
| ① 导演与叙事 | TVC + 动画短片 + 剧情短片 | 镜头决策、叙事能力、商业服务 |
| ② 视觉与世界观 | 角色设计短片 + 生图作品 | 审美、世界观构建、跨镜头一致性 |
| ③ 工作流工程化 | 自研 skill | 工具编排、效率放大、团队贡献 |

### 能力映射（建筑智能化 → AI 视频导演）

用于简历、面试、关于页面：

| 建筑智能化 | AI 视频导演胜任力 |
| -- | --- |
| 空间设计、透视、尺度感 | 镜头空间叙事、广角/纵深/透视构图 |
| 多系统集成（BA / 安防 / 弱电） | 多工具工作流编排、跨工具 pipeline |
| 图纸、规范、标准化 | 分镜表 / 镜头表的系统性 |
| 多专业协调（电气 / 暖通 / 结构） | 多镜头一致性管理（角色 / 场景 / 风格） |
| 现场协调、项目管理 | 制作周期与交付管理 |
| 工程化思维、调试排错 | 自研 skill、迭代调优 |

---

## 2. 信息架构

```
/                首页 —— 生成式剧场（四条创作线索引）
/worldbuilding   01 世界观与叙事 —— 剧本档案馆 + 角色设计
/films           02 AI 短片 —— 放映厅 + 练习片段
/commercial      03 商业设计 —— 商业画册
/skills          04 技能树 —— 技能卡 + 深度演示
/about           关于 / 简历 / 联系
/resume.pdf      静态文件
```

四个内容区（`SECTIONS`，数组顺序即导航顺序与首页索引顺序）：

| # | key | 路由 | 中文标签 | 英文标签 | 收录内容 |
| -- | --- | --- | --- | --- | --- |
| 01 | `worldbuilding` | `/worldbuilding` | 世界观与叙事 | `WORLDBUILDING` | 剧本档案馆 |
| 02 | `films` | `/films` | AI 短片 | `FILMS` | 放映厅 + 练习片段 + 角色PV（角色设计演出） |
| 03 | `commercial` | `/commercial` | 商业设计 | `COMMERCIAL` | 商业画册 |
| 04 | `skills` | `/skills` | 技能树 | `SKILLS` | 技能卡 + 深度演示 |

每个区下辖两个页面层级：**列表页**（`/films`）+ **详情页**（`/films/[filmId]`）。

### 排序策略

| 页面 | 篇幅占比 | 首页曝光 | 内容 |
| -- | --- | --- | --- |
| `/films` | 主位 | 编号索引 02 | 放映厅（完整成品）+ 练习片段（单场景练习） |
| `/worldbuilding` | 主位 | 编号索引 01 | 剧本档案馆 + 角色设计 |
| `/commercial` | 次位 | 编号索引 03 | 商业全案 |
| `/skills` | 次位 | 编号索引 04 | 自研 skill 与工具链 |
| `/about` | 收口 | 顶栏右侧 `ABOUT ME` | 简历 + 联系 + PDF 下载 |

> **每个区内部再分区**，而不是页面级多页。例如 `/films` 内部分「放映厅 / 练习片段」，`/worldbuilding` 内部分「剧本档案馆 / 角色设计」。

---

## 3. 首页设计

**定位：生成式剧场。** 首页不是作品墙，而是「四条创作线的索引」——作品在各自的板块页展开。

### 结构

```
[顶部导航栏 · 跨页常驻]
  几何符号 + DOMN·STUDIO    01 WORLDBUILDING  02 FILMS  03 COMMERCIAL  04 SKILLS    ABOUT ME

[舞台]  右侧 16:9 黑边画框（idle.mp4，仅首页显示）

[左侧负空间 · 内容]
  eyebrow    DOMN-STUDIO // GENERATIVE THEATER
  字标       DWELL ON MY NATURE          ← WarpText WebGL（LemonMilk 全大写单行，文本宽约 60% 视口；无 lede、无索引）

[底部 loop 栏]  11 个工具 logo 无限横滚（与导航栏同高）
```

### 要点

- **首页只放这一区**：eyebrow + 观点字标。不放精选作品网格、不放能力支柱、不放页脚（编号索引已于 2026-10-14 删除）。
- **字标是 WebGL**：React 岛 `WarpText`（ogl 玻璃折射 shader），文本 `DWELL ON MY NATURE` 经 2D canvas 栅格进纹理；`--font-display` = 本地 `public/fonts/lemonmilk.otf`。另有一个 `sr-only` 的 `<h1>` 承载标题语义。
- **左侧负空间已放宽**：`.home` 覆盖 `.page-inner` 的 46vw 上限为 `min(100%, 88vw)`，`.home-content { max-width: 70vw }` → 字标文本约占视口 60%（`WarpText` 文本填其容器 86%）。
- 内容压在左侧，右侧仍让给 16:9 画幅。
- 底部 loop 栏 hover logo 浮出品牌名 tooltip；hover 刹车为 playbackRate 平滑缓动（非瞬停）。
- 子页**隐藏舞台**（`body:not(.is-home) .stage { display: none }`），纯黑底承载内容。

### 内容来源

| 区块 | 来源 |
| -- | --- |
| eyebrow / 字标 | 固定在 `src/pages/index.astro`（字标文本以 props 传入 `WarpText`） |
| 舞台背景 | `IDLE_VIDEO`（`/video/idle.mp4`） |
| 底部 logo 栏 | `src/components/HomeLogoLoop.tsx` 的 11 个工具 |

---

## 4. 板块列表页

四个列表页共用同一骨架：

```
[TitleCard]  视频标题卡（吃 SECTIONS[].video + statement 导语）
[CaseShowcase × N]  作品卡片网格，每个区块一个 kicker
```

### 各页区块划分

| 页面 | 区块（kicker） | 过滤条件 |
| -- | --- | --- |
| `/films` | `CINEMATIC SCREENING · 放映厅` | `type === 'ai-video' && workKind === '成品片'` |
| `/films` | `DRILLS · 练习片段` | `type === 'ai-video' && workKind === '练习片段'` |
| `/films` | `CHARACTER PV · 角色PV` | `type === 'character-design'` |
| `/worldbuilding` | `SCRIPT ARCHIVE · 剧本档案馆` | `type === 'worldbuilding' \|\| crossSections.includes('script-archive')` |
| `/commercial` | `COMMERCIAL LOOKBOOK · 商业画册` | `['tvc','visual-design','ai-images'].includes(type)` |
| `/skills` | （无 kicker）`SkillShowcase` + `SkillSlides` | 见下 |

### 作品卡（`CaseShowcase` → `.feature`）

- 非对称网格。每卡：序号 + 封面 + 英文代号 + 中文标题 + 一句话阐述 + 元信息 chips。
- 卡片 chip 反映 **`workKind`**（成品片 / 练习片段）或 **`category`**（LIVE-ACTION / 3D CGI / 2D ANIME）。
- hover：封面轻微放大 + 标题转 accent，不做统一 `translateY` 抬升。
- 滚动浮现：`.reveal` + `IntersectionObserver`（**必须挂 `astro:page-load`**，见 `architecture.md` §5.1）。

### `/skills` 的特殊性

**三分类混合来源**（2026-10-15 起列表页部分读集合）：
- 分类 A「视觉与角色系统」/ B「电影导演语言」：14 张方法论卡**硬编码**在 `src/pages/skills.astro` 的 `methodologyCategories` 里（含亮点/痛点/封面，无详情页，点击走 `SKILL_DECKS` 的 `en → /slides/<name>.html` 演示映射）。
- 分类 C「自研工具 / IN-HOUSE TOOLS」：由内容集合（`type: skills` / `ai-tools`）**实时生成**，`href=/skills/<id>` 整卡链接到详情页——列表与 `/skills/[skillId]` 已联动，集合增删工具卡自动跟随。
- `SkillShowcase` 卡片字段 `highlights / pains / href` 均可选：有 `href` 渲染 `<a>`（脚注"查看详情"），无则 `<article>`（脚注"查看演示"）；`highlights/pains` 缺省整块不渲染。
- 14 张方法论卡仍无详情页（无集合条目），如需详情页属内容迁移，另行立项。

---

## 5. 详情页设计

### 5.1 页面组装

`/films/[filmId]` 与 `/worldbuilding/[scriptId]` 共用同一套内容组件。**两套结构并存，由 `process` 字段驱动**（`isNewStructure = !!d.process`）：

**新结构**（已按四段整理好素材的项目）：

```
[header · detail-head]
  eyebrow（英文代号） + h1（中文标题） + statement / logline（一句话阐述）
  facts：作品性质 / 类型 / 年份 / 时长 / 工具链（或题材）

[ProjectCover]        封面（16:9，取 media 里 kind=cover）
[WorkScreening]       主片放映（RAW/FINAL 双播放位 + finalClips 列表）
                      传 showShots={false}，不渲染「制作步骤拆解」表
[ProjectProcess]      制作过程时间线：剧本 → 资产 → 关键帧 → 包装展示
                      资产段的卡片可点开，把该角色的过程资产展开在行内（手风琴）
```

新结构下**不渲染正文**（项目故事 / 关键决策 / 工具方法等叙述性文本不进详情页）。

**旧结构**（其余项目，逐个项目迁移）：

```
[header · detail-head]
[WorkScreening]       放映区 + 制作步骤拆解表
[FilmProcess]         过程区时间轴（按 ClipStage 排序）
[PromptAccordion]     逐镜提示词（原生 details 折叠）
[prose]               正文
[duallink]            关联作品外链
```

**守卫**：`/worldbuilding/[scriptId]` 用 `hasWork`（`finalClips` 或 `processClips` 非空）决定是否渲染前三个组件；纯剧本页只有 header + gallery + prose。
`WorkScreening` 内部再用 `hasScreen` / `hasDualPane` 守卫，**拿不到 B 站链接就不摆空播放位**。
`ProjectProcess` 逐段守卫：某段无素材就整段不出现，不留空壳。

### 5.2 字段映射

**新结构**：

| 页面区块 | project.md 字段 |
| -- | --- |
| eyebrow | `titleEn` |
| h1 | `title` |
| 一句话阐述 | `logline`（剧本）/ `statement` |
| facts | `workKind` / `category` / `year` / `duration` / `tools[]` |
| 封面 | `media[]` 里 `kind: 'cover'` 的那张（经 `coverOf()`） |
| 主片放映 | `bilibiliUrl` / `rawBilibiliUrl` / `finalClips[]` |
| 制作过程 · 剧本 | `process.script[]`（`label` + `note`） |
| 制作过程 · 资产 | `process.assets[]`（行 `label` → `cards[]`；card 含 `cover` + `assets[]`） |
| 制作过程 · 包装展示 | `process.packaging[]`（`file` + `label` + `note`） |

**旧结构**：

| 页面区块 | project.md 字段 |
| -- | --- |
| 放映区 | `bilibiliUrl` / `rawBilibiliUrl` / `finalClips[]` |
| 制作步骤拆解表 | `shots[]` |
| 过程区时间轴 | `processClips[]`（按 `stage` 排序） |
| 逐镜提示词 | `promptShots[]` |
| 正文 | markdown 正文 |
| 关联作品 | `filmId` / `scriptId` / `crossSections` |
| 图组（`ProjectMedia`） | `media[]`（公开的图片类，经 `galleryOf()` 过滤） |
| 角色矩阵 | `characters[]` |

### 5.3 镜头表字段定义（`shots[]`）

| 字段 | 取值范围 / 说明 |
| -- | --- |
| `id` | 镜头序号 |
| `size` | 远 / 全 / 中 / 近 / 特 |
| `lens` | 广角（14–24mm）/ 标准（35–50mm）/ 长焦（85mm+） |
| `move` | 推 / 拉 / 摇 / 移 / 跟 / 升降 / 固定 / 手持 / 甩 |
| `content` | 画面主体 + 环境 |
| `function` | 交代环境 / 建立角色 / 推进冲突 / 情绪峰值 / 收束 |
| `duration` | 秒 |
| `transition` | 直切 / 淡入淡出 / 匹配剪辑 / 转场特效 / 声音先行 |
| `frame` | 对应分镜板文件名（可选） |

### 5.4 过程区阶段

**新结构（`process`）** —— 时间轴固定四段，**顺序即叙事顺序**：

```
剧本 → 资产 → 关键帧 → 包装展示
```

| 段 | 放什么 | 形态 |
| -- | --- | --- |
| 剧本 | 剧本 / 生产包 / 提示词库的条目 | 文本条目列表 |
| 资产 | 角色、族群、场景、道具 | 按行分组，行内卡片平铺一行 |
| 包装展示 | 主视觉、海报、设定总表、场景帧 | 图组网格 |

**资产段的卡片规则**（重要）：

- **角色卡片固定 16:9**：左侧角色图、右侧角色说明（名称 / 定位 / 一句话）。
- **卡片的 `cover` 必须是竖构图角色图**（9:16 的 3D 概念图或 2D 立绘）——它只占卡片左侧那一块。**剧照、生成帧、海报不属于角色资产**。
- **悬停轮播**：指针**一经过**卡片就立即切到第一张非首图，之后只在非首图之间循环；移开回到首图。**16:9 图覆盖整卡；9:16 图只覆盖左侧角色图区**。
- 卡片**单行放不下自动换行**，无点击展开。
- 没有竖构图角色图的角色，`cover` 只能退回三视图 —— 此时横图会盖住整卡、说明不可见，属于素材缺口，不是版式问题。
- 族群类（如狼群）可以**两张群体图作卡片**（群体图为横构图，会覆盖整卡）。

**旧结构（`ClipStage`）** —— 时间轴按此枚举顺序排列，**顺序即此枚举顺序**：

`剧本 → 分镜 → 资产 → 生成 → 迭代 → 修正 → 剪辑`

### 5.5 导演阐述模板（含跨域视角）

**通用版**：

```
我想让观众感受到 __，因为 __。
```

**跨域视角版**（有空间/工程思考时用）：

```
我想让观众感受到 __。
用 [建筑/空间/系统] 的视角切入：__。
因此选择了 [景别/焦段/运镜/构图]。
```

**示例**：

> 我想让观众感受到孤独感。
> 用空间透视的思路切入：把人物放在广角纵深尽头，让空间压过来。
> 因此选了 24mm 广角 + 低机位长焦前景。

### 5.6 两轴分类：`workKind` vs 成品区/过程区

| 轴 | 字段 | 含义 |
| -- | --- | --- |
| 作品性质 | `workKind` | 决定它落在 `/films` 哪个区块：`成品片` → 放映厅；`练习片段` → 练习片段区 |
| 项目内分区 | `finalClips` / `processClips` | 该片自己的「成品区 / 过程区」，与作品性质无关 |

两个轴独立，不能用 `finalClips.length > 0` 反推 `workKind`。

---

## 6. `/commercial/[caseId]` 商业详情页

结构与影片详情页不同，走「画册」逻辑：

```
[header · detail-head]   eyebrow（client · industry）+ h1 + statement
[双播放位]               .player__pane × 2（16:9 横版 / 9:16 竖版）
[交付形式]               deliverables[] → chips
[关联技能]               skillIds[] → getProjectsByIds() 反查
[prose]                  正文
[duallink]               关联作品
```

---

## 7. `/about` 关于页

### 文案框架

```markdown
# 我是谁

AI 视频导演 / AIGC 创作者。

# 背景

X 年建筑智能化工程设计 → 转向 AI 视频创作。
过去做空间与系统，现在做镜头与叙事。
工程化思维、多工具协调、结构化决策是同一套底盘。

# 为什么做 AI 视频

（一段真实动机，1–2 句，不煽情）

# 能带来什么

- 用镜头讲故事的导演能力
- 用自研工具建设工作流的能力
- 用工程化思维管理复杂制作的能力

# 工作履历

（建筑智能化经历，按时间倒序）
- [年份] [公司] · [职位] · [代表项目]

# 教育 / 培训

（学历 + AI 相关学习，没有 AI 培训就列自研 skill 作为替代性学习证据）

# 联系方式

邮箱 / 微信 / 作品集链接
```

### 跨域叙述要点

- 不写「转行」，写「复合背景」
- 把建筑智能化能力映射到 AI 视频导演胜任力（见 §1 能力映射表）
- 自研 skill 是跨域能力的证明，不是「业余爱好」
- 最后收敛到「能带来什么」，回答招聘方的核心问题

---

## 8. PDF 投递版结构

求职第一关常是 PDF，做一页可下载的精简版。

### 结构

```
[第 1 页]
  - 姓名 / 艺名
  - 岗位意向：AI 视频导演 / AIGC 创作者
  - 一句话定位
  - 三个能力支柱
  - 精选案例缩略（4–5 个，封面 + 标题 + 一行说明）
  - 网页链接二维码

[第 2 页]
  - 完整履历（建筑智能化 → AI 视频）
  - 技能清单（导演/创作 + 工程化两栏）
  - 联系方式
```

### 放置位置

- 网页：`/resume.pdf`（`public/resume.pdf`）
- 投递时：附件直接发送，同时邮件正文附网页链接

---

## 9. 简历 / 面试应对预案

### 简历处理

- **工作履历照实写**：建筑智能化经历保留，标注时间、职责、代表项目
- **教育 / 培训**：AI 相关系统学习列出来；没有就列自研 skill
- **技能栏分两栏**：
  - 导演 / 创作：分镜、镜头语言、剪辑、调色、声音设计
  - 工程化：自研 skill 列表、工具链
- **作品集链接**：放显眼位置

### 面试质疑应对（「你没有行业背景」）

30 秒回答结构：

```
承认差异 → 解释迁移逻辑 → 用作品收口

"确实，我之前做的是建筑智能化。
但 AI 视频导演真正稀缺的不是工具操作，
而是系统化的镜头决策和一致性管理——
这和我过去做空间设计和多系统集成是同一套底层能力。
作品里每个案例我都附了镜头表和关键决策，
你可以直接看我在做选择，
而不是只会用工具抽卡。"
```

---

## 10. 素材整理 checklist

详情页能挖多深，取决于素材整理得是否完整。

### 10.1 每条视频必做

- [ ] 关键帧 contact sheet（5–10 张关键帧拼成一张图）
- [ ] 镜头参数表（每个镜头的 prompt、首尾帧图、运动参数）
- [ ] 失败方案截图（1–2 张「被放弃的版本」，配一句「为什么废掉」）
- [ ] 迭代对比视频（15–30 秒，从坏到好的对比）

### 10.2 按项目类型额外做

- **剧情短片 / TVC**：镜头表 + 分镜板 + 关键决策（3 条）
- **动画短片**：风格参考图 + 关键帧动画
- **角色设计**：角色一致性对比图（同一角色跨视角）
  - **角色资产图分三类，别混**：① **竖构图角色图**（9:16 的 3D 概念图 / 2D 立绘）→ 作卡片封面；② **三视图**（半身特写 + 正面全身 + 背面全身）→ 作展开面板；③ **包装物**（海报 / 设定总表 / 剧照 / 生成帧）→ 归「包装展示」段，**不算角色资产**。
  - 没有竖构图角色图的角色，卡片封面用三视图兜底。
- **自研 skill**：skill 产出片段 + 效率数据

### 10.3 文件命名规范

以 `architecture.md` §2.4 为准：

```
01-cover.webp
02-process-concept.webp
03-process-reference.webp
04-process-prompt.md
05-process-generation.webp
06-process-edit.webp
07-final.mp4
```

视频本体**放 B 站**，站内只留外链 + 缩略图（见 `architecture.md` §5.4）。

---

## 11. 当前状态与待办

| 项 | 状态 |
| -- | --- |
| 站点实现 | ✅ 28 页已构建，四区块 IA 全部落地 |
| 详情页新结构（封面 + 主片放映 + 制作过程四段） | ✅ 组件与 schema 已就位，样板 = `/films/evolution-wolf-herder`；其余项目逐个人工迁移（有 `process` 字段才走新结构） |
| 内容 | 22 个项目（`ai-video` 7 / `character-design` 9 / `ai-images` 2 / `tvc` 1 / `ai-tools` 1 / `skills` 2） |
| 封面 | ⏳ 待用 domn-imagegen 重生 |
| B 站链接 | ⏳ `bilibiliUrl` / `rawBilibiliUrl` / `Clip.bilibiliUrl` 全空 |
| 练习片段正文 | ⏳ 11 部仍是 TODO |
| worldbuilding 剧本主题 | ⏳ 16 个待入库 |
| PDF 投递版 | ⏳ 未做（见 §8） |
| git 仓库 | ⏳ **未初始化**（最高优先级工程债） |
