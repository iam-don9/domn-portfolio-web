# 审核报告：作品集设计产物（motion-web audit）

> 审核对象：`design.md`、`site-architecture.md`、`MOTION_SPEC-hero.md`、`tasks/plan.md`
> 审核标准：motion-web 的 `design-slop.md`、`page-design.md`、`page-blueprints.md`
> 当前无已搭建页面，故不审实现，只审「设计系统 + 信息架构 + 动效规格 + 计划」四份产物。

---

## 一句话结论

现有产物最大问题不是配色也不是动效，而是 **design.md 描述的是 Spotify 音乐播放器 App，不是作品集页面**。保留「绿 + 近黑暗色 + 作品是唯一光源」这个洞察，但整套 App 骨架和字阶必须重写。

---

## 发现（按严重度）

### P0 · design.md 是 App 设计系统，不是页面设计系统

证据（直接引自 design.md）：

- §2 色板 = Spotify App 色板：`#121212` / `#181818` / `#1f1f1f` / `#006A60`
- §4 组件 = 「Sidebar 导航 / 圆形播放按钮 / now-playing bar / album 卡 / search input」
- §5 布局 = 「Sidebar (fixed) + main content area」「Full-width now-playing bar at bottom」
- §3 字阶自述 = 「designed for scanning playlists, not reading articles」

这是 category error。作品集是 creative page（motion-web 明确属于此类的 site），不是 media-player app。

- **保留**：绿 `#006A60` + 近黑暗色 + 「作品是唯一光源」的 content-first darkness 洞察。这个洞察对视频作品集是对的（影片/关键帧在暗底上发光）。
- **丢弃**：sidebar、now-playing bar、album grid、播放按钮、search input、`10px-24px` 紧凑字阶。这些是 Spotify 的 App 骨架，跟作品集无关。

### P0 · 字阶断裂，是「没设计感」的头号来源

- design.md 最大字号 = 24px（Section Title），自述「10px–24px range」。
- motion-web `page-design.md` §2 实测 15 个获奖站：最大展示字中位数 **108px**（52–218），body 16px，比例 ≈ **8×**。

24px 的 hero 标题在作品集里等于没有标题。字阶必须从 app 尺度（10–24）重建为 creative 尺度（display 72–120px 对 body 14–16px）。这就是为什么「沿用 Spotify 绿」如果被理解为「沿用 design.md 整套」，会直接产出没设计感的页面。

### P1 · hero 职责自相矛盾

两份文档对 hero 的定义互斥：

- `site-architecture.md` §3：hero = 「5 秒命中岗位」的静态定位（居中 `<h1>` + tagline + 三个支柱链接）。
- `MOTION_SPEC-hero.md`：hero = 「10–15 秒滚轮劫持的 3 幕视频旅程」。

而且 site-architecture 的「居中 H1 + 居中副标 + 3 个链接」本身就是 `design-slop.md` A1 默认 hero（centred H1, centred subhead, three links）。必须二选一并说明理由，不能两套并存。

### P1 · 动效预算全压在 hero

`MOTION_SPEC-hero.md` 只覆盖 hero。`design-slop.md` B4：预算要分摊到整页，不是「首屏放烟花、后面八屏全静态」。

案例列表的 hover/转场、案例详情页的分镜 reveal、画廊的 lightbox，这些完全没有任何 motion 概念。当前等于「一个 hero 动效 + 一个 App 设计系统」，两者都不对。

### P1 · 作品集应是 index + detail，不是 scroll rail

作品集是「可浏览的作品库」，正确形状是 `page-blueprints.md` B/F 蓝图：index + detail 路由，动效活在转场和 hover，不在 section 里。

`MOTION_SPEC-hero.md` 的 wheel-hijack 视频 hero 让访问者必须先「scrub 完一段 10–15 秒视频」才见到作品，对 30 秒做判断的招聘方是实打实的风险。这与「5 秒命中岗位」的定位直接冲突。

### P2 · 内容硬阻塞（已确认）

无成品素材。所有下游依赖它。hero demo 可用示例占位推进，但设计系统重写不依赖内容。

---

## 保留项（这些是对的，别动）

- `site-architecture.md` 的 **8 段式案例结构** = 真「show, not claim」。把导演思维（镜头表 / 关键决策 / 迭代）直接变成页面，不是贴图。
- **跨域叙事**（建筑智能化 → AI 视频导演）+ §9 面试预案 = 诚实、可落地。
- `MOTION_SPEC-hero.md` 的 **全 I 帧 H.264**（`-g 1 -keyint_min 1`）技术判断 = 专业。scroll scrub 要求每帧可随机访问，这个判断是对的。
- MOTION_SPEC 的 **reduced-motion 降级**（保留 D1 静态图 + 全段文案一次性呈现）写得到位。

---

## 修复顺序建议

1. **重写 design.md**：从「App 系统」改为「页面系统」。保留绿 + 暗 + content-first，重写字阶（display 大字号）、组件（作品卡 / 案例页 / 画廊，不是播放器）、布局（全出血 + 单列窄 measure，不是 sidebar）。
2. **拍板 hero 单一职责**：静态定位（快，5 秒见作品）或视频旅程（沉浸，但慢），二选一。
3. **补整页动效概念**：案例列表 hover/转场、案例详情分镜 reveal、画廊 lightbox。
4. **内容归档**（并行，硬阻塞）：真实素材到位后再填。

---

## 对 tasks/plan.md 的修正

`plan.md` 现写「沿用现有 design.md 的 Spotify 暗色 + 绿……语言」，这句有误导：它暗示复用整套 design.md。实际上只有「绿 + 暗 + content-first」可复用，App 骨架和字阶必须重写。已在 plan.md 追加修正说明。
