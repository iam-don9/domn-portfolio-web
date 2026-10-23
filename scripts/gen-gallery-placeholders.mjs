// 生成画廊占位图（SVG）。用户后续上传真实照片时，直接替换
// public/media/gallery/placeholder-XX.svg 即可，文件名保持不变。
// 运行：node scripts/gen-gallery-placeholders.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = resolve('public/media/gallery');
mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 800;

const items = [
  { n: '01', title: '进化论：牧狼人', sub: '白骨王座 · 暗黑奇幻', c1: '#0a1c1a', c2: '#052b26' },
  { n: '02', title: '雨巷', sub: '姐姐战损 · 写实动作', c1: '#101418', c2: '#0a1d22' },
  { n: '03', title: '十二大战', sub: '生肖轮转 · 角色 PV', c1: '#14110f', c2: '#231a12' },
  { n: '04', title: '龙之守护者', sub: '神龙降临 · 东方奇幻', c1: '#0a161c', c2: '#07242b' },
  { n: '05', title: '韩式分手', sub: '练习片段 · 文戏节奏', c1: '#141316', c2: '#1d1622' },
  { n: '06', title: '投篮对决', sub: '练习片段 · 运动镜头', c1: '#101418', c2: '#12201d' },
  { n: '07', title: '雾港', sub: '霓虹夜行 · 城市质感', c1: '#0b1018', c2: '#101a26' },
  { n: '08', title: '静物研究', sub: '材质与光 · 视觉探索', c1: '#14130f', c2: '#221f12' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const svg = (it) => {
  let grid = '';
  for (let x = 120; x < W; x += 120) {
    grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" />`;
  }
  for (let y = 120; y < H; y += 120) {
    grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${it.c1}"/>
      <stop offset="1" stop-color="${it.c2}"/>
    </linearGradient>
    <radialGradient id="r" cx="0.72" cy="0.32" r="0.85">
      <stop offset="0" stop-color="rgba(0,184,148,0.20)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#r)"/>
  <g stroke="rgba(255,255,255,0.05)" stroke-width="1">${grid}</g>
  <text x="64" y="150" font-family="ui-monospace, monospace" font-size="118" font-weight="700" fill="rgba(244,245,247,0.14)">${it.n}</text>
  <text x="64" y="${H - 132}" font-family="'LogoSCUnboundedSans','AlimamaFangYuanTi',sans-serif" font-size="58" font-weight="700" fill="#f4f5f7">${esc(it.title)}</text>
  <text x="66" y="${H - 84}" font-family="ui-monospace, monospace" font-size="26" letter-spacing="1" fill="rgba(183,188,196,0.72)">${esc(it.sub)}</text>
  <text x="${W - 64}" y="${H - 64}" text-anchor="end" font-family="ui-monospace, monospace" font-size="22" fill="rgba(118,125,136,0.85)">PLACEHOLDER · 占位图</text>
</svg>`;
};

for (const it of items) {
  writeFileSync(resolve(OUT, `placeholder-${it.n}.svg`), svg(it));
  console.log('wrote placeholder-' + it.n + '.svg');
}
console.log('done: ' + items.length + ' placeholders');
