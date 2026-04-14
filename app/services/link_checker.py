"""
Link checker service — verifica se um link está acessível (HTTP 2xx/3xx).
"""

import httpx
from typing import Literal

StatusResult = Literal["ok", "broken", "error"]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}
TIMEOUT = 8.0


async def check_link(url: str) -> dict:
    """
    Verifica se uma URL responde com status 2xx ou 3xx.

    Returns:
        dict com keys: url, status ("ok" | "broken" | "error"), status_code
    """
    async with httpx.AsyncClient(
        headers=HEADERS,
        timeout=TIMEOUT,
        follow_redirects=True,
    ) as client:
        try:
            response = await client.head(url)
            status_code = response.status_code
            status: StatusResult = "ok" if status_code < 400 else "broken"
        except httpx.TimeoutException:
            return {"url": url, "status": "error", "status_code": None, "error": "timeout"}
        except Exception as e:
            return {"url": url, "status": "error", "status_code": None, "error": str(e)}

    return {"url": url, "status": status, "status_code": status_code}


async def check_links_bulk(urls: list[str]) -> list[dict]:
    """Verifica múltiplas URLs em sequência (sem sobrecarregar o servidor)."""
    import asyncio
    results = []
    for url in urls:
        result = await check_link(url)
        results.append(result)
        await asyncio.sleep(0.2)  # throttle leve
    return results
