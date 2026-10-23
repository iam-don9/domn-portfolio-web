# DOMN 作品集网页

AI 视频导演 / AIGC 创作者个人作品集，求职向。受众是 30 秒内做匹配判断的招聘方。

站点名：**DOMN-STUDIO · 生成式剧场**。四条创作线（世界观与叙事 / AI 短片 / 商业设计 / 技能树）彼此独立。

---

## 状态

**已实现并上线可构建**：Astro 站点 28 页，内容源 22 个项目。

| 项 | 现状 |
| -- | --- |
| 构建 | `astro build` **28 页**，`astro check` **0 error / 0 warning** |
| 信息架构 | 四区块：`/worldbuilding`（剧本档案馆 + 角色设计）、`/films`（放映厅 + 练习片段）、`/commercial`、`/skills` |
| 内容 | 22 个项目（`ai-video` 7 / `character-design` 9 / `ai-images` 2 / `tvc` 1 / `ai-tools` 1 / `skills` 2） |
| 主要阻塞 | 封面待重生（domn-imagegen）、B 站链接待回填、11 部练习片段正文仍是 TODO |

⚠️ **git 仓库尚未初始化** —— 这是最高优先级工程债，也是当前所有文件操作不可逆的原因。

---

## 技术栈

- **Astro 7**（Content Layer API + `glob` loader + zod），静态输出
- **React 集成仅用于一处**：首页底部 `HomeLogoLoop` 工具 logo 岛
- 原生 CSS 变量 + Astro scoped style，无 Tailwind、无 UI 框架
- 字体：`--font-decor` 从 Google Fonts 按需加载 Cormorant Garamond（钢印字标用）；正文走系统字体栈，零下载
- 页面转场：`<ClientRouter />`（View Transitions）
- 部署：Vercel（域名待定）

> 以上以 `src/styles/global.css` 与 `astro.config.mjs` 为准。

---

## 快速开始

```bash
npm run dev                       # 开发服务器
NODE_OPTIONS="" npx astro check   # 类型检查
NODE_OPTIONS="" npx astro build   # 构建（会清 dist/，沙箱内需 NODE_OPTIONS=""）
```

> **`build` 与 `preview` 不能同时跑**：preview 会锁住 `dist/`，导致 build 在 `ssrMoveAssets` 阶段失败。先停 preview 再 build。

---

## 目录

```
domn-portfolio-web/
├── architecture.md          # ⭐ 工程架构（现行规范，写代码前必读）
├── portfolio-source/        # 内容数据源（不直接发布）
│   ├── profile/profile.md            # → /about
│   └── projects/<type>/<slug>/project.md
├── src/
│   ├── content.config.ts    # collections: projects / profile
│   ├── lib/{sections,projects}.ts
│   ├── components/          # 各页内容组件
│   ├── pages/               # 路由
│   ├── scripts/stage.mjs    # 导航高亮 + 首页待机态舞台
│   └── styles/global.css    # 全局 token（唯一真源）
├── public/                  # media / video / brand / slides / resume.pdf
└── tasks/                   # 规划期任务清单（历史）
```

---

## 文档索引

| 文档 | 状态 | 内容 |
| -- | --- | --- |
| `architecture.md` | ✅ **现行规范**（v2，2026-10-13） | 工程架构：content schema、目录约定、路由与 IA、硬约定、媒体管线、构建验收 |
| `site-architecture.md` | ✅ **现行规范**（v2，2026-10-13） | 信息架构：四区块、首页「生成式剧场」、列表页与详情页组装、字段映射、求职预案、素材 checklist |
| `design.md` | ✅ **现行规范**（v4，2026-10-13） | 设计系统：按 `src/styles/global.css` 实际 token 重写（雾蓝灰 `#88a9bd` + 纯黑 + 系统字体栈 + Cormorant Garamond） |
| `MOTION_SPEC-page.md` | 历史 | 整页动效 M0–M4 规划 |
| `MOTION_SPEC-hero.md` | 历史 | Hero 视频 scrub 方案（已暂缓至 v2，不实现） |
| `AUDIT-motion-web-2026-09-17.md` | 历史 | 设计产物审核报告 |
| `tasks/{todo,plan,audit}.md` | 历史 | 规划期任务清单与已拍板决策 |

> **三份现行规范的分工**：`site-architecture.md` 管「每页放什么」，`architecture.md` 管「代码怎么消费内容」，`design.md` 管「长什么样」。
> 历史文档（2026-09）保留作设计沿革参考，但**不再是现行规范**。任何冲突表述以上述三份 + `src/styles/global.css` 为准。

---

## 内容工作流

1. 在 `portfolio-source/projects/<type>/<slug>/` 下建目录，放 `project.md`
2. 结构化数据写 frontmatter（zod 校验），叙述性文本写正文
3. 媒体放 `public/media/<type>/<slug>/`，命名 `NN-用途.扩展名`
4. `_` 前缀 = 不进内容集合（模板、草稿）

字段定义见 `architecture.md` §3；逐页过滤条件见 §4。
