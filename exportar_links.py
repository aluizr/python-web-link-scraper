"""
Script para exportar links do Supabase para CSV ou JSON
Uso: python exportar_links.py [--formato csv|json] [--arquivo nome]
"""

import sys
import json
import csv
from datetime import datetime
from app.database import get_supabase

def exportar_csv(links, arquivo):
    """Exporta links para CSV"""
    if not links:
        print("⚠️  Nenhum link para exportar")
        return False
    
    # Colunas
    colunas = [
        'id', 'url', 'title', 'description', 'category', 'tags',
        'is_favorite', 'favicon', 'og_image', 'notes',
        'status', 'priority', 'due_date', 'created_at'
    ]
    
    with open(arquivo, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=colunas, extrasaction='ignore')
        writer.writeheader()
        
        for link in links:
            # Converter tags de array para string
            if 'tags' in link and isinstance(link['tags'], list):
                link['tags'] = ','.join(link['tags'])
            writer.writerow(link)
    
    return True

def exportar_json(links, arquivo):
    """Exporta links para JSON"""
    if not links:
        print("⚠️  Nenhum link para exportar")
        return False
    
    data = {
        'exported_at': datetime.now().isoformat(),
        'total': len(links),
        'links': links
    }
    
    with open(arquivo, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    
    return True

def exportar_links(formato='csv', arquivo=None, incluir_deletados=False):
    """Exporta links do Supabase"""
    
    print("=" * 70)
    print("  📤 Exportação de Links")
    print("=" * 70)
    print()
    
    # Nome do arquivo padrão
    if not arquivo:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        arquivo = f"links_backup_{timestamp}.{formato}"
    
    print(f"📋 Formato: {formato.upper()}")
    print(f"📄 Arquivo: {arquivo}")
    print()
    
    # Conectar ao Supabase
    print("📡 Conectando ao Supabase...")
    try:
        db = get_supabase()
        print("   ✅ Conectado")
    except Exception as e:
        print(f"   ❌ Erro ao conectar: {e}")
        return False
    
    # Buscar links
    print()
    print("🔍 Buscando links...")
    try:
        query = db.table("links").select("*")
        
        if not incluir_deletados:
            # Tentar filtrar deletados (se a coluna existir)
            try:
                query = query.eq("is_deleted", False)
            except:
                pass  # Coluna não existe, buscar todos
        
        result = query.order("created_at", desc=True).execute()
        links = result.data
        
        print(f"   ✅ {len(links)} links encontrados")
    except Exception as e:
        print(f"   ❌ Erro ao buscar links: {e}")
        return False
    
    if not links:
        print()
        print("ℹ️  Nenhum link para exportar")
        return True
    
    # Exportar
    print()
    print(f"💾 Exportando para {formato.upper()}...")
    try:
        if formato == 'csv':
            sucesso = exportar_csv(links, arquivo)
        elif formato == 'json':
            sucesso = exportar_json(links, arquivo)
        else:
            print(f"❌ Formato não suportado: {formato}")
            return False
        
        if sucesso:
            print(f"   ✅ Exportado com sucesso!")
    except Exception as e:
        print(f"   ❌ Erro ao exportar: {e}")
        return False
    
    # Resumo
    print()
    print("=" * 70)
    print("  📊 RESUMO DA EXPORTAÇÃO")
    print("=" * 70)
    print(f"  Total de links: {len(links)}")
    print(f"  Arquivo: {arquivo}")
    print(f"  Formato: {formato.upper()}")
    print("=" * 70)
    print()
    print("✅ Exportação concluída!")
    print()
    print("💡 Para importar em outro projeto:")
    print(f"   python importar_links.py {arquivo}")
    
    return True

def main():
    formato = 'csv'
    arquivo = None
    incluir_deletados = False
    
    # Processar argumentos
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == '--formato' and i + 1 < len(args):
            formato = args[i + 1].lower()
            i += 2
        elif args[i] == '--arquivo' and i + 1 < len(args):
            arquivo = args[i + 1]
            i += 2
        elif args[i] == '--incluir-deletados':
            incluir_deletados = True
            i += 1
        else:
            i += 1
    
    # Validar formato
    if formato not in ['csv', 'json']:
        print("❌ Formato inválido. Use: csv ou json")
        sys.exit(1)
    
    sucesso = exportar_links(formato, arquivo, incluir_deletados)
    sys.exit(0 if sucesso else 1)

if __name__ == "__main__":
    if '--help' in sys.argv or '-h' in sys.argv:
        print("Uso: python exportar_links.py [opções]")
        print()
        print("Opções:")
        print("  --formato csv|json        Formato de exportação (padrão: csv)")
        print("  --arquivo nome            Nome do arquivo de saída")
        print("  --incluir-deletados       Incluir links da lixeira")
        print()
        print("Exemplos:")
        print("  python exportar_links.py")
        print("  python exportar_links.py --formato json")
        print("  python exportar_links.py --formato csv --arquivo meus_links.csv")
        print("  python exportar_links.py --incluir-deletados")
        sys.exit(0)
    
    main()
