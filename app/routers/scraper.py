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

    response = ScrapeResponse(
        url=metadata["url"],
        title=metadata["title"] or None,
        description=metadata["description"] or None,
        og_image=metadata["og_image"] or None,
        favicon=metadata["favicon"] or None,
        saved=False,
    )

    if request.save:
        supabase = get_supabase()
        link_data = LinkCreate(
            url=metadata["url"],
            title=metadata["title"],
            description=metadata["description"],
            og_image=metadata["og_image"],
            favicon=metadata["favicon"],
            category=request.category,
            tags=request.tags,
        )
        result = (
            supabase.table("links")
            .insert(link_data.model_dump(exclude_none=True))
            .execute()
        )
        if result.data:
            response.saved = True
            response.link_id = result.data[0]["id"]

    return response
