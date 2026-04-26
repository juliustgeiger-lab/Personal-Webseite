#!/usr/bin/env python3
"""
generate_handwriting.py — convert a word into an animated handwriting SVG.

Two modes, picked automatically by the file extension of --font:

  • SVG-font (.svg)  → single-line glyphs (e.g. EMS Allure).
                        Output: one <path> with stroke + stroke-dasharray
                        animation. The pen actually traces each letter
                        along its centreline. This is "real" handwriting.

  • TTF/OTF font     → fill outlines (e.g. Caveat).
                        Output: one filled <path>. Animation is a
                        left→right clip-path wipe — fonts have no
                        centreline data, so we can't pen-trace them
                        without skeletonisation.

EMS Allure is included at scripts/fonts/EMSAllure.svg (OFL, by Sheldon B.
Michaels, derived from Allura by Rob Leuschke; SVG conversion by Windell H.
Oskay). It's a single-line cursive font intended for plotters — exactly
what we need for stroke-dasharray writing.

Usage:
  python3 generate_handwriting.py unwritten \\
      --font scripts/fonts/EMSAllure.svg \\
      --out  public/unwritten-handwritten.html

Reuse for other words:
  python3 generate_handwriting.py "future"  --font ... --out ...
  python3 generate_handwriting.py "decisions" --font ... --out ...

Optional flags: --duration (ms), --ink (hex), --bg (hex), --stroke-width.
"""

from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "{http://www.w3.org/2000/svg}"


# ---------------------------------------------------------------------------
# SVG-font (single-line) renderer — produces a stroke path for pen-tracing.
# ---------------------------------------------------------------------------

# Tokeniser for the simple M/L path data SVG fonts emit. Matches commands
# (M, L, m, l) and signed decimals separated by spaces or commas.
_PATH_TOKEN = re.compile(r"[MLml]|-?\d+(?:\.\d+)?")


def _parse_glyph_d(d: str) -> list[tuple[str, list[float]]]:
    """Parse a glyph d-string into [(cmd, [x, y]), ...]. Lower-case (relative)
    commands are normalised to absolute by tracking the current point."""
    tokens = _PATH_TOKEN.findall(d)
    out: list[tuple[str, list[float]]] = []
    cx = cy = 0.0
    i = 0
    last_cmd = "M"
    while i < len(tokens):
        t = tokens[i]
        if t in "MLml":
            last_cmd = t
            i += 1
        cmd = last_cmd
        x = float(tokens[i]); y = float(tokens[i + 1]); i += 2
        if cmd.islower():
            x += cx; y += cy
            cmd = cmd.upper()
        cx, cy = x, y
        out.append((cmd, [x, y]))
        # After an M, subsequent implicit pairs are L (per SVG spec).
        if last_cmd == "M":
            last_cmd = "L"
        elif last_cmd == "m":
            last_cmd = "l"
    return out


def render_word_svgfont(font_path: Path, word: str):
    """Return (path-d, width, height, units_per_em) using an SVG single-line font."""
    tree = ET.parse(str(font_path))
    root = tree.getroot()
    font_el = root.find(f".//{SVG_NS}font")
    face = root.find(f".//{SVG_NS}font-face")
    if font_el is None or face is None:
        sys.exit(f"{font_path} doesn't look like an SVG font")

    upem = int(face.get("units-per-em") or 1000)
    ascent = int(face.get("ascent") or 800)
    descent = int(face.get("descent") or -200)
    default_adv = int(font_el.get("horiz-adv-x") or upem)

    glyphs: dict[str, dict] = {}
    for g in root.findall(f".//{SVG_NS}glyph"):
        u = g.get("unicode")
        if u is None or len(u) != 1:
            continue
        glyphs[u] = {
            "advance": int(float(g.get("horiz-adv-x") or default_adv)),
            "d": g.get("d") or "",
        }

    parts: list[str] = []
    x_cursor = 0
    for ch in word:
        if ch not in glyphs:
            print(f"warning: '{ch}' not in font", file=sys.stderr)
            continue
        gd = glyphs[ch]
        if gd["d"]:
            for cmd, coords in _parse_glyph_d(gd["d"]):
                # Translate by x_cursor, flip Y (font is y-up; SVG is y-down,
                # baseline lands at y = ascent in our viewBox).
                gx = coords[0] + x_cursor
                gy = ascent - coords[1]
                parts.append(f"{cmd}{gx:.2f},{gy:.2f}")
        x_cursor += gd["advance"]

    d = " ".join(parts)
    width = x_cursor
    height = ascent - descent
    return d, width, height, upem


