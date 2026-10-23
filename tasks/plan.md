# 作品集制作计划：DOMN 个人作品集

## 0. Design Read（一句话设计判断）

Reading this as: AI 视频导演个人作品集，面向 HR / 艺术总监 / 导演 / 创始人做 30 秒匹配判断，沿用现有 design.md 的 Spotify 暗色 + 绿 (#006A60) 语言，近黑沉浸底色 + 作品即色彩 + 单一绿色强调 + 自托管字体，Astro 静态站 + 克制动效，让动效让位给作品本身。

设计拨盘：DESIGN_VARIANCE 7 / MOTION_INTENSITY 5 / VISUAL_DENSITY 3（Spotify 网格较规整、动效克制，作品是主角）。

已拍板：设计方向 = 沿用 Spotify 绿；技术栈 = Astro；内容 = 暂无成品，先做设计方向 demo 用示例项目占位。

## 1. 现状盘点（audit 结论）

| 资产 | 状态 |
|---|---|
| 网站代码 | 无。README 标注"网页设计：暂缓"，src/ 不存在 |
| design.md | 有，Spotify 暗色 + 绿 (#006A60) |
| site-architecture.md | 有，5 页 IA + 3 能力支柱，可直接复用 |
| MOTION_SPEC-hero.md | 有，Hero 动效规格 |
| portfolio-source/projects | 空，仅 template + example，7 个子目录无内容 |
| portfolio-source/profile | 空 |
| 实际作品素材（成片/分镜/关键帧/迭代） | 未归档 |

核心结论：设计是最后 30% 的问题。前 70% 是把真实作品归档成结构化案例。没有真实案例，再好的设计也只是空壳。

## 2. 定位与叙事（复用现有 IA，不推翻）

- 一句话定位：AI 视频导演 / AIGC 创作者，建筑智能化工程背景 × AI 视频创作 × 自研工作流
- 核心叙事：导演思维 + 工程化底盘（跨域迁移）
- 三个能力支柱：① 导演与叙事 ② 视觉与世界观 ③ 工作流工程化
- 5 页 IA：/ 首页、/works、/visual、/toolkit、/about（沿用现有 site-architecture.md，不改结构）

## 3. 设计方向

### 3.1 双身份双字体（核心差异化）

你的差异点不是"又一个导演"，而是「导演思维 × 工程化底盘」的融合。设计用两套字体语言各司其职：

- 作品（影片/视觉）：电影语言。全出血大图、letterbox 黑边、片尾字幕式元数据、宽画幅。
- 过程（skill/工作流）：工程语言。等宽字体、timecode、规格表精度、前后迭代对比。

### 3.2 视觉基调

- 底色：近黑影院 (#0d0d0d 到 #141414)，作品是唯一的光源。沿用现有 doc 的"content-first darkness"洞察，这是对的方向。
- 强调色：**已锁定 Spotify 绿 #006A60**，单一、功能化使用（按钮、激活态、CTA），不做装饰性绿光/渐变。
- 字体注意：design.md 里的 SpotifyMixUI/CircularSp 是 Spotify 专有字体，无法自托管。实际构建用免费近似 grotesque 替代（Geist 或同类，形似 Circular），中文用思源黑体 / Noto Sans SC 压字距，数据/过程字用 Geist Mono / IBM Plex Mono。

### 3.3 字体

- 展示字：紧凑无衬线（影院惯例），自托管。拉丁选 **Geist**（与 `design.md` §3 对齐，Space Grotesk 为备选）；中文用思源黑体 / Noto Sans SC 压字距。
- 数据/过程字：等宽 IBM Plex Mono / Geist Mono，用于 timecode、工具链、规格。
- 禁用：衬线默认、Fraunces、Instrument Serif、Inter。

### 3.4 动效（MOTION_INTENSITY 5，与 §0 拨盘统一）

页面动效克制：Hero 入场（M0）、滚动揭示（whileInView）、作品 hover 播片（M1）。视频才是真正的动效。全程遵守 prefers-reduced-motion，禁止 window.addEventListener('scroll')。整页规格见 `MOTION_SPEC-page.md`。

## 4. 技术选型

**已锁定 Astro**（非 Next）：

- 内容已是 markdown（portfolio-source/projects/*.md），Astro Content Collections 直接消费
- 作品集是内容站不是应用，零 JS 默认 = 招聘方手机端秒开
- 图片/视频优化、多页组件复用
- 需要交互处用 Motion island（仅 Hero 动效）

（纯静态 HTML 方案已否决。）

## 5. 任务拆分

### Phase 0：内容归档（阻塞项，决定设计能否落地）
- Task 0.1 填 profile：个人定位、一句话介绍、能力映射表
- Task 0.2 选定 3-6 个精选项目，每个按 project-template.md 填满
- Task 0.3 归档每项目媒体：封面、成片、分镜、关键帧、迭代对比
- Task 0.4 定义每项目在 /works 与 /visual 的展示切片

Checkpoint 0：至少 3 个项目的 project.md + 媒体齐备，才进入设计实现。

### Phase 1：设计定稿
- Task 1.1 确认设计方向 + 强调色 + 字体 + 技术栈（本次确认）
- Task 1.2 建立设计 token：色彩、字阶、圆角、间距、z-index
- Task 1.3 产出 1 个 hero 视觉方向 demo，确认后再展开

### Phase 2：搭建骨架
- Task 2.1 初始化 Astro 项目 + 内容集合 schema
- Task 2.2 全局布局：导航、页脚、暗色主题锁定、响应式断点
- Task 2.3 首页骨架：Hero + 精选案例 + 能力 + CTA

### Phase 3：页面实现
- Task 3.1 /works 案例列表 + 案例详情模板
- Task 3.2 /visual 画廊
- Task 3.3 /toolkit skill 卡片
- Task 3.4 /about 简历 + 联系 + PDF 下载

### Phase 4：打磨与验收
- Task 4.1 动效接入：reveal、hero、reduced-motion
- Task 4.2 暗色一致性 + 对比度 + 无障碍审计
- Task 4.3 Lighthouse（LCP/CLS/INP）+ 移动端验收
- Task 4.4 文案自审（无 em-dash、无 AI 腔、无假数据）+ 最终 pre-flight

## 6. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 内容空是硬阻塞 | 高 | Phase 0 先行，设计 demo 先用示例项目占位 |
| 真实素材缺失 | 高 | 每项目给素材清单，缺失先标注占位 |
| 过度动效抢戏 | 中 | 动效强度 6，让位视频 |
| 中文排版（字距/换行） | 中 | 思源黑体压字距，逐屏验收 |

## 7. 已拍板决策

1. 设计方向：沿用 Spotify 绿 #006A60 + 近黑暗色（复用现有 design.md 的 content-first darkness）
2. 技术栈：Astro（Content Collections 吃 markdown，零 JS 默认，Motion island 做动效）
3. 内容：暂无成品 → Phase 0 调整为「设计方向 demo 先行，用示例项目占位」，真实素材到位后再填

## 8. 立即下一步

顺序已修正（原写法把 Checkpoint 0 架空了）：

### 8.1 先补架构层（阻塞一切实现）

`architecture.md` 未落地前不写业务代码。需要定稿：content schema（镜头表落 zod）、目录/文件约定、媒体管线、路由映射。

### 8.2 再做设计 demo，但评价边界要说清

Task 1.3 的 hero demo **可以做**，不阻塞于真实素材，前提是：

- 占位素材必须来自**显式隔离**的示例项目（`_` 前缀，不进内容集合），不得伪装成真实作品
- 评审标准是**设计系统本身**（字阶跳变比、暗色层次、留白节奏、响应式断点），不是「作品看起来牛不牛」
- demo 只产出 hero + 一张作品卡，不做全站

**风险**：用假素材评「有没有设计感」会系统性高估——真素材的画质、构图、色彩都会变差。demo 通过不等于全站通过。

### 8.3 Checkpoint 0 恢复为硬闸门，但只对内容页生效

- **设计系统 / 骨架 / demo**：不阻塞，可用隔离占位推进
- **/works 与 /visual 的真实内容**：仍需至少 3 个项目 project.md + 媒体齐备才实现，否则占位图会混进真实路由

## 9. 审核修正（motion-web audit，见 tasks/audit.md）

1. 「沿用 Spotify 绿」只复用三样：绿 `#006A60`、近黑暗色、作品是唯一光源的 content-first 洞察。**不复用 design.md 的 App 骨架**（sidebar / now-playing bar / album grid / 播放按钮 / 10-24px 紧凑字阶）。
2. 新增前置任务：**重写 design.md 为「页面设计系统」**，字阶从 app 尺度（10-24px）重建为 creative 尺度（display 72-120px 对 body 14-16px，比例 ≥6×）。
3. ~~hero 职责需与 MOTION_SPEC-hero.md 对齐（静态定位 vs 视频旅程，二选一），当前两份文档互斥。~~
   **✅ 已解决（2026-09-17）**：拍板静态定位。见 `MOTION_SPEC-page.md` §10，`MOTION_SPEC-hero.md` 标注暂缓至 v2。
4. 补整页动效概念，动效预算不能只压在 hero。→ **✅ 已解决**：`MOTION_SPEC-page.md` 已补 M0–M4。
