# MOTION_SPEC-hero.md v2 — 暗调 · sticky 滚动驱动 hero

> 状态：**✅ 激活（v2 执行中）** —— 2026-09-21 拍板重启动。
> 相对 v1 暂缓版的核心变化：**放弃滚轮劫持**，改为 `position:sticky` 原生滚动驱动；**全局暗调**；新增「视频生成 brief」。

---

## ⚠️ 决策记录：v2 为什么重启、改了什么

v1 暂缓的三条理由，v2 逐一处置：

1. **与「30 秒判断」冲突** → 改为 **sticky 非劫持**。原方案 `preventDefault` 锁死 `scrollY`、要求先 scrub 完才见作品；v2 用原生滚动 + sticky 钉屏，首屏即见 hero，作品一滑即达，**不锁滚动条、不影响判断**。
2. **技术前提未验证** → 全 I 帧编码（`-g 1 -keyint_min 1`）仍是硬前提，写进资产清单与验收；seek 卡顿即不发布。
3. **成本不对等** → 仍需新生成 1 段暗调视频 + 全 I 帧转码，但**不再需要 D1 揭示图**（v2 用文字收尾代替交叉溶解支付点，更轻）。

---

## 1. Goal

| 项 | 内容 |
|---|---|
| Page type | 个人作品集首页 hero（求职向） |
| Audience | 招聘方（AI 视频导演 / AIGC 创作者岗位） |
| Primary action | 首屏 1 秒成立 → 自然下滑时画面随滚动「走」→ 滑过即见作品 |
| Motion concept | 一次「在脑海里穿行」的暗调旅程。AI 视频承载运动，滚动进度控制体验，**不劫持滚轮** |
| Baseline UI role | **静帧必须自己成立**——暗调首帧 + 一句主张，关掉动效也是能打的 hero |
| 调性 | 暗调（near-black 基底 `#121212`），低键光、高对比、去饱和；色彩只来自影像本身 |

---

## 2. Choreography（sticky 钉屏 + 滚动驱动）

```
┌─ .hero (position: sticky; top:0; height:100svh) ── 钉住 1 屏
│     ├─ .hero-bg  ── <video> 暗调底片，scroll progress → currentTime
│     └─ .hero-inner ── 4 段主张随 progress 逐段揭示（同一时刻仅 1 段）
└─ .hero-scroll (height: ~250svh) ── 提供滚动距离；滚完即释放
        ↓ 释放后
   正常页面流（作品 teaser / CTA）→ /works
```

- 用户**自然下滑**，`.hero` 钉在视口；下滑距离 / `.hero-scroll` 高度 = 0→1 进度，映射视频 `currentTime`。
- 进度 0–1 内，4 段主张按 §5 时间线逐段进入/退出（同一时刻仅 1 段可见）。
- 滚过 `.hero-scroll` 后 hero 释放，下方作品内容自然接上。

### 与 v1 多幕 deck 的关系
v1 的 6 幕 scroll-snap deck **被本方案取代**：叙事不再靠多屏切换，而靠「单屏视频随滚动 scrub + 文字时间线」。原 `index.astro` 的 `.deck` 结构作废，改为上述 sticky 结构。

---

## 3. Build Approach

### 资产清单（1 个主资产 + 1 个 poster）

| 编号 | 资产 | 规格 |
|---|---|---|
| C1 | AI 视频（暗调、scrub 友好） | 时长 ~6–8s；720p 或 1080p；**全 I 帧 H.264**（`-g 1 -keyint_min 1`）；目标 < 8MB |
| P1 | 首帧 poster（暗调） | 取视频代表性暗帧，作 LCP + reduced-motion 兜底 |

### 全 I 帧编码为什么必要
滚动拖动要求**每帧可随机访问**。普通 H.264 只在稀疏关键帧可定位，中间帧靠推算，拖动会卡顿跳帧。全 I 帧让每帧都是关键帧，seek 精确。一个 ffmpeg flag 的事，但不做整套交互就废了。

### 前置动作
- [ ] 生成视频后**实测滚动 scrub**，确认无卡顿（真机，非估算）
- [ ] 暗调达标：首帧在 `#121212` 背景下不刺眼、文字可读
- [ ] 记录体积，超 8MB 则降分辨率或 CRF

---

## 4. Interaction

| 输入 | 行为 |
|---|---|
| 滚动 | **原生滚动，无 `preventDefault`**；`.hero` sticky 钉屏，滚动进度 → 视频 `currentTime` |
| 鼠标移动 | 视频元素整体 CSS 倾角（±2°，跟随 `1-exp(-6.2·dt)`）；可关 |
| 键盘 | 原生方向键/PageDown 推进（不劫持） |
| Touch | 关闭倾角；滚动仍为原生，进度驱动 scrub |
| Click | 无 |

> ❗ 明确红线：**不调用 `preventDefault`、不锁 `scrollY`**。这是 v2 与 v1 暂缓版的根本区别，也是保住招聘定位的前提。

---

## 5. Text Timeline（映射滚动进度 0–1）

| 进度 | 内容 |
|---|---|
| 0.00 – 0.15 | 视频入点，无文字（让暗调画面先立住） |
| 0.15 – 0.38 | 角度 1 |
| 0.38 – 0.61 | 角度 2 |
| 0.61 – 0.84 | 角度 3 |
| 0.84 – 1.00 | 角度 4 → 收束，揭示「查看作品」CTA |

每块文字有独立进入/退出窗口，**同一时刻不出现两块**。

---

## 6. Motion Tokens

