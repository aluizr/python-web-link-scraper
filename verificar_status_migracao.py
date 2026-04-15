"""Script para verificar o status da migração"""
from pathlib import Path
from app.database import get_supabase
import sys

def verificar_status():
    print("=" * 70)
    print("  🔍 Status da Migração")
    print("=" * 70)
    print()
    
    status = {
        'passo1': False,
        'passo2': False,
        'passo3': False,
        'passo4': False
    }
    
    # Passo 1: Verificar se arquivo de backup existe
    print("📤 PASSO 1: Exportar do Projeto Antigo")
    arquivo_backup = Path("links_backup.csv")
    if arquivo_backup.exists():
        print("   ✅ Arquivo links_backup.csv encontrado")
        status['passo1'] = True
    else:
        print("   ❌ Arquivo links_backup.csv NÃO encontrado")
        print("   💡 Exporte os links do projeto antigo e salve aqui")
    print()
    
    # Passo 2: Verificar se banco está configurado
    print("🔧 PASSO 2: Preparar Projeto Novo")
    try:
        db = get_supabase()
        
        # Testar leitura
        result = db.table("links").select("id").limit(1).execute()
        print("   ✅ Leitura do banco: OK")
        
        # Testar escrita
        try:
            test_link = {
                "url": "https://test-migration.com",
                "title": "Teste de Migração"
            }
            result = db.table("links").insert(test_link).execute()
            if result.data:
                link_id = result.data[0]["id"]
                db.table("links").delete().eq("id", link_id).execute()
                print("   ✅ Escrita no banco: OK")
                print("   ✅ RLS desabilitado: OK")
                status['passo2'] = True
            else:
                print("   ❌ Escrita no banco: FALHOU")
                print("   💡 Execute o SQL: migration_completa.sql")
        except Exception as e:
            if "row-level security" in str(e).lower():
                print("   ❌ RLS ainda está ativo")
                print("   💡 Execute o SQL: migration_completa.sql")
            else:
                print(f"   ❌ Erro na escrita: {e}")
                print("   💡 Execute o SQL: migration_completa.sql")
    except Exception as e:
        print(f"   ❌ Erro ao conectar: {e}")
        print("   💡 Verifique o arquivo .env")
    print()
    
    # Passo 3: Verificar se links foram importados
    print("📥 PASSO 3: Importar Links")
    try:
        db = get_supabase()
        result = db.table("links").select("id").execute()
        total = len(result.data)
        
        if total > 0:
            print(f"   ✅ {total} links encontrados no banco")
            status['passo3'] = True
        else:
            print("   ⚠️  Nenhum link no banco ainda")
            if status['passo1'] and status['passo2']:
                print("   💡 Execute: python importar_links.py links_backup.csv")
            else:
                print("   💡 Complete os passos 1 e 2 primeiro")
    except Exception as e:
        print(f"   ❌ Erro ao verificar links: {e}")
    print()
    
    # Passo 4: Verificar se servidor está acessível
    print("🌐 PASSO 4: Verificar Interface")
    try:
        import urllib.request
        with urllib.request.urlopen("http://localhost:8080/health", timeout=3) as response:
            if response.status == 200:
                print("   ✅ Servidor está rodando")
                print("   ✅ Interface acessível em: http://localhost:8080")
                status['passo4'] = True
            else:
                print(f"   ⚠️  Servidor respondeu com status {response.status}")
    except:
        print("   ❌ Servidor NÃO está rodando")
        print("   💡 Execute: python start_server.py")
    print()
    
    # Resumo
    print("=" * 70)
    print("  📊 RESUMO")
    print("=" * 70)
    
    passos_completos = sum(status.values())
    total_passos = len(status)
    
    print(f"  Progresso: {passos_completos}/{total_passos} passos completos")
    print()
    
    if status['passo1']:
        print("  ✅ Passo 1: Arquivo exportado")
    else:
        print("  ❌ Passo 1: Exporte os links do projeto antigo")
    
    if status['passo2']:
        print("  ✅ Passo 2: Banco configurado")
    else:
        print("  ❌ Passo 2: Execute migration_completa.sql no Supabase")
    
    if status['passo3']:
        print("  ✅ Passo 3: Links importados")
    else:
        print("  ❌ Passo 3: Importe os links")
    
    if status['passo4']:
        print("  ✅ Passo 4: Interface funcionando")
    else:
        print("  ❌ Passo 4: Inicie o servidor")
    
    print()
    
    if passos_completos == total_passos:
        print("  🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        print()
        print("  🌐 Acesse: http://localhost:8080")
    else:
        print("  ⚠️  AÇÃO NECESSÁRIA")
        print()
        print("  📖 Próximo passo:")
        if not status['passo1']:
            print("     1. Exporte os links do projeto antigo")
            print("        Veja: GUIA_EXPORTAR_IMPORTAR.md")
        elif not status['passo2']:
            print("     2. Execute migration_completa.sql no Supabase")
            print("        Veja: PASSO_A_PASSO_COMPLETO.md")
        elif not status['passo3']:
            print("     3. Execute: python importar_links.py links_backup.csv")
        elif not status['passo4']:
            print("     4. Execute: python start_server.py")
    
    print("=" * 70)
    
    return passos_completos == total_passos

if __name__ == "__main__":
    sucesso = verificar_status()
    sys.exit(0 if sucesso else 1)
