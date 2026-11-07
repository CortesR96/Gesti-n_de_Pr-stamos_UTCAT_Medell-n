#!/usr/bin/env python3
"""Genera la versión Word (.docx) del informe desde el Markdown.

Requiere Pandoc 3.x. Si no está en el PATH, indícalo con la variable PANDOC:
    PANDOC=/ruta/a/pandoc python3 docs/_generar_docx.py

El script:
  1. Sustituye la portada HTML y las figuras HTML por Markdown compatible con Word.
  2. Ajusta el ancho relativo de las columnas de las tablas.
  3. Construye un documento de referencia con la identidad visual de la UT.
  4. Convierte el Markdown a .docx con las imágenes incrustadas.
"""
import os
import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SOURCE = DOCS / "INFORME-APLICACION.md"
TARGET = DOCS / "INFORME-APLICACION.docx"
PANDOC = os.environ.get("PANDOC", "pandoc")

COVER = """![](../icons/logo-ut.png){width=2.2cm}

::: {custom-style="CoverKicker"}
UNIVERSIDAD DEL TOLIMA · IDEAD · CAT MEDELLÍN
:::

::: {custom-style="CoverTitle"}
Sistema de Gestión de Préstamos de Materiales y Espacios
:::

::: {custom-style="CoverSub"}
Informe técnico y académico del prototipo PWA «Préstamos UT»
:::

::: {custom-style="CoverMeta"}
**Modalidad:** proyecto académico y prototipo funcional\\
**Periodo de referencia:** 2026-2\\
**Versión del documento:** 1.0 · noviembre de 2026\\
**Naturaleza:** aplicación web progresiva (PWA) para demostración
:::

::: {custom-style="CoverNote"}
Documento de apoyo para la presentación universitaria. Las capturas corresponden al prototipo funcional y utilizan datos ficticios de demostración.
:::

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

"""


def transform_markdown(text: str) -> str:
    """Convierte la portada y las figuras HTML a Markdown para Word."""
    text = re.sub(
        r'<div class="cover">.*?<p class="cover-note">.*?</p>\s*</div>\s*',
        COVER,
        text,
        count=1,
        flags=re.S,
    )

    def figure(match: re.Match) -> str:
        block, src, caption = match.group(0), match.group(1), match.group(2)
        caption = re.sub(r"</?b>", "**", caption).strip()
        caption = re.sub(r"<[^>]+>", "", caption)
        width = "2.6in" if "fig-mobile" in block else "6.4in"
        return f"![{caption}]({src}){{width={width}}}\n"

    text = re.sub(
        r'<figure[^>]*>\s*<img src="([^"]+)"[^>]*>\s*<figcaption>(.*?)</figcaption>\s*</figure>',
        figure,
        text,
        flags=re.S,
    )
    return resize_tables(text)


def visible_length(value: str) -> int:
    value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"\*\*|__|`|\[|\]", "", value)
    return len(value.strip())


def resize_tables(text: str) -> str:
    """Ajusta las líneas separadoras para que Word reparta mejor las columnas."""
    lines = text.split("\n")
    out, i = [], 0
    separator = re.compile(r"^\|[\s:\-|]+\|$")

    while i < len(lines):
        if lines[i].lstrip().startswith("|") and i + 1 < len(lines) and separator.match(lines[i + 1].strip()):
            j = i
            while j < len(lines) and lines[j].lstrip().startswith("|"):
                j += 1
            table = lines[i:j]
            header = [c.strip() for c in table[0].strip().strip("|").split("|")]
            cells = [[c.strip() for c in row.strip().strip("|").split("|")] for row in table[2:]]
            widths = []
            for k in range(len(header)):
                texts = [header[k]] + [r[k] for r in cells if k < len(r)]
                longest = max(visible_length(t) for t in texts)
                longest_word = max(
                    (len(word) for t in texts for word in re.split(r"\s+", t) if word),
                    default=5,
                )
                widths.append(max(7, longest_word + 4, min(46, longest)))
            old = [c.strip() for c in table[1].strip().strip("|").split("|")]
            sep = []
            for k, width in enumerate(widths):
                dashes = "-" * width
                if k < len(old) and old[k].startswith(":"):
                    dashes = ":" + dashes[1:]
                if k < len(old) and old[k].endswith(":"):
                    dashes = dashes[:-1] + ":"
                sep.append(dashes)
            out.extend([table[0], "|" + "|".join(sep) + "|", *table[2:]])
            i = j
        else:
            out.append(lines[i])
            i += 1

    return "\n".join(out)


