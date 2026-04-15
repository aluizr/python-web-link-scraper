#!/usr/bin/env python3
"""
Testa o FastAPI diretamente com TestClient
"""
from fastapi.testclient import TestClient
from app.main import app

print("🧪 Testando FastAPI com TestClient...")
print()

client = TestClient(app)

try:
    print("📋 GET /api/categories...")
    response = client.get("/api/categories")
    
    print(f"Status: {response.status_code}")
    print()
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Sucesso! Total: {len(data)}")
        print()
        if data:
            print("Primeiras 3 categorias:")
            for cat in data[:3]:
                print(f"  - {cat['name']}")
    else:
        print(f"❌ Erro {response.status_code}")
        print(f"Resposta: {response.text}")
        
except Exception as e:
    print(f"❌ Exceção: {e}")
    import traceback
    traceback.print_exc()
