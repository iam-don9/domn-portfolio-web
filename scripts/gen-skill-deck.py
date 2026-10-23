# -*- coding: utf-8 -*-
"""
gen-skill-deck.py · 技能 deck 生成器 (domn-portfolio-web)
数据源：
  1) scripts/skill-decks-data.py  —— 手写数据（视觉类，图文 deck）
  2) scripts/text-decks-extract.json —— 文字类抽取数据（agent 从技能源文档摘录）
输出：public/slides/<en>.html

纪律参照 zara bold-template-pack/templates/broadside/design.md：
单一 accent / flat 无圆角 / 1px hairline / mono chrome / / 形 bullet /
36x2 stub rule / 收敛 3 条 / CJK 行高 1.75+ / 标题无句号。
"""
import html as html_mod
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HERE = Path(__file__).resolve().parent
DATA = HERE / "skill-decks-data.py"
EXTRACT = HERE / "text-decks-extract.json"
OUT = ROOT / "public" / "slides"

SCAFFOLD = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>[[TITLE]]</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<style>
/* ===== FIXED 16:9 STAGE (zara-frontend-slides) ===== */
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #0a0c0e; }
.deck-viewport { position: fixed; inset: 0; overflow: hidden; background: #0a0c0e; }
.deck-stage { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; transform-origin: 0 0; background: #0a0c0e; }
.slide { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; display: block; visibility: hidden; opacity: 0; pointer-events: none; background: #0a0c0e; }
.slide.active, .slide.visible { visibility: visible; opacity: 1; pointer-events: auto; z-index: 1; }
img, video, canvas, svg { max-width: 100%; max-height: 100%; }
.deck-controls { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 1000; }
@media print {
  html, body { width: 1920px; height: auto; overflow: visible; background: #fff; }
  .deck-viewport { position: static; overflow: visible; background: #fff; }
  .deck-stage { position: static; width: auto; height: auto; transform: none !important; background: none; }
  .slide { position: relative; display: block !important; visibility: visible !important; opacity: 1 !important; width: 1920px; height: 1080px; break-after: page; page-break-after: always; }
  .slide:last-child { break-after: auto; page-break-after: auto; }
  .deck-controls { display: none !important; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; } }

/* ===== THEME — DOMN dark · broadside 纪律 ===== */
:root {
  --bg: #0a0c0e; --line: #232a31; --text: #f4f5f7; --muted: #8b929b; --hint: #57616c;
  --accent: #88a9bd;
  --display: 'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --mono: 'Space Mono', 'PingFang SC', 'Microsoft YaHei', ui-monospace, monospace;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-content { position: absolute; inset: 0; padding: 60px 96px 48px; display: flex; flex-direction: column; background: #0a0c0e; }
.chrome { display: flex; justify-content: space-between; align-items: baseline; font-family: var(--mono); font-size: 17px; color: var(--hint); border-bottom: 1px solid var(--line); padding-bottom: 14px; }
.chrome .cn { color: var(--accent); }
.chrome .en { letter-spacing: 0.14em; text-transform: uppercase; }
.foot { margin-top: auto; border-top: 1px solid var(--line); padding-top: 14px; display: flex; justify-content: space-between; font-family: var(--mono); font-size: 17px; color: var(--hint); }
.kicker { font-family: var(--mono); font-size: 20px; color: var(--accent); margin: 30px 0 16px; }
.s-h { font-family: var(--display); font-weight: 700; font-size: 72px; line-height: 1.12; letter-spacing: -0.015em; margin: 0; color: var(--text); }
.stub { width: 36px; height: 2px; background: var(--accent); margin-top: 26px; }
.lead { font-family: var(--display); font-size: 27px; line-height: 1.75; color: var(--muted); max-width: 1480px; margin: 24px 0 0; }
.vmeta { font-family: var(--mono); font-size: 18px; color: var(--hint); margin: 14px 0 0; letter-spacing: 0.06em; }
.reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.5s var(--ease), transform 0.5s var(--ease); }
.slide.visible .reveal { opacity: 1; transform: none; }
.slide.visible .reveal:nth-child(1) { transition-delay: 0.06s; }
.slide.visible .reveal:nth-child(2) { transition-delay: 0.14s; }
.slide.visible .reveal:nth-child(3) { transition-delay: 0.22s; }
.slide.visible .reveal:nth-child(4) { transition-delay: 0.30s; }
.slide.visible .reveal:nth-child(5) { transition-delay: 0.38s; }
.slide.visible .reveal:nth-child(6) { transition-delay: 0.46s; }
.plist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 24px; }
.plist li { font-family: var(--display); font-size: 28px; line-height: 1.6; color: var(--text); padding-left: 36px; position: relative; }
.plist li::before { content: "/"; position: absolute; left: 0; top: 0; font-family: var(--mono); font-weight: 700; color: var(--accent); }
.pcard { border-top: 2px solid var(--accent); padding-top: 26px; }
.pcard .lab { font-family: var(--mono); font-size: 18px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 18px; }
.pcard p { font-family: var(--display); font-size: 27px; line-height: 1.75; color: var(--text); margin: 0; }
.show-body { display: grid; grid-template-columns: 440px 1fr; gap: 24px; flex: 1; min-height: 0; margin-top: 26px; }
.mgrid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; min-height: 0; }
.fig { border: 1px solid var(--line); margin: 0; overflow: hidden; display: flex; flex-direction: column; min-height: 0; background: #10141a; }
.fig img { width: 100%; flex: 1; min-height: 0; object-fit: cover; display: block; }
.fig figcaption { font-family: var(--mono); font-size: 16px; color: var(--muted); padding: 10px 14px; border-top: 1px solid var(--line); letter-spacing: 0.04em; flex: none; }
.split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 72px; margin: auto 0; padding: 20px 0; }
.struct { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 64px; flex: 1; align-items: start; margin-top: 30px; }
.tree { font-family: var(--mono); font-size: 23px; line-height: 1.95; color: var(--text); border: 1px solid var(--line); padding: 28px 32px; margin: 0; background: transparent; white-space: pre; }
.tree .dir { color: var(--accent); }
.tree .fname { color: var(--text); }
.tree .cmt { color: var(--hint); }
.filerow { display: flex; flex-direction: column; gap: 30px; }
.fcard { border-top: 2px solid var(--accent); padding: 24px 0 0; }
.fcard .fl { font-family: var(--mono); font-size: 22px; letter-spacing: 0.06em; color: var(--accent); margin: 0 0 14px; }
.fcard p { font-family: var(--display); font-size: 24px; line-height: 1.65; color: var(--text); margin: 0; }
.fcard .meta-tags { font-family: var(--mono); font-size: 17px; color: var(--hint); margin: 14px 0 0; line-height: 1.7; }
.fgrid { display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); margin-top: 30px; }
.fcell { border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 24px 22px 28px; display: flex; flex-direction: column; gap: 12px; min-height: 150px; }
.fcell .fn { font-family: var(--mono); font-size: 22px; color: var(--accent); }
.fcell p { font-family: var(--display); font-size: 22px; line-height: 1.5; color: var(--text); margin: 0; }
/* 图墙：竖版海报 / 封面 / 方形贴纸，contain 保完整不裁切 */
.pwall { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; flex: 1; min-height: 0; margin-top: 26px; }
.swall { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: 1fr 1fr; gap: 20px; flex: 1; min-height: 0; margin-top: 26px; }
.pwall .fig img, .swall .fig img { object-fit: contain; }
/* 文字类样张页 */
.ex-single { border: 1px solid var(--line); background: #0d1116; padding: 26px 30px; margin: 28px 0 auto; flex: none; max-width: 1560px; }
.ex-single pre { font-family: var(--mono); font-size: 21px; line-height: 1.8; color: #d7dde3; margin: 0; white-space: pre-wrap; word-break: break-word; overflow: hidden; }
.ex-note { font-family: var(--mono); font-size: 16px; color: var(--hint); margin: 14px 0 0; padding-top: 12px; border-top: 1px dashed var(--line); }
</style>
</head>
<body>
<div class="deck-viewport">
  <main class="deck-stage" id="deckStage">
[[SLIDES]]
  </main>
</div>
<script>
class SlidePresentation {
  constructor() {
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.current = 0;
    this.stage = document.getElementById('deckStage');
    this.setupStageScale();
    this.setupKeyboardNav();
    this.setupTouchNav();
    this.setupWheelNav();
    this.showSlide(0);
  }
  setupStageScale() {
    if (window.top !== window.self) return;
    const fit = () => {
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = document.documentElement.clientHeight || window.innerHeight;
      const f = Math.min(vw / 1920, vh / 1080);
      this.stage.style.transformOrigin = '0 0';
      this.stage.style.transform = `translate(${(vw - 1920 * f) / 2}px, ${(vh - 1080 * f) / 2}px) scale(${f})`;
    };
    fit();
    window.addEventListener('resize', fit);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(document.documentElement);
  }
  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); this.next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); this.prev(); }
      else if (e.key === 'Escape') { try { parent.postMessage({ type: 'skillSlidesClose' }, '*'); } catch (_) {} }
    });
  }
  setupTouchNav() {
    let sx = 0, sy = 0;
    this.stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    this.stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? this.next() : this.prev(); }
    }, { passive: true });
  }
  setupWheelNav() {
    let lock = false;
    window.addEventListener('wheel', (e) => {
      if (lock) return; lock = true; setTimeout(() => (lock = false), 600);
      e.deltaY > 0 ? this.next() : this.prev();
    }, { passive: true });
  }
  next() { this.showSlide(this.current + 1); }
  prev() { this.showSlide(this.current - 1); }
  showSlide(i) {
    this.current = Math.max(0, Math.min(i, this.slides.length - 1));
    this.slides.forEach((s, k) => { s.classList.toggle('active', k === this.current); s.classList.toggle('visible', k === this.current); });
  }
}
new SlidePresentation();
</script>
</body>
</html>"""

SLIDE_TPL = """    <section class="slide">
      <div class="slide-content">
        <div class="chrome"><span class="cn">[[BRAND]]</span><span class="en">[[PAGE]]</span></div>
        <p class="kicker reveal">[[KICKER]]</p>
        <h2 class="s-h reveal">[[STITLE]]</h2>
