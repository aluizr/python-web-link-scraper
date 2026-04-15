# 🚀 Release Notes - v0.14.5

**Data de Lançamento**: 15 de Abril de 2026  
**Tipo**: Correções Críticas + Sistema de Migração

---

## 🎯 Destaques desta Versão

### ✅ Correções Críticas de Backend
- Corrigido erro fatal no `database.py` que impedia o servidor de funcionar
- Corrigido erro 500 em endpoints de links e categorias
- Corrigido erro 422 no scraper de metadados
- Melhorado tratamento de erros em todos os endpoints

### 📦 Sistema Completo de Importação/Exportação
- Importação de links de CSV e JSON com validação automática
- Exportação para backup em múltiplos formatos
- Detecção e skip de duplicatas
- Processamento em lotes para performance

### 🖼️ Atualização Automática de Metadados
- Script para buscar thumbnails automaticamente
- Scraping de descrições e títulos
- Processamento em lotes com rate limiting
- Fallbacks inteligentes para sites que bloqueiam

### 🔄 Sistema de Migração Entre Projetos
- Migração completa entre projetos Supabase
- SQL pronto para aplicar todas as migrations
- Scripts de verificação e diagnóstico
- Documentação passo a passo completa

---

## 📋 Mudanças Detalhadas

### Backend

#### Correções Críticas
- **`app/database.py`**: Corrigido carregamento de variáveis de ambiente
- **`app/routers/links.py`**: Removido parâmetro não suportado `nulls_last`
- **`app/routers/categories.py`**: Adicionado campo `user_id` e tratamento de erros
- **`app/routers/scraper.py`**: Melhorado tratamento de campos vazios
- **`app/main.py`**: Adicionada rota para favicon

#### Melhorias
- Tratamento de exceções mais robusto
- Mensagens de erro mais claras
- Logging melhorado para debug

### Scripts Novos

#### Servidor
- **`start_server.py`**: Inicia servidor com interface visual
- **`run.bat`**: Atalho Windows para iniciar servidor
- **`verificar_servidor.py`**: Verifica se servidor está online

#### Diagnóstico
- **`diagnostico_links.py`**: Diagnóstico completo do banco
- **`corrigir_banco.py`**: Testa e corrige problemas de RLS
- **`verificar_status_migracao.py`**: Verifica progresso de migração

#### Importação/Exportação
- **`importar_links.py`**: Importa links de CSV/JSON
  - Validação automática
  - Normalização de dados
  - Skip de duplicatas
  - Relatório detalhado
  
- **`exportar_links.py`**: Exporta links para backup
  - Múltiplos formatos
  - Inclui metadados completos
  - Opção de incluir deletados

#### Metadados
- **`atualizar_metadados.py`**: Busca thumbnails e descrições
  - Scraping automático
  - Rate limiting
  - Fallbacks inteligentes
  - Progresso em tempo real

### Documentação

#### Guias de Uso
- **`COMO_ACESSAR.md`**: Guia completo de acesso
- **`GUIA_METADADOS.md`**: Como atualizar metadados
- **`GUIA_EXPORTAR_IMPORTAR.md`**: Importação e exportação

#### Migração
- **`PASSO_A_PASSO_COMPLETO.md`**: Guia detalhado de migração
- **`CHECKLIST_MIGRACAO.md`**: Checklist interativo
- **`INICIO_RAPIDO_MIGRACAO.txt`**: Resumo visual

#### Troubleshooting
- **`SOLUCAO_LINKS_NAO_APARECEM.md`**: Links não aparecem
- **`SOLUCAO_ERROS_IMAGENS.md`**: Erros CORS e 404
- **`STATUS_PRODUCAO.md`**: Status e correções

#### SQL
- **`migration_completa.sql`**: Todas as migrations em um arquivo

---

## 🔧 Como Atualizar

### Se você já tem o projeto rodando:

```bash
# 1. Fazer backup
python exportar_links.py --formato json

# 2. Atualizar código
git pull origin main

# 3. Reiniciar servidor
python start_server.py

# 4. Atualizar metadados (opcional)
python atualizar_metadados.py
```

### Se está começando do zero:

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/python-web-link-scraper.git
cd python-web-link-scraper

# 2. Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate  # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar .env
cp .env.example .env
# Edite .env com suas credenciais

# 5. Aplicar migrations no Supabase
# Execute migration_completa.sql no Supabase Dashboard

# 6. Iniciar servidor
python start_server.py
```

---

## 🐛 Bugs Corrigidos

| Bug | Descrição | Status |
|-----|-----------|--------|
| #1 | KeyError no database.py | ✅ Corrigido |
| #2 | TypeError no order() | ✅ Corrigido |
| #3 | 422 no scraper | ✅ Corrigido |
| #4 | 500 nas categorias | ✅ Corrigido |
| #5 | Links não aparecem após importação | ✅ Corrigido |
| #6 | Metadados não são buscados | ✅ Corrigido |

---

## 📊 Estatísticas

- **Arquivos modificados**: 7
- **Arquivos novos**: 23
- **Linhas de código adicionadas**: ~3.500
- **Documentação**: 15 novos arquivos
- **Scripts utilitários**: 8 novos

---

## 🎉 Funcionalidades Novas

### Sistema de Importação
- ✅ Suporte a CSV e JSON
- ✅ Validação automática
- ✅ Normalização de dados
- ✅ Skip de duplicatas
- ✅ Importação em lotes
- ✅ Relatório detalhado

### Sistema de Metadados
- ✅ Scraping automático
- ✅ Thumbnails (og_image)
- ✅ Descrições
- ✅ Títulos
- ✅ Favicons
- ✅ Rate limiting
- ✅ Fallbacks inteligentes

### Sistema de Migração
- ✅ Exportação do projeto antigo
- ✅ SQL de migrations completo
- ✅ Importação no projeto novo
- ✅ Verificação de status
- ✅ Diagnóstico de problemas

---

## ⚠️ Breaking Changes

Nenhuma breaking change nesta versão. Totalmente compatível com v0.14.4.

---

## 🔮 Próximas Versões

### v0.15.0 (Planejado)
- [ ] Interface React melhorada
- [ ] Busca full-text no Supabase
- [ ] Tags automáticas com IA
- [ ] Compartilhamento de coleções

### v0.16.0 (Planejado)
- [ ] Extensão do browser
- [ ] API REST pública
- [ ] Perfil público
- [ ] Onboarding tour

---

## 🙏 Agradecimentos

Obrigado a todos que reportaram bugs e sugeriram melhorias!

---

## 📞 Suporte

- **Documentação**: Veja os arquivos `.md` na raiz do projeto
- **Issues**: https://github.com/seu-usuario/python-web-link-scraper/issues
- **Discussões**: https://github.com/seu-usuario/python-web-link-scraper/discussions

---

**Versão**: 0.14.5  
**Data**: 15 de Abril de 2026  
**Status**: ✅ Estável