STYLE_REPLACEMENTS = {
    "Normal": """<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
    <w:pPr><w:widowControl/><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:eastAsia="Segoe UI" w:cs="Segoe UI"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="es-CO"/></w:rPr>
  </w:style>""",
    "BodyText": """<w:style w:type="paragraph" w:styleId="BodyText">
    <w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:link w:val="BodyTextChar"/><w:qFormat/>
    <w:pPr><w:spacing w:before="0" w:after="120" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>
  </w:style>""",
    "Compact": """<w:style w:type="paragraph" w:customStyle="1" w:styleId="Compact">
    <w:name w:val="Compact"/><w:basedOn w:val="BodyText"/><w:qFormat/>
    <w:pPr><w:spacing w:before="30" w:after="30"/><w:jc w:val="left"/></w:pPr>
  </w:style>""",
    "Heading1": """<w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="BodyText"/><w:link w:val="Heading1Char"/><w:uiPriority w:val="9"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="360" w:after="160"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="5C0D24"/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr>
  </w:style>""",
    "Heading2": """<w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="BodyText"/><w:link w:val="Heading2Char"/><w:uiPriority w:val="9"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:keepLines/><w:pBdr><w:bottom w:val="single" w:sz="10" w:space="4" w:color="7A1230"/></w:pBdr><w:spacing w:before="320" w:after="140"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="7A1230"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>
  </w:style>""",
    "Heading3": """<w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="BodyText"/><w:link w:val="Heading3Char"/><w:uiPriority w:val="9"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="5C0D24"/><w:sz w:val="25"/><w:szCs w:val="25"/></w:rPr>
  </w:style>""",
    "Heading4": """<w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:next w:val="BodyText"/><w:link w:val="Heading4Char"/><w:uiPriority w:val="9"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="200" w:after="60"/><w:outlineLvl w:val="3"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/><w:b/><w:color w:val="171717"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>
  </w:style>""",
    "Caption": """<w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="Caption"/><w:basedOn w:val="Normal"/><w:link w:val="BodyTextChar"/>
    <w:pPr><w:spacing w:before="0" w:after="120"/></w:pPr>
    <w:rPr><w:i/><w:color w:val="595959"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
  </w:style>""",
    "ImageCaption": """<w:style w:type="paragraph" w:customStyle="1" w:styleId="ImageCaption">
    <w:name w:val="Image Caption"/><w:basedOn w:val="Caption"/>
    <w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="7A1230"/></w:pBdr><w:ind w:left="170"/><w:spacing w:before="40" w:after="260"/><w:jc w:val="left"/></w:pPr>
    <w:rPr><w:i w:val="0"/><w:color w:val="595959"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
  </w:style>""",
    "Figure": """<w:style w:type="paragraph" w:customStyle="1" w:styleId="Figure">
    <w:name w:val="Figure"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="0"/></w:pPr>
  </w:style>""",
    "BlockText": """<w:style w:type="paragraph" w:styleId="BlockText">
    <w:name w:val="Block Text"/><w:basedOn w:val="BodyText"/><w:next w:val="BodyText"/><w:uiPriority w:val="9"/><w:unhideWhenUsed/><w:qFormat/>
    <w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F6E9ED"/><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="7A1230"/></w:pBdr><w:spacing w:before="140" w:after="140"/><w:ind w:left="227" w:right="170"/><w:jc w:val="left"/></w:pPr>
  </w:style>""",
    "VerbatimChar": """<w:style w:type="character" w:customStyle="1" w:styleId="VerbatimChar">
    <w:name w:val="Verbatim Char"/><w:basedOn w:val="BodyTextChar"/>
    <w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr>
  </w:style>""",
    "Table": """<w:style w:type="table" w:default="1" w:styleId="Table">
    <w:name w:val="Table"/><w:basedOn w:val="TableNormal"/><w:qFormat/>
    <w:tblPr>
      <w:tblInd w:w="0" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="D9CFD3"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="D9CFD3"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D9CFD3"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="D9CFD3"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D9CFD3"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D9CFD3"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="40" w:type="dxa"/><w:left w:w="90" w:type="dxa"/>
        <w:bottom w:w="40" w:type="dxa"/><w:right w:w="90" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    <w:tblStylePr w:type="firstRow">
      <w:rPr><w:b/><w:color w:val="5C0D24"/></w:rPr>
      <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F6E9ED"/><w:vAlign w:val="bottom"/></w:tcPr>
    </w:tblStylePr>
  </w:style>""",
}

EXTRA_STYLES = """
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverKicker">
    <w:name w:val="Cover Kicker"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="180"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/><w:b/><w:color w:val="7A1230"/><w:spacing w:val="24"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverTitle">
    <w:name w:val="Cover Title"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="120" w:after="260" w:line="240" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="5C0D24"/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverSub">
    <w:name w:val="Cover Subtitle"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="360"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:color w:val="4A3A3E"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverMeta">
    <w:name w:val="Cover Meta"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:space="10" w:color="DEDADA"/><w:bottom w:val="single" w:sz="6" w:space="10" w:color="DEDADA"/></w:pBdr><w:spacing w:before="120" w:after="300"/><w:ind w:left="0"/></w:pPr>
    <w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverNote">
    <w:name w:val="Cover Note"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>
    <w:rPr><w:color w:val="595959"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="SourceCode">
    <w:name w:val="Source Code"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F7F4F4"/><w:pBdr><w:left w:val="single" w:sz="18" w:space="6" w:color="7A1230"/></w:pBdr><w:spacing w:before="90" w:after="120" w:line="240" w:lineRule="auto"/><w:ind w:left="113"/><w:jc w:val="left"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
  </w:style>
"""


