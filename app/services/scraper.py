"""
Scraper service — extrai metadados de uma URL usando BeautifulSoup4.

Extrai:
- title      (og:title → twitter:title → <title>)
- description (og:description → twitter:description → meta[name=description])
- og_image   (og:image → twitter:image)
- favicon    (link[rel*=icon] → /favicon.ico fallback)
"""

import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
}

TIMEOUT = 10.0


def _get_meta_content(soup: BeautifulSoup, *selectors: dict) -> Optional[str]:
    """Tenta cada seletor de meta tag em ordem e retorna o primeiro conteúdo encontrado."""
    for sel in selectors:
        tag = soup.find("meta", sel)
        if tag and tag.get("content"):
            return tag["content"].strip()
    return None


def _get_favicon(soup: BeautifulSoup, base_url: str) -> Optional[str]:
    """Extrai o favicon da página ou retorna o /favicon.ico padrão."""
    # Tenta link[rel*=icon] em ordem de preferência
    for rel in (["shortcut icon"], ["icon"], ["apple-touch-icon"]):
        tag = soup.find("link", rel=rel)
        if tag and tag.get("href"):
            href = tag["href"].strip()
            if href.startswith("http"):
                return href
            return urljoin(base_url, href)

    # Fallback: /favicon.ico
    parsed = urlparse(base_url)
    return f"{parsed.scheme}://{parsed.netloc}/favicon.ico"


async def scrape_metadata(url: str) -> dict:
    """
    Busca a URL via httpx e extrai metadados com BeautifulSoup.

    Returns:
        dict com keys: url, title, description, og_image, favicon
    """
    # Normaliza URL
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    async with httpx.AsyncClient(
        headers=HEADERS,
        timeout=TIMEOUT,
        follow_redirects=True,
    ) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.TimeoutException:
            raise ValueError(f"Timeout ao tentar acessar: {url}")
        except httpx.HTTPStatusError as e:
            raise ValueError(f"Erro HTTP {e.response.status_code} ao acessar: {url}")
        except Exception as e:
            raise ValueError(f"Erro ao acessar URL: {e}")

    soup = BeautifulSoup(response.text, "html.parser")

    # --- Título ---
    title = _get_meta_content(
        soup,
        {"property": "og:title"},
        {"name": "twitter:title"},
    )
    if not title:
        tag = soup.find("title")
        if tag:
            title = tag.get_text(strip=True)

    # Limpa sufixo de branding ("Título | Site" → "Título")
    if title:
        for sep in [" | ", " - ", " – ", " — "]:
            if sep in title:
                parts = title.split(sep)
                if len(parts[-1]) < 30:
                    title = sep.join(parts[:-1]).strip()
                break

    # --- Descrição ---
    description = _get_meta_content(
        soup,
        {"property": "og:description"},
        {"name": "twitter:description"},
        {"name": "description"},
    )
    if description:
        description = description[:300]

    # --- OG Image ---
    og_image = _get_meta_content(
        soup,
        {"property": "og:image"},
        {"name": "twitter:image"},
        {"name": "twitter:image:src"},
        {"itemprop": "image"},
    )
    # Converte URL relativa em absoluta
    if og_image and not og_image.startswith("http"):
        og_image = urljoin(url, og_image)

    # --- Favicon ---
    favicon = _get_favicon(soup, url)

    return {
        "url": url,
        "title": title or "",
        "description": description or "",
        "og_image": og_image or "",
        "favicon": favicon or "",
    }
