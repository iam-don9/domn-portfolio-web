#!/usr/bin/env python3
"""Finalize the 14-style cover batch:

1. Move generated covers from the temporary wrong path
   (F:/DOMN-STUDIO/domn-web/public/media/covers) into the correct project
   (F:/DOMN-STUDIO/domn-web/domn-portfolio-web/public/media/covers).
2. Inject `cover: '/media/covers/<en>.webp'` into skills.astro for every
   successfully generated skill (skips skills without a cover file).
3. Delete the obsolete vox collage prompt file.

Idempotent: re-running only adds covers still missing.
"""
import json
import re
import shutil
from pathlib import Path

PARENT = Path(r"F:/DOMN-STUDIO/domn-web")
WRONG = PARENT / "public" / "media" / "covers"
RESULTS = PARENT / "scripts" / "covers-results.json"
PROJECT = PARENT / "domn-portfolio-web"
OUT = PROJECT / "public" / "media" / "covers"
SKILLS_ASTRO = PROJECT / "src" / "pages" / "skills.astro"
VOX_FILE = PROJECT / "cover-prompts-vox-collage.md"


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # Which skills actually produced a webp?
    succeeded = set()
    if RESULTS.exists():
        for r in json.loads(RESULTS.read_text(encoding="utf-8")):
            if r.get("ok"):
                succeeded.add(r["en"])

    # Move webp files.
    moved = []
    if WRONG.exists():
        for p in WRONG.glob("*.webp"):
            if p.stem in succeeded:
                dest = OUT / p.name
                shutil.move(str(p), str(dest))
                moved.append(p.stem)
    print(f"Moved {len(moved)} covers -> {OUT}")

    # Inject cover fields into skills.astro for moved skills only.
    if moved and SKILLS_ASTRO.exists():
        text = SKILLS_ASTRO.read_text(encoding="utf-8")
        for en in moved:
            needle = f"        en: '{en}',"
            cover_line = f"        cover: '/media/covers/{en}.webp',"
            if f"/media/covers/{en}.webp" in text:
                continue
            # Insert right after the matching en: line (object property form).
            idx = text.find(needle)
            if idx == -1:
                print(f"  [skip] en '{en}' not found in skills.astro")
                continue
            nl = text.find("\n", idx)
            text = text[: nl + 1] + cover_line + "\n" + text[nl + 1 :]
            print(f"  [ok] wired cover for {en}")
        SKILLS_ASTRO.write_text(text, encoding="utf-8")

    # Remove obsolete vox prompt file (move aside; safe-delete shim blocks unlink).
    if VOX_FILE.exists():
        proc = PROJECT / "scripts" / "_removed"
        proc.mkdir(parents=True, exist_ok=True)
        shutil.move(str(VOX_FILE), str(proc / VOX_FILE.name))
        print(f"Removed obsolete vox prompt file: {VOX_FILE}")

    # Cleanup: move any leftover PNGs aside (safe-delete shim blocks unlink),
    # then remove the now-empty wrong dir.
    if WRONG.exists():
        proc = WRONG.parent.parent / ".tmp-covers-processed"
        for p in WRONG.glob("*.png"):
            try:
                shutil.move(str(p), str(proc / p.name))
            except Exception:
                pass
        try:
            WRONG.rmdir()
        except OSError:
            leftover = list(WRONG.glob("*"))
            print(f"Wrong dir not empty, leftover: {[p.name for p in leftover]}")

    # Tidy: move generator helpers into the project and fix their output root so
    # future reruns write covers to the correct project.
    helpers_src = PARENT / "scripts"
    helpers_dst = PROJECT / "scripts"
    helpers_dst.mkdir(parents=True, exist_ok=True)
    for name in ("gen-covers.py", "covers-data.json", "covers-results.json"):
        src = helpers_src / name
        if src.exists():
            shutil.move(str(src), str(helpers_dst / name))
    # Fix output root inside the relocated generator.
    gen = helpers_dst / "gen-covers.py"
    if gen.exists():
        gt = gen.read_text(encoding="utf-8")
        gt = gt.replace(
            'ROOT = Path(r"F:/DOMN-STUDIO/domn-web")',
            'ROOT = Path(r"F:/DOMN-STUDIO/domn-web/domn-portfolio-web")',
        )
        gen.write_text(gt, encoding="utf-8")

    print("\nDone. Covers wired:", sorted(moved))


if __name__ == "__main__":
    main()
