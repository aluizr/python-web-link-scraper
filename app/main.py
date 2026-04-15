"""
Python Web Link Scraper — FastAPI Application
Interface visual: http://localhost:8080/
Swagger UI:       http://localhost:8080/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.config import get_settings
from app.routers import links, categories, scraper, export, stats

settings = get_settings()

app = FastAPI(
    title="Python Web Link Scraper",
    description=(
        "API REST para captura e gerenciamento de links.\n\n"
        "Use `POST /api/scrape` para extrair metadados de qualquer URL via BeautifulSoup4."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ───────────────────────────────────────────────────────────
app.include_router(scraper.router)
app.include_router(links.router)
app.include_router(categories.router)
app.include_router(export.router)
app.include_router(stats.router)

# ── Static Files ──────────────────────────────────────────────────────────
STATIC_DIR = Path(__file__).parent.parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# ── Frontend (SPA) ────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def frontend():
    """Serve the web frontend."""
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=True,
    )