def build_reference_docx(destination: Path) -> None:
    """Parte del documento de referencia de Pandoc y aplica el estilo UT."""
    default = subprocess.run(
        [PANDOC, "--print-default-data-file", "reference.docx"],
        check=True, capture_output=True,
    ).stdout
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        source = tmp_path / "reference.docx"
        source.write_bytes(default)

        with zipfile.ZipFile(source) as zin:
            entries = {name: zin.read(name) for name in zin.namelist()}

        styles = entries["word/styles.xml"].decode("utf-8")
        for style_id, xml in STYLE_REPLACEMENTS.items():
            pattern = r'<w:style [^>]*w:styleId="%s".*?</w:style>' % style_id
            if not re.search(pattern, styles, re.S):
                raise SystemExit(f"No se encontró el estilo {style_id} en reference.docx")
            styles = re.sub(pattern, lambda _m, x=xml: x, styles, count=1, flags=re.S)
        styles = styles.replace("</w:styles>", EXTRA_STYLES + "</w:styles>")
        entries["word/styles.xml"] = styles.encode("utf-8")

        document = entries["word/document.xml"].decode("utf-8")
        document = re.sub(
            r"<w:sectPr>.*?</w:sectPr>",
            """<w:sectPr>
      <w:footnotePr><w:numRestart w:val="eachSect"/></w:footnotePr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1247" w:right="1247" w:bottom="1247" w:left="1247" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>""",
            document, count=1, flags=re.S,
        )
        entries["word/document.xml"] = document.encode("utf-8")

        with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED) as zout:
            for name, data in entries.items():
                zout.writestr(name, data)


def fit_tables(path: Path) -> None:
    """Hace que las tablas ocupen todo el ancho útil de la página A4."""
    content_width = 11906 - 2 * 1247  # A4 menos márgenes de 2,2 cm

    with zipfile.ZipFile(path) as zin:
        entries = {name: zin.read(name) for name in zin.namelist()}

    document = entries["word/document.xml"].decode("utf-8")

    def fit(match: re.Match) -> str:
        table = match.group(0)
        widths = [int(w) for w in re.findall(r'<w:gridCol w:w="(\d+)"', table)]
        if not widths:
            return table
        total = sum(widths)
        scaled = [max(1, round(w * content_width / total)) for w in widths]
        scaled[-1] += content_width - sum(scaled)
        table = re.sub(r"<w:tblW w:type=\"pct\" w:w=\"\d+\" ?/>",
                       f'<w:tblW w:type="dxa" w:w="{content_width}" />', table, count=1)
        grid = "<w:tblGrid>" + "".join(f'<w:gridCol w:w="{w}" />' for w in scaled) + "</w:tblGrid>"
        table = re.sub(r"<w:tblGrid>.*?</w:tblGrid>", grid, table, count=1, flags=re.S)
        return table

    document = re.sub(r"<w:tbl>.*?</w:tbl>", fit, document, flags=re.S)
    entries["word/document.xml"] = document.encode("utf-8")

    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in entries.items():
            zout.writestr(name, data)


def set_doc_properties(path: Path) -> None:
    """Escribe título y autor en las propiedades del documento."""
    with zipfile.ZipFile(path) as zin:
        entries = {name: zin.read(name) for name in zin.namelist()}

    core = entries["docProps/core.xml"].decode("utf-8")
    core = re.sub(r"<dc:title>.*?</dc:title>", "", core)
    core = re.sub(r"<dc:creator>.*?</dc:creator>", "", core)
    core = core.replace(
        "</cp:coreProperties>",
        "<dc:title>Sistema de Gestión de Préstamos de Materiales y Espacios</dc:title>"
        "<dc:subject>Informe técnico y académico del prototipo PWA Préstamos UT</dc:subject>"
        "<dc:creator>Universidad del Tolima · IDEAD · CAT Medellín</dc:creator>"
        "</cp:coreProperties>",
    )
    entries["docProps/core.xml"] = core.encode("utf-8")

    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in entries.items():
            zout.writestr(name, data)


def main() -> None:
    if not shutil.which(PANDOC) and not Path(PANDOC).exists():
        raise SystemExit("Pandoc no está instalado. Instálalo o define la variable PANDOC.")

    markdown = transform_markdown(SOURCE.read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        source = tmp_path / "INFORME-APLICACION.md"
        reference = tmp_path / "reference.docx"
        source.write_text(markdown, encoding="utf-8")
        build_reference_docx(reference)

        subprocess.run(
            [
                PANDOC,
                str(source),
                "-f", "markdown+implicit_figures+fenced_divs+raw_attribute",
                "-t", "docx",
                "--reference-doc", str(reference),
                "--resource-path", str(DOCS),
                "--metadata", "lang=es-CO",
                "-o", str(TARGET),
            ],
            check=True,
        )

    fit_tables(TARGET)
    set_doc_properties(TARGET)

    size = TARGET.stat().st_size / 1e6
    print(f"DOCX generado: {TARGET} ({size:.1f} MB)")


if __name__ == "__main__":
    main()
