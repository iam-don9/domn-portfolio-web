# 可执行整改清单 · domn-portfolio-web UI 评审

> 配套文件：`AUDIT-ui-2026-10-17.md`（诊断版，只给问题）
> 本件为 **Q4=B 可执行清单**：每条含 `文件:行号` + 具体改法。**仅方案，未改动代码。**

## 约束重申（来自你的四条决策）
- 基准色：**绿色 `#006A60`**（保留；仅文字变体提亮，不换色系）
- 首页结构：**保持 7 屏 scroll-snap deck**（不回退单屏 nav hub）
- **第一屏 hero（S1）不改**
- **第二屏 about（S2）只允许微调**
- 其余各屏允许大改，且**允许重排首页屏顺序**
- Q3=C 受众=求职+获客双目标，要"首屏 人设+代表作 双入口"

---

## P0 — 阻断性缺陷（上线前必须修）

### P0-1 详情页标题永久不可见
- **位置**：4 处 `<header class="detail-head reveal" id="overview">`
  - `src/pages/worldbuilding/[scriptId].astro:82`
  - `src/pages/skills/[skillId].astro:42`
  - `src/pages/films/[filmId].astro:76`
  - `src/pages/commercial/[caseId].astro:42`
- **根因**：`.reveal { opacity: 0 }`（`global.css:149`）只在 `index.astro:418` 的 IntersectionObserver 里加 `.in`；详情页继承 `BaseLayout` 而非 `index.astro`，不运行该脚本 → 标题永远透明。
- **改法 A（推荐，DRY）**：把 `index.astro:418` 那段 `querySelectorAll('.reveal')` + observer 抽到 `BaseLayout.astro` 的 `<script>`（若已有脚本则并入），全站共用揭示逻辑。
- **改法 B（最小，逐文件）**：从上述 4 行删掉 `reveal` class（详情头在首屏，本就不需要滚动揭示）。
- **约束符合**：属"其他页"大改范畴，不动 S1/S2 ✓

### P0-2 Capabilities 死链
- **位置**：`src/components/Capabilities.astro:77` → `href={`/skills/${s.en}`}`
- **根因**：`/skills/<en>` 路由不存在（dist/skills 仅 `consistency-locker`/`prompt-diff`/`shot-table-gen`）。而 `Capabilities.astro:15-20` 的 6 个 `s.en` 全部命中 `src/data/skillSlides.ts:12-27` 的 `SKILL_DECKS` 映射（→ `/slides/*.html`）。
- **改法**：
  1. 顶部 `import { SKILL_DECKS } from '../data/skillSlides';`
  2. 第 77 行改为 `href={SKILL_DECKS[s.en] ?? `/slides/${s.en}.html`}`
- **约束符合**：属 S4（Capabilities），可大改 ✓

### P0-3 画廊占位文案暴露给访客
- **位置**：`src/pages/index.astro:141` `gallery-hint` 含"当前为占位图，后续替换同名 svg 即可"
- **根因**：占位调试文案遗留在面向用户的 UI。
- **改法**：文案改为纯交互指引，去掉"占位"信息 → `拖拽 / 滚轮 / 方向键浏览 · 点击放大查看`；占位 SVG 资源上线前替换为真实作品图（内容侧任务，非代码）。
- **约束符合**：属 S5（mywork），可大改 ✓

### P0-4 绿色小字对比度不达标（WCAG AA）
- **位置**：小号 accent 文本多处：
  - `global.css:451` `.page-eyebrow { color: var(--accent) }`
  - `src/components/ProfileOperatorMerge.astro:73` `.mg-eyebrow { color: var(--accent) }`
  - `src/components/Capabilities.astro:146-147` `.cap-eyebrow`（确认色值后同改）
  - `global.css:214` `.brand-mark b { color: var(--accent) }`
  - `global.css:264` `.nav-num` hover/active `color: var(--accent)`
  - `global.css:618` `.duallink__item .k { color: var(--accent) }`
  - `src/components/ProfileOperatorMerge.astro:104` `.mg-edge :global(.sec-h){color:var(--accent)}`
- **根因**：`#006A60` 在近黑底（`--bg≈#0a0c0e`）上对比度仅 ≈3.23:1，低于正文 4.5:1。
- **改法**：小号文本改用更亮的 `--accent-strong: #00B894`（同属品牌绿，近黑底对比度 ≈7.7:1，过 AA）；`--accent` 保留给填充/大号/描边（如 `mg-num` 描边、`btn-primary` 底色）。逐项把上述 `var(--accent)` → `var(--accent-strong)`。
- **约束符合**：保持"基准色绿色"，仅提亮文字变体 ✓

---

## P1 — 结构 / 首屏双入口 / 导航

### P1-1 重排首页顺序，前置"代表作"满足 Q3=C 双入口
- **矛盾**：Q3=C 要"首屏 人设+代表作 双入口"，但约束规定 S1 不改、S2 仅微调 → 首屏本身无法加作品入口。
- **解法（推荐）**：重排 deck，将 `SelectedWorks`（当前 S6，`index.astro:146-150`）上移到 **S3**（紧跟 about 之后），其余顺延：
  - S1 `hero-scene`（`index.astro:40`）— 不改
  - S2 `about-slide`（`index.astro:87`）— 仅微调
  - S3 `SelectedWorks`（从 `:146` 搬到 about 之后）
  - S4 `ProfileOperatorMerge`（`index.astro:124`）
  - S5 `Capabilities`（`index.astro:127`）
  - S6 `mywork-slide`（`index.astro:130`）
  - S7 `pullquote-slide`（`index.astro:153`）
