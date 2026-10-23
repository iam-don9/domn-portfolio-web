# DOMN 首页设计审核 · 2026-10-14

> 方法：用真实浏览器（headless Chromium）渲染 `localhost` 开发服务器，对首页 DOM 做几何实测 + 源码 + 设计 token（`global.css`）比对。
> 限制：当前模型无法目视渲染像素，**结论基于 DOM 几何实测数据 + 源码 + token**，非肉眼审美。已确认：WebGL 画幅正常渲染（canvas 尺寸贴合画框，非 DOM fallback）、idle 视频 playing、无 console 报错。
> 设计读（Design Read）：把它读作「生成式剧场作品集首页 / 给导演·品牌方看 / 暗黑电影感语言 / 单一雾蓝灰强调色 + 衬线钢印字标」。

---

## 0. 实测数据（权威）

| 视口 | 是否溢出滚动 | 可用高(topbar→loopbar) | 内容底 | 末项是否被底部 loopbar 遮挡 |
|---|---|---|---|---|
| 1440×900 | 是(仅 6px) | 784 | 810 | 否（ clearance 32px，脆弱） |
| 1366×768 | **是** | 656 | 771 | **是 — CREATION 项被遮** |
| 1280×720 | **是** | 608 | 745 | **是 — CREATION 项被遮** |
| 768×1024 | 否 | 892 | 589 | 否 |
| 390×844 | 否 | 732 | 573 | 否 |

关键实测：
- 英雄区内容块高 ~690px（1440）／ ~661px（1366）。**最大贡献者是索引区**（4 项 × 89px ≈ 356px，占总高过半）。
- `stage-frame` 在桌面几乎铺满整屏（1440 下 left=45、宽 1395），hero 文字列（left 158、宽 446）**整段压在 idle 视频之上**；左侧"负空间"仅靠视频构图暗度成立，非真实留白。
- 仅 `Cormorant Garamond 600 italic` 一个自定义字体被加载（字标专用），其余走系统字体 + mono，符合"零下载"策略。

---

## 1. 美观可优化点（按严重度）

### 🔴 P0 — 英雄区在常见笔记本分辨率溢出，第 4 个导航项被底部 loopbar 遮住
1366×768（最常见的笔记本分辨率）下，`CREATION` 项（y 686→771）压在固定 loopbar（712→768）下方，**不滚动就看不到 4 个入口里的 1 个**。这与"首页 = 单屏导航中枢"的设定直接冲突。1440×900 也只剩 32px clearance，属脆弱设计。

修复（最小、定向）：
```css
/* index.astro <style> .home-content 增加底部安全距 */
.home-content {
  padding-bottom: calc(var(--topbar-h) + 1.5rem); /* 保证末项可完整滚出 loopbar 之上 */
}
```
若要**不滚动即全见**（更优），再同步收一点纵向：
```css
.home-wordmark { font-size: clamp(2.2rem, 4.4vw, 3.6rem); } /* 上界 4.4→3.6rem，省 ~20px */
.hero-index-item { padding: clamp(0.35rem, 0.9vh, 0.7rem) 0; } /* 每项 89→~72px */
```
实测 1366 下内容可降到 ~600px < 可用 656px，单屏全见。

### 🟡 P1 — 文字压在视频上，可读性依赖 idle 帧左侧暗度
设计意图（`global.css` 注释）是"文案置于左侧负空间、不压画幅"，但几何证明文字整段落在视频画框内。当前靠 `text-shadow` 兜底；若 idle 视频左侧出现亮帧，字标/导语会糊。

注意：设计明确"无叠加层、背景视频保持原生画质"，**不要整屏渐变压暗**。建议只在文字列做**紧致局部柔影**而非全屏 scrim，尊重"视频原质"：
```css
/* 紧裹文字列的极弱柔影，不碰视频其余部分 */
.home-content { position: relative; }
.home-content::before {
  content: ""; position: absolute; inset: -8% -12% -8% -8%;
  background: radial-gradient(120% 90% at 20% 40%, rgba(0,0,0,.55), transparent 70%);
  filter: blur(8px); z-index: -1; pointer-events: none;
}
```

### 🟡 P1 — 品牌符号四色注入 vs 单一强调色
顶部 `geometric-symbols.svg` 含红 `#d92d20` / 黄 `#fbbd16` / 蓝 `#145a93` / 黑四色方块，与全局"单一雾蓝灰 `#88a9bd`、高亮靠亮度/位移而非辉光"的克制基调冲突；且 View Transition 的 glitch（`global.css:554`）又用红 drop-shadow，红在**两处**泄漏进调色板。

决策二选一（建议 A，保品牌资产）：
- **A（推荐）**：保留彩色品牌标作为**唯一**色彩时刻，把转场 glitch 的红改为强调色 `var(--accent)`，消除第二处红泄漏。
- **B（极致克制）**：品牌标改单色（白或 accent），全站真正零饱和色，仅留电影感灰阶。

