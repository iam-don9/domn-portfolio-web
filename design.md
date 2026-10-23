# DOMN 作品集 · 页面设计系统

> 定位：AI 视频导演 / AIGC 创作者个人作品集，求职向。
> 视觉基调：近黑影院，作品是唯一光源。
> 主题：整站暗色锁定，无亮色切换。
> 版本：**v4.1（2026-10-20 颜色修订）** —— 按 `src/styles/global.css` 的**实际实现**与当前四区块 IA 重写；本次仅将强调色由 v4 的雾蓝灰 `#88a9bd` 改回品牌青绿 `#006A60`，使文档对齐现状。
> **真源**：一切 token 以 `src/styles/global.css` 为准，本文件是它的说明书。强调色现采用品牌 Spotify 青绿 `#006A60`（与 v3 同色），提亮档 `--accent-strong: #00B894` 供小字文本 / hover 保对比度。Geist 字体方案不适用。

---

## 0. Design Read

- 页面类型：个人作品集（creative page）
- 受众：HR / 艺术总监 / 导演 / 创始人，30 秒做匹配判断
- 核心叙事：导演思维 + 工程化底盘（跨域迁移）
- 一句话：**暗黑机能 × 赛博暗黑幻想**。UI 退进阴影，高亮靠**亮度与位移**而非辉光。

## 1. 视觉基调

**content-first darkness**：页面 UI 是消色的（纯黑 + 灰阶），唯一真正的色彩来自作品本身（影片帧、关键帧、生图）。

强调色 `--accent: #006A60` —— **品牌青绿（Spotify 绿），去霓虹**。它只做功能高亮：CTA 填充、激活态、焦点环、编号、链接 hover、卡片 hover 描边、eyebrow。不做装饰性辉光、不做渐变背景、不做第二个强调色。提亮档 `--accent-strong: #00B894` 用于小字文本（如导航编号、`.k` 标签）与 hover，确保 AA 对比度。

**全站无辉光**：不写 `box-shadow` 发光、不写 `text-shadow` 泛光、不写渐变背景。唯一近似的是顶栏与播放位的半透明 `backdrop-filter: blur()` —— 那是景深，不是发光。

## 2. 色彩 Token

| Token | 值 | 用途 |
| -- | --- | --- |
| `--ink` | `#000000` | 最底层纯黑（舞台底 / 视频盒） |
| `--bg` | `#08090a` | 页面底色（近黑，比纯黑多一丝层次，让着色器与吊卡浮出） |
| `--surface` | `#0e0f12` | 卡片、容器 |
| `--surface-raised` | `#15171b` | 交互态、hover 底 |
| `--border` | `#23262c` | 描边（hairline） |
| `--border-soft` | `#181a1f` | 更弱的分隔线 |
| `--text-primary` | `#f4f5f7` | 主文字（off-white，非纯白） |
| `--text-secondary` | `#b7bcc4` | 次要文字、inactive |
| `--text-muted` | `#767d88` | 弱化文字、元数据 |
| `--accent` | `#006A60` | 唯一强调色，品牌青绿，功能化 |
| `--accent-strong` | `#00B894` | 提亮青绿，小字文本 / hover 保对比度 |
| `--accent-dim` | `rgba(0,106,96,.34)` | 描边/背景弱化档 |

规则：

- 单一强调色，整站锁定，不做第二个强调色。
- accent 只出现在：主按钮填充、当前激活态、焦点环、编号、链接 hover、卡片 hover 描边、`.page-eyebrow`。
- 顶栏 / 筛选条用半透明 + `backdrop-filter: blur()`，让背景画幅透出来。
- 阴影一律深色（`rgba(0,0,0,.4~.6)`），不用纯黑硬投影。

## 3. 字体

| 角色 | Token | 栈 | 用途 |
| -- | --- | --- | --- |
| Sans（主） | `--font-sans` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif` | 正文与 UI 主字体 |
| Mono（数据） | `--font-mono` | `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace` | 编号、时长、工具链、eyebrow、按钮、标签 |
| Serif（中文衬线） | `--font-serif` | `"Songti SC", "SimSun", "Noto Serif SC", Georgia, serif` | 备用 |
| Decor（装饰拉丁） | `--font-decor` | `"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif` | 顶栏品牌标 `DOMN·STUDIO`（Google Fonts） |
| Display（展示大字） | `--font-display` | `"LemonMilk", Impact, "Haettenschweiler", "Arial Narrow Bold", var(--font-sans)` | 首页字标（本地 `public/fonts/lemonmilk.otf`，`@font-face`；仅 Regular/400） |

原则：

- **五支栈里四支零外部请求或本地自托管**。唯一外部字体是按需加载的 **Cormorant Garamond**（`BaseLayout.astro` 里 `preconnect` + `stylesheet`），只服务顶栏品牌标；首页字标改用**本地** LemonMilk（无网络依赖，离线回退 Impact → 系统无衬线）。
- 中文正文走系统栈（零下载、跨平台稳定），不做 CJK 子集化。
- **mono 承担「数据感」**：所有编号、参数、eyebrow、标签一律 mono + 大写 + 宽字距（`letter-spacing: 0.1em ~ 0.3em`）。

