"""
Python Web Link Scraper — FastAPI Application

Endpoints disponíveis:
  POST   /api/scrape              Extrair metadados de uma URL
  GET    /api/links               Listar links
  POST   /api/links               Criar link
  GET    /api/links/{id}          Buscar link
  PUT    /api/links/{id}          Atualizar link
  DELETE /api/links/{id}          Mover para lixeira
  DELETE /api/links/{id}/permanent Excluir permanentemente
  PATCH  /api/links/{id}/favorite Toggle favorito
  POST   /api/links/{id}/restore  Restaurar da lixeira
  GET    /api/links/trash         Listar lixeira
  GET    /api/links/broken        Verificar links quebrados
  GET    /api/categories          Listar categorias
  POST   /api/categories          Criar categoria
  PUT    /api/categories/{id}     Atualizar categoria
  DELETE /api/categories/{id}     Excluir categoria
  GET    /api/export/json         Exportar JSON
  GET    /api/export/csv          Exportar CSV
  GET    /api/export/html         Exportar HTML Bookmarks
  GET    /api/stats               Estatísticas

Docs interativos: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Routers
app.include_router(scraper.router)
app.include_router(links.router)
app.include_router(categories.router)
app.include_router(export.router)
app.include_router(stats.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "app": "Python Web Link Scraper",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


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
