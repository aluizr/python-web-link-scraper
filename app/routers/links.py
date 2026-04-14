"""
Router: /api/links
CRUD completo de links + lixeira + favoritos + busca.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.link import LinkCreate, LinkUpdate, LinkResponse
from app.database import get_supabase

router = APIRouter(prefix="/api/links", tags=["Links"])


def _db():
    return get_supabase()


# ── LIST ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[LinkResponse], summary="Listar links")
def list_links(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    is_favorite: Optional[bool] = Query(None, description="Apenas favoritos"),
    status: Optional[str] = Query(None, description="backlog | in_progress | done"),
    priority: Optional[str] = Query(None, description="low | medium | high"),
    q: Optional[str] = Query(None, description="Busca por título ou URL"),
    include_deleted: bool = Query(False, description="Incluir links na lixeira"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    query = _db().table("links").select("*")

    if not include_deleted:
        query = query.eq("is_deleted", False)

    if category:
        query = query.eq("category", category)
    if is_favorite is not None:
        query = query.eq("is_favorite", is_favorite)
    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)
    if q:
        query = query.or_(f"title.ilike.%{q}%,url.ilike.%{q}%,description.ilike.%{q}%")

    result = query.order("position", desc=False, nulls_last=True).range(offset, offset + limit - 1).execute()
    return result.data


# ── TRASH ────────────────────────────────────────────────────────────────────

@router.get("/trash", response_model=list[LinkResponse], summary="Listar lixeira")
def list_trash():
    result = _db().table("links").select("*").eq("is_deleted", True).execute()
    return result.data


# ── BROKEN LINKS ─────────────────────────────────────────────────────────────

@router.get("/broken", summary="Verificar links quebrados")
async def check_broken_links():
    """Verifica todos os links ativos e retorna os que estão inacessíveis."""
    from app.services.link_checker import check_links_bulk

    result = _db().table("links").select("id, url, title").eq("is_deleted", False).execute()
    links = result.data

    url_list = [link["url"] for link in links]
    check_results = await check_links_bulk(url_list)

    # Mescla resultados com IDs
    merged = []
    for link, check in zip(links, check_results):
        merged.append({
            "id": link["id"],
            "url": link["url"],
            "title": link["title"],
            "status": check["status"],
            "status_code": check.get("status_code"),
        })

    return {
        "total": len(merged),
        "broken": [r for r in merged if r["status"] == "broken"],
        "errors": [r for r in merged if r["status"] == "error"],
        "ok": len([r for r in merged if r["status"] == "ok"]),
    }


# ── GET BY ID ────────────────────────────────────────────────────────────────

@router.get("/{link_id}", response_model=LinkResponse, summary="Buscar link por ID")
def get_link(link_id: str):
    result = _db().table("links").select("*").eq("id", link_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    return result.data


# ── CREATE ───────────────────────────────────────────────────────────────────

@router.post("", response_model=LinkResponse, status_code=201, summary="Criar link")
def create_link(link: LinkCreate):
    data = link.model_dump(exclude_none=True)
    if "due_date" in data and data["due_date"]:
        data["due_date"] = str(data["due_date"])
    result = _db().table("links").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Erro ao criar link")
    return result.data[0]


# ── UPDATE ───────────────────────────────────────────────────────────────────

@router.put("/{link_id}", response_model=LinkResponse, summary="Atualizar link")
def update_link(link_id: str, link: LinkUpdate):
    data = link.model_dump(exclude_none=True)
    if "due_date" in data and data["due_date"]:
        data["due_date"] = str(data["due_date"])
    result = _db().table("links").update(data).eq("id", link_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    return result.data[0]


# ── TOGGLE FAVORITE ──────────────────────────────────────────────────────────

@router.patch("/{link_id}/favorite", response_model=LinkResponse, summary="Toggle favorito")
def toggle_favorite(link_id: str):
    current = _db().table("links").select("is_favorite").eq("id", link_id).single().execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    new_value = not current.data["is_favorite"]
    result = _db().table("links").update({"is_favorite": new_value}).eq("id", link_id).execute()
    return result.data[0]


# ── SOFT DELETE (TRASH) ──────────────────────────────────────────────────────

@router.delete("/{link_id}", status_code=204, summary="Mover para lixeira")
def soft_delete_link(link_id: str):
    result = _db().table("links").update({"is_deleted": True}).eq("id", link_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Link não encontrado")


# ── RESTORE FROM TRASH ───────────────────────────────────────────────────────

@router.post("/{link_id}/restore", response_model=LinkResponse, summary="Restaurar da lixeira")
def restore_link(link_id: str):
    result = _db().table("links").update({"is_deleted": False}).eq("id", link_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    return result.data[0]


# ── PERMANENT DELETE ─────────────────────────────────────────────────────────

@router.delete("/{link_id}/permanent", status_code=204, summary="Excluir permanentemente")
def permanent_delete_link(link_id: str):
    _db().table("links").delete().eq("id", link_id).execute()