# ---------------------------------------------------------------------------
# TTF/OTF (fill outline) renderer — keeps the original Caveat-style mode.
# ---------------------------------------------------------------------------

def render_word_ttf(font_path: Path, word: str):
    try:
        from fontTools.ttLib import TTFont
        from fontTools.pens.svgPathPen import SVGPathPen
        from fontTools.pens.transformPen import TransformPen
    except ImportError:
        sys.exit("fontTools is required for TTF/OTF fonts. pip install fonttools")

    font = TTFont(str(font_path))
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    ascender = font["hhea"].ascender
    descender = font["hhea"].descender

    pen = SVGPathPen(glyph_set)
    x = 0
    for ch in word:
        cp = ord(ch)
        if cp not in cmap:
            print(f"warning: '{ch}' not in font cmap", file=sys.stderr)
            continue
        name = cmap[cp]
        glyph = glyph_set[name]
        transform = (1, 0, 0, -1, x, ascender)
        glyph.draw(TransformPen(pen, transform))
        x += hmtx[name][0]

    return pen.getCommands(), x, ascender - descender, font["head"].unitsPerEm


# ---------------------------------------------------------------------------
# HTML templates.
# ---------------------------------------------------------------------------

HTML_STROKE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{word} — handwriting</title>
<style>
  :root {{ --ink: {ink}; --bg: {bg}; }}
  html, body {{
    margin: 0; min-height: 100vh; background: var(--bg);
    display: grid; place-items: center;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  }}
  .stage {{ width: min(880px, 92vw); cursor: pointer; }}
  .handwrite-svg {{ display: block; width: 100%; height: auto; overflow: visible; }}
  .handwrite-svg path {{
    fill: none;
    stroke: var(--ink);
    stroke-width: {stroke_width};
    stroke-linecap: round;
    stroke-linejoin: round;
  }}

  /* pathLength=100 normalises the dash math regardless of true path length.
     The pen traces each subpath in writing order; M-jumps between letters
     have zero length, so they read as instant lifts. */
  .handwrite-svg path {{
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }}
  .stage.is-writing .handwrite-svg path {{
    animation: handwrite {duration}ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }}
  @keyframes handwrite {{
    to {{ stroke-dashoffset: 0; }}
  }}

  @media (prefers-reduced-motion: reduce) {{
    .handwrite-svg path {{ stroke-dashoffset: 0; }}
    .stage.is-writing .handwrite-svg path {{ animation: none; }}
  }}

  .hint {{
    margin-top: 1.5rem; text-align: center;
    color: #6b7280; font-size: 0.85rem; letter-spacing: 0.04em;
  }}
</style>
</head>
<body>
  <div class="stage" id="stage" role="img" aria-label="{word}">
    <svg class="handwrite-svg" viewBox="{vb_x} {vb_y} {vb_w} {vb_h}"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="{d}" pathLength="100"/>
    </svg>
  </div>
  <p class="hint">click to replay</p>
  <script>
    (function () {{
      const stage = document.getElementById('stage');
      if (!stage) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const start = () => {{
        stage.classList.remove('is-writing');
        void stage.offsetWidth;
        stage.classList.add('is-writing');
      }};
      if (reduced) {{
        stage.classList.add('is-writing');
      }} else if ('IntersectionObserver' in window) {{
        const io = new IntersectionObserver((entries) => {{
          if (entries.some((e) => e.isIntersecting)) {{ start(); io.disconnect(); }}
        }}, {{ threshold: 0.4 }});
        io.observe(stage);
      }} else {{
        start();
      }}
      stage.addEventListener('click', () => {{ if (!reduced) start(); }});
    }})();
  </script>
