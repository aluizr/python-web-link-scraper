"""Script para iniciar o servidor FastAPI"""
import uvicorn
from app.config import get_settings
import sys

def main():
    try:
        settings = get_settings()
        
        print("=" * 60)
        print("  🚀 Python Web Link Scraper")
        print("=" * 60)
        print()
        print(f"  🌐 Interface Web:    http://localhost:{settings.app_port}")
        print(f"  📚 API Docs:         http://localhost:{settings.app_port}/docs")
        print(f"  📖 ReDoc:            http://localhost:{settings.app_port}/redoc")
        print(f"  ❤️  Health Check:    http://localhost:{settings.app_port}/health")
        print()
        print("  💡 Pressione CTRL+C para parar o servidor")
        print("=" * 60)
        print()
        
        uvicorn.run(
            "app.main:app",
            host=settings.app_host,
            port=settings.app_port,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n👋 Servidor encerrado. Até logo!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")
        print("\n💡 Verifique:")
        print("  1. Se o arquivo .env existe e está configurado")
        print("  2. Se a porta não está em uso")
        print("  3. Se as dependências estão instaladas (pip install -r requirements.txt)")
        sys.exit(1)

if __name__ == "__main__":
    main()