## 4. 字阶

| Token | 值 | 用途 |
| -- | --- | --- |
| `--fs-hero` | `clamp(2.5rem, 6vw, 5rem)` | 首页大标题 |
| `--fs-display` | `clamp(2rem, 4.5vw, 3.4rem)` | 页面大标题 |
| `--fs-title` | `1.5rem` | 区块标题 |
| `--fs-body` | `1rem` | 正文 |
| `--fs-small` | `0.875rem` | 说明、元数据 |
| `--fs-label` | `0.6875rem` | 标签、按钮文字 |
| `--fs-num` | `clamp(1.1rem, 1.6vw, 1.4rem)` | 编号 |

跳变比：`--fs-hero` ÷ `--fs-body` ≈ 2.5–5×。设计感来自「大展示字压着 16px 正文」，靠字重 + 字号对比，不靠加第三个字体。

## 5. 文案语言策略（英文主标题 + 中文副标题）

原则：英文给「形状和名词」，中文给「意思和差异化」。

| 位置 | 英文 | 中文 |
| -- | --- | --- |
| 首页字标 | `DWELL ON MY NATURE`（`--font-display` 全大写单行，WarpText WebGL 渲染，占视口约 60% 宽；另有 `sr-only` `<h1>` 承载语义） | — |
| eyebrow | `DOMN-STUDIO // GENERATIVE THEATER` | — |
| 板块导航 | 编号 + 标签（`01 WORLDBUILDING`） | 副标签（`世界观与叙事`） |
| 区块标题 | 标签（`CINEMATIC SCREENING` / `DRILLS`） | 副标题（`放映厅` / `练习片段`） |
| 作品卡 | 项目英文代号（mono 小字） | 中文标题 + 一句话阐述 |

- 英文只做**真名词或真数据**（`FILMS` / `SCREENING` / timecode），不做空泛美德词（`CREATIVE` / `VISION` / `BEYOND`）。空词英文一上就从设计感滑到模板味。
- 案例正文（导演阐述 / 关键决策 / 过程）一律中文 —— 这是招聘方读的内容。

## 6. 布局

- **首页**：全出血。内容压在**左侧负空间**（`.page-inner { width: min(100%, 46vw) }`），右侧让给 16:9 画幅。底部一条同高 loop 栏。
- **子页**：隐藏舞台（`body:not(.is-home) .stage { display: none }`），内容限宽居中（`max-width: 1360px`）。
- 正文窄栏：`.page-lede { max-width: 52ch }`；prose 65ch。
- 顶部导航固定，高 `--topbar-h: clamp(56px, 6.4vh, 74px)`；首页底部 loop 栏同高。
- 段落间距**不恒定**：相关两块紧，要落地的节拍前松。

## 7. 形状（圆角）

| Token | 值 | 用途 |
| -- | --- | --- |
| `--radius-pill` | `9999px` | 可交互 pill（按钮、chip、tag、badge） |
| `--radius-media` | `10px` | 媒体 / 卡片容器 |
| `--radius-chip` | `6px` | 小 chip |

焦点环：`outline: 2px solid var(--accent)`，`outline-offset: 3px`，`border-radius: 4px`。

## 8. 组件

分两层：**全局层**（`global.css`，跨页共享）+ **组件层**（各 `.astro` 的 scoped style）。

### 全局层（`src/styles/global.css`）

| 组件 | 要点 |
| -- | --- |
| `.topbar` | fixed；`rgba(8,8,10,.66)` + `blur(12px) saturate(1.06)`；底部 1px 亮边；`transition:persist` 跨页常驻 |
| `.brand` | 几何符号（`/brand/geometric-symbols.svg`，高 20px）+ `DOMN·STUDIO` 字标（mono `0.75rem` / `0.3em` 字距），中点 `·` 用 accent |
| `.nav-item` | **机械滑块**：`::after` 1px accent 下划线，`scaleX(0→1)`，`transform-origin: left`，用 `--ease-mech`；编号 hover 转 accent |
| `.topbar-side` | 右侧 `ABOUT ME`（contact 已并入 about），同样带滑块下划线 |
| `.stage` / `.stage-frame` | 首页 16:9 黑边画框，锚定**右上角**（贴导航栏底边 + 贴页面右缘）；`transition:persist` |
| `.loopbar` | 首页底部 logo 循环栏，与 topbar 同高；hover 浮出自绘 tooltip（品牌名，纵向浮出栏外） |
| `.page-eyebrow` | mono + `0.3em` 字距 + accent |
| `.hero-index` | 首页编号板块索引（主入口）：hover 整行右移 `1.7rem` + 左侧滑出 `1.1rem` accent 短横线 + 箭头淡入 |
| `.btn-primary` / `.btn-ghost` | pill；primary = accent 底 + `#0a0c0e` 字；ghost = 描边 `#5a606b`，hover 转 `--text-primary` |
| `.label` / `.mono` / `.muted` / `.dim` / `.serif` | 排版工具类 |
| `.section-block` | 子页区块（mono 大写标题 + 底部 hairline），用于 `/about` |
| `.flow-list` / `.flow-item` | 编号 + 正文的行式列表，用于 `/about` 的联系方式 |
| `.back-link` | 详情页返回链接（mono 大写 + `←`），hover 转 accent |
| `.player` / `.player__pane` / `.player__tag` | 双播放位（16:9 / 9:16），用于 `/commercial` 详情 |
| `.duallink` / `.duallink__list` / `.duallink__item` | 详情页底部「关联作品」外链区 |
| `.facts` / `.tag` | 详情页头部的事实标签行 |
| `@view-transition` | 微 glitch：新页 `translateY(8px)` 淡入，40–50% 处 RGB 错位抖动（accent 绿 + `#d92d20` 红） |

