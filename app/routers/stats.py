"""
Router: /api/stats
Estatísticas gerais da coleção de links.
"""

from fastapi import APIRouter
from app.database import get_supabase
from collections import Counter

router = APIRouter(prefix="/api/stats", tags=["Estatísticas"])


@router.get("", summary="Estatísticas gerais")
def get_stats():
    """
    Retorna estatísticas consolidadas:
    - total de links ativos
    - favoritos
    - links na lixeira
    - distribuição por categoria, status e prioridade
    - tags mais usadas (top 20)
    """
    db = get_supabase()

    all_links = db.table("links").select(
        "id, category, tags, is_favorite, status, priority, is_deleted"
    ).execute().data

    active = [l for l in all_links if not l.get("is_deleted")]
    trash = [l for l in all_links if l.get("is_deleted")]

    by_category = Counter(l.get("category") or "Sem categoria" for l in active)
    by_status = Counter(l.get("status") or "backlog" for l in active)
    by_priority = Counter(l.get("priority") or "medium" for l in active)
    favorites = sum(1 for l in active if l.get("is_favorite"))

    # Flatten tags
    all_tags = [tag for l in active for tag in (l.get("tags") or [])]
    top_tags = dict(Counter(all_tags).most_common(20))

    return {
        "total_links": len(active),
        "favorites": favorites,
        "trash": len(trash),
        "by_category": dict(by_category),
        "by_status": dict(by_status),
        "by_priority": dict(by_priority),
        "top_tags": top_tags,
    }
