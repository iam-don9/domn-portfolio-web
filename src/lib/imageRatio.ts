import sharp from 'sharp';

const ratioCache = new Map<string, number>();

/**
 * 返回图片宽高比（width / height）；读取失败返回 1（按横图处理）。
 * pp-card 用它计算竖图在 16:9 卡片上的占位宽度：宽度% = 9/16 × ratio。
 * 路径相对项目根，如 `public/media/ai-video/<slug>/a1.webp`。
 */
export async function getAspectRatio(filePath: string): Promise<number> {
  const hit = ratioCache.get(filePath);
  if (hit !== undefined) return hit;
  try {
    const meta = await sharp(filePath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const ratio = w > 0 && h > 0 ? w / h : 1;
    ratioCache.set(filePath, ratio);
    return ratio;
  } catch {
    ratioCache.set(filePath, 1);
    return 1;
  }
}

/**
 * 判断媒体文件是否为竖构图（高 > 宽）。
 * 卡片轮播需要按朝向决定覆盖范围：16:9 覆盖整卡，竖图只覆盖左侧图区。
 */
export async function isPortrait(filePath: string): Promise<boolean> {
  return (await getAspectRatio(filePath)) < 1;
}
