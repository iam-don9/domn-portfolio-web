import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// glob loader 的 base 相对项目根解析（build 时 cwd 即项目根）。
// ⚠️ 内容集合的缓存由 Astro 托管在项目根的 .astro/ 下。手动 rm -rf .astro 之后，
//    运行中的 dev server 会继续用已失效的旧状态，getCollection() 返回空数组
//    （症状：页面框架在、卡片全没了）。此时必须重启 dev server。
const PROJECTS_BASE = 'portfolio-source/projects';
const PROFILE_BASE = 'portfolio-source/profile';

// ---- 枚举（与 architecture.md §3.2 对齐）----
const ShotSize = z.enum(['远', '全', '中', '近', '特']);
const ShotLens = z.enum(['广角', '标准', '长焦']);
const ShotMove = z.enum(['推', '拉', '摇', '移', '跟', '升降', '固定', '手持', '甩']);
const ShotFunction = z.enum(['交代环境', '建立角色', '推进冲突', '情绪峰值', '收束']);
const Transition = z.enum(['直切', '淡入淡出', '匹配剪辑', '转场特效', '声音先行']);

const Shot = z.object({
  id: z.number(),
  size: ShotSize,
  lens: ShotLens,
  move: ShotMove,
  content: z.string(),
  function: ShotFunction,
  duration: z.number(),
  transition: Transition,
  frame: z.string().optional(), // 对应分镜板文件名，驱动 M3 交叉高亮
});

const MediaItem = z.object({
  file: z.string(),
  kind: z.enum(['cover', 'process', 'final']),
  proves: z.string(),
  public: z.boolean().default(true),
});

// 角色（剧本的角色头像矩阵）
const Character = z.object({
  name: z.string(),
  role: z.string().optional(),
  avatar: z.string().optional(), // 相对 /media/<type>/<slug>/
});

// ---- 项目内分区（films 页：成品区 / 过程区）----
// 生产阶段：驱动过程区时间轴的排序，顺序即此枚举顺序
const ClipStage = z.enum(['剧本', '分镜', '资产', '其他', '生成', '迭代', '修正', '剪辑']);

// 一条素材（成品区或过程区）。视频本体在 B 站，站内只留链接 + 缩略图。
const Clip = z.object({
  label: z.string(),               // 片段名，如「段5+ 第一次迭代」
  stage: ClipStage,                // 生产阶段
  proves: z.string().optional(),   // 这段证明了什么
  thumb: z.string().optional(),    // 缩略图文件名，相对 /media/<type>/<slug>/
  bilibiliUrl: z.string().optional(), // B 站链接，可空（待上传）

  // ── 资产 / 其他 阶段的 pp-card 展示（仅 stage === '资产'|'其他' 使用，其余阶段忽略）──
  // 与进化论世界观页的「资产」段共用同一套 pp-card 视觉与交互。
  // 「其他」用于立绘 / 海报等非角色资产图组。
  name: z.string().optional(),                    // pp-card 标题（缺省回退 label）
  role: z.string().optional(),                    // pp-card 副标题：角色定位 / 场景用途
  note: z.string().optional(),                    // pp-card 说明（缺省回退 proves）
  assets: z.array(z.string()).default([]),        // 轮播附图，与 cover 共同悬停轮播
  prompt: z.string().optional(),                  // 分镜阶段：提示词原文，时间线内折叠展示
});

// 逐镜生视频提示词（详情页可折叠展示）
const PromptShot = z.object({
  id: z.number(),
  text: z.string(),
  note: z.string().optional(),
});

// ---- 制作过程（剧本 → 资产 → 关键帧 → 包装展示）----
// 段内无素材则整段不渲染；每段内的条目按项目实际素材增删。
const ProcessScript = z.object({
  label: z.string(),
  note: z.string().optional(),
});

// 资产卡片：角色 / 族群 / 场景 / 道具 共用同一形态
export const ProcessCard = z.object({
  name: z.string(),
  role: z.string().optional(),                    // 副标题：角色定位 / 场景用途
  cover: z.string(),                              // 展示图（立绘 / 场景概念）
  note: z.string().optional(),                    // 一句说明
  assets: z.array(z.string()).default([]),        // 过程资产图组，点开弹层浏览
});

// 资产行：行内卡片平铺一行，行标题如「主要角色 / 族群 / 场景 / 道具」
export const ProcessAssetRow = z.object({
  label: z.string(),
  cards: z.array(ProcessCard).default([]),
});

const ProcessPackaging = z.object({
  label: z.string(),
  file: z.string(),
  note: z.string().optional(),
});

