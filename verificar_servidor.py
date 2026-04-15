"""Script para verificar se o servidor está funcionando"""
import urllib.request
import json
import sys

def verificar_servidor():
    url = "http://localhost:8080/health"
    
    print("🔍 Verificando servidor...")
    print(f"   URL: {url}")
    print()
    
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print("✅ Servidor está ONLINE!")
                print(f"   Status: {data.get('status', 'ok')}")
                print()
                print("🌐 Acesse:")
                print("   Interface: http://localhost:8080")
                print("   API Docs:  http://localhost:8080/docs")
                return True
            else:
                print(f"⚠️  Servidor respondeu com status {response.status}")
                return False
            
    except urllib.error.URLError:
        print("❌ Servidor NÃO está rodando!")
        print()
        print("💡 Para iniciar o servidor, execute:")
        print("   python start_server.py")
        print("   ou")
        print("   run.bat")
        return False
        
    except Exception as e:
        print(f"❌ Erro ao verificar servidor: {e}")
        return False

if __name__ == "__main__":
    sucesso = verificar_servidor()
    sys.exit(0 if sucesso else 1)
