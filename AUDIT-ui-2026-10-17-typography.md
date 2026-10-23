# 排版专项整改清单 · domn-portfolio-web

> 配套：`AUDIT-ui-2026-10-17.md`（诊断）、`AUDIT-ui-2026-10-17-fixlist.md`（结构/缺陷清单）
> 本件聚焦 **排版（字阶 / 量度 / 中西文混排 / 节奏）**。仍**只方案、未改码**。

## 约束重申
绿基准 / 7 屏 deck / **S1 hero 不改** / **S2 about 仅微调** / 其余可大改 + 可重排。
> 注意：类型 token 改动若影响 hero 用到的字号，会波及 S1；本清单已尽量把改动限定在组件级与"内容页/非 S1 屏"。凡波及 S1 的项均标注 ⚠️。

---

## 现状基线（已确认的好底子）
- `lang="zh-CN"` 已设（`BaseLayout.astro:43`）→ CJK 字体回退/标点走中文规则。
- body：`font-weight:400`（方圆体不加粗）、`line-height:1.7`（CJK 友好）、`text-rendering:optimizeLegibility`、`-webkit-font-smoothing:antialiased`（`global.css:112-123`）→ 正文基础扎实。
- 流体大标题 `--fs-display:clamp(2rem,4.5vw,3.4rem)`（`global.css:65`）；`text-wrap:balance` 已在 `CaseShowcase.astro:202` 用上（现代最佳实践）。
- 多数 prose 块有量度（`.prose` 52ch `:473`、`.pf-prose` 48ch、`.OperatorEdge` 52ch 等）。

---

## P1 — 字阶与量度硬伤（内容页）

### P1-1 详情页 statement 完全无样式 / 无量度
- **位置**：`commercial/[caseId].astro:45`、`films/[filmId].astro:79`、`skills/[skillId].astro:45`、`worldbuilding/[scriptId].astro:75` 的 `<p class="statement">`。
- **根因**：`global.css` 中**没有 `.statement` 规则**（grep 无匹配）→ 该段继承裸 body（16px / `line-height:1.7` / 无 `max-width`）。其容器 `.page-inner` 宽至 `max-width:1360px`（`global.css:443`），桌面下 ≈80 全角字/行，远超舒适 CJK 量度（30–45 字）。
- **改法**（在 `global.css` `.prose` 附近补规则）：
  ```css
  .statement {
    font-size: var(--fs-body);
    line-height: 1.8;
    max-width: var(--measure, 42ch);
    color: var(--text-secondary);
    text-wrap: pretty;
  }
  ```
- **约束符合**：属"其他页"大改 ✓（S1/S2 不触及）

### P1-2 字阶缺中间档，各屏自定 clamp 不统一
- **位置**：标题字号散落各组件，无统一 token：
  - `mg-title` `clamp(1.5rem,2.6vw,2.1rem)`（`ProfileOperatorMerge.astro:77`）
  - `mg-num` `clamp(2.1rem,3.6vw,3rem)`（`:65`）
  - `cap-title` `clamp(1.5rem,2.6vw,2.1rem)`（`Capabilities.astro:153`）
  - `mywork-title` `clamp(1.8rem,3.4vw,2.6rem)`（`index.astro:378`）
  - `pullquote blockquote` `clamp(1.6rem,3.6vw,3rem)`（`index.astro:353`）
  - 现状 token 只有 `--fs-display / --fs-body(1rem) / --fs-small / --fs-label`（`global.css:65-69`），**屏题/卡题/子标题无专属档**。
- **后果**：无单一模数比，跨屏标题尺寸无法保证一致；首页二轮虽实测出"48>33.6>30.4"节奏但未 token 化，易回退。
- **改法**（在 `global.css:69` 后补中间档，再替换各组件 clamp）：
  ```css
  --fs-h1: clamp(1.75rem, 3vw, 2.5rem);    /* 屏题 ~28–40px */
  --fs-h2: clamp(1.4rem, 2.4vw, 2rem);     /* 卡题 ~22–32px */
  --fs-h3: clamp(1.1rem, 1.6vw, 1.35rem);  /* 子标题 ~18–22px */
  ```
  替换：`mg-title`/`cap-title`→`var(--fs-h2)`；`mywork-title`/`pullquote blockquote`→`var(--fs-h1)`；`mg-num` 保留自身（描边大号，作 display 用，但注明归属 `--fs-display` 族）。
- **约束符合**：mywork/pullquote= S5/S7、mg/cap= S3/S4，均允许大改 ✓；新增 token 不触及 hero（hero 用 WarpText 自有尺寸）。⚠️ 若 hero 误用 `--fs-h1` 需单独锁回。

---

## P2 — 中文排版特性 / 量度基线 / 标题换行 / 字体栈 / 节奏