const Process = z.object({
  // ── 世界观页（/worldbuilding/<id>）：编导策划能力 ──
  worldview: z.string().optional(),               // 世界观说明（可空，待补）
  script: z.array(ProcessScript).default([]),     // 剧本剖析
  assets: z.array(ProcessAssetRow).default([]),   // 角色 / 族群 / 场景 / 道具
  keyFrames: z.array(ProcessPackaging).default([]), // 关键帧（剧照级单帧，也在时间线上）

  // ── 影片页（/films/<id>）：包装展示 ──
  packaging: z.array(ProcessPackaging).default([]), // 包装展示

  // 剧本状态标注：如「目前只有预告片剧本，正片剧本待补」
  scriptNote: z.string().optional(),
});

// 落地索引（技能节点的“已应用”计数）
const Applied = z.object({
  scripts: z.number().default(0),
  films: z.number().default(0),
  tvcs: z.number().default(0),
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/project.md',
    base: PROJECTS_BASE,
    // slug = 倒数第二层目录名（type/slug/project.md → slug）
    generateId: ({ entry }) => entry.split('/').slice(-2, -1)[0] ?? entry,
  }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    type: z.enum([
      'ai-video', 'tvc', 'character-design', 'worldbuilding',
      'ai-images', 'visual-design', 'ai-tools', 'skills', 'ip-design',
    ]),
    year: z.number(),
    status: z.enum(['完成', '进行中', '实验']),
    featured: z.boolean().default(false),
    client: z.string().optional(),
    duration: z.number().optional(),
    tools: z.array(z.string()).default([]),
    statement: z.string(),
    shots: z.array(Shot).default([]),
    media: z.array(MediaItem).default([]),
    order: z.number().optional(),
    // ── DOMN-STUDIO IA 扩展字段（四类总览 + 详情页 + 双向链接）──
    logline: z.string().optional(),                                   // 一句话核心梗概
    genre: z.string().optional(),                                      // 剧本题材（科幻末世/暗黑奇幻/赛博朋克/悬疑怪谈）
    characters: z.array(Character).default([]),                       // 剧本角色矩阵
    filmStatus: z.enum(['Filmed', 'In Development', 'Lore Concept']).optional(), // 影视化状态
    // 世界观页分组（与 films 区分开的两个轴）：短剧规划 / 短片规划 / 电影规划
    planKind: z.enum(['短剧规划', '短片规划', '电影规划']).optional(),
    filmId: z.string().optional(),                                    // 剧本 → 关联短片（project id）
    scriptId: z.string().optional(),                                  // 短片 → 关联剧本（project id）
    category: z.string().optional(),                                  // 短片：LIVE-ACTION / 3D CGI / 2D ANIME
    // 作品性质（与「成品区/过程区」是两个独立轴）：
    //   成品区 = 该片的主观看单元；workKind = 它落在 /films 的哪个区块
    //   成品片 → 放映厅；练习片段 → 练习片段区。仅 ai-video 类型使用。
    workKind: z.enum(['成品片', '练习片段']).default('练习片段'),
    industry: z.string().optional(),                                  // 商业：行业大品类
    deliverables: z.array(z.string()).default([]),                    // 商业：交付形式 chips
    proficiency: z.string().optional(),                               // 技能：熟练度等级
    applied: Applied.optional(),                                      // 技能：已应用计数
    skillIds: z.array(z.string()).default([]),                        // 商业 → 关联技能（project id）

    // ── films 页：视频全部走 B 站，站内只留外链 ──
    bilibiliUrl: z.string().optional(),                               // 成片 B 站链接（可空）
    rawBilibiliUrl: z.string().optional(),                            // 原片 B 站链接（可空）

    // ── films 页：项目内分区（成品区 / 过程区）──
    finalClips: z.array(Clip).default([]),                            // 成品区素材
    processClips: z.array(Clip).default([]),                          // 过程区素材（按 stage 排时间轴）
    promptShots: z.array(PromptShot).default([]),                     // 逐镜生视频提示词

    // ── 制作过程（剧本 → 资产 → 关键帧 → 包装展示）──
    // 设了该字段 → 详情页走「封面 + 主片放映 + 制作过程」新结构；未设 → 保持旧结构。
    process: Process.optional(),

    // ── 双链：作品同时归入别的区（如进化论 → script-archive 剧本档案馆）──
    crossSections: z.array(z.string()).default([]),
  }),
});

const profile = defineCollection({
  loader: glob({
    pattern: 'profile.md',
    base: PROFILE_BASE,
  }),
  schema: z.object({
    name: z.string(),
    alias: z.string().optional(),
    role: z.string(),
    tagline: z.string(),
    email: z.string().email().optional(),
    resume: z.string().default('/resume.pdf'),
  }),
});

export const collections = { projects, profile };
