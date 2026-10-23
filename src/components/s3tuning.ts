// S3 调参：尺寸 / 距离 等参数集中定义，供 SkillFolder（消费端）与
// S3TuningPanel（浮层调节端）共享同一份类型与默认值。
// 用户可在页面悬浮面板里手动拖动，把满意的数值复制回给我，我再写死进代码。

export interface S3Tuning {
  /** 文件夹整体尺寸（Folder 的 size prop）。影响文件夹与卡片的绝对大小 */
  folderSize: number;
  /** 卡片宽高比 = 宽 / 高（Folder 的 itemAspect prop）。1.79 ≈ 1088×608 横封面 */
  cardAspect: number;
  /** 点开后的卡片放大倍数（--s3-scale），围绕文件夹中心缩放 */
  openScale: number;
  /** 三个文件夹列之间的间距（rem） */
  colGap: number;
  /** 点开后卡片行相对文件夹中心的垂直抬升（px），正负可上下移 */
  liftY: number;
  /** 点开单行里卡片之间的间距倍率（Folder 的 cardGap prop，1 = 引擎默认） */
  cardGap: number;
  /** 文件夹整体相对居中位置的垂直下移（px），正=下移，给展开卡片让出顶部空间、避免压到标题 */
  folderDrop: number;
}

export const S3_DEFAULTS: S3Tuning = {
  folderSize: 1.1,
  cardAspect: 1.7895,
  openScale: 2.2,
  colGap: 6,
  liftY: -160,
  cardGap: 3,
  folderDrop: 120
};

// 浮层里每个滑块的展示配置：标签、最小值、最大值、步长、单位。
export interface S3KnobMeta {
  key: keyof S3Tuning;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  /** 数值格式化（用于读数展示） */
  fmt?: (v: number) => string;
}

export const S3_KNOBS: S3KnobMeta[] = [
  { key: 'folderSize', label: '文件夹尺寸', min: 0.6, max: 1.3, step: 0.01, unit: '' },
  { key: 'cardAspect', label: '卡片宽高比 (宽/高)', min: 1.0, max: 2.4, step: 0.01, unit: '' },
  { key: 'openScale', label: '点开放大倍数', min: 1.0, max: 2.2, step: 0.01, unit: '×' },
  { key: 'colGap', label: '列间距', min: 0, max: 6, step: 0.1, unit: 'rem' },
  { key: 'liftY', label: '垂直抬升', min: -160, max: 160, step: 1, unit: 'px' },
  { key: 'cardGap', label: '卡片间距倍率', min: 0.2, max: 3, step: 0.05, unit: '×' },
  { key: 'folderDrop', label: '文件夹下移', min: 0, max: 320, step: 4, unit: 'px' }
];
