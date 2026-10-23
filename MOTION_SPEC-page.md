# MOTION_SPEC-page.md — 整页动效规格

> 补 `MOTION_SPEC-hero.md` 只覆盖 hero 的空缺：本文档定整页（首页 + 案例列表 + 案例详情 + 画廊）的动效。
> 状态：**hero 已拍板（静态定位，见 §10）**；整页动效方向已对齐（4 + 1 个），数值待实现时校准。
> 本文档是 hero 的唯一权威来源；`MOTION_SPEC-hero.md` 为暂缓的 v2 方案。

---

## 1. Goal

- 页面类型：个人作品集（index + detail 结构，非 scroll rail）
- 受众：招聘方（30 秒判断）
- 动效总原则：**作品本身就是动效（视频），页面动效绝不跟作品抢戏。** 每个动效必须有动机（层级 / 叙事 / 反馈 / 状态），不是「好看」。
- 动效身份分工：导演语法（播片、匹配剪辑）＋ 工程化底盘（拖拽 scrub、镜头交叉高亮）。
- Baseline UI 角色：静帧自己成立，关掉所有动效页面依然完整可读（见 design.md）。

## 2. 动效全景

| 编号 | 动效 | 位置 | 触发 | 动机 | 身份 |
|---|---|---|---|---|---|
| M0 | Hero 大字入场（非均匀） | 首页 hero | load | 层级：聚焦一句话 | 导演 |
| M1 | 作品卡 hover 播片 | 首页精选 + /works 列表 | hover / focus | 反馈：这是影片，来看 | 导演 |
| M2 | 迭代对比拖拽 scrub | 案例页「过程与迭代」 | 拖拽 | 叙事：show process | 工程化 |
| M3 | 镜头表 ↔ 分镜板交叉高亮 | 案例页 | hover / focus / tap | 层级：把镜头数据和视觉连起来 | 导演 + 工程化 |
| M4 | 跨页匹配剪辑转场 | 列表 → 详情 | 路由跳转 | 空间记忆：同一帧延续 | 导演 |

## 3. Motion Tokens

复用 design.md §9，补两档：

| Token | 值 | 用途 |
|---|---|---|
| fast | 200ms | hover 状态、高亮、封面↔视频淡切 |
| standard | 300ms | 交叉高亮的 opacity 过渡 |
| base | 400ms | 区块揭示、拖拽松手回弹 |
| slow | 800ms | Hero 入场、路由转场 |
| easing-primary | `cubic-bezier(0.16, 1, 0.3, 1)` | 揭示、入场（ease-out-expo） |
| easing-exit | `cubic-bezier(0.7, 0, 0.84, 0)` | 退出专用（ease-in-expo） |
| easing-transition | `cubic-bezier(0.76, 0, 0.24, 1)` | 对称转场（ease-in-out-quart） |
| spring-snappy | stiffness 350 / damping 28 | 拖拽松手、按钮反馈 |
| stagger-line | 0.08-0.1s/行 | Hero 文字逐行入场 |

## 4. 逐个规格

### M0 · Hero 大字入场

- 触发：load
- 行为：`DIRECTOR` 大字逐行揭示（opacity 0→1 + translateY 12px→0），stagger 0.1s/行，ease-out-expo，slow。
- **已拍板采用**（§10）。底图为全出血静态作品帧，不叠加视频；视频 scrub 方案暂缓至 v2。
- 明确不做：全页 fade-up（design-slop B2）。
- reduced-motion：文字直接呈现，无动画。
- 验收：入场 800ms 内完成；非全页同时淡入；reduced-motion 下文字即时可见。

### M1 · 作品卡 hover 播片

