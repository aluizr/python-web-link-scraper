"""
Router: /api/categories
CRUD de categorias.
"""

from fastapi import APIRouter, HTTPException
from app.models.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.database import get_supabase

router = APIRouter(prefix="/api/categories", tags=["Categorias"])


def _db():
    return get_supabase()


@router.get("", summary="Listar categorias")
def list_categories():
    try:
        print("DEBUG: Iniciando list_categories")
        result = _db().table("categories").select("*").execute()
        print(f"DEBUG: Resultado obtido, {len(result.data)} categorias")
        print(f"DEBUG: Tipo de result.data: {type(result.data)}")
        print(f"DEBUG: Primeira categoria: {result.data[0] if result.data else 'vazio'}")
        return result.data
    except Exception as e:
        print(f"ERRO ao listar categorias: {e}")
        print(f"ERRO tipo: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao listar categorias: {str(e)}")


@router.post("", response_model=CategoryResponse, status_code=201, summary="Criar categoria")
def create_category(category: CategoryCreate):
    result = _db().table("categories").insert(category.model_dump(exclude_none=True)).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Erro ao criar categoria")
    return result.data[0]


@router.put("/{category_id}", response_model=CategoryResponse, summary="Atualizar categoria")
def update_category(category_id: str, category: CategoryUpdate):
    data = category.model_dump(exclude_none=True)
    result = _db().table("categories").update(data).eq("id", category_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return result.data[0]


@router.delete("/{category_id}", status_code=204, summary="Excluir categoria")
def delete_category(category_id: str):
    _db().table("categories").delete().eq("id", category_id).execute()