### 🟢 P2 — 字标 line-height 1.02 斜体降部裁切风险
`home-wordmark` 用 `font-style: italic` 且 `line-height: 1.02`（低于安全阈值 1.1）。"Dwell On My Nature" 换行后第二行斜体 `y` 降部有被裁风险。**无法目视确认**（模型限制），但按规则应 ≥1.1：
```css
.home-wordmark { line-height: 1.08; } /* 仍紧凑，但给斜体降部留白 */
```

### 🟢 P2 — 英雄区纵向占比偏大
索引每项 89px 是高度主因。即便不溢出，收紧后单屏呼吸感更好（见 P0 中的收口数值）。

---

## 2. 动画特效可优化点

### 🔴 缺"入场编排"（motion-first 最大缺口）
页面加载/软导航回来时，`eyebrow → wordmark → lede → 4 个索引项`**静态一次性出现**，没有任何错峰动效。这是 motion-web 的核心原则："伟大机制贴在默认长相的页面上"——首页目前是"默认长相 + 只有 hover 微交互"。

建议挂在 `astro:page-load`（注意项目硬约定：组件 DOM 脚本必须挂 `astro:page-load`，否则软导航二次进入被静默跳过）：
```css
/* index.astro <style> — 错峰淡入上移 */
.home .page-eyebrow, .home-wordmark, .home-lede,
.hero-index-item { opacity: 0; transform: translateY(14px); }
@media (prefers-reduced-motion: no-preference) {
  .home.revealed .page-eyebrow { transition: .5s var(--ease) 0s; opacity:1; transform:none; }
  .home.revealed .home-wordmark { transition: .6s var(--ease) .08s; opacity:1; transform:none; }
  .home.revealed .home-lede    { transition: .6s var(--ease) .16s; opacity:1; transform:none; }
  .home.revealed .hero-index-item { transition: .5s var(--ease) calc(.24s + var(--i)*.07s); opacity:1; transform:none; }
}
```
```js
// 在 index.astro 内联脚本或 stage.mjs 的 astro:page-load 里
function revealHome(){ document.querySelector('.home')?.classList.add('revealed'); }
revealHome(); document.addEventListener('astro:page-load', revealHome);
```
（`.hero-index-item` 需 `style="--i:0..3"` 由 map 注入 `i`。）

### 🔴 最高性价比升级 — Hover 预览板块视频（基础设施已就绪，未接线）
WebGL shader 已有 `uTexA / uTexB / uMix` 跨淡入通道，但首页只 `primeIdle()`，**hover 索引项时背景毫无反应**。把 idle 与对应 section 视频做 hover 跨淡，能让背景"回应"导航意图，是"生成式剧场"最对味的动效。

落地（在 `stage.mjs`）：额外 prime 4 个 section 视频到 `uTexB`，hover `hero-index-item` 时把 `uMix` 用 rAF 在 0↔1 间 tween，leave 归零。需给 `SECTIONS` 视频建 VideoTexture 并 `play()`（静音、不显示）。约 30 行，复用现有 shader。

### 🟡 索引 hover 位移 1.7rem 偏重
`.hero-index-item:hover { transform: translateX(1.7rem); }` 位移偏大，机械感略重。建议降到 `1.0–1.2rem`，配 `::before` 短横线（已存在）即可，更克制。

### 🟢 loopbar 加载瞬间无淡入
底部 LogoLoop 栏首屏是"啪"地出现。可给 `.loopbar` 加一次性淡入（与 hero 编排同步），更顺。

### ✅ 已做得好的（保留）
- `is-entering` 点击时的**收束 + 提亮 + 模糊**（scale 1.05 / brightness 1.14 / blur 4px，340ms）作为换页前的"聚焦冲击"，很对味，保留。
- View Transition 微 glitch（RGB 错位抖动）做转场，保留（仅建议改红色为 accent，见 P1）。
- WebGL idle 视频**按实际帧率节流渲染**（`measureFrameRate` + `frameInterval`），不空转，性能友好。
- `prefers-reduced-motion` 全套兜底（动画/过渡归零、`is-entering` 失效），合规。

---

## 3. 优先级建议

| 优先级 | 项 | 改动量 | 收益 |
|---|---|---|---|
| P0 | 英雄区遮挡末项 + 收口单屏全见 | 小（CSS） | 修掉"看不到 1/4 导航"的硬缺陷 |
| 高 | 入场编排（错峰淡入） | 小（CSS+几行 JS） | 首页从"静态"变"有呼吸" |
| 高 | Hover 预览板块视频 | 中（复用 shader） | 首页标志性动效，差异化 |
| 中 | 文字列局部柔影 | 小 | 跨帧可读性保障 |
| 中 | 调色板去第二处红 | 极小 | 基调一致性 |
| 低 | 字标 line-height / hover 位移微调 | 极小 | 细节打磨 |

---

## 4. 数据完整性备注
- 上述几何数据来自 headless Chromium 对 `localhost` 开发服务器的 `getBoundingClientRect` 实测，非估算。
- 未目视渲染像素（模型限制）；"左侧负空间""降部裁切"等视觉判断已显式标注为依赖构图/需人工复核。
- 截图已留存：`tmp/audit/home-desktop.png`、`home-1366.png`、`home-1280.png`、`home-mobile.png`、`home-768.png`，供人工过目。