- 触发：pointer enter（键盘 focus-visible 也触发，保证可达）
- 行为：封面 `opacity 1→0`，内嵌 `video muted playsinline loop` 播放；移开 `pause()` + 归零 + 封面淡回。
- duration：封面↔视频 cross-fade 200ms（fast），ease-out-expo。
- transform：仅 opacity（cheap tier），视频不位移。
- library：原生 `<video>` API（`play()`/`pause()`），不引动画库。
- 硬前提：视频必须 `muted` + `playsinline`，否则 hover 无法触发播放（浏览器 autoplay 策略）。
- reduced-motion：不播片，封面保持静态，hover 无动效。
- mobile：无 hover，降级为点击进详情、详情页视频自动播；卡片本身不播。
- 验收：hover 500ms 内视频开始播；移开 200ms 内封面恢复；reduced-motion 不播；移动端无 hover 依赖。

### M2 · 迭代对比拖拽 scrub

- 触发：pointerdown + pointermove（drag）
- 行为：两层图叠放（v1 在下、final 在上），上层裁剪随分隔线移动揭示下层。
- 实现：`scaleX` + `transform-origin` 裁剪（cheap tier），不用 `width`（会 layout）；连续值用 `useMotionValue`，**禁止 useState 每帧重渲染**（motion-web 硬规则）。
- 跟手段：1:1 直接映射 pointer x，无缓动（linear）；松手可选 spring-snappy 轻微回弹。
- library：原生 pointer events + Motion `useMotionValue`。
- reduced-motion：不拖拽，直接并排显示两图（v1 | final）。
- mobile：touch 同 pointer；若空间不够，降级为并排显示。
- 验收：拖拽 1:1 跟手无滞后；松手无跳动；60fps；reduced-motion 下并排显示内容完整。

### M3 · 镜头表 ↔ 分镜板交叉高亮

- 触发：hover / focus-visible 镜头表某行，或分镜板某帧（反向同理）
- 行为：用 `data-shot` 属性联动；hover 一方，另一方对应项边框变绿，其余项 `opacity → 0.5`。
- duration：150ms（fast），ease-out-expo。
- transform：opacity + border-color（cheap），无位移。
- library：纯 CSS（`data-shot` + `:hover` / `:has()`），零 JS。
- reduced-motion：保留高亮（这是状态不是运动），去掉 opacity 过渡，直接切换。
- mobile：无 hover，改 tap 选中联动；或降级为镜头表行内嵌缩略图。
- 验收：hover 一行，对应帧 150ms 内亮起；其余帧同步降到 0.5；键盘 focus 也触发。

### M4 · 跨页匹配剪辑转场

- 触发：路由跳转（/works 列表 → /works/[slug] 详情）
- 行为：封面帧 cross-dissolve 成详情页第一帧（成片视频首帧）。
- duration：400-600ms（base/slow），easing-transition（对称）。
- transform：opacity cross-fade（cheap）。
- library：View Transitions API（Astro 原生 `transition:animate`），或 Motion `layoutId` 共享元素。
- reduced-motion：直接跳转，无转场。
- 验收：转场 600ms 内完成；reduced-motion 直接跳转；无布局跳动（CLS 为 0）。

## 5. 静区原则（quiet band）

页面 chrome（导航、正文文字）保持静止，作品动；某处静，动效才有意义（page-design §3）。整个作品集里，「静」是默认，「动」是例外。

## 6. 不做清单（design-slop 映射）

- 统一 hover 抬升（B1）
- 全页 fade-up（B2）
- 跟随光标的小圆点（B7）
- 粒子 / 漂浮 orb 背景（B5）
- 视差当唯一纵深手段（B6）
- 动效预算全堆 hero（B4）
- `window.addEventListener('scroll')`（用 `useScroll` / IntersectionObserver / CSS scroll-driven）

## 7. Reduced-motion 降级阶梯

每动效按 motion-tokens 三档降级：

1. opacity only（200ms）
2. translate only（8px → 0）
3. no motion（直接呈现，无过渡）

全局兜底：`@media (prefers-reduced-motion: reduce)` 把 animation/transition 压到 0.01ms，scroll-behavior 归 auto。测试：DevTools → Rendering → Emulate prefers-reduced-motion。

## 8. Stack

