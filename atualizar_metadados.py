"""
Script para buscar metadados (thumbnails e descrições) dos links importados
"""

import asyncio
import sys
from app.database import get_supabase
from app.services.scraper import scrape_metadata

async def atualizar_metadados(limite=None, apenas_sem_thumb=True):
    """
    Busca metadados para links que não têm thumbnail ou descrição
    
    Args:
        limite: Número máximo de links para processar (None = todos)
        apenas_sem_thumb: Se True, processa apenas links sem og_image
    """
    
    print("=" * 70)
    print("  🔍 Atualização de Metadados")
    print("=" * 70)
    print()
    
    # Conectar ao banco
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
        query = db.table("links").select("id, url, title, description, og_image, favicon")
        
        if apenas_sem_thumb:
            # Buscar apenas links sem thumbnail OU sem descrição
            query = query.or_("og_image.eq.,description.eq.")
        
        result = query.order("created_at", desc=True).execute()
        links = result.data
        
        if limite:
            links = links[:limite]
        
        print(f"   ✅ {len(links)} links encontrados")
        
        if apenas_sem_thumb:
            sem_thumb = sum(1 for l in links if not l.get('og_image'))
            sem_desc = sum(1 for l in links if not l.get('description'))
            print(f"   📊 Sem thumbnail: {sem_thumb}")
            print(f"   📊 Sem descrição: {sem_desc}")
    except Exception as e:
        print(f"   ❌ Erro ao buscar links: {e}")
        return False
    
    if not links:
        print()
        print("ℹ️  Nenhum link precisa de atualização")
        return True
    
    # Processar links
    print()
    print("🌐 Buscando metadados...")
    print()
    
    sucesso = 0
    erros = 0
    pulos = 0
    
    for i, link in enumerate(links, 1):
        link_id = link['id']
        url = link['url']
        titulo_atual = link.get('title', '')
        
        # Mostrar progresso
        print(f"[{i}/{len(links)}] {titulo_atual[:50]}...")
        
        try:
            # Buscar metadados
            metadados = await scrape_metadata(url)
            
            # Preparar dados para atualizar
            dados_atualizacao = {}
            
            # Atualizar apenas campos vazios
            if not link.get('og_image') and metadados.get('og_image'):
                dados_atualizacao['og_image'] = metadados['og_image']
                print(f"   ✅ Thumbnail encontrada")
            
            if not link.get('description') and metadados.get('description'):
                dados_atualizacao['description'] = metadados['description']
                print(f"   ✅ Descrição encontrada")
            
            if not link.get('title') and metadados.get('title'):
                dados_atualizacao['title'] = metadados['title']
                print(f"   ✅ Título encontrado")
            
            if not link.get('favicon') and metadados.get('favicon'):
                dados_atualizacao['favicon'] = metadados['favicon']
                print(f"   ✅ Favicon encontrado")
            
            # Atualizar no banco se houver dados novos
            if dados_atualizacao:
                db.table("links").update(dados_atualizacao).eq("id", link_id).execute()
                sucesso += 1
            else:
                print(f"   ⏭️  Já tem todos os metadados")
                pulos += 1
            
        except Exception as e:
            erros += 1
            print(f"   ❌ Erro: {str(e)[:60]}")
        
        print()
        
        # Pequena pausa para não sobrecarregar
        if i < len(links):
            await asyncio.sleep(0.5)
    
    # Resumo
    print("=" * 70)
    print("  📊 RESUMO")
    print("=" * 70)
    print(f"  Total processado: {len(links)}")
    print(f"  ✅ Atualizados: {sucesso}")
    print(f"  ⏭️  Já completos: {pulos}")
    if erros > 0:
        print(f"  ❌ Erros: {erros}")
    print("=" * 70)
    print()
    
    if sucesso > 0:
        print("✅ Metadados atualizados com sucesso!")
        print()
        print("🌐 Acesse: http://localhost:8080")
        print("   (Recarregue a página para ver as thumbnails)")
        return True
    else:
        print("ℹ️  Nenhum link foi atualizado")
        return True

def main():
    # Argumentos
    limite = None
    apenas_sem_thumb = True
    
    if '--todos' in sys.argv:
        apenas_sem_thumb = False
        print("Modo: Processar TODOS os links")
    
    if '--limite' in sys.argv:
        try:
            idx = sys.argv.index('--limite')
            limite = int(sys.argv[idx + 1])
            print(f"Limite: {limite} links")
        except:
            pass
    
    # Executar
    sucesso = asyncio.run(atualizar_metadados(limite, apenas_sem_thumb))
    sys.exit(0 if sucesso else 1)

if __name__ == "__main__":
    if '--help' in sys.argv or '-h' in sys.argv:
        print("Uso: python atualizar_metadados.py [opções]")
        print()
        print("Opções:")
        print("  --todos              Processar todos os links (não apenas sem thumb)")
        print("  --limite N           Processar apenas N links")
        print()
        print("Exemplos:")
        print("  python atualizar_metadados.py")
        print("  python atualizar_metadados.py --limite 10")
        print("  python atualizar_metadados.py --todos")
        sys.exit(0)
    
    main()
