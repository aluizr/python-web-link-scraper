# ✅ Checklist de Migração - Acompanhe Seu Progresso

## 📋 Status Atual

Execute este comando para ver o status:
```bash
python verificar_status_migracao.py
```

---

## 🔲 Passo 1: Exportar Links do Projeto Antigo

### Ações Necessárias:

- [ ] Acessei https://app.supabase.com
- [ ] Selecionei o projeto antigo (onde meus links estão)
- [ ] Fui em Table Editor → links
- [ ] Cliquei em "..." → "Download as CSV"
- [ ] Salvei como `links_backup.csv` na pasta do projeto

**Localização do arquivo**: `C:\Repositorio\python-web-link-scraper\links_backup.csv`

**Verificar**: O arquivo `links_backup.csv` deve estar na mesma pasta que este arquivo.

---

## 🔲 Passo 2: Aplicar Migrations no Projeto Novo

### Ações Necessárias:

- [ ] Acessei https://app.supabase.com
- [ ] Selecionei o projeto **qanlbsstfxwicultliiq** (novo)
- [ ] Fui em SQL Editor
- [ ] Cliquei em "+ New Query"
- [ ] Abri o arquivo `migration_completa.sql`
- [ ] Copiei todo o conteúdo
- [ ] Colei no SQL Editor
- [ ] Cliquei em "Run"
- [ ] Vi a mensagem: "Migration aplicada com sucesso! ✅"

**Verificar no terminal**:
```bash
python corrigir_banco.py
```
**Resultado esperado**: ✅ BANCO DE DADOS OK!

---

## 🔲 Passo 3: Importar os Links

### Ações Necessárias:

- [ ] Arquivo `links_backup.csv` está na pasta do projeto
- [ ] Executei no terminal:
```bash
python importar_links.py links_backup.csv
```
- [ ] Vi a mensagem: "✅ Importação concluída!"
- [ ] Verifiquei o total de links importados

**Verificar**:
```bash
python diagnostico_links.py
```

---

## 🔲 Passo 4: Verificar na Interface

### Ações Necessárias:

- [ ] Servidor está rodando:
```bash
python start_server.py
```
- [ ] Abri o navegador em: http://localhost:8080
- [ ] Vejo meus links na tela
- [ ] Categorias estão corretas
- [ ] Favoritos estão marcados
- [ ] Posso adicionar novos links

---

## 🎯 Status Final

Quando todos os passos estiverem completos:

✅ Links exportados  
✅ Migrations aplicadas  
✅ Links importados  
✅ Interface funcionando  

**🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!**

---

## 🆘 Precisa de Ajuda?

### Passo 1 não funciona?
- Verifique se está no projeto correto
- Tente exportar via SQL Editor (veja GUIA_EXPORTAR_IMPORTAR.md)

### Passo 2 não funciona?
- Certifique-se de copiar TODO o SQL
- Verifique se não há erros no console do Supabase
- Execute linha por linha se necessário

### Passo 3 não funciona?
- Verifique se o arquivo CSV está na pasta correta
- Execute: `python corrigir_banco.py` primeiro
- Veja os erros detalhados no terminal

### Passo 4 não funciona?
- Reinicie o servidor
- Limpe o cache do navegador (CTRL+SHIFT+R)
- Execute: `python diagnostico_links.py`

---

**Última atualização**: 15 de Abril de 2026
