#!/usr/bin/env python3
"""Genera el manual de usuario en HTML y PDF.

El PDF se produce con Chrome en modo headless. El pie de página y los
números de página se agregan con las cajas de margen de CSS (@page), que
Chrome 157 ya soporta.

Uso:
    python3 docs/_generar_manual.py
"""
from __future__ import annotations

import re
import subprocess
import unicodedata
from pathlib import Path

from markdown_it import MarkdownIt

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SOURCE = DOCS / "MANUAL-DE-USUARIO.md"
HTML = DOCS / "MANUAL-DE-USUARIO.html"
PDF = DOCS / "MANUAL-DE-USUARIO.pdf"
CHROME = "google-chrome"

SECTIONS = [
    ("presentacion", "1. Presentación"),
    ("antes-de-empezar", "2. Antes de empezar"),
    ("ingresar-y-cerrar-sesion", "3. Ingresar y cerrar sesión"),
    ("guia-del-administrador", "4. Guía del administrador"),
    ("guia-de-coordinacion", "5. Guía de coordinación"),
    ("guia-del-estudiante-y-del-docente", "6. Guía del estudiante y del docente"),
    ("correos-y-notificaciones", "7. Correos y notificaciones"),
    ("instalar-la-pwa", "8. Instalar la PWA y usarla en el celular"),
    ("solucion-de-problemas", "9. Solución de problemas"),
    ("buenas-practicas", "10. Buenas prácticas y cierre"),
    ("anexo-a-credenciales", "Anexo A. Credenciales y flujo rápido"),
    ("anexo-b-glosario", "Anexo B. Glosario"),
]

