import { useEffect, useMemo, useRef, useState } from 'react';
import './GridMotion.css';

const IMAGE = /^(https?:\/\/|\/\/|\/|\.\.?\/|data:image\/|blob:)|\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = (value, total) => ((value % total) + total) % total;

const toTile = item => {
  if (item === null || item === undefined || item === false) return { kind: 'empty' };
  if (typeof item === 'object' && typeof item.src === 'string') return { kind: 'image', src: item.src, alt: item.alt ?? '' };
  const text = String(item).trim();
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };
};

const Tile = ({ tile }) => (
  <div className="grid-motion__tile">
    {tile.kind === 'image' && <img src={tile.src} alt={tile.alt} draggable={false} decoding="async" />}
    {tile.kind === 'text' && <span className="grid-motion__text">{tile.text}</span>}
  </div>
);

export default function GridMotion({
  items = [],
  rows = 5,
  aspectRatio = 1.15,
  gap = 14,
  radius = 10,
  angle = -18,
  tilt = 18,
  speed = 18,
  direction = 'alternate',
  spotlight = 0.72,
  grayscale = false,
  fade = 0.4,
  dim = 0.12,
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const planeRef = useRef(null);
  const motionRef = useRef({ offsets: [], pointer: { x: 0, y: 0, active: false } });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const settings = {
    rows: clamp(Math.round(rows), 1, 12),
    aspect: clamp(aspectRatio, 0.3, 4),
    gap: Math.max(0, gap),
    angle,
    tilt: clamp(tilt, 0, 75),
    speed,
    direction: ['alternate', 'left', 'right'].includes(direction) ? direction : 'alternate',
    spotlight: clamp(spotlight, 0, 1),
    fade: clamp(fade, 0, 1),
    dim: clamp(dim, 0, 1),
  };
  const tiles = useMemo(() => items.map(toTile), [items]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const update = () => setSize({ width: root.clientWidth, height: root.clientHeight });
    const observer = new ResizeObserver(update);
    observer.observe(root);
    update();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const pointer = motionRef.current.pointer;
    const onPointerMove = event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onPointerLeave);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onPointerLeave);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const layout = useMemo(() => {
    if (!size.width || !size.height) return null;
    const turn = Math.abs(settings.angle * Math.PI / 180);
    const planeWidth = (size.width * Math.cos(turn) + size.height * Math.sin(turn)) * 1.25;
    const planeHeight = (size.width * Math.sin(turn) + size.height * Math.cos(turn)) * 1.16;
    const tileHeight = Math.max(24, (planeHeight - settings.gap * (settings.rows - 1)) / settings.rows);
    const tileWidth = tileHeight * settings.aspect;
    const step = tileWidth + settings.gap;
    const perRow = Math.ceil(planeWidth / step) + 2;
    return {
      planeWidth,
      planeHeight,
      tileWidth,
      tileHeight,
      step,
      perRow,
      period: perRow * step,
      top: (planeHeight - settings.rows * tileHeight - (settings.rows - 1) * settings.gap) / 2,
    };
  }, [size, settings.angle, settings.rows, settings.gap, settings.aspect]);

  useEffect(() => {
    const root = rootRef.current;
    const plane = planeRef.current;
    if (!root || !plane || !layout) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const rowsEls = Array.from(plane.children);
    const tileEls = rowsEls.flatMap(row => Array.from(row.children));
    const motion = motionRef.current;
    let raf = 0;
    let last = performance.now();
    let alive = true;
    const frame = now => {
      if (!alive) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      rowsEls.forEach((row, index) => {
        const drift = settings.direction === 'left' ? -1 : settings.direction === 'right' ? 1 : index % 2 ? 1 : -1;
        motion.offsets[index] = (motion.offsets[index] ?? index * layout.step * 0.37) + (reduce ? 0 : settings.speed * drift * dt);
        row.style.transform = `translate3d(${(-layout.period + wrap(motion.offsets[index], layout.period)).toFixed(2)}px, 0, 0)`;
      });
      const rootRect = root.getBoundingClientRect();
      const inside = motion.pointer.active
        && motion.pointer.x >= rootRect.left && motion.pointer.x <= rootRect.right
        && motion.pointer.y >= rootRect.top && motion.pointer.y <= rootRect.bottom;
      const reach = (0.6 + 2.2 * settings.spotlight) * Math.max(layout.tileWidth, layout.tileHeight);
      tileEls.forEach(tile => {
        const rect = tile.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = inside ? Math.hypot(centerX - motion.pointer.x, centerY - motion.pointer.y) / reach : Infinity;
        const t = Math.min(1, Math.max(0, (distance - 0.25) / 0.75));
        const spot = inside ? 1 - t * t * (3 - 2 * t) : 0;
        tile.style.setProperty('--spot', spot.toFixed(3));
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [layout, settings.direction, settings.speed, settings.spotlight]);

  const rowTiles = layout
    ? Array.from({ length: settings.rows }, (_, row) =>
        Array.from({ length: layout.perRow }, (_, index) => tiles.length ? tiles[(row * layout.perRow + index) % tiles.length] : { kind: 'empty' })
      )
    : [];
  const mask = settings.fade > 0
    ? `linear-gradient(to right, transparent, black ${settings.fade * 18}%, black ${100 - settings.fade * 18}%, transparent), linear-gradient(to bottom, transparent, black ${settings.fade * 22}%, black ${100 - settings.fade * 22}%, transparent)`
    : undefined;

  return (
    <div
      ref={rootRef}
      className={`grid-motion${grayscale ? ' grid-motion--gray' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--gm-tile': '#15191c',
        '--gm-text': 'rgba(255,255,255,.78)',
        '--gm-border': 'rgba(255,255,255,.1)',
        '--gm-radius': `${Math.max(0, radius)}px`,
        '--gm-dim': settings.dim,
        maskImage: mask,
        WebkitMaskImage: mask,
        ...style,
      }}
    >
      {layout && (
        <div
          ref={planeRef}
          className="grid-motion__plane"
          aria-hidden="true"
          style={{
            width: layout.planeWidth,
            height: layout.planeHeight,
            transform: `translate(-50%, -50%) rotateX(${settings.tilt}deg) rotateZ(${settings.angle}deg)`,
            '--gm-gap': `${settings.gap}px`,
            '--gm-tile-w': `${layout.tileWidth}px`,
            '--gm-tile-h': `${layout.tileHeight}px`,
          }}
        >
          {rowTiles.map((sequence, row) => (
            <div key={row} className="grid-motion__row" style={{ top: layout.top + row * (layout.tileHeight + settings.gap) }}>
              {Array.from({ length: 3 * layout.perRow }, (_, index) => <Tile key={index} tile={sequence[index % layout.perRow]} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
