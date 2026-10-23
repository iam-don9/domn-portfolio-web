#!/usr/bin/env python3
"""Batch-generate 14 distinct-style skill covers via the domn-imagegen gateway.

Each skill gets a different punk-cover style. Uses the fast tier (gpt-image-2.5-flare)
to avoid the standard tier's intermittent 502s. Retries on failure, converts the
returned PNG to lossless WEBP, and records a result report.
"""
import json
import subprocess
import sys
import time
from pathlib import Path

VENV_PY = r"C:/Users/44155/.workbuddy/binaries/python/envs/default/Scripts/python.exe"
SCRIPT = r"C:/Users/44155/.workbuddy/skills/domn-imagegen/scripts/api_imagegen.py"
ROOT = Path(r"F:/DOMN-STUDIO/domn-web/domn-portfolio-web")
DATA = ROOT / "scripts" / "covers-data.json"
TMP = ROOT / ".tmp-covers"
OUT = ROOT / "public" / "media" / "covers"
RESULTS = ROOT / "scripts" / "covers-results.json"
MODEL = "gpt-image-2.5-flare"
MAX_RETRIES = 3


def run_job(job):
    en = job["en"]
    tmp_prompt = TMP / f"{en}.prompt.txt"
    tmp_prompt.write_text(job["en_prompt"], encoding="utf-8")
    png = OUT / f"{en}.png"
    resp = TMP / f"{en}.json"
    cmd = [
        VENV_PY, SCRIPT,
        "--model", MODEL,
        "--quality", "1K",
        "--aspect-ratio", "16:9",
        "--prompt-file", str(tmp_prompt),
        "--prompt-zh", job["zh_prompt"],
        "--out-dir", str(OUT),
        "--filename", f"{en}.png",
        "--response-json", str(resp),
    ]
    last_err = ""
    for attempt in range(1, MAX_RETRIES + 1):
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        if png.exists():
            return convert(en, png)
        last_err = (r.stderr or r.stdout or "").strip().splitlines()[-1] if (r.stderr or r.stdout) else f"exit {r.returncode}"
        print(f"  [{en}] attempt {attempt} failed: {last_err}", flush=True)
        if attempt < MAX_RETRIES:
            time.sleep(30)
    return {"en": en, "ok": False, "error": last_err}


def convert(en, png):
    from PIL import Image
    webp = OUT / f"{en}.webp"
    with Image.open(png) as img:
        img.save(webp, "WEBP", lossless=True)
    size = webp.stat().st_size
    # Move the source PNG aside instead of deleting it: the sandbox safe-delete
    # shim blocks os.unlink, so a rename (same-filesystem move) is used instead.
    archive = TMP / "processed"
    archive.mkdir(parents=True, exist_ok=True)
    try:
        shutil.move(str(png), str(archive / f"{en}.png"))
    except Exception:
        pass
    return {"en": en, "ok": True, "webp": str(webp), "bytes": size, "size": f"{img.width}x{img.height}"}


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = json.loads(DATA.read_text(encoding="utf-8"))
    results = []
    print(f"Generating {len(jobs)} covers with model {MODEL}...\n", flush=True)
    for i, job in enumerate(jobs, 1):
        en = job["en"]
        webp = OUT / f"{en}.webp"
        if webp.exists():
            print(f"[{i}/{len(jobs)}] {en}  ({job['style']}) — already done, skip", flush=True)
            results.append({"en": en, "ok": True, "skip": True, "webp": str(webp)})
            continue
        print(f"[{i}/{len(jobs)}] {en}  ({job['style']})", flush=True)
        res = run_job(job)
        results.append(res)
        print(f"  -> {res}\n", flush=True)
        time.sleep(5)
    RESULTS.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    ok = sum(1 for r in results if r.get("ok"))
    print(f"\nDONE: {ok}/{len(results)} succeeded. Report -> {RESULTS}", flush=True)


if __name__ == "__main__":
    main()
