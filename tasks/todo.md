# DOMN 作品集 · 任务清单

状态：已拍板（设计 = Spotify 绿 #006A60 + 近黑暗色；技术 = Astro；hero = 静态定位；内容 = 暂无成品）。

**立即下一步 = Task 1.0 定稿 `architecture.md`（阻塞所有实现）**，之后才是 Task 1.3 hero demo。

> 变更记录 2026-09-17：
> 1. hero 拍板为**静态定位**，`MOTION_SPEC-hero.md` 视频 scrub 暂缓至 v2（见 `MOTION_SPEC-page.md` §10）。
> 2. 新增 Task 1.0：架构层（schema / 目录约定 / 媒体管线 / 路由）必须先定稿，此前不写业务代码。
> 3. Task 1.3 demo 可用隔离占位，但评审标准限于设计系统，且占位素材必须 `_` 前缀隔离。
> 4. Checkpoint 0 只对**内容页**（/works、/visual）保持硬闸门。

---

## Phase 0：内容归档（并行待办，素材到位后启动）

> 当前暂无成品素材，本阶段降级为并行待办。设计 demo 可先用示例项目占位推进，不被本阶段阻塞。

- [ ] Task 0.1 填 profile：个人定位、一句话介绍、能力映射表
  - 验收：portfolio-source/profile 下产出 profile.md，含定位一句话 + 三支柱能力映射
- [ ] Task 0.2 选定 3-6 个精选项目，按 project-template.md 逐项填满
  - 验收：至少 3 个 projects/*/project.md 字段完整（基本信息/项目故事/工具方法/过程证据/关键决策）
  - 注意：**不含** `_` 前缀示例；`Featured: true` 只允许真实项目使用
- [ ] Task 0.3 归档每项目媒体：封面、成片、分镜、关键帧、迭代对比
  - 验收：每项目 media 目录有对应文件，缺的显式标注占位
- [ ] Task 0.4 定义每项目在 /works 与 /visual 的展示切片
  - 验收：每个项目写出进哪个页面 + 展示哪几张图/哪段视频

**Checkpoint 0**（范围已修正）：至少 3 个**真实**项目 project.md + 媒体齐备，才能进入 **/works 与 /visual 的内容实现**。

- 阻塞：内容页、真实案例路由
- **不阻塞**：架构定稿、设计 token、hero demo（用 `_` 前缀隔离的占位素材）
- `_` 前缀的示例项目**不计入**这 3 个

---

## Phase 1：设计定稿

- [x] Task 1.1 确认设计方向 + 强调色 + 字体 + 技术栈
  - 结果：Spotify 绿 #006A60 + 近黑暗色 + Astro；字体用免费 grotesque 替代专有 CircularSp
- [x] Task 1.1b 拍板 hero 职责（关闭 audit P1）
  - 结果：**静态定位**。`MOTION_SPEC-page.md` §10 为唯一权威来源，`MOTION_SPEC-hero.md` 暂缓至 v2
- [ ] **Task 1.0 定稿 `architecture.md`（阻塞项，优先于 1.2/1.3）**
  - 内容集合 schema（`projects` / `profile`，镜头表 8 字段落 zod）
  - 目录与文件约定（修 `projects/` 层级矛盾，见 `architecture.md` §2）
  - 媒体管线（格式 / 尺寸 / 体积上限 / 命名）
  - 路由映射（slug 生成、featured 筛选、示例隔离）
  - 验收：`architecture.md` 落盘，Astro glob 表达式可直接照抄
- [ ] Task 1.2 建立设计 token（色彩、字阶、圆角、间距、z-index）
  - 验收：tokens 文件产出，单强调色锁定，圆角体系一致
- [ ] Task 1.3 产出 1 个 hero 视觉方向 demo
  - 验收：用户确认后再展开全站
  - 约束：占位素材 `_` 前缀隔离；只做 hero + 一张作品卡；评审限于设计系统

**Checkpoint 1**：架构定稿 + 设计方向 + 技术栈已确认，hero demo 通过。

---

## Phase 2：搭建骨架

- [ ] Task 2.1 初始化 Astro 项目 + 内容集合 schema
  - 验证：pnpm build 通过
- [ ] Task 2.2 全局布局：导航、页脚、暗色主题锁定、响应式断点
  - 验证：导航单行、高度 ≤ 80px、移动端折叠显式声明
- [ ] Task 2.3 首页骨架：Hero + 精选案例 + 能力 + CTA
  - 验证：Hero 首屏内、无假截图、无装饰性状态点

**Checkpoint 2**：骨架可跑，构建通过。

---

## Phase 3：页面实现

- [ ] Task 3.1 /works 案例列表 + 案例详情模板
- [ ] Task 3.2 /visual 画廊
- [ ] Task 3.3 /toolkit skill 卡片
- [ ] Task 3.4 /about 简历 + 联系 + PDF 下载
  - 验收：每页用真实素材，无纯文本页，长列表用合适组件而非默认 divide-y

**Checkpoint 3**：5 页全部落地，内容真实可读。

---

## Phase 4：打磨与验收

- [ ] Task 4.1 动效接入：reveal、hero、reduced-motion
  - 验证：prefers-reduced-motion 下动效坍缩为静态
- [ ] Task 4.2 暗色一致性 + 对比度 + 无障碍审计
  - 验证：WCAG AA，按钮文字对背景可读，表单对比达标
- [ ] Task 4.3 Lighthouse（LCP/CLS/INP）+ 移动端验收
  - 验证：LCP < 2.5s、INP < 200ms、CLS < 0.1
- [ ] Task 4.4 文案自审 + 最终 pre-flight
  - 验证：零 em-dash、无 AI 腔、无假数据、无重复 CTA 意图

**Checkpoint 4**：全站 pre-flight 全绿，交付。

---

## 全局验收标准

- [ ] 单强调色贯穿全站，暗色主题整页锁定
- [ ] 圆角体系一致（一套规则）
- [ ] 图标只用 Phosphor/HugeIcons/Radix/Tabler，禁手写 SVG path
- [ ] 动效有动机（层级/叙事/反馈/状态），不是"好看"
- [ ] 真实图片/视频优先，禁 div 假截图，禁纯文本页
- [ ] 无 AI 痕迹：无 Inter 默认、无 AI 紫、无三等分卡、无 Jane Doe、无 em-dash
