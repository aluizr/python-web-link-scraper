#!/usr/bin/env python3
"""
Inicia o servidor na porta 8081 para testes
"""
import uvicorn

print("=" * 60)
print("  🚀 Python Web Link Scraper - PORTA 8081")
print("=" * 60)
print("  🌐 Interface Web:    http://localhost:8081")
print("  📚 API Docs:         http://localhost:8081/docs")
print("  ❤️  Health Check:    http://localhost:8081/health")
print("  💡 Pressione CTRL+C para parar o servidor")
print("=" * 60)

uvicorn.run(
    "app.main:app",
    host="0.0.0.0",
    port=8081,
    reload=True,
)
