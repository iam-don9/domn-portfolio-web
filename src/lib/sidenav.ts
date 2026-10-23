import type { BranchedMenuItem, BranchedMenuChild } from '../components/BranchedMenu/BranchedMenu';

// 板块页侧栏数据：分组（项目种类）+ 组内项目。
// 每个 item.value 必须等于内容卡片的 data-nav-id（通常为详情路由），hover 联动才会命中。
export interface NavCategory {
  label: string;
  en?: string;
  /** 分组头点击后滚动到的内容区 id（如 'sec-A'）；省略则不滚动 */
  target?: string;
  items: { value: string; label: string; href?: string }[];
}

export function buildSectionNav(categories: NavCategory[]): BranchedMenuItem[] {
  return categories.map((c) => ({
    label: c.label,
    target: c.target,
    children: c.items.map(
      (it, i): BranchedMenuChild => ({
        value: it.value,
        label: it.label,
        href: it.href,
        // 每组内顺序编号（01, 02…），便于随时调整作品顺序
        num: String(i + 1).padStart(2, '0'),
      })
    ),
  }));
}

// 详情页侧栏数据：单一「本页目录」分组，子项指向页内锚点（value = 区块 id，不含 #）。
export function buildDetailNav(entries: { value: string; label: string }[]): BranchedMenuItem[] {
  return [
    {
      label: '本页目录 · CONTENTS',
      children: entries.map(
        (e): BranchedMenuChild => ({ value: e.value, label: e.label, href: `#${e.value}` })
      ),
    },
  ];
}

// 取当前激活叶子的 value（用于高亮 + 默认展开所在分组）。
// section 总览页 → 板块路由（非叶子，回退到首个叶子）；详情页 → 页面路由（非锚点，回退到首个锚点）。
export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}
