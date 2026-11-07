#!/usr/bin/env python3
"""Genera la versión HTML imprimible del informe."""
from pathlib import Path
from markdown_it import MarkdownIt

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
md_text = (DOCS / "INFORME-APLICACION.md").read_text(encoding="utf-8")

md = MarkdownIt("commonmark").enable(["table", "strikethrough"])
body = md.render(md_text)

html = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Informe · Sistema de Gestión de Préstamos UT · CAT Medellín</title>
<style>
:root{
  --wine:#7a1230; --wine-d:#5c0d24; --wine-l:#f6e9ed;
  --ink:#171717; --mut:#5f5f5f; --line:#dedada; --bg:#eeeae9;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font:11.2pt/1.62 "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.sheet{
  width:min(1000px,100%); margin:28px auto; background:#fff; padding:64px 72px 80px;
  box-shadow:0 10px 40px #0002; border-radius:2px;
}
h1,h2,h3,h4{font-family:Georgia,"Times New Roman",serif; color:var(--ink); line-height:1.18}
h1{font-size:26pt; margin:0 0 10px}
h2{
  font-size:17.5pt; color:var(--wine); margin:34px 0 12px; padding-bottom:6px;
  border-bottom:1.5px solid var(--wine); break-after:avoid;
}
h3{font-size:12.8pt; margin:24px 0 8px; break-after:avoid}
h4{font-size:11.5pt; margin:18px 0 6px; break-after:avoid}
p{margin:0 0 10px; text-align:justify; hyphens:auto}
ul,ol{margin:0 0 12px; padding-left:22px}
li{margin:3px 0}
a{color:var(--wine); text-decoration:none}
strong{color:#111}
code{
  font:9.8pt ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  background:#f3efef; border:1px solid #e6dede; border-radius:4px; padding:1px 4px;
}
pre{
  background:#f7f4f4; border:1px solid var(--line); border-left:4px solid var(--wine);
  border-radius:6px; padding:12px 14px; overflow:auto; margin:14px 0; break-inside:avoid;
}
pre code{background:none;border:0;padding:0;font-size:9.2pt;line-height:1.45}
blockquote{
  margin:14px 0; padding:10px 16px; background:var(--wine-l);
  border-left:4px solid var(--wine); border-radius:0 6px 6px 0; color:#3a1822;
}
blockquote p{margin:0}
table{
  width:100%; border-collapse:collapse; margin:14px 0 18px; font-size:9.4pt; line-height:1.4;
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
  margin:20px 0 24px; padding:0; break-inside:avoid; text-align:center;
}
figure img{
  display:block; width:100%; height:auto; margin:0 auto;
  border:1px solid #cfc7c7; border-radius:6px; box-shadow:0 4px 14px #0001;
}
figcaption{
  font-size:9.3pt; color:var(--mut); line-height:1.45; text-align:left;
  margin:8px 6px 0; padding-left:10px; border-left:3px solid var(--wine);
}
figcaption b{color:var(--wine)}
.fig-mobile img{width:300px; max-width:100%}
hr{border:0; border-top:1px solid var(--line); margin:28px 0}
.cover{
  min-height:245mm; display:flex; flex-direction:column; justify-content:center;
  padding:12mm 8mm 16mm; break-after:page; text-align:left;
}
.cover-logo{width:96px; height:96px; object-fit:contain; margin:0 0 26px}
.cover-kicker{
  font:700 10.5pt/1.3 "Segoe UI",Arial,sans-serif; letter-spacing:.12em;
  text-transform:uppercase; color:var(--wine); margin:0 0 12px;
}
.cover h1{font-size:31pt; max-width:760px; margin:0 0 12px; color:var(--wine-d)}
.cover-sub{font:14pt/1.35 Georgia,serif; color:#4a3a3e; margin:0 0 34px; max-width:640px}
.cover-meta{
  border-top:1px solid var(--line); border-bottom:1px solid var(--line);
  padding:14px 0; margin:0 0 26px; max-width:560px;
}
.cover-meta p{margin:3px 0; font-size:10.2pt; text-align:left}
.cover-note{font-size:9.4pt; color:var(--mut); max-width:560px; text-align:left; margin:0}
.cover + h2{margin-top:0}

@media (max-width:760px){
  .sheet{margin:0; padding:28px 20px 50px; border-radius:0}
  .cover{min-height:70vh; padding:24px 0}
  .cover h1{font-size:24pt}
  h2{font-size:15.5pt}
  table{font-size:8.8pt}
  td,th{padding:4px}
}

@page{size:A4; margin:17mm 15mm 18mm}
@media print{
  body{background:#fff; font-size:10.4pt; line-height:1.5}
  .sheet{width:auto; margin:0; padding:0; box-shadow:none; border-radius:0}
  a{color:inherit; text-decoration:none}
  h2{margin-top:22px}
  figure{margin:14px 0 18px}
  figure img{box-shadow:none}
  .cover{min-height:auto; height:calc(297mm - 35mm); padding:8mm 4mm; page-break-after:always}
  .cover h1{font-size:28pt}
  table{font-size:8.9pt}
  thead{display:table-header-group}
  .fig-mobile img{width:250px}
}
</style>
</head>
<body>
<main class="sheet">
__BODY__
</main>
</body>
</html>
"""

(DOCS / "INFORME-APLICACION.html").write_text(
    html.replace("__BODY__", body), encoding="utf-8"
)
print("HTML generado:", DOCS / "INFORME-APLICACION.html")
