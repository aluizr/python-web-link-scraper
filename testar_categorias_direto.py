#!/usr/bin/env python3
"""
Testa o endpoint de categorias diretamente via Supabase
"""
from app.database import get_supabase

print("🧪 Testando acesso direto às categorias...")
print()

try:
    supabase = get_supabase()
    print("✅ Conexão com Supabase OK")
    print()
    
    # Tenta listar categorias
    print("📋 Listando categorias...")
    result = supabase.table("categories").select("*").execute()
    
    print(f"✅ Sucesso! Total: {len(result.data)}")
    print()
    
    if result.data:
        print("Primeiras 3 categorias:")
        for cat in result.data[:3]:
            print(f"  - {cat.get('name', 'N/A')} (ID: {cat.get('id', 'N/A')})")
            print(f"    Campos: {list(cat.keys())}")
    else:
        print("⚠️  Nenhuma categoria encontrada")
        
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
