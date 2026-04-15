# 🖼️ Guia de Atualização de Metadados

## 📋 O que são Metadados?

Metadados são informações sobre os links:
- **Thumbnail (og_image)**: Imagem de preview do site
- **Descrição**: Texto descritivo do conteúdo
- **Título**: Título da página
- **Favicon**: Ícone do site

## 🎯 Quando Usar?

Use o script de atualização de metadados quando:

1. ✅ **Após importar links** de outro projeto
2. ✅ **Links sem thumbnail** aparecem sem imagem
3. ✅ **Links sem descrição** aparecem incompletos
4. ✅ **Adicionar links manualmente** sem metadados

## 🚀 Como Usar

### Atualizar Todos os Links Sem Metadados

```bash
python atualizar_metadados.py
```

Isso vai:
- ✅ Buscar apenas links sem thumbnail OU sem descrição
- ✅ Fazer scraping automático dos sites
- ✅ Atualizar apenas campos vazios
- ✅ Mostrar progresso em tempo real

### Atualizar Apenas os Primeiros N Links

```bash
python atualizar_metadados.py --limite 10
```

Útil para testar antes de processar todos.

### Atualizar TODOS os Links (Forçar)

```bash
python atualizar_metadados.py --todos
```

Processa todos os links, mesmo os que já têm metadados.

## 📊 Exemplo de Saída

```
======================================================================
  🔍 Atualização de Metadados
======================================================================

📡 Conectando ao Supabase...
   ✅ Conectado

🔍 Buscando links...
   ✅ 59 links encontrados
   📊 Sem thumbnail: 53
   📊 Sem descrição: 27

🌐 Buscando metadados...

[1/59] Claude...
   ❌ Erro: Erro HTTP 403 ao acessar: https://claude.ai/

[2/59] Academy...
   ✅ Thumbnail encontrada
   ✅ Descrição encontrada

[3/59] Portal Mindsight...
   ⏭️  Já tem todos os metadados

...

======================================================================
  📊 RESUMO
======================================================================
  Total processado: 59
  ✅ Atualizados: 38
  ⏭️  Já completos: 12
  ❌ Erros: 9
======================================================================

✅ Metadados atualizados com sucesso!
```

## ⚠️ Sites que Podem Dar Erro

Alguns sites bloqueiam scraping automático:
- ❌ **Claude.ai** - Erro 403 (Cloudflare)
- ❌ **Salesforce** - Erro 403 (proteção anti-bot)
- ❌ **Caterpillar Careers** - Erro 403 (Cloudflare)

**Solução**: Adicione metadados manualmente para esses sites.

## 🔄 Fluxo Recomendado

### Após Importar Links:

1. **Importe os links**:
```bash
python importar_links.py links_backup.csv
```

2. **Atualize os metadados**:
```bash
python atualizar_metadados.py
```

3. **Verifique o resultado**:
```bash
python diagnostico_links.py
```

4. **Acesse a interface**:
```
http://localhost:8080
```

## 🛠️ Opções Avançadas

### Ver Ajuda

```bash
python atualizar_metadados.py --help
```

### Processar em Lotes

Para não sobrecarregar o servidor:

```bash
# Primeiro lote (10 links)
python atualizar_metadados.py --limite 10

# Segundo lote (próximos 10)
python atualizar_metadados.py --limite 10

# E assim por diante...
```

## 📈 Performance

- **Velocidade**: ~2 links por segundo
- **Pausa entre requests**: 0.5 segundos
- **Timeout**: 10 segundos por link
- **Taxa de sucesso**: ~80-90% (depende dos sites)

## 🔍 Verificar Quais Links Precisam de Atualização

```bash
python -c "from app.database import get_supabase; db = get_supabase(); result = db.table('links').select('id, url, title, og_image, description').or_('og_image.eq.,description.eq.').execute(); print(f'Links sem metadados: {len(result.data)}')"
```

## 💡 Dicas

1. **Execute após cada importação** para garantir que todos os links tenham metadados

2. **Use --limite** para testar primeiro com poucos links

3. **Alguns sites bloqueiam scraping** - isso é normal, adicione metadados manualmente

4. **Recarregue a página** no navegador após atualizar (CTRL+SHIFT+R)

5. **Execute periodicamente** para atualizar links antigos que podem ter mudado

## 🆘 Problemas Comuns

### Muitos erros 403

**Causa**: Sites com proteção anti-bot (Cloudflare, etc.)

**Solução**: Normal, alguns sites bloqueiam. Adicione metadados manualmente.

### Timeout

**Causa**: Site muito lento ou indisponível

**Solução**: Execute novamente mais tarde ou aumente o timeout no código.

### Nenhum link atualizado

**Causa**: Todos os links já têm metadados

**Solução**: Use `--todos` para forçar atualização.

## 📞 Comandos Úteis

```bash
# Atualizar metadados
python atualizar_metadados.py

# Testar com 5 links
python atualizar_metadados.py --limite 5

# Forçar todos
python atualizar_metadados.py --todos

# Ver ajuda
python atualizar_metadados.py --help

# Verificar status
python diagnostico_links.py

# Contar links sem thumbnail
python -c "from app.database import get_supabase; db = get_supabase(); result = db.table('links').select('id').eq('og_image', '').execute(); print(f'Sem thumbnail: {len(result.data)}')"
```

---

**Última atualização**: 15 de Abril de 2026
