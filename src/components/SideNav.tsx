import { useEffect, useMemo, useRef, useState } from 'react';
import BranchedMenu from './BranchedMenu/BranchedMenu';
import type { BranchedMenuItem } from './BranchedMenu/BranchedMenu';
import type { Project } from '../lib/projects';
import './BranchedMenu/BranchedMenu.css';
import './SideNav.css';
import { navigate } from 'astro:transitions/client';

interface SideNavProps {
  items: BranchedMenuItem[];
  /** 默认激活值（页面路由）；命中叶子则用之，否则回退到首个叶子 */
  activeValue?: string;
  kind?: 'section' | 'detail';
  /** 板块页点击 skills 的 en 时，判断是否已有详情页可跳转 */
  projects?: Project[];
}

const GH_BASE = 'https://github.com/iam-don9/';

export default function SideNav({ items, activeValue, kind = 'section', projects = [] }: SideNavProps) {
  const isDetail = kind === 'detail';

  // 首个叶子（板块页默认展开第一组；详情页默认首个锚点）
  const firstLeaf = useMemo(() => {
    for (const it of items) {
      if (it.children && it.children.length) return it.children[0].value;
      if (it.value) return it.value;
    }
    return '';
  }, [items]);

  const defaultActive = useMemo(() => {
    if (activeValue) {
      const hit = items.some(
        (it) => it.children?.some((k) => k.value === activeValue) || it.value === activeValue
      );
      if (hit) return activeValue;
    }
    return firstLeaf;
  }, [activeValue, items, firstLeaf]);

  const [hover, setHover] = useState<string | null>(null);
  const [spy, setSpy] = useState<string>('');
  const asideRef = useRef<HTMLElement | null>(null);

  const active = isDetail ? hover ?? spy ?? defaultActive : hover ?? defaultActive;
  const effectiveActive = items.some(
    (it) => it.children?.some((k) => k.value === active) || it.value === active
  )
    ? active
    : defaultActive;

  // 板块页：手风琴，只展开 active 所在组；详情页：根分组恒开
  const activeGroup = items.findIndex((it) => it.children?.some((k) => k.value === effectiveActive));
  const openSections = isDetail ? items.map((_, i) => i) : activeGroup >= 0 ? [activeGroup] : [0];

  // 内容 / 侧栏 hover 联动：监听最近携带 [data-nav-id] 的元素
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest?.('[data-nav-id]') as HTMLElement | null;
      if (el) setHover(el.getAttribute('data-nav-id'));
      else if (isDetail) setHover(null);
    };
    document.addEventListener('mouseover', onOver, true);
    return () => document.removeEventListener('mouseover', onOver, true);
  }, [isDetail]);

  // 详情页滚动高亮（scroll-spy）：观察带 id 的内容区块
  useEffect(() => {
    if (!isDetail) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-id][id]'));
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setSpy(visible[0].target.getAttribute('data-nav-id') || '');
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [isDetail]);

  const goLeaf = (value: string) => {
    if (isDetail) {
      const el = document.getElementById(value);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          history.replaceState(null, '', `#${value}`);
        } catch {
          /* 忽略 */
        }
      }
      setHover(value);
      return;
    }
    // 板块页：skills 的 en 若已有详情页则软导航，否则开 GitHub；其余按路由跳转
    const proj = projects.find(
      (p) => p.id === value && (p.data.type === 'skills' || p.data.type === 'ai-tools')
    );
    if (proj) {
      try {
        navigate(value);
      } catch {
        window.location.href = value;
      }
    } else if (/^[\w-]+$/.test(value) && !value.startsWith('/')) {
      window.open(`${GH_BASE}${value}`, '_blank', 'noopener');
    } else {
      try {
        navigate(value);
      } catch {
        window.location.href = value;
      }
    }
    setHover(value);
  };

  // 定位：固定侧栏左缘对齐内容列左缘、顶缘对齐 hero / 概述区底线。
  // 内容列已右移预留留白，故侧栏叠在左侧空白带上，滚动时不压正文。
  useEffect(() => {
    const place = () => {
      const aside = asideRef.current;
      if (!aside) return;
      const anchor =
        document.querySelector<HTMLElement>('.page-body') ??
        document.querySelector<HTMLElement>('.page-inner.detail');
      if (!anchor) return;
      const a = anchor.getBoundingClientRect();
      const titleCard = document.querySelector<HTMLElement>('.title-card');
      const hero = titleCard ?? document.querySelector<HTMLElement>('.detail-head');
      const anchorTop =
        (hero ? hero.getBoundingClientRect().bottom : a.top) + (titleCard ? 0 : window.scrollY);
      const gap = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const minTop = (document.getElementById('domn-topbar')?.getBoundingClientRect().bottom ?? 0) + gap;
      const maxTop = window.innerHeight - aside.scrollHeight - gap;
      const top = Math.max(minTop, Math.min(anchorTop, maxTop));
      aside.style.left = `${Math.round(a.left)}px`;
      aside.style.setProperty('--sidenav-top', `${Math.round(top)}px`);
    };
    place();
    const onResize = () => place();
    window.addEventListener('resize', onResize);
    document.addEventListener('astro:page-load', place);
    const ro = new ResizeObserver(() => place());
    const root = document.querySelector('.page');
    if (root) ro.observe(root);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('astro:page-load', place);
      ro.disconnect();
    };
  }, []);

  return (
    <aside id="domn-sidenav" className="sidenav" aria-label="页面导航" data-kind={kind} ref={asideRef}>
      {/* 详情页的分组头本身即「本页目录 · CONTENTS」，不再重复渲染面板标题 */}
      {!isDetail && <p className="sidenav__title">项目目录 · INDEX</p>}
      <BranchedMenu
        items={items}
        activeValue={effectiveActive}
        openSections={openSections}
        onSelect={(value) => goLeaf(value)}
        color="#e9eaec"
        accentColor="#00B894"
        lineColor="#3a3f47"
        width={212}
        rowHeight={32}
        indent={34}
        trunk={11}
        radius={8}
        fontSize={12.5}
        drawDuration={360}
        foldDuration={240}
      />
    </aside>
  );
}
