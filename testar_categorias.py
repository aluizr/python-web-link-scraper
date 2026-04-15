#!/usr/bin/env python3
"""
Script para testar o endpoint de categorias e ver o erro exato
"""
import requests
import json

print("🧪 Testando endpoint /api/categories...")
print()

try:
    response = requests.get("http://localhost:8080/api/categories")
    print(f"Status Code: {response.status_code}")
    print()
    
    if response.status_code == 200:
        print("✅ Sucesso!")
        data = response.json()
        print(f"Total de categorias: {len(data)}")
        print()
        print("Primeiras 3 categorias:")
        for cat in data[:3]:
            print(f"  - {cat.get('name', 'N/A')} (ID: {cat.get('id', 'N/A')})")
    else:
        print("❌ Erro!")
        print(f"Resposta: {response.text}")
        
except Exception as e:
    print(f"❌ Exceção: {e}")
    import traceback
    traceback.print_exc()
