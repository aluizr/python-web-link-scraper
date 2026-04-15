# 🚀 Como Acessar o Python Web Link Scraper

## ✅ Servidor Está Rodando!

O servidor FastAPI está configurado e funcionando corretamente.

## 🌐 URLs de Acesso

- **Interface Web**: http://localhost:8080
- **Documentação API (Swagger)**: http://localhost:8080/docs
- **Documentação API (ReDoc)**: http://localhost:8080/redoc
- **Health Check**: http://localhost:8080/health

## 🎯 Como Iniciar o Servidor

### Opção 1: Script Python (Recomendado)
```bash
python start_server.py
```

### Opção 2: Arquivo Batch (Windows)
```bash
run.bat
```

### Opção 3: Comando Direto
```bash
python -m app.main
```

### Opção 4: Uvicorn Direto
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## 🔧 Configuração

As configurações estão no arquivo `.env`:
- **SUPABASE_URL**: https://qanlbsstfxwicultliiq.supabase.co
- **SUPABASE_KEY**: Configurada ✅
- **APP_PORT**: 8080
- **APP_HOST**: 0.0.0.0

## 📝 Endpoints Principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Interface web |
| GET | `/health` | Status do servidor |
| POST | `/api/scrape` | Extrair metadados de URL |
| GET | `/api/links` | Listar links |
| POST | `/api/links` | Criar link |
| PUT | `/api/links/{id}` | Atualizar link |
| DELETE | `/api/links/{id}` | Deletar link |
| GET | `/api/categories` | Listar categorias |
| GET | `/api/export/json` | Exportar como JSON |
| GET | `/api/export/csv` | Exportar como CSV |
| GET | `/api/export/html` | Exportar como HTML |
| GET | `/api/stats` | Estatísticas |

## 🐛 Solução de Problemas

### Servidor não inicia
1. Verifique se o Python está instalado: `python --version`
2. Verifique se as dependências estão instaladas: `pip list`
3. Verifique se a porta 8080 está livre
4. Verifique o arquivo `.env`

### Erro de conexão com Supabase
1. Verifique se o SUPABASE_URL está correto no `.env`
2. Verifique se o SUPABASE_KEY está correto no `.env`
3. Teste a conexão: `python -c "from app.database import get_supabase; get_supabase()"`

### Porta já em uso
Se a porta 8080 já estiver em uso, edite o `.env` e mude `APP_PORT=8080` para outra porta (ex: 8000, 8888, etc.)

## 🔄 Correções Aplicadas

✅ **Corrigido**: `app/database.py` agora usa `get_settings()` em vez de `os.environ` diretamente
✅ **Testado**: Conexão com Supabase funcionando
✅ **Verificado**: Health check respondendo corretamente

## 📱 Próximos Passos

1. Abra seu navegador em http://localhost:8080
2. Explore a interface web
3. Teste a API em http://localhost:8080/docs
4. Comece a adicionar seus links!

## 🚀 Deploy em Produção

Para colocar em produção, você pode usar:

### Opção 1: Docker
```bash
docker build -t python-web-link-scraper .
docker run -p 8080:8000 --env-file .env python-web-link-scraper
```

### Opção 2: Serviços Cloud
- **Heroku**: Adicione `Procfile` com `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Railway**: Conecte o repositório e configure as variáveis de ambiente
- **Render**: Configure como Web Service Python
- **Fly.io**: Use o Dockerfile existente

### Opção 3: VPS (DigitalOcean, AWS, etc.)
```bash
# Instalar dependências
pip install -r requirements.txt

# Rodar com Gunicorn (produção)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8080
```

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do servidor no terminal
2. Console do navegador (F12)
3. Arquivo `.env` está configurado corretamente
4. Todas as dependências estão instaladas

---

**Última atualização**: 15 de Abril de 2026
**Versão**: 0.14.4
