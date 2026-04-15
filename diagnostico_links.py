"""Script para diagnosticar problemas com links não aparecendo"""
from app.database import get_supabase
from app.config import get_settings

def diagnosticar():
    print("=" * 60)
    print("  🔍 Diagnóstico de Links")
    print("=" * 60)
    print()
    
    settings = get_settings()
    print(f"📡 Conectando ao Supabase...")
    print(f"   URL: {settings.supabase_url}")
    print()
    
    try:
        db = get_supabase()
        
        # 1. Verificar total de links (incluindo deletados)
        print("1️⃣  Verificando total de links...")
        all_links = db.table("links").select("id, is_deleted").execute()
        total = len(all_links.data)
        print(f"   ✅ Total de links no banco: {total}")
        
        if total == 0:
            print()
            print("❌ PROBLEMA ENCONTRADO: Não há links no banco de dados!")
            print()
            print("💡 Possíveis causas:")
            print("   1. Você está conectado ao projeto Supabase errado")
            print("   2. Os links estão em outra tabela")
            print("   3. As migrations não foram aplicadas")
            print()
            print("🔧 Soluções:")
            print("   1. Verifique o SUPABASE_URL no arquivo .env")
            print("   2. Verifique se você tem links em outro projeto")
            print("   3. Importe seus links usando o Scraper ou manualmente")
            return
        
        # 2. Verificar links ativos vs deletados
        print()
        print("2️⃣  Verificando status dos links...")
        ativos = [l for l in all_links.data if not l.get("is_deleted", False)]
        deletados = [l for l in all_links.data if l.get("is_deleted", False)]
        
        print(f"   ✅ Links ativos: {len(ativos)}")
        print(f"   🗑️  Links na lixeira: {len(deletados)}")
        
        if len(ativos) == 0 and len(deletados) > 0:
            print()
            print("⚠️  PROBLEMA: Todos os links estão na lixeira!")
            print()
            print("🔧 Solução: Restaure os links da lixeira:")
            print("   1. Acesse http://localhost:8080")
            print("   2. Clique em 'Lixeira' no menu lateral")
            print("   3. Clique em 'Restaurar' nos links que deseja recuperar")
            return
        
        # 3. Verificar estrutura dos links
        print()
        print("3️⃣  Verificando estrutura dos links...")
        sample = db.table("links").select("*").limit(1).execute()
        if sample.data:
            link = sample.data[0]
            campos = list(link.keys())
            print(f"   ✅ Campos disponíveis: {', '.join(campos)}")
            
            # Mostrar exemplo
            print()
            print("📄 Exemplo de link:")
            print(f"   ID: {link.get('id', 'N/A')}")
            print(f"   Título: {link.get('title', 'N/A')}")
            print(f"   URL: {link.get('url', 'N/A')}")
            print(f"   Categoria: {link.get('category', 'Sem categoria')}")
            print(f"   Favorito: {'Sim' if link.get('is_favorite') else 'Não'}")
            print(f"   Deletado: {'Sim' if link.get('is_deleted') else 'Não'}")
        
        # 4. Verificar categorias
        print()
        print("4️⃣  Verificando categorias...")
        cats = db.table("categories").select("*").execute()
        print(f"   ✅ Total de categorias: {len(cats.data)}")
        if cats.data:
            print(f"   📁 Categorias: {', '.join([c['name'] for c in cats.data[:5]])}")
        
        # 5. Testar endpoint da API
        print()
        print("5️⃣  Testando endpoint da API...")
        try:
            import urllib.request
            import json
            with urllib.request.urlopen("http://localhost:8080/api/links", timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    print(f"   ✅ API respondendo: {len(data)} links retornados")
                else:
                    print(f"   ❌ API retornou status {response.status}")
        except Exception as e:
            print(f"   ❌ Erro ao acessar API: {e}")
            print("   💡 Certifique-se de que o servidor está rodando")
        
        # Resumo
        print()
        print("=" * 60)
        print("  📊 RESUMO")
        print("=" * 60)
        print(f"  Total de links: {total}")
        print(f"  Links ativos: {len(ativos)}")
        print(f"  Links na lixeira: {len(deletados)}")
        print(f"  Categorias: {len(cats.data)}")
        print()
        
        if len(ativos) > 0:
            print("✅ TUDO OK! Seus links devem aparecer na interface.")
            print()
            print("🌐 Acesse: http://localhost:8080")
        else:
            print("⚠️  Nenhum link ativo encontrado.")
            print()
            print("💡 Próximos passos:")
            print("   1. Verifique a lixeira")
            print("   2. Adicione novos links")
            print("   3. Importe links de um arquivo")
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        print()
        print("💡 Verifique:")
        print("   1. Se o arquivo .env está configurado corretamente")
        print("   2. Se o SUPABASE_URL e SUPABASE_KEY estão corretos")
        print("   3. Se você tem acesso ao projeto Supabase")

if __name__ == "__main__":
    diagnosticar()
