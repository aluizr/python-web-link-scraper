#!/usr/bin/env python3
import urllib.request
import json

try:
    response = urllib.request.urlopen('http://localhost:8081/api/categories')
    data = json.loads(response.read())
    print(f'✅ Sucesso! Total: {len(data)}')
    for cat in data[:3]:
        print(f'  - {cat["name"]}')
except Exception as e:
    print(f'❌ Erro: {e}')
