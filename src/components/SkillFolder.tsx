'use client';

import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import Folder from './Folder';
import type { S3Tuning } from './s3tuning';
import { S3_DEFAULTS } from './s3tuning';
import './SkillFolder.css';

export interface Skill {
  name: string;
  en: string;
  cover: string;
  desc: string;
  highlights: string[];
  github?: string;
}

export interface Category {
  label: string;
  en: string;
  intro: string;
  skills: Skill[];
}

export default function SkillFolder({
  categories,
  tuning = S3_DEFAULTS,
  cardGap
}: {
  categories: Category[];
  tuning?: S3Tuning;
  cardGap?: number;
}) {
  // 桌面端默认展开第一类；移动端先展示文件夹入口，点击后再展开内容，避免缩略图悬在文件夹上方。
  const [openCat, setOpenCat] = useState<Category | null>(categories[0] ?? null);
  const [isCompact, setIsCompact] = useState(false);
  const [active, setActive] = useState<Skill | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const updateViewportMode = () => {
      const compact = window.innerWidth <= 760;
      setIsCompact(compact);
      setOpenCat((current) => {
        if (compact) return null;
        return current ?? categories[0] ?? null;
      });
    };
    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    return () => window.removeEventListener('resize', updateViewportMode);
  }, [categories]);

  // 固定展开锚点 + 自适应放大/抬升 + 防遮标题：
  // - 给每列算好 --s3-shift（行中心 − 文件夹中心），打开时卡片行飞到统一锚点。
  // - openScale / liftY 不再写死：以 1440×820 为基准做视口倍率（窄屏/矮屏都收敛），
  //   放大倍数取「最受限维度」，抬升按屏高缩放。
  // - 再测打开态卡片块实际高度，把抬升夹紧：卡片顶部永远不低于标题下沿 + 安全边距，
  //   从而任何屏幕都不会盖到「自研技能」标题（而不是到一个固定值）。
  useEffect(() => {
    const compute = () => {
      const rootEl = rootRef.current;
      const row = rowRef.current;
      if (!rootEl || !row) return;
      const W = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const H = typeof window !== 'undefined' ? window.innerHeight : 900;
      const vwFactor = Math.min(1.18, Math.max(0.62, W / 1440));
      const vhFactor = Math.min(1.08, Math.max(0.7, H / 820));
      const tunedScale = tuning.openScale * Math.min(vwFactor, vhFactor);
      const tunedLift = tuning.liftY * vhFactor;
      rootEl.style.setProperty('--s3-scale', String(tunedScale));

      const rr = row.getBoundingClientRect();
      const targetX = rr.left + rr.width / 2;
      colRefs.current.forEach((col) => {
        const fr = col.querySelector('.folder-root');
        if (!fr) return;
        const frr = fr.getBoundingClientRect();
        const shift = targetX - (frr.left + frr.width / 2);
        col.style.setProperty('--s3-shift', `${shift.toFixed(1)}px`);
      });

      // 防遮标题：以当前动画中的 scale 反推「未缩放卡片块高度」，再按目标放大倍数算块高，
      // 夹住抬升量使块顶不低于标题下沿 + 安全边距。
      const openCol = openCat ? colRefs.current.get(openCat.en) : undefined;
      const header = rootEl.closest('.skill-inner')?.querySelector('.slide-head');
      if (openCol && header) {
        const folderRoot = openCol.querySelector('.folder-root');
        const items = openCol.querySelector('.folder-items');
        if (folderRoot && items) {
          const fs = getComputedStyle(items);
          const sx = parseFloat(fs.getPropertyValue('scale').toString().split(/\s+/)[0]) || 1;
          const rectH = items.getBoundingClientRect().height;
          const baseH = sx > 0.01 ? rectH / sx : rectH;
          const targetH = baseH * tunedScale;
          const frr = folderRoot.getBoundingClientRect();
          const folderCenterY = frr.top + frr.height / 2; // 弹簧缩放支点 = 文件夹中心
          const headerBottom = header.getBoundingClientRect().bottom;
          const requiredLift = headerBottom + 16 - folderCenterY + targetH / 2;
          const clampedLift = Math.max(tunedLift, requiredLift);
          rootEl.style.setProperty('--s3-lift', `${clampedLift.toFixed(1)}px`);
          return;
        }
      }
      rootEl.style.setProperty('--s3-lift', `${tunedLift}px`);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [openCat, tuning.openScale, tuning.liftY]);

  // 详情弹窗无障碍：Esc 关闭、焦点管理、滚动锁定
  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus();
    };
  }, [active]);

  return (
    <div
      ref={rootRef}
      className="skill-folder"
      style={{
        ['--s3-col-gap' as string]: `${tuning.colGap}rem`,
        ['--s3-folder-drop' as string]: `${tuning.folderDrop}px`
      } as CSSProperties}
    >
      {/* 三个分类文件夹并列；文件夹位置保持不动，点开后 React Bits Folder 的原生弹簧
          动效保留，封面按 layout="row" 在文件夹上方弹成单/双行（数量>4 自动双行、
          卡片共用同一 fit 故尺寸统一、不裁切、保留原图比例） */}
      <div className="skill-folder__row" ref={rowRef}>
        {categories.map((cat) => {
          const items = cat.skills.map((s) => ({
            title: s.name,
            description: s.en,
            image: s.cover,
            alt: s.name,
          }));
          const isOpen = openCat === cat;
          // 数量多自动双行：≤4 张单行，>4 张折成两行（顶行 ceil(n/2) 张）。
          // 双行下所有卡片共用同一 fit，尺寸天然统一。
          const rows = cat.skills.length > 4 ? 2 : 1;
          return (
            <div
              className={`skill-folder__col${isOpen ? ' skill-folder__col--open' : ''}`}
              key={cat.en}
              ref={(el) => {
                if (el) colRefs.current.set(cat.en, el);
                else colRefs.current.delete(cat.en);
              }}
            >
              <Folder
                items={items}
                label={cat.label}
                variant="solid"
                color="#0e1217"
                paperColor="#171c24"
                tabPosition="center"
                layout="row"
                size={tuning.folderSize}
                itemAspect={tuning.cardAspect} /* 封面统一 1088×608 横图（浏览器解码实测）：卡片宽/高比 = 1088/608 ≈ 1.79，与封面吻合 */
                cardGap={cardGap ?? tuning.cardGap}
                rows={rows}
                openOn="click"
                zoomOnClick={false}
                defaultOpen={!isCompact && cat === categories[0]}
                theme="dark"
                open={isOpen}
                closeOnOutsideClick={false}
                onOpenChange={(o) => {
                  if (o) {
                    setOpenCat(cat);
                    return;
                  }
                  if (isCompact) setOpenCat(null);
                }}
                onItemClick={(_entry, index) => setActive(cat.skills[index])}
              />
              {/* 底部说明常驻：文件夹名 + 两行完整说明，无论文件夹开合都显示 */}
              {cat.intro && (
                <p className="skill-folder__cap">
                  <span className="skill-folder__cap-name">{cat.label}</span>
                  <span className="skill-folder__cap-desc">{cat.intro}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {active && (
        <div
          className="skill-modal"
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActive(null);
          }}
        >
          <div className="skill-modal__panel">
            <button
              className="skill-modal__close"
              ref={closeRef}
              type="button"
              onClick={() => setActive(null)}
              aria-label="关闭"
            >
              ×
            </button>
            <div className="skill-modal__cover">
              <img src={active.cover} alt={active.name} draggable={false} />
            </div>
            <div className="skill-modal__body">
              <h3 className="skill-modal__name">{active.name}</h3>
              <code className="skill-modal__en">{active.en}</code>
              <p className="skill-modal__desc">{active.desc}</p>
              <p className="skill-modal__label">亮点 · HIGHLIGHTS</p>
              <ul className="skill-modal__hl">
                {active.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              {active.github && (
                <a
                  className="skill-modal__gh"
                  href={active.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
