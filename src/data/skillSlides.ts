// skillSlides.ts · 技能 deck 清单
// 每个 skill 的「深度演示」由 zara-frontend-slides 引擎产出为独立 HTML 文件。
// en -> deck HTML 路径（位于 public/slides/）。
// 有 entry → 弹层内嵌 iframe 展示；无 entry → SkillSlides 自动渲染「演示整理中」占位。

export interface SkillMeta {
  en: string;
  name: string;
  category: string;
}

export const SKILL_DECKS: Record<string, string> = {
  'domn-ip-visual': '/slides/domn-ip-visual.html',
  'domn-character-poster': '/slides/domn-character-poster.html',
  'domn-image-ipsticker-generator': '/slides/domn-image-ipsticker-generator.html',
  'domn-cover': '/slides/domn-cover.html',
  'domn-film-scifi-short-film': '/slides/domn-film-scifi-short-film.html',
  'domn-film-screenplay-save-the-cat': '/slides/domn-film-screenplay-save-the-cat.html',
  'domn-film-seedance-format': '/slides/domn-film-seedance-format.html',
  'domn-film-character-showcase': '/slides/domn-film-character-showcase.html',
  'domn-film-action-director': '/slides/domn-film-action-director.html',
  'domn-film-henshin-director': '/slides/domn-film-henshin-director.html',
  'domn-film-style-deconstruct': '/slides/domn-film-style-deconstruct.html',
  'domn-film-kamen-raider': '/slides/domn-film-kamen-raider.html',
  'domn-film-ironic-upgrade': '/slides/domn-film-ironic-upgrade.html',
  'domn-director-emotion-review': '/slides/domn-director-emotion-review.html',
};
