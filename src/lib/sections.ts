// DOMN-STUDIO · 4 个功能 section 外壳配置
// 子页按功能组织（type→section 映射见 projects.ts）。
// 注：角色视频仅为视觉素材，与具体子页主题无对应关系，故不再绑定角色代号。

export type SectionKey =
  | 'worldbuilding'
  | 'films'
  | 'commercial'
  | 'skills';

export type ProjectType =
  | 'ai-video'
  | 'tvc'
  | 'character-design'
  | 'worldbuilding'
  | 'ai-images'
  | 'visual-design'
  | 'ai-tools'
  | 'skills'
  | 'ip-design';

export interface SectionDef {
  /** 路由键，对应 /<key> */
  key: SectionKey;
  /** 编号，如 "01" */
  num: string;
  /** 英文主标签（大写） */
  label: string;
  /** 中文副标签 */
  labelCn: string;
  /** 关联角色视频（相对 public/ 路径，ASCII 命名） */
  video: string;
  /** 该 section 聚合的 Content Layer 作品类型 */
  types: ProjectType[];
  /** 一句话功能定位（子页导语） */
  statement: string;
  /** 路由 */
  route: string;
  /** 是否隐藏：隐藏的板块不进入顶部导航，但仍保留数据供详情页 getSection 使用 */
  hidden?: boolean;
}

// 顺序即首页导航顺序（hidden 的板块不进入导航，但仍保留数据供详情页 getSection 使用）。
export const SECTIONS: SectionDef[] = [
  {
    key: 'worldbuilding',
    num: '03',
    label: 'IDEA',
    labelCn: '想法',
    video: '/video/worldbuilding.mp4',
    types: ['worldbuilding'],
    statement: '创世设定的档案馆与剧本库（IP Bible & Script Archive）——把想象里的宇宙先立住。',
    route: '/worldbuilding',
    hidden: true,
  },
  {
    key: 'films',
    num: '01',
    label: 'PRACTICE',
    labelCn: '实践',
    video: '/video/ai-shorts.mp4',
    types: ['ai-video', 'character-design'],
    statement: '高保真暗房放映厅（Cinematic Screening Room）——用生成式工具当摄制组拍出的短片。',
    route: '/films',
  },
  {
    key: 'commercial',
    num: '04',
    label: 'COMMERCIAL',
    labelCn: '商业设计',
    video: '/video/commercial.mp4',
    types: ['tvc', 'visual-design', 'ai-images', 'ip-design'],
    statement: '先锋商业全案画册（High-End Commercial Lookbook）——为品牌交付可落地的视觉系统。',
    route: '/commercial',
    hidden: true,
  },
  {
    key: 'skills',
    num: '02',
    label: 'CREATION',
    labelCn: '研发与沉淀',
    video: '/video/skill-tree.mp4',
    types: ['skills', 'ai-tools'],
    statement: '自研工具与方法论的沉淀库（In-House Build & Methodology）——把生成式流程亲手搭出来、跑通、再沉淀成可复用的武器，每一件都来自自己的工程实践。',
    route: '/skills',
  },
];

/** 待机态视频（首页默认，舞台索引 0） */
export const IDLE_VIDEO = '/video/idle.mp4';

/** 按 key 取 section */
export function getSection(key: SectionKey): SectionDef {
  const s = SECTIONS.find((x) => x.key === key);
  if (!s) throw new Error(`unknown section: ${key}`);
  return s;
}
