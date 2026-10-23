'use client';

import { useState, useEffect } from 'react';
import SkillFolder from './SkillFolder';
import type { Category } from './SkillFolder';
import { S3_DEFAULTS } from './s3tuning';

// S3 舞台：以固定默认参数驱动 SkillFolder（调参面板已取消，参数回到写死的默认组）。
export default function S3Stage({ categories }: { categories: Category[] }) {
  const [vwFactor, setVwFactor] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
      setVwFactor(Math.min(1.2, Math.max(0.6, w / 1440)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const effectiveCardGap = S3_DEFAULTS.cardGap * vwFactor;

  return (
    <SkillFolder categories={categories} tuning={S3_DEFAULTS} cardGap={effectiveCardGap} />
  );
}
