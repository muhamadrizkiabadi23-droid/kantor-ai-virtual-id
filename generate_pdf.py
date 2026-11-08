#!/usr/bin/env python3
"""Ubah RENCANA-MASTER.md menjadi PDF siap bagikan."""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

BASE = Path(__file__).resolve().parent
MD = BASE / "RENCANA-MASTER.md"
PDF = BASE / "RENCANA-MASTER-v4.1.pdf"

CSS = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.62; color: #1a1f26; font-size: 12.5px; }
h1 { color: #b8323d; border-bottom: 3px solid #b8323d; padding-bottom: 8px; font-size: 25px; margin: 0 0 6px; }
h2 { color: #b8323d; border-left: 4px solid #b8323d); padding-left: 10px; font-size: 18px; margin-top: 26px; page-break-after: avoid; }
h3 { color: #2c3e50; font-size: 14px; margin-top: 18px; page-break-after: avoid; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0; padding-left: 22px; }
li { margin: 2px 0; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; page-break-inside: avoid; }
th, td { border: 1px solid #d6dce2; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #b8323d; color: #fff; font-weight: 600; }
tr:nth-child(even) td { background: #faf7f5; }
code { background: #f0f2f4; padding: 1px 5px; border-radius: 4px; font-family: 'Consolas', monospace; font-size: 11px; }
pre { background: #1e242c; color: #d8e0e8; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4; }
pre code { background: transparent; color: inherit; padding: 0; }
blockquote { border-left: 3px solid #e0a0a6; margin: 8px 0; padding: 4px 14px; color: #5a6470; background: #fbf7f7; }
hr { border: 0; border-top: 1px solid #e3e7eb; margin: 18px 0; }
strong { color: #232a33; }
.footer { text-align: center; color: #8a929c; font-size: 10px; margin-top: 34px; border-top: 1px solid #eee; padding-top: 12px; }
.cover { text-align: center; padding-top: 60px; }
.cover .tag { display: inline-block; margin-top: 14px; background: #b8323d; color: #fff; border-radius: 14px; padding: 4px 14px; font-size: 11px; font-weight: 700; }
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Kantor AI Merah Putih — Rencana Master v4.1</title>
<style>{css}</style>
</head>
<body>
{content}
<div class="footer">Kantor AI Merah Putih · Rencana Master v4.1 · Full Virtual · 2026</div>
</body>
</html>
"""


def main() -> int:
    try:
        import markdown
    except ImportError:
        print("Modul 'markdown' tidak ada. Jalankan: pip install markdown")
        return 1

    text = MD.read_text(encoding="utf-8")
    html_body = markdown.markdown(text, extensions=["tables", "fenced_code"])
    full_html = HTML_TEMPLATE.format(css=CSS, content=html_body)

    handle, html_path = tempfile.mkstemp(suffix=".html", prefix="rencana-", text=True)
    with os.fdopen(handle, "w", encoding="utf-8") as stream:
        stream.write(full_html)

    chrome = Path("C:/Program Files/Google/Chrome/Application/chrome.exe")
    edge = Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")

    for browser in (chrome, edge):
        if not browser.exists():
            continue
        cmd = [
            str(browser), "--headless=new", "--disable-gpu", "--no-sandbox",
            f"--print-to-pdf={PDF}", "--print-to-pdf-no-header", "--no-pdf-header-footer",
            html_path,
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        except Exception as error:  # noqa: BLE001
            print(f"Gagal menjalankan {browser.name}: {error}")
            continue
        if PDF.exists() and PDF.stat().st_size > 0:
            print(f"OK: {PDF} ({PDF.stat().st_size:,} bytes) via {browser.name}")
            try:
                os.unlink(html_path)
            except OSError:
                pass
            return 0
        print(f"{browser.name} tidak menghasilkan PDF: {result.stderr[:200]}")

    print("Tidak ada browser Chrome/Edge yang bisa dipakai.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