[[BODY]]
        <div class="foot"><span>[[FOOTL]]</span><span>[[FOOTR]]</span></div>
      </div>
    </section>
"""


def esc(t):
    return html_mod.escape(str(t), quote=False)


def build_slide(slide, brand):
    s = SLIDE_TPL
    s = s.replace("[[BRAND]]", brand)
    s = s.replace("[[PAGE]]", slide["page"])
    s = s.replace("[[KICKER]]", slide["kicker"])
    s = s.replace("[[STITLE]]", slide["title"])
    s = s.replace("[[BODY]]", slide["body"])
    s = s.replace("[[FOOTL]]", slide.get("footL", ""))
    s = s.replace("[[FOOTR]]", slide.get("footR", ""))
    return s


def build_deck(skill):
    brand = skill["brand"]
    slides_html = "\n".join(build_slide(s, brand) for s in skill["slides"])
    html = SCAFFOLD.replace("[[TITLE]]", brand)
    html = html.replace("[[SLIDES]]", slides_html)
    return html


def build_tree_html(en, files):
    """真实文件树：目录 accent 色，文件名正文色，注释 hint 色。"""
    rows = ['<span class="dir">' + esc(en) + "/</span>"]
    dirs, tops = {}, []
    for f in files:
        p = str(f.get("path", "")).strip()
        role = str(f.get("role", "")).strip()
        if not p:
            continue
        if "/" in p:
            d, name = p.split("/", 1)
            dirs.setdefault(d, []).append((name, role))
        else:
            tops.append((p, role))
    items = [(n, r, False) for n, r in tops]
    for d in sorted(dirs):
        items.append((d + "/", "", True))
        for name, role in dirs[d]:
            items.append(("&nbsp;&nbsp;" + esc(name), role, False))
    for name, role, isdir in items:
        cmt = '  <span class="cmt">· ' + esc(role) + "</span>" if role else ""
        if isdir or name.startswith("<"):
            rows.append(name + cmt if isdir else name)
        else:
            rows.append(esc(name) + cmt)
    return "\n".join(rows)


def text_entry(d):
    """把 agent 抽取的 JSON 条目转成 deck 数据。"""
    en = d["en"]
    name = d.get("name") or en
    ver = d.get("version") or "v1.0"
    brand = en + " · " + name
    pp = [p for p in d.get("painPoints", []) if p][:3]
    oos = (d.get("outOfScope") or "").strip()
    wf = d.get("workflow", [])
    files = d.get("fileTree", [])
    skill_role = next((f["role"] for f in files if f["path"] == "SKILL.md"), "执行说明书")
    others = [f for f in files if f["path"] != "SKILL.md"]
    summary = "；".join(f["path"] + "（" + f["role"] + "）" for f in others[:3])
    if len(others) > 3:
        summary += "……共 " + str(len(others)) + " 份"

    pp_li = "".join("<li>" + esc(p) + "</li>" for p in pp)
    wf_cells = "".join(
        '<div class="fcell"><span class="fn">' + f"{i+1:02d}" + '</span><p>' + esc(s) + "</p></div>"
        for i, s in enumerate(wf)
    )

    slides = [
        {
            "page": "Output / 01 / 04",
            "kicker": "先看样张",
            "title": d.get("excerptTitle") or "样张",
            "body": (
                '<div class="ex-single reveal"><pre>' + esc(d.get("excerptBody", "")) +
                '</pre><p class="ex-note">' + esc(d.get("excerptCaption", "")) +
                " · 摘自技能源文档，非示意编造</p></div>"
            ),
            "footL": name + " · " + ver,
            "footR": "真实模板摘录",
        },
        {
            "page": "About / 02 / 04",
            "kicker": "它是什么 · 它解决什么",
            "title": name,
            "body": (
                '<p class="vmeta reveal">' + esc(en) + " · " + esc(ver) + "</p>" +
                '<p class="lead reveal">' + esc(d.get("positioning", "")) + "</p>" +
                '<div class="split reveal"><ul class="plist">' + pp_li + "</ul>" +
                '<div class="pcard"><p class="lab">解法</p><p>' + esc(d.get("solution", "")) + "</p></div></div>"
            ),
            "footL": oos if oos else "从想法到可直接使用的文案",
            "footR": "工作边界",
        },
        {
            "page": "Structure / 03 / 04",
            "kicker": "核心结构",
            "title": "一个说明书，加一套配套资料",
            "body": (
                '<div class="struct reveal"><pre class="tree">' + build_tree_html(en, files) + "</pre>" +
                '<div class="filerow"><div class="fcard"><p class="fl">SKILL.md</p><p>' +
                esc(skill_role) + "。Agent 干活时读的主文档。</p></div>" +
                '<div class="fcard"><p class="fl">配套资料 · references / assets</p><p>' + esc(summary) + "。</p>" +
                '<p class="meta-tags">按需查阅，命中即用，不整篇硬读。</p></div></div></div>'
            ),
            "footL": "真实文件树 · 来自技能源目录",
            "footR": "逻辑全在文档里",
        },
        {
            "page": "Workflow / 04 / 04",
            "kicker": "工作流",
            "title": str(len(wf)) + " 步，从想法到交付",
            "body": '<div class="fgrid reveal">' + wf_cells + "</div>",
            "footL": "阶段名来自源文档",
            "footR": "只往前，不回头",
        },
    ]
    return {"en": en, "brand": brand, "slides": slides}


def main():
    ns = {}
    exec(DATA.read_text(encoding="utf-8"), ns)
    skills = list(ns["SKILLS"])
    if EXTRACT.exists():
        data = json.loads(EXTRACT.read_text(encoding="utf-8"))
        for d in data.get("skills", []):
            skills.append(text_entry(d))
    OUT.mkdir(parents=True, exist_ok=True)
    for skill in skills:
        en = skill["en"]
        html = build_deck(skill)
        out = OUT / (en + ".html")
        out.write_text(html, encoding="utf-8")
        print("WROTE " + out.name + "  (" + str(len(html)) + " bytes, " + str(len(skill["slides"])) + " slides)")


if __name__ == "__main__":
    main()
