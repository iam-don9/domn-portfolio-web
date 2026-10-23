# 作品集首页 · 动效审计（motion-web audit）

> 审计对象：`src/pages/index.astro`（滚动分幕 deck）+ `src/styles/global.css` + `BaseLayout`/`SiteHeader`。
> 方法：关掉动效看静帧（design-slop A 类闸门）→ 再开动效看机制（B 类闸门）→ 性能/无障碍/可发现性。
> 结论：**能跑、无报错、无死链、reduced-motion 可用**，但首页作为「全站第一印象」在「设计感」和「可发现性」上还有明显可改项。无阻断性 bug。

---

## ✅ 已通过（不用动）

- **无 A1 默认 hero**：首屏是机制本身（分幕 + 观点标题 + 参考帧），不是「居中 H1 + 两个按钮」模板。
- **无 A4 紫色渐变**：单一强调色 `#006A60` 锁定，暗色基调一致。
- **CTA 只有一个按钮**（「查看全部作品」），不是双按钮对，符合创意页方言。
- **B8 reduced-motion 通过**：`prefers-reduced-motion` 下 6 幕全部 `is-active`，内容完整可见。
- **未劫持滚轮**：用原生 `scroll-snap`，符合 architecture 里的无障碍/性能约束（不监听 `scroll`、不 `preventDefault`）。
- **构建通过、全路由 200、无 NaN/undefined 残留**（前序已验证）。

---

## 🔴 HIGH（建议必改）

### H1 · 色调推进几乎不可见 —— 装饰风险（design-slop A5）
- 现象：`.slide-tone` 的 `--tone` 从 `0 → 10 → 18 → 26 → 34 → 42`，叠在 `filter: brightness(0.62)` 的近黑图上。42% 的暗绿在亮度和已达 0.62 的图上基本看不出来，6 幕之间没有可感知的色彩推进。
- 后果：「色彩推进」这个设计意图没落地，那层渐变读起来像「给空页面加纹理」，正是 A5 警告的「装饰代替设计」。
- 修法（二选一）：
  - **让推进有意义**：把 ramp 拉到 `0 / 35 / 55 / 72 / 88 / 100`，并让 `--accent` 在末端明显压过背景；或在 intro 用冷色、act 幕渐暖到 accent。
  - **或删掉**：如果保持同一张参考帧，干脆只用统一的暗化遮罩，别假装有色阶。

### H2 · 6 张相同的全屏 `<img>` 同一 webp —— 性能/冗余
- 现象：6 个 `.slide` 各放一张 `src="/media/hero-reference.webp"`，`position:absolute; inset:0; object-fit:cover`。
- 后果：DOM 里 5 张是纯冗余；全屏 `filter` 过渡还会逐帧重绘整图（见 H3）。
- 修法：抽成**一个共享背景层**（`.deck` 上 `background-image` 或单个 `.slide-bg` 固定定位），每幕只保留**独立的色调叠层** `.slide-tone`。删掉 5 个冗余 `<img>`。

### H3 · 背景图 `filter` 过渡触发整图重绘（性能）
- 现象：`.slide-bg { transition: transform 1.1s ..., filter 1.1s ease; filter: brightness(0.62) saturate(0.92) }`。
- 后果：`filter` **不是合成层属性**，过渡时每帧重绘整张全屏图 1.1s，低端机掉帧。
- 修法：去掉 `filter` 的 transition（只保留静态 `filter`）；`transform: scale` 是合成层，可保留。

### H4 · 背景图 `alt` 重复 6 次相同文本（无障碍/语义）
- 现象：6 张图 alt 都是「Hero 视频参考帧：庄一作品主视觉」，正文才是信息。
- 后果：屏幕阅读器会把同一句装饰说明念 6 遍；且这图是装饰（未来换视频），不该带信息性 alt。
- 修法：背景图改为 `alt=""`（或 `role="presentation"`），把语义留给每幕的文字。

---

## 🟡 MEDIUM

