"""Script para tentar corrigir o banco de dados automaticamente"""
from app.database import get_supabase
import sys

def corrigir():
    print("=" * 60)
    print("  🔧 Correção Automática do Banco de Dados")
    print("=" * 60)
    print()
    print("⚠️  ATENÇÃO: Este script tentará corrigir o banco de dados.")
    print("   Mas algumas operações só podem ser feitas no Supabase Dashboard.")
    print()
    
    db = get_supabase()
    
    # Teste 1: Verificar se consegue ler
    print("1️⃣  Testando leitura...")
    try:
        result = db.table("links").select("id").limit(1).execute()
        print("   ✅ Leitura OK")
    except Exception as e:
        print(f"   ❌ Erro na leitura: {e}")
        print()
        print("💡 Você precisa aplicar as migrations no Supabase Dashboard")
        print("   Veja o arquivo: SOLUCAO_LINKS_NAO_APARECEM.md")
        return False
    
    # Teste 2: Verificar se consegue escrever
    print()
    print("2️⃣  Testando escrita...")
    try:
        test_link = {
            "url": "https://example.com/test",
            "title": "Teste de Escrita",
            "description": "Link de teste para verificar permissões"
        }
        result = db.table("links").insert(test_link).execute()
        
        if result.data:
            print("   ✅ Escrita OK")
            # Deletar o link de teste
            link_id = result.data[0]["id"]
            db.table("links").delete().eq("id", link_id).execute()
            print("   ✅ Link de teste removido")
            return True
        else:
            print("   ❌ Erro na escrita")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"   ❌ Erro na escrita: {e}")
        print()
        
        if "row-level security" in error_msg.lower():
            print("🔒 PROBLEMA: Row Level Security (RLS) está bloqueando")
            print()
            print("📋 SOLUÇÃO:")
            print("   1. Acesse: https://app.supabase.com")
            print("   2. Vá para SQL Editor")
            print("   3. Execute este comando:")
            print()
            print("   ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;")
            print("   ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;")
            print()
            print("   Ou veja o guia completo em: SOLUCAO_LINKS_NAO_APARECEM.md")
            
        elif "does not exist" in error_msg.lower():
            print("📊 PROBLEMA: Coluna não existe")
            print()
            print("📋 SOLUÇÃO:")
            print("   Aplique as migrations no Supabase Dashboard")
            print("   Veja o arquivo: SOLUCAO_LINKS_NAO_APARECEM.md")
        
        return False

if __name__ == "__main__":
    sucesso = corrigir()
    print()
    print("=" * 60)
    if sucesso:
        print("  ✅ BANCO DE DADOS OK!")
        print()
        print("  🌐 Acesse: http://localhost:8080")
        print("  📝 Adicione seus links!")
    else:
        print("  ⚠️  AÇÃO NECESSÁRIA")
        print()
        print("  📖 Leia: SOLUCAO_LINKS_NAO_APARECEM.md")
        print("  🔧 Aplique as migrations no Supabase Dashboard")
    print("=" * 60)
    
    sys.exit(0 if sucesso else 1)