### 组件层（scoped style）

各页内容组件自带 scoped style，不污染全局：

| 组件 | 用途 |
| -- | --- |
| `TitleCard.astro` | 板块页顶部视频标题卡（吃 `SECTIONS[].video`） |
| `CaseShowcase.astro` | 作品卡片网格（`.showcase` / `.feature`）+ `.reveal` 浮现 |
| `WorkScreening.astro` | 放映区（RAW/FINAL 双播放位 + finalClips 列表）+ 制作步骤拆解表 |
| `FilmProcess.astro` | 过程区时间轴（按 `ClipStage` 排序） |
| `PromptAccordion.astro` | 逐镜提示词折叠（原生 `<details>`） |
| `ProjectMedia.astro` | 项目图组（`.media-grid` / `.media-cell` + 图注） |
| `SkillShowcase.astro` | 技能卡片（`.skill-deck`） |
| `SkillSlides.astro` | 技能深度演示弹层（iframe 内嵌 `public/slides/*.html`） |
| `HomeLogoLoop` / `LogoLoop` | 首页底部工具 logo 循环（React 岛） |

## 9. 动效 Token

| 角色 | 值 |
| -- | --- |
| `--dur-fast` | `200ms` |
| `--dur-base` | `420ms` |
| `--dur-slow` | `800ms` |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-mech` | `cubic-bezier(0.2, 0.9, 0.2, 1)` —— 机械滑块感，专用于下划线 / 短横线滑出 |
| reveal | `opacity 0→1` + `translateY(28px)`，进入视口一次 |

原则：

- **克制**：动效让位给作品（视频才是真正的动效）。
- **高亮靠亮度与位移，不靠辉光**：hover 用 `color` / `translateX` / `border-color` / `scaleX`。
- 禁用 `window.addEventListener('scroll')`；滚动相关一律 `IntersectionObserver`。
- `prefers-reduced-motion`：全局 animation / transition 坍缩到 `0.001ms`，view transition 关闭，内容完整。
- ⚠️ **组件内 DOM 脚本必须挂 `astro:page-load`**（见 `architecture.md` §5.1），否则软跳转后 reveal 不执行、内容停在透明态。

## 10. 无障碍

对比度（对 `#000000` 底，计算值）：

| 前景 | 对比度（对 `#08090a` 底） | 用途 |
| -- | --- | --- |
| `--text-primary` `#f4f5f7` | ≈ 19.3:1 | 主文字 |
| `--text-secondary` `#b7bcc4` | ≈ 11.0:1 | 次要文字 |
| `--accent-strong` `#00B894` | ≈ 7.9:1 | 小字强调、导航编号、`.k` 标签（保 AA） |
| `--accent` `#006A60` | ≈ 3.1:1 | 填充 / 描边 / 大色块（不作小字正文） |
| `--text-muted` `#767d88` | ≈ 5.1:1 | 元数据（仍过 AA 正文 4.5:1） |

- 主按钮：`--accent #006A60` 底配 `#0a0c0e` 字 ≈ **3.1:1** —— 绿底深字靠 pill 形状识别，按钮文字建议加 `font-weight` 或改用 `--accent-strong` 底以达 AA。
- 基础青绿 `#006A60` 对暗底 **≈ 3.1:1**，低于 AA 4.5:1，**不作小字号正文**；小字强调统一走 `--accent-strong #00B894`（≈7.9:1）。这与早期 v3 用绿作小字的情况一致，文档回归绿后同步明确此约束。
- 焦点可见：`outline: 2px solid var(--accent)` + `offset 3px`。
- 触摸目标 ≥ 44px。
- 图片 alt 写「它证明什么」（即 `MediaItem.proves`），不写文件名。

## 11. 断点

| 断点 | 变化 |
| -- | --- |
| ≤ 1080px | 顶栏放不下英文板块名 → 只留编号（`.nav-label` 隐藏） |
| ≤ 900px | 竖屏不做黑边画框，舞台恢复全屏背景；内容区改 100% 宽；`.page-inner` 顶距收紧 |
| ≤ 620px | 隐藏字标 `DOMN·STUDIO`（只留几何符号）；首页索引字号收紧 |