### M1 · 嵌套滚动容器键盘无法滚动（a11y）
- 现象：`.deck` 是内部滚动容器，但只有 CTA 幕有可聚焦元素（`<a>`）。键盘用户 Tab 到页头/CTA 后，无法把焦点带进 deck 去滚动 1–4 幕。
- 修法：给 `.deck`（或每幕 `.slide`）加 `tabindex="0"`，使其成为可键盘滚动区域（方向键/空格滚动）。

### M2 · deck 绕过全局 motion token + 6 幕入场完全一致（B3 / B2）
- 现象：deck 硬编码 `cubic-bezier(0.2,0.7,0.2,1)` @ 0.7s，没用 `global.css` 的 `--ease` / 三档时长（fast/base/slow）；6 幕的 reveal 都是 `translateY(20px)+opacity`、stagger 完全相同。
- 后果：B3 单一缓动单一时长；B2 每个到达点动作一致，读者到第三幕就学会忽略。
- 修法：引用全局 motion token；并让 act 幕的**大数字**用不同入场（如缩放入场 / clip 揭示），和 intro 的逐行揭示拉开差异。

### M3 · reduced-motion 下 scale(1.1) 特异性压过 `transform:none`（正确性）
- 现象：`.slide.is-active .slide-bg { transform: scale(1.1) }`（特异性 0,3,0）在 reduced-motion 块里的 `.slide-bg { transform:none }`（0,1,0）**之上**，所以 reduced-motion 下 6 张图仍被静态放大 1.1。
- 后果：当前是静态、无害，但你「reduced-motion 不动 transform」的意图没落实。
- 修法：把 scale 用 `:where(.slide.is-active .slide-bg)` 降特异性，或把 `.is-active` 的 scale 整段移入非 reduced-motion 块。

### M4 · 缺少进度/定位指示（affordance）
- 现象：6 幕无任何可见进度（01–06 / 圆点 / 当前幕标），intro 有「下滑 ↓」提示，但后续幕没有「我在第几幕 / 这是结尾」的指示。
- 后果：affordance.md 担心的「能点≠看得出」——用户不知道还有 5 幕、也不知道何时到底。
- 修法：右侧或底部加一个轻量进度指示（数字 01–06 或竖点），当前幕高亮；CTA 幕给末端态。

---

## 🟢 LOW

### L1 · 首页 hero 字号偏小（A6 尺度对比）
- 现象：`.slide-title` 上限 `clamp(2.4rem, 6.5vw, 5rem)`，与全局 `--fs-display`(5rem) 同级，没用 `--fs-hero`(8.5rem)。
- 修法：全屏观点 hero 可上探到 6–7rem，制造「巨型 display 字 vs 小 body」的尺度跳跃（这是静帧的半壁江山）。

### L2 · 全局 `.reveal { will-change: opacity, transform }` 常驻（性能）
- 现象：所有 `.reveal` 元素永久挂 `will-change`，违反「不在静态元素上加 will-change」。
- 后果：works/visual/toolkit/about 页大量元素常驻各自合成层，内存/层数膨胀。（不影响首页，首页用 deck 不用 `.reveal`。）
- 修法：observe 时加 `will-change`，`is-visible` 后移除。

### L3 · CTA 幕语义尾（affordance 轻）
- 现象：「片子讲完了，作品在这里」+ 一个按钮，但没明确「这是分幕结尾」。
- 修法：配合 M4 的进度末端态即可，不必额外加字。

---

## 建议修复顺序
1. **H2 + H3 + H4** 一起做：把 6 张 `<img>` 抽成 1 个共享背景层 + 装饰 `alt=""`，顺手去掉 filter 过渡。
2. **H1**：决定色调推进是「做真」还是「删掉」。
3. **M1 + M4**：加 `tabindex` + 进度指示，补齐可发现性与键盘可达。
4. **M2 + M3**：统一 motion token、拉开入场差异、修 reduced-motion 特异性。
5. **L1 / L2 / L3**：尺度、will-change、尾态收尾。

> 注：以上为静态 + 代码级审计。最终的「手感/分幕节奏」建议你在浏览器里实滚一遍（dev server 起 `npm run dev`），重点看 M4 进度指示是否必要、H1 色阶是否做到位。需要我直接按上面顺序改，告诉我从哪一条开始。
