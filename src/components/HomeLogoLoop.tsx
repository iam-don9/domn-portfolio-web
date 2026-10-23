import type { ReactNode } from 'react';
import LogoLoop from './LogoLoop';

/* 真实创作/工具品牌标（11 个，单色灰，public/brand/loop/*.svg）。
   按类型分组：① 图像/视频创作 ② AI 对话/编码 ③ 平台。
   无链接（纯装饰），hover 自绘 tooltip 只显示名称。 */
const logos: { src: string; alt: string; title: string }[] = [
  { src: '/brand/loop/photoshop.svg', alt: 'Photoshop', title: 'Photoshop' },
  { src: '/brand/loop/midjourney.svg', alt: 'Midjourney', title: 'Midjourney' },
  { src: '/brand/loop/minimax.svg', alt: 'Minimax', title: 'Minimax' },
  { src: '/brand/loop/davinciresolve.svg', alt: 'DaVinci Resolve', title: 'DaVinci Resolve' },
  { src: '/brand/loop/premierepro.svg', alt: 'Premiere Pro', title: 'Premiere Pro' },
  { src: '/brand/loop/chatgpt.svg', alt: 'ChatGPT', title: 'ChatGPT' },
  { src: '/brand/loop/gemini.svg', alt: 'Gemini', title: 'Gemini' },
  { src: '/brand/loop/claude.svg', alt: 'Claude', title: 'Claude' },
  { src: '/brand/loop/deepseek.svg', alt: 'DeepSeek', title: 'DeepSeek' },
  { src: '/brand/loop/trae.svg', alt: 'Trae', title: 'Trae' },
  { src: '/brand/loop/github.svg', alt: 'GitHub', title: 'GitHub' },
];

// 自绘 hover tooltip（只显示品牌名），浮于 bar 上方，不被 overflow 裁掉
const renderLogo = (item: { src: string; alt: string; title: string }): ReactNode => (
  <span className="loop-logo">
    <img src={item.src} alt={item.alt} />
    <span className="loop-logo__tip">{item.title}</span>
  </span>
);

export default function HomeLogoLoop() {
  return (
    /* width/minWidth 必须显式给：<astro-island> 是 display:contents，这层 div 直接成为
       .loopbar 的 flex item，min-width:auto 会被 max-content 的轨道撑开（正反馈）。
       占满宽度 + min-width:0 后，容器宽度只由 loopbar 决定。 */
    <div
      style={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <LogoLoop
        logos={logos}
        renderItem={renderLogo}
        speed={60}
        direction="left"
        logoHeight={30}
        gap={52}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#000000"
        ariaLabel="创作工具 / 品牌"
      />
    </div>
  );
}
