/*
 * S2 · 精选作品 · FlexCarousel + 点开播视频弹层
 *
 * 设计约束（勿破坏）：
 *  - FlexCarousel 只负责呈现封面和低速连续位移；点击封面由本组件弹出 B 站视频层。
 *  - 视频弹层 iframe 必须 clip-path: inset(0 round 14px) 裁掉 B 站合成层越界的白底
 *    （同 domn 历史事故：跨域 iframe 白底泄漏）。
 *  - 弹层用 position: fixed 覆盖整屏，z-index 高于 LightRays 与内容层。
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FlexCarousel from './FlexCarousel';
import './FeaturedGallery.css';

export default function FeaturedGallery({ items }) {
  const [video, setVideo] = useState(null); // { embed, title }

  const carouselItems = items.map((item) => ({
    ...item,
    src: item.image,
    title: item.text,
    subtitle: item.description || undefined,
  }));

  const openVideo = (item) => {
    if (item && item.embed) setVideo({ embed: item.embed, title: item.text || item.alt || '影片', detailUrl: item.detailUrl || '' });
  };
  const closeVideo = () => setVideo(null);

  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeVideo();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [video]);

  return (
    <div className="fg-wrap">
      <FlexCarousel
        items={carouselItems}
        preset="liquid"
        intro="bloom"
        cardHeight={0.62}
        gap={24}
        radius={18}
        fit="portrait"
        focusOnClick={false}
        centerOnClick
        autoplay
        interval={3}
        captureWheel={false}
        onSelect={(_, item) => openVideo(item)}
      />

      {/* 视频弹层走 portal 挂到 body：避免被任何祖先的 transform/stacking 约束
          （否则 fixed 失效、盖不住 topbar z30），且 z 高于全站一切层级。 */}
      {video &&
        createPortal(
          <div className="fg-modal" role="dialog" aria-modal="true" onClick={closeVideo}>
            <div className="fg-modal__box">
              <button className="fg-modal__close" type="button" aria-label="关闭" onClick={closeVideo}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <div className="fg-modal__frame">
                <iframe
                  className="fg-modal__iframe"
                  src={`${video.embed}${video.embed.includes('?') ? '&' : '?'}autoplay=1`}
                  title={video.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {video.detailUrl && (
                <a className="fg-modal__cta" href={video.detailUrl}>
                  <span>查看影片详情</span>
                  <svg className="fg-modal__cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
