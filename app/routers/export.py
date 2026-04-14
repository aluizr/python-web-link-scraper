"""
Router: /api/export
Exportação de links em JSON, CSV e HTML Bookmarks.
"""

import csv
import io
from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from app.database import get_supabase

router = APIRouter(prefix="/api/export", tags=["Exportação"])


def _get_active_links():
    result = get_supabase().table("links").select("*").eq("is_deleted", False).order("position", nulls_last=True).execute()
    return result.data


@router.get("/json", summary="Exportar como JSON")
def export_json():
    """Exporta todos os links ativos em formato JSON."""
    links = _get_active_links()
    return JSONResponse(content={"links": links, "total": len(links)})


@router.get("/csv", summary="Exportar como CSV")
def export_csv():
    """Exporta todos os links ativos em formato CSV (UTF-8)."""
    links = _get_active_links()

    output = io.StringIO()
    fieldnames = ["id", "url", "title", "description", "category", "tags",
                  "is_favorite", "status", "priority", "due_date", "notes", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for link in links:
        # Converte array de tags para string separada por ;
        link["tags"] = "; ".join(link.get("tags") or [])
        writer.writerow(link)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=links.csv"},
    )


@router.get("/html", summary="Exportar como HTML Bookmarks")
def export_html():
    """Exporta todos os links ativos no formato Netscape Bookmarks (compatível com todos os navegadores)."""
    from datetime import datetime
    links = _get_active_links()

    # Agrupa por categoria
    categories: dict[str, list] = {}
    for link in links:
        cat = link.get("category") or "Sem categoria"
        categories.setdefault(cat, []).append(link)

    def escape(text: str) -> str:
        return (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    lines = [
        "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
        f"<!-- Exportado de Python Web Link Scraper em {datetime.now().strftime('%d/%m/%Y %H:%M')} -->",
        '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
        "<TITLE>Bookmarks</TITLE>",
        "<H1>Bookmarks</H1>",
        "<DL><p>",
    ]

    for cat_name, cat_links in categories.items():
        lines.append(f'  <DT><H3>{escape(cat_name)}</H3></DT>')
        lines.append("  <DL><p>")
        for link in cat_links:
            title = escape(link.get("title") or link["url"])
            url = escape(link["url"])
            favicon = escape(link.get("favicon") or "")
            lines.append(f'    <DT><A HREF="{url}" ICON="{favicon}">{title}</A></DT>')
        lines.append("  </DL><p>")

    lines.append("</DL><p>")
    html_content = "\n".join(lines)

    return StreamingResponse(
        iter([html_content]),
        media_type="text/html; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=bookmarks.html"},
    )
