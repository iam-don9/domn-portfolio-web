"""Strip the markdown prose body (everything after the frontmatter) from film
project.md files, keeping only the YAML frontmatter (which already holds
finalClips / processClips / promptShots / media).

Only strips if the body actually looks like the standard prose (contains the
'## 项目故事' heading), so any file without that prose is left untouched.
"""
import pathlib

BASE = pathlib.Path(r"F:/DOMN-STUDIO/domn-web/domn-portfolio-web/portfolio-source/projects")

TARGETS = [
    "ai-video/boyhood-love/project.md",
    "ai-video/courtroom-drama/project.md",
    "ai-video/grave-wailing/project.md",
    "ai-video/k-drama-breakup/project.md",
    "ai-video/retro-tragedy/project.md",
    "character-design/dragon-maiden/project.md",
    "character-design/game-ui/project.md",
    "character-design/mecha-girl/project.md",
    "character-design/shan-hai-jing-beasts/project.md",
    "character-design/street-basketball/project.md",
    "character-design/zodiac-war/project.md",
]

for rel in TARGETS:
    p = BASE / rel
    text = p.read_text(encoding="utf-8")
    lines = text.split("\n")
    if lines[0].strip() != "---":
        print("SKIP (no frontmatter):", rel)
        continue
    close_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            close_idx = i
            break
    if close_idx is None:
        print("SKIP (no closing ---):", rel)
        continue
    body = "\n".join(lines[close_idx + 1 :])
    if "## 项目故事" in body:
        new_text = "\n".join(lines[: close_idx + 1]).rstrip("\n") + "\n"
        p.write_text(new_text, encoding="utf-8")
        print("STRIPPED:", rel)
    else:
        print("KEEP (no prose):", rel)