CSS = r"""
:root{
  --wine:#7a1230; --wine-d:#5c0d24; --wine-l:#f6e9ed;
  --ink:#171717; --mut:#5f5f5f; --line:#dedada; --bg:#eeeae9;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font:10.8pt/1.58 "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.sheet{
  width:min(980px,100%); margin:28px auto; background:#fff; padding:56px 64px 72px;
  box-shadow:0 10px 40px #0002; border-radius:2px;
}
h1,h2,h3,h4{font-family:Georgia,"Times New Roman",serif; color:var(--ink); line-height:1.18}
h2{
  font-size:18pt; color:var(--wine); margin:0 0 16px; padding-bottom:8px;
  border-bottom:1.5px solid var(--wine); break-after:avoid;
}
h3{font-size:12.6pt; margin:22px 0 8px; break-after:avoid}
h4{font-size:11.3pt; margin:16px 0 6px; break-after:avoid}
p{margin:0 0 10px; text-align:justify; hyphens:auto}
ul,ol{margin:0 0 12px; padding-left:24px}
li{margin:4px 0}
a{color:var(--wine); text-decoration:none}
strong{color:#111}
code{
  font:9.5pt ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  background:#f3efef; border:1px solid #e6dede; border-radius:4px; padding:1px 4px;
}
pre{
  background:#f7f4f4; border:1px solid var(--line); border-left:4px solid var(--wine);
  border-radius:6px; padding:12px 14px; overflow:auto; margin:14px 0; break-inside:avoid;
}
pre code{background:none;border:0;padding:0;font-size:9pt;line-height:1.45}
blockquote{
  margin:14px 0; padding:10px 16px; background:var(--wine-l);
  border-left:4px solid var(--wine); border-radius:0 6px 6px 0; color:#3a1822;
}
blockquote p{margin:0}
table{
  width:100%; border-collapse:collapse; margin:14px 0 18px; font-size:8.8pt; line-height:1.4;
}
thead{display:table-header-group}
th{
  background:var(--wine-l); color:var(--wine-d); text-align:left; font-weight:700;
  border:1px solid #d9bfc8; padding:6px 7px;
}
td{border:1px solid var(--line); padding:5px 7px; vertical-align:top}
tr{break-inside:avoid}
tbody tr:nth-child(even){background:#fbf9f9}
figure{
  margin:18px 0 22px; padding:0; break-inside:avoid; text-align:center;
}
figure img{
  display:block; width:100%; height:auto; margin:0 auto;
  border:1px solid #cfc7c7; border-radius:6px; box-shadow:0 4px 14px #0001;
}
figcaption{
  font-size:9pt; color:var(--mut); line-height:1.45; text-align:left;
  margin:8px 6px 0; padding-left:10px; border-left:3px solid var(--wine);
}
figcaption b{color:var(--wine)}
.fig-mobile img{width:290px; max-width:100%}
hr{border:0; border-top:1px solid var(--line); margin:26px 0}

/* Portada */
.cover{
  min-height:245mm; display:flex; flex-direction:column; justify-content:center;
  padding:10mm 6mm 14mm; break-after:page; text-align:left;
}
.cover-logo{width:100px; height:100px; object-fit:contain; margin:0 0 28px}
.cover-kicker{
  font:700 10.5pt/1.3 "Segoe UI",Arial,sans-serif; letter-spacing:.12em;
  text-transform:uppercase; color:var(--wine); margin:0 0 14px;
}
.cover h1{font-size:38pt; max-width:760px; margin:0 0 14px; color:var(--wine-d)}
.cover-sub{font:15pt/1.38 Georgia,serif; color:#4a3a3e; margin:0 0 38px; max-width:660px}
.cover-meta{
  border-top:1px solid var(--line); border-bottom:1px solid var(--line);
  padding:15px 0; margin:0 0 28px; max-width:580px;
}
.cover-meta p{margin:4px 0; font-size:10.2pt; text-align:left}
.cover-note{font-size:9.4pt; color:var(--mut); max-width:580px; text-align:left; margin:0}

/* Contenido */
.toc{break-after:page; padding-top:6mm}
.toc-title{
  font:700 26pt/1.1 Georgia,serif; color:var(--wine-d);
  border-bottom:2px solid var(--wine); padding-bottom:10px; margin:0 0 22px;
}
.toc-list{list-style:none; margin:0; padding:0}
.toc-list li{
  display:flex; align-items:baseline; gap:8px; margin:0; padding:9px 0;
  border-bottom:1px dotted #d9cfd3; font-size:11pt;
}
.toc-list li a{flex:1; color:var(--ink)}
.toc-list li a:hover{color:var(--wine)}
.toc-page{font:700 10pt "Segoe UI",Arial,sans-serif; color:var(--wine); min-width:26px; text-align:right}
.toc-note{font-size:9pt; color:var(--mut); margin-top:24px; text-align:left}

.manual-end{
  margin-top:26px; padding-top:14px; border-top:1px solid var(--line);
  font-size:9.5pt; color:var(--mut); text-align:left;
}

/* Pantalla */
@media (max-width:760px){
  .sheet{margin:0; padding:28px 20px 50px; border-radius:0}
  .cover{min-height:70vh; padding:24px 0}
  .cover h1{font-size:28pt}
  h2{font-size:16pt}
  table{font-size:8.4pt}
  td,th{padding:4px}
}

/* Impresión */
@page{
  size:A4;
  margin:16mm 16mm 20mm;
  @bottom-left{
    content:"Manual de usuario · Préstamos UT";
    font-family:"Segoe UI", Arial, sans-serif; font-size:8pt; color:#7a1230;
  }
  @bottom-right{
    content:"Página " counter(page) " de " counter(pages);
    font-family:"Segoe UI", Arial, sans-serif; font-size:8pt; color:#7a1230;
  }
}
@page:first{
  @bottom-left{content:none}
  @bottom-right{content:none}
}
@media print{
  body{background:#fff; font-size:9.8pt; line-height:1.45}
  .sheet{width:auto; margin:0; padding:0; box-shadow:none; border-radius:0}
  a{color:inherit; text-decoration:none}
  h2{break-before:page; margin-top:0}
  .page-break{break-before:page}
  h3{margin:16px 0 6px}
  p{margin-bottom:7px}
  li{margin:3px 0}
  .toc{break-after:page; padding-top:0}
  .toc-list li{padding:7px 0}
  figure{margin:10px 0 14px}
  figure img{box-shadow:none; width:auto; max-width:100%; max-height:112mm; margin:0 auto}
  .cover{min-height:auto; height:calc(297mm - 36mm); padding:4mm; page-break-after:always}
  .cover h1{font-size:32pt}
  .cover-sub{font-size:13.5pt}
  blockquote{margin:9px 0; padding:7px 13px}
  table{font-size:8.1pt; line-height:1.32}
  td,th{padding:3.5px 5.5px}
  thead{display:table-header-group}
  .fig-mobile img{width:245px}
  .fig-inv img{max-height:74mm}
}
"""


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def add_heading_ids(html: str) -> str:
    def replace(match: re.Match) -> str:
        level, inner = match.group(1), match.group(2)
        plain = re.sub(r"<[^>]+>", "", inner)
        plain = re.sub(r"&[a-z]+;", "", plain)
        return f'<h{level} id="{slugify(plain)}">{inner}</h{level}>'

    return re.sub(r"<h([23])>(.*?)</h\1>", replace, html, flags=re.S)


