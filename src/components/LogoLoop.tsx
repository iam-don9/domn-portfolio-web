// @ts-nocheck
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import './LogoLoop.css';

const ANIMATION_CONFIG = { MIN_COPIES: 2, COPY_HEADROOM: 2 };

const toCssLength = value => (typeof value === 'number' ? `${value}px` : (value ?? undefined));

const useResizeObserver = (callback, elements, dependencies) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener('resize', handleResize);
      callback();
      return () => window.removeEventListener('resize', handleResize);
    }
    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });
    callback();
    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [callback, elements, dependencies]);
};

const useImageLoader = (seqRef, onLoad, dependencies) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) {
      onLoad();
      return;
    }
    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) onLoad();
    };
    images.forEach(img => {
      const htmlImg = img;
      if (htmlImg.complete) {
        handleImageLoad();
      } else {
        htmlImg.addEventListener('load', handleImageLoad, { once: true });
        htmlImg.addEventListener('error', handleImageLoad, { once: true });
      }
    });
    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
  }, [onLoad, seqRef, dependencies]);
};

interface LogoLoopProps {
  logos: { src: string; alt: string; title: string }[];
  speed?: number;
  direction?: string;
  width?: string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem: (item: { src: string; alt: string; title: string }, key?: number) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export const LogoLoop = memo(
  ({
    logos,
    speed = 120,
    direction = 'left',
    width = '100%',
    logoHeight = 28,
    gap = 32,
    pauseOnHover,
    hoverSpeed,
    fadeOut = false,
    fadeOutColor,
    scaleOnHover = false,
    renderItem,
    ariaLabel = 'Partner logos',
    className,
    style
  }: LogoLoopProps) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const seqRef = useRef(null);

    const [seqWidth, setSeqWidth] = useState(0);
    const [seqHeight, setSeqHeight] = useState(0);
    const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);

    const effectiveHoverSpeed = useMemo(() => {
      if (hoverSpeed !== undefined) return hoverSpeed;
      if (pauseOnHover === true) return 0;
      if (pauseOnHover === false) return undefined;
      return 0;
    }, [hoverSpeed, pauseOnHover]);

    const isVertical = direction === 'up' || direction === 'down';
    const isRight = direction === 'right';
    const isDown = direction === 'down';

    // 测量「一个完整序列」的平铺周期：水平取相邻两份副本左缘间距（含尾随 gap），
    // 垂直取序列高度。改 CSS 动画用 var(--seq-width/height) 平移整一个周期即无缝循环。
    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const lists = trackRef.current?.querySelectorAll('.logoloop__list');
      const firstList = lists?.[0];
      const secondList = lists?.[1];

