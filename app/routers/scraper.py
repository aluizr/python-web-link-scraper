"""
Router: /api/scrape
Extrai metadados de uma URL usando BeautifulSoup.
"""

from fastapi import APIRouter, HTTPException
from app.models.link import ScrapeRequest, ScrapeResponse, LinkCreate
from app.services.scraper import scrape_metadata
from app.database import get_supabase

router = APIRouter(prefix="/api/scrape", tags=["Scraper"])


@router.post("", response_model=ScrapeResponse, summary="Extrair metadados de uma URL")
async def scrape_url(request: ScrapeRequest):
    """
    Extrai metadados (título, descrição, og:image, favicon) de uma URL usando BeautifulSoup.

    - **url**: URL a ser analisada (http:// é adicionado automaticamente se ausente)
    - **save**: se `true`, salva o link no Supabase após a extração
    - **category**: categoria do link (usado apenas se `save=true`)
    - **tags**: tags do link (usado apenas se `save=true`)
    """
    try:
        metadata = await scrape_metadata(request.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer scraping: {str(e)}")

    response = ScrapeResponse(
        url=metadata.get("url", request.url),
        title=metadata.get("title") or None,
        description=metadata.get("description") or None,
        og_image=metadata.get("og_image") or None,
        favicon=metadata.get("favicon") or None,
        saved=False,
    )

    if request.save:
        try:
            supabase = get_supabase()
            link_data = LinkCreate(
                url=metadata.get("url", request.url),
                title=metadata.get("title", ""),
                description=metadata.get("description", ""),
                og_image=metadata.get("og_image", ""),
                favicon=metadata.get("favicon", ""),
                category=request.category or "",
                tags=request.tags or [],
            )
            result = (
                supabase.table("links")
                .insert(link_data.model_dump(exclude_none=True))
                .execute()
            )
            if result.data:
                response.saved = True
                response.link_id = result.data[0]["id"]
        except Exception as e:
            # Não falha se não conseguir salvar, apenas retorna os metadados
            print(f"Erro ao salvar link: {e}")

    return response