### P2-1 CJK 排版特性缺失（中文受众关键）
- **根因**：全站无 `text-spacing-trim` / `font-feature-settings:"palt"` / `hanging-punctuation` / `line-break:strict`。后果：标点不挤压、中西文混排粘连、避头尾失效。
- **改法**（加在 `global.css` 根/body）：
  ```css
  body { line-break: strict; overflow-wrap: anywhere; }
  :lang(zh-CN) { font-feature-settings: "palt" 1; text-spacing-trim: trim-start; }
  ```
- **注**：`text-spacing-trim` 需 Chrome 123+，属渐进增强，旧浏览器自动忽略，无副作用。

### P2-2 量度基线不统一（52ch 对 CJK 偏长）
- **位置**：running-text 量度横跨 34/42/48/52/60/64/68ch（`CaseShowcase.astro:88,213`、`ProfileAbout.astro:107`、`global.css:473`、`OperatorEdge.astro:21`、`SkillSlides.astro:466,470`、`ProjectProcess.astro:314` 等）；且 `.edge-lead` 为 `max-width:none`（`ProfileOperatorMerge.astro:108`）。
- **问题**：`ch` 在 CJK 方圆体下 ≈ 全角字宽，52ch ≈ 52 字/行，偏长（舒适 30–45 字）。基线不统一使阅读节奏跳变。
- **改法**：在 `global.css` 定义量度标尺并统一套用：
  ```css
  --measure: 42ch;       /* CJK 正文舒适量度 */
  --measure-wide: 60ch;  /* 允许更宽处 */
  ```
  把 `.prose`/`.pf-prose`/`.OperatorEdge`/`.edge-lead`/`.statement` 等统一为 `var(--measure)`；`SkillSlides`/`ProjectProcess` 长文用 `var(--measure-wide)`。

### P2-3 标题缺 `text-wrap: balance` / 正文缺 `pretty`
- **位置**：仅 `CaseShowcase.astro:202` 有 `text-wrap:balance`；`mg-title`/`cap-title`/`mywork-title`/`.statement`/`.w-name` 等标题换行 uncontrolled → 多行时 rag 参差。
- **改法**：给所有标题类加 `text-wrap: balance`；给 prose 类加 `text-wrap: pretty`（`balance` 已有先例，直接推广）。

### P2-4 笔刷体（淘宝买菜体）作全站 mono 标签 —— 可读性（设计观点，非硬 bug）
- **位置**：`--font-mono:"TaoBaoMaiCaiTi"`（`global.css:88`）用于**全部**功能标签：`.page-eyebrow`、`.mg-eyebrow`、`.cap-eyebrow`、`.nav-num`、`.duallink .k`、`.player__tag`、`.facts .tag` 等；源码注释称"笔刷体"并配 `letter-spacing` 补偿。
- **观点**：笔刷体用于功能性微文案（编号、眉标、标签）降低扫读效率；在 `--fs-label`(11px) 下笔锋更易糊。建议：保留笔刷体作**展示性点缀**，另设 `--font-mono-ui: ui-monospace,"SF Mono",Menlo,Consolas`（已在 fallback 链）专供功能标签。是否采纳看你审美取向。
- **约束符合**：不改品牌主色/主字体，属风格收敛 ✓

### P2-5 字体加载稳定性
- **位置**：栈含 `AlimamaFangYuanTi`/`LogoSCUnboundedSans`/`TaoBaoMaiCaiTi`/`Belanosima`/`LemonMilk`/`Cormorant Garamond` 多个 Web 字体。
- **改法**：确认各 `@font-face` 带 `font-display:swap`；对首屏关键字体加 `<link rel="preload">` / `preconnect`，避免 FOUT 造成的排版跳动（属性能/稳定性，非视觉硬伤）。

### P2-6 垂直节奏缺 spacing 标尺
- **位置**：标题→正文、分节间距用散落 rem（`0.3/0.8/1.2/1.6/2rem` 等），无 `--sp-*` 标尺。
- **改法**：定义 4px 基数标尺 `--sp-1..--sp-6`，统一标题块内与屏间间距，提升节奏一致性（低优先，可延后）。

### P2-7 letter-spacing 不一致
- **位置**：标签字距 `0.04–0.06em`（`.nav-num`:258、`.page-eyebrow`:449、`.cap-eyebrow`:482、`.duallink .k`:618）但 `.nav-label` 为 `0.14em`（`global.css:269`）→ 同一导航区内外松紧不一。
- **改法**：把 `.nav-label` 字距收到 `0.06em` 与全局标签对齐。

---

## 保留项（不要动）
`lang="zh-CN"`、body 字重/行高、`text-rendering:optimizeLegibility`、WarpText 英雄字标、双语标题（display 英文 / cn-head 中文）分工、`text-wrap:balance` 既有用法。

## 未验证（需真机/浏览器复测）
- `text-spacing-trim`/`palt` 在目标浏览器的实际挤压效果（P2-1）。
- `--fs-h1/h2/h3` 替换后各屏标题在窄屏的下限是否过小（P1-2）。
- `--measure:42ch` 对各 CJK 文本块换行后的实际行数/颜值（P2-2）。
- 字体 `font-display:swap` 现状（P2-5）需查 `@font-face` 定义文件确认。