      if (isVertical) {
        const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0;
        if (containerRef.current && parentHeight > 0) {
          const targetHeight = Math.ceil(parentHeight);
          if (containerRef.current.style.height !== `${targetHeight}px`)
            containerRef.current.style.height = `${targetHeight}px`;
        }
        const sequenceHeight = seqRef.current?.getBoundingClientRect()?.height ?? 0;
        if (sequenceHeight > 0) {
          setSeqHeight(Math.ceil(sequenceHeight));
          const viewport = containerRef.current?.clientHeight ?? parentHeight ?? sequenceHeight;
          const copiesNeeded = Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM;
          setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
        }
      } else {
        let period = 0;
        if (firstList && secondList) {
          period = secondList.getBoundingClientRect().left - firstList.getBoundingClientRect().left;
        } else if (firstList) {
          period = firstList.getBoundingClientRect().width;
        }
        period = Math.round(period);
        if (period > 0) {
          setSeqWidth(period);
          const copiesNeeded = Math.ceil(containerWidth / period) + ANIMATION_CONFIG.COPY_HEADROOM;
          setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
        }
      }
    }, [isVertical]);

    // 依赖数组必须是稳定引用：否则每次 render 都新建数组 → 两个 effect 每帧重跑 →
    // updateDimensions 里的 setState 又触发 render → 无限更新（React 报
    // "Maximum update depth exceeded"）。缓存后 effect 只在真正变化时重跑。
    const resizeElements = useMemo(() => [containerRef, seqRef], []);
    const layoutDeps = useMemo(
      () => [logos, gap, logoHeight, isVertical],
      [logos, gap, logoHeight, isVertical]
    );
    useResizeObserver(updateDimensions, resizeElements, layoutDeps);

    useImageLoader(seqRef, updateDimensions, layoutDeps);

    // 平滑刹车：hover 进入把跑马灯速度（playbackRate）缓动到 0，移开缓动回 1。
    // 取代原 animation-play-state:paused 的瞬时冻结——瞬停会被读成顿挫/回弹。
    // playbackRate=1 时仍是合成器驱动、零主线程成本；仅 hover 进/出那几百 ms 跑一个 rAF。
    const brakeRafRef = useRef<number | null>(null);
    const speedCurRef = useRef(1);
    const speedTargetRef = useRef(1);
    const lastTsRef = useRef(0);

    const rampSpeed = useCallback((ts: number) => {
      const trackEl = trackRef.current as any;
      const anims: any[] =
        typeof trackEl?.getAnimations === 'function' ? trackEl.getAnimations({ subtree: false }) : [];
      const anim = anims.find((a: any) => a.playState === 'running' || a.playState === 'paused');
      if (!anim) {
        brakeRafRef.current = null;
        return;
      }
      const dt = lastTsRef.current ? Math.min(0.05, (ts - lastTsRef.current) / 1000) : 1 / 60;
      lastTsRef.current = ts;
      const tau = 0.1; // 时间常数 ~100ms：约 300–350ms 平滑刹停 / 加速
      speedCurRef.current += (speedTargetRef.current - speedCurRef.current) * (1 - Math.exp(-dt / tau));
      const settled = Math.abs(speedTargetRef.current - speedCurRef.current) < 0.02;
      anim.playbackRate = Math.max(0, Math.min(1, settled ? speedTargetRef.current : speedCurRef.current));
      if (settled) {
        speedCurRef.current = speedTargetRef.current;
        brakeRafRef.current = null;
        return;
      }
      brakeRafRef.current = requestAnimationFrame(rampSpeed);
    }, []);

    const brakeTo = useCallback(
      (target: number) => {
        if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
          return;
        speedTargetRef.current = target;
        if (brakeRafRef.current == null) brakeRafRef.current = requestAnimationFrame(rampSpeed);
      },
      [rampSpeed]
    );

    useEffect(
      () => () => {
        if (brakeRafRef.current != null) cancelAnimationFrame(brakeRafRef.current);
      },
      []
    );

    const animSize = isVertical ? seqHeight : seqWidth;
    const loopDuration = animSize > 0 && speed ? animSize / Math.abs(speed) : 0;

    const cssVariables = useMemo(
      () => ({
        '--logoloop-gap': `${gap}px`,
        '--logoloop-logoHeight': `${logoHeight}px`,
        '--seq-width': `${seqWidth}px`,
        '--seq-height': `${seqHeight}px`,
        '--loop-duration': `${loopDuration}s`,
        ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor })
      }),
      [gap, logoHeight, seqWidth, seqHeight, loopDuration, fadeOutColor]
    );

    const rootClassName = useMemo(
      () =>
        [
          'logoloop',
          isVertical ? 'logoloop--vertical' : 'logoloop--horizontal',
          isRight && 'logoloop--right',
          isDown && 'logoloop--down',
          fadeOut && 'logoloop--fade',
          scaleOnHover && 'logoloop--scale-hover',
          effectiveHoverSpeed === 0 && 'logoloop--pause-hover',
          loopDuration === 0 && 'logoloop--static',
          className
        ]
          .filter(Boolean)
          .join(' '),
      [isVertical, isRight, isDown, fadeOut, scaleOnHover, effectiveHoverSpeed, loopDuration, className]
    );

    const renderLogoItem = useCallback(
      (item, key) => {
        if (renderItem) {
          return (
            <li className="logoloop__item" key={key} role="listitem">
              {renderItem(item, key)}
            </li>
          );
        }
        const isNodeItem = 'node' in item;
        const content = isNodeItem ? (
          <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>
            {item.node}
          </span>
        ) : (
          <img
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes}
            width={item.width}
            height={item.height}
            alt={item.alt ?? ''}
            title={item.title}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        );
        const itemAriaLabel = isNodeItem ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);
        const itemContent = item.href ? (
          <a
            className="logoloop__link"
            href={item.href}
            aria-label={itemAriaLabel || 'logo link'}
            target="_blank"
            rel="noreferrer noopener"
          >
            {content}
          </a>
        ) : (
          content
        );
        return (
          <li className="logoloop__item" key={key} role="listitem">
            {itemContent}
          </li>
        );
      },
      [renderItem]
    );

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="logoloop__list"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            ref={copyIndex === 0 ? seqRef : undefined}
          >
            {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
          </ul>
        )),
      [copyCount, logos, renderLogoItem]
    );

    const containerStyle = useMemo(
      () => ({
        width: isVertical
          ? toCssLength(width) === '100%'
            ? undefined
            : toCssLength(width)
          : (toCssLength(width) ?? '100%'),
        ...cssVariables,
        ...style
      }),
      [width, cssVariables, style, isVertical]
    );

    return (
      <div
        ref={containerRef}
        className={rootClassName}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onPointerEnter={() => {
          if (effectiveHoverSpeed === 0) brakeTo(0);
        }}
        onPointerLeave={() => {
          if (effectiveHoverSpeed === 0) brakeTo(1);
        }}
      >
        <div className="logoloop__track" ref={trackRef}>
          {logoLists}
        </div>
      </div>
    );
  }
);

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
