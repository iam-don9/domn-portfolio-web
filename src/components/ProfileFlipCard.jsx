'use client';

import { useState } from 'react';
import TiltedCard from './react-bits/TiltedCard.jsx';
import './ProfileFlipCard.css';

// S6 右栏 · 单张 3:4 翻面卡（hover 翻到背面，离开翻回正面）
// 正面 = 工程管理优势「封面」（4 个能力锚点）；背面 = 用该优势回击「转行」疑虑的 4 组问答。
// 图片字段预留（frontImg / backImg）：后续填真图无需改此组件。
const EDGE = [
  {
    k: '拆解',
    q: '你做了十年建筑，现在转行做 AI 视频，之前的经验不就白费了？',
    a: '没白费，只是把同一套拆解法换了个战场。一条片子，我拆成镜头表、生成单元和混音时序，像排 WBS 一样排创意，每一镜都能单独交付。',
  },
  {
    k: '协调',
    q: 'AI 视频一个人怎么做得完？你又不会亲手画、不会演。',
    a: '导演本来就不亲手画。美术、生成、剪辑在我这像分包商，靠规格和约束表对齐，不靠反复返工。跨工种不扯皮，才是真功夫。',
  },
  {
    k: '交付',
    q: 'AI 生成不就是抽卡吗？质量怎么稳得住？',
    a: '抽卡看运气，交付看流程。我有固定的生产节奏和版本控制，成片可回溯、可复现。你拿到的是稳定产出，不是开盲盒。',
  },
  {
    k: '风控',
    q: '环摇长镜、多人同框这些 AI 的硬伤，你真搞得定？',
    a: '硬伤不是不能碰，是先看清、先拆解。我把风险拆成可验证的子任务，把雷排在上线前，而不是等渲染完才救火。',
  },
];

function FrontFace() {
  return (
    <div className="pfc-face pfc-front">
      <div className="pfc-top">
        <p className="pfc-eyebrow">OPERATOR EDGE · 工程管理优势</p>
        <h3 className="pfc-headline">把十年工程管控，<br />变成 AI 视频的稳定交付</h3>
      </div>
      <div className="pfc-tags">
        {EDGE.map((e) => (
          <span className="pfc-tag" key={e.k}>{e.k}</span>
        ))}
      </div>
      <p className="pfc-hint">悬停翻面 → 看我如何回答「转行」的质疑</p>
    </div>
  );
}

function BackFace() {
  return (
    <div className="pfc-face pfc-back">
      <p className="pfc-back-eyebrow">为什么我能做好 AI 视频</p>
      <div className="pfc-qa-list">
        {EDGE.map((e) => (
          <div className="pfc-qa" key={e.k}>
            <p className="pfc-q"><span className="pfc-k">{e.k}</span>　{e.q}</p>
            <p className="pfc-a">{e.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileFlipCard() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="pfc-wrap"
      onPointerEnter={() => setFlipped(true)}
      onPointerLeave={() => setFlipped(false)}
    >
      <TiltedCard
        className="pfc-card"
        containerWidth="100%"
        containerHeight="100%"
        imageWidth="100%"
        imageHeight="100%"
        radius={16}
        rotateAmplitude={10}
        glare={0.42}
        shadow={0.55}
        scaleOnHover={1.04}
        flipOnClick={false}
        flipped={flipped}
        backContent={<BackFace />}
      >
        <FrontFace />
      </TiltedCard>
    </div>
  );
}
