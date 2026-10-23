'use client';

import { useState } from 'react';
import TiltedCard from './react-bits/TiltedCard.jsx';
import './ProfileEdgeCards.css';

// S6 右栏 · 4 张 4:3 横向翻面卡（hover 翻到背面，离开翻回正面）
// 正面 = 可交付能力；背面 = 对应的执行证据。
const EDGE = [
  {
    k: 'PROJECT CONTROL',
    q: '复杂项目可交付',
    a: '需求拆解、流程统筹、进度与成本控制，保证项目往前走。',
  },
  {
    k: 'FULL DELIVERY',
    q: '从想法到成片',
    a: '剧本、分镜、资产、生成、剪辑、调色、声音和宣发一条链路完成。',
  },
  {
    k: 'CONSISTENCY',
    q: '资产与镜头稳定',
    a: '通过角色、场景和风格约束，控制跨镜头的一致性。',
  },
  {
    k: 'COST CONTROL',
    q: '把算力用在关键处',
    a: '按任务选模型，先校验提示词和规格，减少无效生成。',
  },
];

function EdgeCard({ e }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="pec-cell"
      onPointerEnter={() => setFlipped(true)}
      onPointerLeave={() => setFlipped(false)}
    >
      <TiltedCard
        className="pec-tilt"
        containerWidth="100%"
        containerHeight="100%"
        imageWidth="100%"
        imageHeight="100%"
        radius={14}
        rotateAmplitude={9}
        glare={0.4}
        shadow={0.5}
        scaleOnHover={1.03}
        flipOnClick={false}
        flipped={flipped}
        backContent={
          <div className="pec-face pec-back">
            <span className="pec-k">{e.k}</span>
            <p className="pec-a">{e.a}</p>
          </div>
        }
      >
        <div className="pec-face pec-front">
          <span className="pec-k pec-k--front">{e.k}</span>
          <p className="pec-q">{e.q}</p>
          <p className="pec-hint">查看执行证据 →</p>
        </div>
      </TiltedCard>
    </div>
  );
}

export default function ProfileEdgeCards() {
  return (
    <div className="pec-grid">
      {EDGE.map((e) => (
        <EdgeCard key={e.k} e={e} />
      ))}
    </div>
  );
}
