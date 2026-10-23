"""No-cache static server for dist/ preview.

Usage: python scripts/serve-nocache.py [port] [root]
Default: port 4321, root = ../dist relative to this file.

Why: `python -m http.server` sends no Cache-Control header, so browsers
heuristically cache localhost HTML/CSS. After a rebuild with new hashed
filenames, a cached index.html + cached old CSS renders the OLD page
verbatim — the "rebuilt but nothing changed" trap. This server forces
`Cache-Control: no-store` on every response so every reload is fresh.
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
ROOT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "dist")
ROOT = os.path.abspath(ROOT)


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(ROOT)
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), NoCacheHandler).serve_forever()
