#!/usr/bin/env python3
# 商业案例配图生成 driver：循环调用 domn-imagegen (gpt-image-2.5-flare)，png->webp。
# 用法：python scripts/gen-case-images.py <jobs.json>
# jobs.json: [{slug, filename, aspect, prompt, promptZh}]
import json, subprocess, os, sys, time
from pathlib import Path
from PIL import Image

VENV = r"C:/Users/44155/.workbuddy/binaries/python/envs/default/Scripts/python"
SCRIPT = r"C:/Users/44155/.workbuddy/skills/domn-imagegen/scripts/api_imagegen.py"
OUT_ROOT = Path(r"F:/DOMN-STUDIO/domn-web/domn-portfolio-web/public/media/visual-design")
MODEL = "gpt-image-2.5-flare"
DENOISE = ("整体画面必须干净、平滑、统一，强调大色块叙事与整体轮廓，"
           "不要细碎噪点，不要高频纹理，不要脏污颗粒，不要密集小装饰，"
           "边缘清晰利落，表面干净，画面呼吸感强，一目了然。")

jobs = json.load(open(sys.argv[1], encoding="utf-8"))
total = len(jobs)
for i, j in enumerate(jobs, 1):
    slug, fn, aspect = j["slug"], j["filename"], j["aspect"]
    prompt = j["prompt"] + " " + DENOISE
    pzh = j.get("promptZh", fn)
    outdir = OUT_ROOT / slug
    outdir.mkdir(parents=True, exist_ok=True)
    pfile = outdir / f"_{fn}.prompt.txt"
    pfile.write_text(prompt, encoding="utf-8")
    png = outdir / f"{fn}.png"
    webp = outdir / f"{fn}.webp"
    if webp.exists():
        print(f"[{i}/{total}] skip {slug}/{fn} (webp exists)")
        continue
    rj = outdir / f"_{fn}.json"
    cmd = [VENV, SCRIPT, "--model", MODEL, "--quality", "1K", "--aspect-ratio", aspect,
           "--prompt-file", str(pfile), "--prompt-zh", pzh, "--out-dir", str(outdir),
           "--filename", f"{fn}.png", "--response-json", str(rj)]
    print(f"[{i}/{total}] === {slug}/{fn} ({aspect}) ===", flush=True)
    try:
        subprocess.run(cmd, check=True, timeout=320)
    except Exception as e:
        print(f"  FAILED: {e}", flush=True)
        continue
    if png.exists():
        im = Image.open(png)
        im.save(webp, "WEBP", lossless=True)
        png.rename(outdir / f"_{fn}.png.done")  # rename 避开 safe-delete shim
        print(f"  -> {webp.name} {im.size} {webp.stat().st_size//1024}KB", flush=True)
    else:
        print("  png missing!", flush=True)
    time.sleep(3)

print("done", flush=True)
