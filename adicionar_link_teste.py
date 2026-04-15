"""Script para adicionar um link de teste e verificar a estrutura"""
from app.database import get_supabase

def adicionar_teste():
    print("🔗 Adicionando link de teste...")
    print()
    
    db = get_supabase()
    
    # Dados do link de teste
    link_teste = {
        "url": "https://fastapi.tiangolo.com",
        "title": "FastAPI - Framework Python",
        "description": "FastAPI é um framework web moderno e rápido para construir APIs com Python",
        "category": "Estudos",
        "tags": ["python", "fastapi", "api", "web"],
        "is_favorite": True,
        "favicon": "https://fastapi.tiangolo.com/img/favicon.png"
    }
    
    try:
        # Tentar inserir
        result = db.table("links").insert(link_teste).execute()
        
        if result.data:
            print("✅ Link de teste adicionado com sucesso!")
            print()
            print("📄 Detalhes:")
            link = result.data[0]
            for key, value in link.items():
                print(f"   {key}: {value}")
            print()
            print("🌐 Acesse http://localhost:8080 para ver o link!")
        else:
            print("❌ Erro ao adicionar link")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        print()
        print("💡 Isso pode indicar que:")
        print("   1. A tabela não tem todas as colunas necessárias")
        print("   2. As migrations não foram aplicadas")
        print("   3. Há um problema de permissão")

if __name__ == "__main__":
    adicionar_teste()