- 首选：Astro 静态站。
- CSS-only 区域：M3 交叉高亮、reveal（原生 transition）。
- JS 动画区域：M2 拖拽（Motion `useMotionValue`）、M1 播片（原生 video API）。
- 转场：View Transitions API（Astro 原生），reduced-motion 下关闭。
- 无 3D / canvas（作品本身是视频，不需要额外渲染层）。

## 9. Acceptance Criteria

- [ ] 每个动效都有 trigger / duration / easing / reduced-motion 降级（本文档 §4）
- [ ] 所有 hover 依赖的动效都有移动端降级（M1、M3）
- [ ] 无 `window.addEventListener('scroll')`；连续输入值用 `useMotionValue`，不用 `useState`（M2）
- [ ] 只动 `transform` / `opacity`，无 `width` / `height` / `top` / `left` 动画
- [ ] reduced-motion 下内容完整、可导航、可读完
- [ ] 静帧（关掉所有动效）自己成立，通过 design-slop 闸门
- [ ] 移动端无 hover-only 依赖；320 / 375 / 414 / 768 无横向溢出
- [ ] 构建 / 类型检查通过

## 10. Hero 拍板：多幕式静态 hero（2026-09-17 决策，当日二次修订）

> 关闭 `tasks/audit.md` P1「hero 职责自相矛盾」与 `tasks/plan.md` §9.3。
> 当日首次拍板为「M0 静态定位 + DIRECTOR 字标 + 一个 CTA」；随后用户要求改为**多幕式、表达观点、不放作品**，本节据此二次修订，覆盖前次定义。

**决策：首版 hero = 多幕式静态 image hero，表达「为什么喜欢 AI 视频」。视频 scrub 方案（`MOTION_SPEC-hero.md`）仍暂缓至 v2，但其三幕/角度结构被借用为四幕文案骨架。**

### 为什么二次修订

| 维度 | 首次拍板（DIRECTOR 字标） | 二次修订（多幕式观点） |
|---|---|---|
| 首屏职责 | 作品入口（字标 + 一个 CTA） | 立场表达（为什么做 AI 视频） |
| 内容 | 字标 + 副标 | 观点大标题 + 四幕文案 |
| 与用户最新意图 | 不符（要观点、要幕式） | 符合 |
| 与 v2 spec | 无关 | 复用其角度1–4 结构，静态化 |

首页**不放作品**（无精选网格、无能力支柱），只保留 hero + 四幕。作品在 `/works` 看，能力支柱作为 `/works` 分组标签。

### 首版 hero 的最终定义

覆盖 `site-architecture.md` §3 与 `design.md` §8 的全部 hero 描述，以本节为准：

- 全出血**参考帧**（`/media/hero-reference.webp`，源 `AIGC 资产库/inbox/hero区.png`）作底，右上角标 `HERO 视频参考帧 · 待替换为动态影像`
- **滚动分幕**：hero 是一个自包含 `scroll-snap` deck，共 6 个全屏 slide（intro + 四幕 + CTA），滚轮下滑切到下一幕；原生吸附，**不劫持滚轮**、不监听 scroll 事件，满足 `architecture.md` 的无障碍与性能约束。
- 左对齐观点大标题「一个人，也能把脑子里的画面拍出来」+ 一句 tagline（subtext），位于第 1 幕（intro）
- 四幕（01–04）各占一屏，每条一句话为什么喜欢 AI 视频；未来动态影像到位时，六幕即对应六条 clip 脚本
- **一个** CTA「查看全部作品」→ `/works`（位于第 6 幕，是 hero 唯一主行动，不是三个支柱链接）
- 动效：每幕进入视口触发文案逐项揭示（`IntersectionObserver`，`prefers-reduced-motion` 时直接显示）；背景图轻微缩放推进。不监听 scroll、不做视频 scrub
- 三个能力支柱**不进首页**，下移到 `/works` 作为分组标签

### v2 重启条件

见 `MOTION_SPEC-hero.md` 顶部决策记录（真实成片归档 + 实测 scroll scrub 不卡顿）。