| 角色 | 值 |
|---|---|
| 鼠标倾角 | rotateX/Y ±2° |
| 跟随常数 | `1-exp(-6.2·dt)` |
| 标准过渡 | 420ms |
| 文字进入/退出 | 300–500ms 交叉淡 |

---

## 7. Accessibility And Performance

| 项 | 决策 |
|---|---|
| Reduced-motion | 不播放视频、不 scrub；直接显示 poster + 全部文案一次性呈现 |
| FPS target | 60fps 桌面 / 30fps 移动 |
| 移动端 | 关倾角，保留 sticky scrub（原生滚动） |
| Do not ship if | 滚动 scrub 卡顿；reduced-motion 下内容缺失；移动端横向溢出；暗调不达标致文字不可读 |

---

## 8. Stack
- 静态站（Astro）
- CSS `position:sticky` + `transform` 倾角
- JS：`scroll` 事件（rAF 节流）读 `.hero-scroll` 进度 → 设 `video.currentTime`；IntersectionObserver 管文字显隐
- 无 3D、无 canvas

---

## 9. Acceptance Criteria
- [ ] 首屏即见暗调 hero，不锁滚动
- [ ] 自然下滑时视频随进度 scrub，无卡顿（真机实测）
- [ ] 滚过 hero 后正常释放，作品内容接上
- [ ] 鼠标移动时视频整体倾角（桌面）
- [ ] 同一时刻不出现两段文字
- [ ] reduced-motion 下 poster + 全文案完整
- [ ] 暗调达标、文字可读
- [ ] 320 / 375 / 414 / 768 / 1440 无横向溢出
- [ ] 首屏资产 ≤ 8MB
- [ ] 构建 / 类型检查通过

---

## 10. 视频生成 Brief（C1）

> 给「重新做一段 hero 视频」用的制作单。工具不限（Runway / Kling / Seedance / gpt-image-video 等），按下方调性与运动方向生成，再走 §转码。

**调性（暗调）**
- 基底 near-black `#121212`；低键光（low-key），主体打光、环境压暗。
- 高对比、去饱和（saturation 0.85–0.95）；色彩克制，只靠影像本身。
- 禁止高亮白底、禁止霓虹饱和色；整体「电影感、冷峻、高级」。

**运动方向（scrub 友好）**
- **连续、单向、平滑**的镜头运动：缓慢 dolly-in / 摄像机绕主体环绕 / 粒子或光雾向前流动。
- 无硬切、无突变；6–8s 内运动连贯，任意进度抽帧都「成立」。
- 主体建议：暗调空间里的一个人影 / 一道光 / 流动的物质（云海、尘埃、流体），呼应「脑海里的世界」。
- 结尾帧自然收束，便于接「查看作品」。

**时长 / 分辨率**
- 6–8s；720p（优先，体积小）或 1080p；竖屏否（用横屏 16:9）。

**转码（全 I 帧 + 暗调）**
```bash
# C1：全 I 帧 + 轻微暗调压调色，<8MB
ffmpeg -y -i hero_raw.mp4 \
  -an -c:v libx264 -g 1 -keyint_min 1 -crf 23 -preset slow \
  -pix_fmt yuv420p -movflags +faststart \
  -vf "scale=1280:-2,eq=brightness=-0.06:saturation=0.9:contrast=1.05" \
  public/media/hero-scrub.mp4

# P1：poster（取代表性暗帧，如第 1.5s）
ffmpeg -y -ss 1.5 -i hero_raw.mp4 -frames:v 1 -vf "scale=1280:-2" \
  -c:v libwebp -quality 80 public/media/hero-scrub-poster.webp
```

**AI 视频 prompt 示例（中文描述，按工具改写）**
> 电影感暗调镜头，near-black 背景，一束冷光从画面深处缓缓向前推进，尘埃与微光在光中流动，镜头缓慢 dolly-in，氛围冷峻高级，低键光、高对比、去饱和，无文字、无人物正脸，8 秒连续运动、无剪辑。

---

## 11. Decision Record

| # | 决策 | 结论 |
|---|---|---|
| 1 | 交互机制 | sticky 原生滚动驱动（**非劫持**） |
| 2 | 调性 | 暗调 `#121212` 基底，低键光高对比 |
| 3 | 取代关系 | 本方案取代 v1 多幕 scroll-snap deck |
| 4 | 资产 | 1 段暗调全 I 帧视频 + 1 poster；去掉 D1 |
| 5 | 文案 | 沿用 §附 第一人称四段（需本人最终改写） |

---

## 12. References
| 来源 | 借用 | 不照搬 |
|---|---|---|
| v1 暂缓版 | 全 I 帧论证、`1-exp(-k·dt)` 跟随、reduced-motion 阶梯、文案草稿 | 滚轮劫持、D1 揭示图、多幕 deck |

---

## 附：文案（草稿，必须由本人改写）

> ⚠️ 以下是**结构占位**，不是本人真实动机。发布前必须改写成第一人称真话。
> AI 视频导演的作品集里出现一段不是自己说的话，比没有这段话更糟。

**角度 1**
> 我一直有一些画面。
> 它们不在任何地方，只在我脑子里。

**角度 2**
> 以前我没有办法把它们拿出来。
> 学建筑的时候，我画空间；做工程的时候，我画系统。

**角度 3**
> 直到 AI 出现——
> 它是我找到的第一支，能把脑子里的画面画出来的笔。

**角度 4**
> 所以我做视频，不是为了炫技。
> 是为了让那个世界，多一个人看见。

**收束**
> 这就是我想让你看到的。
> 我脑海里的世界。
