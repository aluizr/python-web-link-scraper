"""
Script para importar links de CSV ou JSON para o Supabase
Uso: python importar_links.py arquivo.csv [--skip-duplicates]
"""

import sys
import json
import csv
from pathlib import Path
from app.database import get_supabase
from datetime import datetime

def ler_csv(arquivo):
    """Lê arquivo CSV e retorna lista de links"""
    links = []
    with open(arquivo, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Processar tags (string separada por vírgula para array)
            if 'tags' in row and row['tags']:
                if isinstance(row['tags'], str):
                    row['tags'] = [t.strip() for t in row['tags'].split(',') if t.strip()]
            else:
                row['tags'] = []
            
            # Converter booleanos
            if 'is_favorite' in row:
                row['is_favorite'] = row['is_favorite'].lower() in ('true', '1', 'yes', 'sim')
            
            # Limpar campos vazios
            link = {k: v for k, v in row.items() if v and v != ''}
            links.append(link)
    
    return links

def ler_json(arquivo):
    """Lê arquivo JSON e retorna lista de links"""
    with open(arquivo, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Se for um objeto com chave 'links', extrair
    if isinstance(data, dict) and 'links' in data:
        data = data['links']
    
    # Garantir que tags é array
    for link in data:
        if 'tags' in link and isinstance(link['tags'], str):
            link['tags'] = [t.strip() for t in link['tags'].split(',') if t.strip()]
        elif 'tags' not in link:
            link['tags'] = []
    
    return data

def normalizar_link(link):
    """Normaliza e valida um link"""
    # Campos obrigatórios
    if 'url' not in link or not link['url']:
        return None
    
    # Campos padrão (garantir que strings nunca sejam None)
    link_normalizado = {
        'url': link.get('url', '').strip() if link.get('url') else '',
        'title': link.get('title', '').strip() if link.get('title') else '',
        'description': link.get('description', '').strip() if link.get('description') else '',
        'category': link.get('category', '').strip() if link.get('category') else '',
        'tags': link.get('tags', []) if link.get('tags') else [],
        'is_favorite': bool(link.get('is_favorite', False)),
        'favicon': link.get('favicon', '').strip() if link.get('favicon') else '',
        'og_image': link.get('og_image', '').strip() if link.get('og_image') else '',
        'notes': link.get('notes', '').strip() if link.get('notes') else '',
        'status': link.get('status', 'backlog') or 'backlog',
        'priority': link.get('priority', 'medium') or 'medium',
    }
    
    # Due date (se existir)
    if 'due_date' in link and link['due_date']:
        link_normalizado['due_date'] = link['due_date']
    
    # Garantir que campos obrigatórios não sejam vazios
    if not link_normalizado['url']:
        return None
    
    return link_normalizado

def importar_links(arquivo, skip_duplicates=False):
    """Importa links do arquivo para o Supabase"""
    
    print("=" * 70)
    print("  📦 Importação de Links")
    print("=" * 70)
    print()
    
    # Verificar se arquivo existe
    if not Path(arquivo).exists():
        print(f"❌ Arquivo não encontrado: {arquivo}")
        return False
    
    # Detectar formato
    extensao = Path(arquivo).suffix.lower()
    print(f"📄 Arquivo: {arquivo}")
    print(f"📋 Formato: {extensao}")
    print()
    
    # Ler arquivo
    print("🔍 Lendo arquivo...")
    try:
        if extensao == '.csv':
            links = ler_csv(arquivo)
        elif extensao == '.json':
            links = ler_json(arquivo)
        else:
            print(f"❌ Formato não suportado: {extensao}")
            print("   Formatos aceitos: .csv, .json")
            return False
        
        print(f"   ✅ {len(links)} links encontrados")
    except Exception as e:
        print(f"   ❌ Erro ao ler arquivo: {e}")
        return False
    
    # Normalizar links
    print()
    print("🔧 Normalizando dados...")
    links_normalizados = []
    for i, link in enumerate(links, 1):
        normalizado = normalizar_link(link)
        if normalizado:
            links_normalizados.append(normalizado)
        else:
            print(f"   ⚠️  Link {i} ignorado (URL inválida)")
    
    print(f"   ✅ {len(links_normalizados)} links válidos")
    
    if not links_normalizados:
        print()
        print("❌ Nenhum link válido para importar")
        return False
    
    # Conectar ao Supabase
    print()
    print("📡 Conectando ao Supabase...")
    try:
        db = get_supabase()
        print("   ✅ Conectado")
    except Exception as e:
        print(f"   ❌ Erro ao conectar: {e}")
        return False
    
    # Verificar duplicatas
    if skip_duplicates:
        print()
        print("🔍 Verificando duplicatas...")
        try:
            existing = db.table("links").select("url").execute()
            existing_urls = {link['url'] for link in existing.data}
            
            links_novos = [l for l in links_normalizados if l['url'] not in existing_urls]
            duplicatas = len(links_normalizados) - len(links_novos)
            
            if duplicatas > 0:
                print(f"   ⚠️  {duplicatas} links duplicados serão ignorados")
            
            links_normalizados = links_novos
            print(f"   ✅ {len(links_normalizados)} links novos para importar")
        except Exception as e:
            print(f"   ⚠️  Erro ao verificar duplicatas: {e}")
    
    if not links_normalizados:
        print()
        print("ℹ️  Nenhum link novo para importar")
        return True
    
    # Importar em lotes
    print()
    print("📥 Importando links...")
    BATCH_SIZE = 50
    total = len(links_normalizados)
    sucesso = 0
    erros = 0
    
    for i in range(0, total, BATCH_SIZE):
        batch = links_normalizados[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
        
        try:
            result = db.table("links").insert(batch).execute()
            sucesso += len(batch)
            print(f"   ✅ Lote {batch_num}/{total_batches}: {len(batch)} links importados")
        except Exception as e:
            erros += len(batch)
            print(f"   ❌ Lote {batch_num}/{total_batches}: Erro - {e}")
    
    # Resumo
    print()
    print("=" * 70)
    print("  📊 RESUMO DA IMPORTAÇÃO")
    print("=" * 70)
    print(f"  Total no arquivo: {len(links)}")
    print(f"  Links válidos: {len(links_normalizados)}")
    print(f"  ✅ Importados com sucesso: {sucesso}")
    if erros > 0:
        print(f"  ❌ Erros: {erros}")
    print("=" * 70)
    print()
    
    if sucesso > 0:
        print("✅ Importação concluída!")
        print()
        print("🌐 Acesse: http://localhost:8080")
        print("🔍 Verifique: python diagnostico_links.py")
        return True
    else:
        print("❌ Nenhum link foi importado")
        print()
        print("💡 Possíveis causas:")
        print("   1. RLS está bloqueando (execute: python corrigir_banco.py)")
        print("   2. Estrutura da tabela está incorreta (aplique migrations)")
        print("   3. Formato dos dados está incorreto")
        return False

def main():
    if len(sys.argv) < 2:
        print("Uso: python importar_links.py arquivo.csv [--skip-duplicates]")
        print()
        print("Exemplos:")
        print("  python importar_links.py links_backup.csv")
        print("  python importar_links.py links_backup.json")
        print("  python importar_links.py links.csv --skip-duplicates")
        sys.exit(1)
    
    arquivo = sys.argv[1]
    skip_duplicates = '--skip-duplicates' in sys.argv
    
    sucesso = importar_links(arquivo, skip_duplicates)
    sys.exit(0 if sucesso else 1)

if __name__ == "__main__":
    main()