def render_html(markdown_text: str, pages: dict[str, str]) -> str:
    md = MarkdownIt("commonmark").enable(["table", "strikethrough"])
    body = add_heading_ids(md.render(markdown_text))

    def page_value(match: re.Match) -> str:
        slug = match.group(1)
        return pages.get(slug, "00")

    body = re.sub(
        r'<span class="toc-page" data-sec="([^"]+)">.*?</span>',
        lambda m: f'<span class="toc-page" data-sec="{m.group(1)}">{page_value(m)}</span>',
        body,
        flags=re.S,
    )

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Manual de usuario · Préstamos UT · CAT Medellín</title>
<style>{CSS}</style>
</head>
<body>
<main class="sheet">
{body}
</main>
</body>
</html>
"""


def chrome_pdf(html_path: Path, pdf_path: Path) -> None:
    subprocess.run(
        [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--hide-scrollbars",
            "--no-pdf-header-footer",
            "--virtual-time-budget=12000",
            "--user-data-dir=/tmp/opencode/chrome-manual",
            f"--print-to-pdf={pdf_path}",
            html_path.as_uri(),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def pdf_pages(pdf_path: Path) -> int:
    out = subprocess.run(
        ["pdfinfo", str(pdf_path)], check=True, capture_output=True, text=True
    ).stdout
    match = re.search(r"^Pages:\s+(\d+)", out, re.M)
    if not match:
        raise SystemExit("No se pudo leer el número de páginas del PDF.")
    return int(match.group(1))


def page_text(pdf_path: Path, page: int) -> str:
    out = subprocess.run(
        ["pdftotext", "-layout", "-f", str(page), "-l", str(page), str(pdf_path), "-"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return out.replace("\f", "\n")


def find_section_pages(pdf_path: Path, pages: int) -> dict[str, str]:
    """Ubica la página donde empieza cada sección principal.

    Cada sección empieza con un salto de página, así que su título debe
    aparecer entre las primeras líneas de la página. Esto evita confundir
    el título con la entrada correspondiente en el contenido.
    """
    normalized_titles = {
        slug: re.sub(r"\s+", " ", title).strip() for slug, title in SECTIONS
    }
    found: dict[str, str] = {}
    for page in range(1, pages + 1):
        lines = [re.sub(r"\s+", " ", line).strip() for line in page_text(pdf_path, page).splitlines()]
        head = [line for line in lines if line][:3]
        if not head:
            continue
        for slug, title in normalized_titles.items():
            if slug in found:
                continue
            # La sección empieza con un salto de página: su título es la
            # primera línea de contenido. En el índice, en cambio, la primera
            # línea es «Contenido» y los títulos aparecen más abajo.
            if head[0] == title:
                found[slug] = str(page)
        if len(found) == len(SECTIONS):
            break
    return found


def main() -> None:
    markdown_text = SOURCE.read_text(encoding="utf-8")

    # Primera pasada: maqueta el contenido con marcadores.
    pages = {slug: "00" for slug, _ in SECTIONS}
    HTML.write_text(render_html(markdown_text, pages), encoding="utf-8")
    chrome_pdf(HTML, PDF)

    # Segunda pasada: escribe los números de página reales y vuelve a imprimir.
    for _ in range(2):
        found = find_section_pages(PDF, pdf_pages(PDF))
        missing = [slug for slug, _ in SECTIONS if slug not in found]
        if missing:
            raise SystemExit(f"No se encontraron las secciones: {', '.join(missing)}")
        if found == pages:
            break
        pages = found
        HTML.write_text(render_html(markdown_text, pages), encoding="utf-8")
        chrome_pdf(HTML, PDF)

    print(f"HTML generado: {HTML}")
    print(f"PDF generado:  {PDF} ({pdf_pages(PDF)} páginas)")
    for slug, _ in SECTIONS:
        print(f"  {pages.get(slug, '??'):>3}  {slug}")


if __name__ == "__main__":
    main()
