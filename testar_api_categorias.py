#!/usr/bin/env python3
"""
Testa o endpoint HTTP /api/categories
"""
import urllib.request
import json

print("🧪 Testando endpoint HTTP /api/categories...")
print()

try:
    response = urllib.request.urlopen('http://localhost:8080/api/categories')
    data = json.loads(response.read())
    
    print(f"✅ Sucesso! Status: {response.status}")
    print(f"📊 Total de categorias: {len(data)}")
    print()
    
    if data:
        print("Primeiras 3 categorias:")
        for cat in data[:3]:
            print(f"  - {cat['name']} (ID: {cat['id']})")
    
except urllib.error.HTTPError as e:
    print(f"❌ Erro HTTP {e.code}: {e.reason}")
    print(f"Resposta: {e.read().decode()}")
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
