import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTIONS, type ProjectType } from './sections';

export type Project = CollectionEntry<'projects'>;

export async function getProjects(): Promise<Project[]> {
  return getCollection('projects');
}

/** 媒体文件公开访问路径：/media/<type>/<slug>/<file> */
export function mediaUrl(project: Project, file: string): string {
  return `/media/${project.data.type}/${project.id}/${file}`;
}

/** 取封面（kind=cover 且为 webp，避免引用不存在的 mp4）。 */
export function coverOf(project: Project) {
  return project.data.media.find(
    (m) => m.kind === 'cover' && m.file.endsWith('.webp')
  );
}

/** 图组素材：公开的图片类媒体（规范为 webp，兜住 png/jpg/avif 以防手工补图）。 */
export function galleryOf(project: Project) {
  return project.data.media.filter(
    (m) => m.public && /\.(webp|png|jpe?g|avif)$/i.test(m.file)
  );
}

// ── Section 聚合（DOMN-STUDIO 4 功能分类）──

/** 按项目类型解析其所属总览 section 的路由（用于双向链接跳转）。 */
export function sectionRouteForType(type: ProjectType): string {
  const sec = SECTIONS.find((s) => s.types.includes(type));
  return sec ? sec.route : '/';
}

/** 按 id 取单个项目（双向链接反向检索用）。 */
export function getProjectById(projects: Project[], id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** 取多个 id 对应的项目（过滤掉不存在的）。 */
export function getProjectsByIds(projects: Project[], ids: string[]): Project[] {
  if (!ids.length) return [];
  return ids
    .map((id) => getProjectById(projects, id))
    .filter((p): p is Project => !!p);
}
