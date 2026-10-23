import { isValidElement, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentType, ReactElement } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import './BranchedMenu.css';

export type BranchedMenuIcon =
  | ComponentType<Record<string, unknown>>
  | ReactElement;

export interface BranchedMenuChild {
  value: string;
  label: string;
  icon?: BranchedMenuIcon;
  /** 提供则叶子渲染为 <a>，由父级 onSelect 处理跳转（兼容 View Transition / 锚点） */
  href?: string;
  /** 板块页作品序号（如 01 / 02），仅渲染在侧栏，便于调整作品顺序 */
  num?: string;
}

export interface BranchedMenuItem {
  /** Section header label. */
  label: string;
  /** A leaf (no children) may carry its own value; otherwise it folds. */
  value?: string;
  children?: BranchedMenuChild[];
  icon?: BranchedMenuIcon;
  /** 分组头被点击时滚动到的内容区 id（板块页跳转用；详情页不设置） */
  target?: string;
}

export interface BranchedMenuProps {
  items?: BranchedMenuItem[];
  defaultOpen?: number | number[];
  defaultActive?: string;
  /** 受控：当前展开的分组下标（提供后覆盖内部状态） */
  openSections?: number[];
  /** 受控：当前激活叶子 value（提供后覆盖内部状态） */
  activeValue?: string;
  onSelect?: (value: string, item: BranchedMenuChild | BranchedMenuItem) => void;
  onToggle?: (index: number, open: boolean) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
}

const PAD = 6;
const MARK = 16;

const renderIcon = (icon?: BranchedMenuIcon) =>
  icon == null
    ? null
    : isValidElement(icon)
      ? icon
      : <HugeiconsIcon icon={icon as never} size={16} strokeWidth={1.8} />;

const toSet = (open: number | number[] | undefined): Set<number> => {
  if (open == null) return new Set();
  return new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);
};

export default function BranchedMenu({
  items = [],
  defaultOpen = 0,
  defaultActive = '',
  openSections,
  activeValue,
  onSelect,
  onToggle,
  color = '#f5f5f5',
  accentColor = '#f5f5f5',
  lineColor = '#3f3f46',
  width = 240,
  rowHeight = 36,
  indent = 40,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  drawDuration = 400,
  foldDuration = 300,
  className = '',
}: BranchedMenuProps) {
  const [openState, setOpenState] = useState(() => toSet(defaultOpen));
  const open = openSections != null ? new Set(openSections) : openState;
  const [activeState, setActiveState] = useState(() => {
    if (defaultActive) return defaultActive;
    const first = items.find((it, i) => it.children && toSet(defaultOpen).has(i));
    return first?.children?.[0]?.value ?? '';
  });
  const active = activeValue != null ? activeValue : activeState;
  const navRef = useRef<HTMLElement | null>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const latest = useRef({ onSelect, onToggle });
  latest.current = { onSelect, onToggle };

  const activeSection = items.findIndex((it) => it.children?.some((kid) => kid.value === active));
  const markerShown = activeSection >= 0 && open.has(activeSection);
  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = markerShown && el;
      if (!glide) m.style.transition = 'none';
      if (on) m.style.top = `${el!.offsetTop + (el!.offsetHeight - MARK) / 2}px`;
      m.toggleAttribute('data-on', Boolean(on));
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = '';
      }
    };
    place(true);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (value: string, item: BranchedMenuChild | BranchedMenuItem) => {
    setActiveState(value);
    latest.current.onSelect?.(value, item);
  };
  // 板块页：点击分组头 → 平滑滚动到对应的内容区（target 为元素 id）
  const scrollToTarget = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toggle = (i: number) => {
    setOpenState((prev) => {
      const next = new Set(prev);
      const isOpen = !next.has(i);
      if (isOpen) next.add(i);
      else next.delete(i);
      latest.current.onToggle?.(i, isOpen);
      return next;
    });
  };

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) => `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) => `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) => rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  return (
    <nav
      ref={navRef}
      className={`branched-menu${className ? ` ${className}` : ''}`}
      style={{
        ['--bm-w' as string]: `${width}px`,
        ['--bm-ink' as string]: color,
        ['--bm-accent' as string]: accentColor,
        ['--bm-line' as string]: lineColor,
        ['--bm-font' as string]: `${fontSize}px`,
        ['--bm-row' as string]: `${rowHeight}px`,
        ['--bm-indent' as string]: `${indent}px`,
        ['--bm-line-w' as string]: lineWidth,
        ['--bm-draw' as string]: `${drawDuration}ms`,
        ['--bm-fold' as string]: `${foldDuration}ms`,
      }}
    >
      <span ref={markerRef} className="branched-menu__marker" aria-hidden="true" />
      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? item.label;
        const leafActive = !kids && leafValue === active;
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;
        return (
          <div key={item.value ?? item.label} className="branched-menu__section" data-open={isOpen ? '' : undefined}>
            <button
              ref={(el) => {
                heads.current[i] = el;
              }}
              type="button"
              className="branched-menu__head"
              aria-expanded={kids ? isOpen : undefined}
              aria-current={leafActive ? 'true' : undefined}
              data-active={leafActive ? '' : undefined}
              data-nav-id={!kids ? leafValue : undefined}
              onClick={() => {
                if (kids) {
                  toggle(i);
                  if (item.target) scrollToTarget(item.target);
                } else {
                  select(leafValue, item);
                }
              }}
            >
              {item.label}
            </button>
            {kids ? (
              <div className="branched-menu__body">
                <div className="branched-menu__fold">
                  <div className="branched-menu__tree" style={{ height: bodyH }}>
                    <svg className="branched-menu__lines" width={indent} height={bodyH} aria-hidden="true">
                      <path className="branched-menu__base" d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`} />
                      {kids.map((kid, k) => (
                        <path key={kid.value} className="branched-menu__base" d={branch(k)} />
                      ))}
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value}
                          className="branched-menu__reach"
                          d={reach(k)}
                          style={{
                            strokeDasharray: length(k),
                            strokeDashoffset: kid.value === active ? 0 : length(k),
                          }}
                        />
                      ))}
                    </svg>
                    {kids.map((kid) =>
                      kid.href ? (
                        <a
                          key={kid.value}
                          className="branched-menu__item"
                          href={kid.href}
                          aria-current={kid.value === active ? 'true' : undefined}
                          data-active={kid.value === active ? '' : undefined}
                          tabIndex={isOpen ? 0 : -1}
                          data-nav-id={kid.value}
                          onClick={(e) => {
                            e.preventDefault();
                            select(kid.value, kid);
                          }}
                        >
                          {kid.icon ? (
                            <span className="branched-menu__icon" aria-hidden="true">
                              {renderIcon(kid.icon)}
                            </span>
                          ) : null}
                          <span className="branched-menu__label">
                            {kid.num && <span className="branched-menu__num">{kid.num}</span>}
                            {kid.label}
                          </span>
                        </a>
                      ) : (
                        <button
                          key={kid.value}
                          type="button"
                          className="branched-menu__item"
                          aria-current={kid.value === active ? 'true' : undefined}
                          data-active={kid.value === active ? '' : undefined}
                          tabIndex={isOpen ? 0 : -1}
                          data-nav-id={kid.value}
                          onClick={() => select(kid.value, kid)}
                        >
                          {kid.icon ? (
                            <span className="branched-menu__icon" aria-hidden="true">
                              {renderIcon(kid.icon)}
                            </span>
                          ) : null}
                          <span className="branched-menu__label">
                            {kid.num && <span className="branched-menu__num">{kid.num}</span>}
                            {kid.label}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