- **替代放法**：若介意"简介"被推后，可 S3=`ProfileOperatorMerge`、S4=`SelectedWorks`，同样满足"人设紧接作品"。
- **注意**：搬动后 01/02 编号屏顺延为 S4/S5，编号与顺序仍自洽。
- **约束符合**：你已授权重排 ✓

### P1-2 顶部导航缺中文副标
- **位置**：`src/layouts/BaseLayout.astro:118-119` 仅渲染 `nav-num` + `nav-label`（英文）；`src/lib/sections.ts:30` 有 `labelCn`（`:47/57/67/77` 已填"想法/实践/商业设计/研发与沉淀"）但未用。
- **改法**：在 `:119` 后加 `<span class="nav-label-cn">{s.labelCn}</span>`；`global.css` 补 `.nav-label-cn { font-size: var(--fs-label); color: var(--text-secondary); }`；窄屏（`global.css:556` 已 `display:none` 英文 label）按需保留中文副标。
- **价值**：双语受众（求职+获客）更直读，契合 Q3=C。
- **约束符合**：非 S1/S2 ✓

### P1-3 矮屏内容溢出 / scroll-snap 失稳
- **位置**：S3 `ProfileOperatorMerge`（`index.astro:124`）、S4 `Capabilities`（`index.astro:127`）内容密度高；768h 矮屏下整屏超出 viewport，`scroll-snap-type: y mandatory` 会割裂。
- **改法**：给这两屏 `slide-inner` 在 `max-height:100vh` 且溢出时 `overflow-y:auto`（`mg-col` 已有 `overflow:auto`，`ProfileOperatorMerge.astro:89`；但整屏需兜底）。建议在 `global.css` 加 `@media (max-height: 760px) { .slide-inner { overflow-y: auto; } }`。
- **约束符合**：非 S1/S2 ✓

### P1-4 ProfileOperatorMerge 屏头编号与标题间距（矮屏）
- **位置**：`ProfileOperatorMerge.astro:17` `mg-num`（描边大号）+ `:18-20` `mg-head__t`（eyebrow+title）。
- **改法**：矮屏/窄屏确认 `mg-num` 与标题不重叠；若拥挤，在现有 `@media (max-width:860px)`（`:112`）或新增 `max-height` 媒体里缩小 `.mg-num` 字号、改为上下堆叠（`flex-direction: column`）。
- **约束符合**：属 S3，可大改 ✓

---

## P2 — 风格收敛 / 细节

### P2-1 系统性 <13px 小字（lint 触发）
- **位置**：`--fs-label: 0.6875rem`（11px）`global.css:69`，被所有 eyebrow/mono 标签使用（`page-eyebrow:448`、`mg-eyebrow:71`、`cap-eyebrow:147`、`nav` 标签、`duallink .k:618` 等）。
- **改法**：`--fs-label` 提到 `0.8125rem`（13px）一次性解决全局；改后回归检查标签密集处（导航、画廊 caption）是否换行/挤压。
- **注**：`--fs-small:0.875rem`（14px）已达标，不动。

### P2-2 强调色泄漏（红 glitch）
- **位置**：`global.css:545` glitch `drop-shadow(-2px 0 #d92d20)` 引入红，与"单一绿"品牌冲突。
- **改法**：二选一 — ① 删红，统一用 `var(--accent)`/`--accent-strong` 做 RGB 错位；② 若刻意保留红作 accent-2，在 `design.md` 显式声明"绿为主、红为转场强调"，避免误判。
- **约束符合**：不改品牌主色 ✓

### P2-3 eyebrow 模式去重 / 中英混排
- **位置**：多处英文大写 eyebrow（"WHAT I DO" `Capabilities.astro:35`、"PROFILE × OPERATOR EDGE" `ProfileOperatorMerge.astro:19`、"MY WORK" `index.astro:133` 等）。
- **改法（评审建议，非强制）**：面向中文受众，eyebrow 改"中文 / EN"双行或纯中文；同类 eyebrow 视觉层级统一，避免每屏各起炉灶。属风格收敛，可延后。
- **约束符合**：不改主色/字体 ✓

### P2-4 文档与代码不一致（design.md）
- **位置**：`design.md` 称 `--accent:#88a9bd`（雾蓝）且"v3 绿已不适用"、描述单屏 nav hub；实际代码绿 `#006A60` + 7 屏 deck。
- **改法**：本评审以代码为准（你已确认绿）。建议后续把 `design.md` 校准到 v4 实际状态，避免下一个人被误导。属文档，不计入代码改动。

---

## 保留项（不要动）
hero 视觉、`scroll-snap` 7 屏结构、品牌绿、字体、glitch 转场机制本身、SideNav 常驻侧栏。

## 未验证（需真机/浏览器复测）
- 真实作品图资源是否到位（P0-3 内容侧）。
- 搬屏后各屏在真机矮屏的实测（P1-1/1-3/1-4）。
- `--fs-label` 提至 13px 后的标签密集处回流（P2-1）。