</body>
</html>
"""

HTML_FILL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{word} — handwriting</title>
<style>
  :root {{ --ink: {ink}; --bg: {bg}; }}
  html, body {{
    margin: 0; min-height: 100vh; background: var(--bg);
    display: grid; place-items: center;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  }}
  .stage {{ width: min(880px, 92vw); cursor: pointer; }}
  .handwrite-svg {{ display: block; width: 100%; height: auto; overflow: visible; }}
  .handwrite-svg path {{ fill: var(--ink); stroke: none; }}

  .handwrite-svg {{ clip-path: inset(0 100% 0 0); }}
  .stage.is-writing .handwrite-svg {{
    animation: handwrite {duration}ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }}
  @keyframes handwrite {{
    from {{ clip-path: inset(0 100% 0 0); }}
    to   {{ clip-path: inset(0 0 0 0); }}
  }}

  @media (prefers-reduced-motion: reduce) {{
    .handwrite-svg {{ clip-path: inset(0 0 0 0); }}
    .stage.is-writing .handwrite-svg {{ animation: none; }}
  }}

  .hint {{
    margin-top: 1.5rem; text-align: center;
    color: #6b7280; font-size: 0.85rem; letter-spacing: 0.04em;
  }}
</style>
</head>
<body>
  <div class="stage" id="stage" role="img" aria-label="{word}">
    <svg class="handwrite-svg" viewBox="{vb_x} {vb_y} {vb_w} {vb_h}"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="{d}"/>
    </svg>
  </div>
  <p class="hint">click to replay</p>
  <script>
    (function () {{
      const stage = document.getElementById('stage');
      if (!stage) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const start = () => {{
        stage.classList.remove('is-writing');
        void stage.offsetWidth;
        stage.classList.add('is-writing');
      }};
      if (reduced) {{
        stage.classList.add('is-writing');
      }} else if ('IntersectionObserver' in window) {{
        const io = new IntersectionObserver((entries) => {{
          if (entries.some((e) => e.isIntersecting)) {{ start(); io.disconnect(); }}
        }}, {{ threshold: 0.4 }});
        io.observe(stage);
      }} else {{
        start();
      }}
      stage.addEventListener('click', () => {{ if (!reduced) start(); }});
    }})();
  </script>
</body>
</html>
"""


def build_html_stroke(d, width, height, *, word, ink, bg, duration, stroke_width):
    pad = max(width, height) // 25
    return HTML_STROKE.format(
        word=word, ink=ink, bg=bg, duration=duration, stroke_width=stroke_width,
        vb_x=-pad, vb_y=-pad, vb_w=width + pad * 2, vb_h=height + pad * 2, d=d,
    )


def build_html_fill(d, width, height, *, word, ink, bg, duration):
    pad = max(width, height) // 30
    return HTML_FILL.format(
        word=word, ink=ink, bg=bg, duration=duration,
        vb_x=-pad, vb_y=-pad, vb_w=width + pad * 2, vb_h=height + pad * 2, d=d,
    )


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("word", help='Word to render, e.g. "unwritten"')
    ap.add_argument("--font", required=True, type=Path,
                    help="Path to font file. .svg = single-line stroke font (real "
                         "writing); .ttf/.otf = fill outline (clip-path wipe).")
    ap.add_argument("--out", required=True, type=Path,
                    help="Output HTML file path")
    ap.add_argument("--duration", type=int, default=3500,
                    help="Animation duration in ms (default: 3500)")
    ap.add_argument("--ink", default="#1e3a8a", help="Ink colour (default: #1e3a8a)")
    ap.add_argument("--bg", default="#f7f5ee", help="Background colour (default: #f7f5ee)")
    ap.add_argument("--stroke-width", type=int, default=12,
                    help="Stroke width for SVG-font mode (default: 12)")
    args = ap.parse_args()

    if not args.font.exists():
        sys.exit(f"font file not found: {args.font}")

    ext = args.font.suffix.lower()
    if ext == ".svg":
        d, w, h, _ = render_word_svgfont(args.font, args.word)
        html = build_html_stroke(d, w, h, word=args.word, ink=args.ink, bg=args.bg,
                                  duration=args.duration, stroke_width=args.stroke_width)
        mode = "stroke"
    elif ext in {".ttf", ".otf"}:
        d, w, h, _ = render_word_ttf(args.font, args.word)
        html = build_html_fill(d, w, h, word=args.word, ink=args.ink, bg=args.bg,
                                duration=args.duration)
        mode = "fill"
    else:
        sys.exit(f"unsupported font extension: {ext}")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html, encoding="utf-8")
    print(f"wrote {args.out}  ({mode} mode, viewBox {w}×{h}, path-d {len(d)} chars)")


if __name__ == "__main__":
    main()
