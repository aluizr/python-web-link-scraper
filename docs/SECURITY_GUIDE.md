# 🛡️ Guia de Segurança e Auditoria — WebNest

Este documento consolida as diretrizes de segurança, o histórico de auditorias e o guia de implementação para garantir a integridade do projeto WebNest.

---

## 📊 Resumo Executivo (Status Atual)

| Métrica | Resultado |
| --------- | ----------- |
| **Status Geral** | 🟢 BOM (Vulnerabilidades críticas resolvidas) |
| **Vulnerabilidades Críticas** | 0 |
| **Pronto para Produção?** | ✅ SIM (com monitoramento) |

### ✅ Itens Implementados
- **Isolamento de Dados**: Banco de dados protegido por Row Level Security (RLS) por usuário.
- **Autenticação**: Fluxo PKCE ativo no Supabase para maior segurança.
- **Validação Estrita**: Schemas Zod com whitelist de protocolos (`https`, `http`, etc) e blacklist de scripts.
- **CSP (Content Security Policy)**: Implementada via meta tags e headers para prevenir XSS.
- **Proteção CSRF**: CORS restrito e headers de segurança configurados.
- **Sanitização**: Proibição de `dangerouslySetInnerHTML` e uso de TypeScript em todo o projeto.
- **Gestão de Segredos**: `.env` removido do histórico git e devidamente ignorado.

---

## 🛡️ Diretrizes de Desenvolvimento Seguro

### 1. Validação de URLs
Sempre valide URLs antes de persistir ou renderizar. Use o schema definido em `src/lib/validation.ts`.
- **Permitidos:** `http:`, `https:`, `ftp:`, `mailto:`.
- **Bloqueados:** `javascript:`, `data:`, `vbscript:`.

### 2. Row Level Security (RLS)
NUNCA desabilite o RLS em tabelas do Supabase. Toda nova tabela deve ter uma política que restrinja o acesso ao `auth.uid()`.
```sql
-- Exemplo de política segura
CREATE POLICY "Users can only access their own data" 
ON public.links FOR ALL 
USING (auth.uid() = user_id);
```

### 3. Gestão de Env e Chaves
- Nunca faça commit de arquivos `.env`.
- Use chaves separadas para Desenvolvimento e Produção.
- Se uma chave for exposta, revogue-a imediatamente no dashboard do Supabase.

### 4. CSP e Headers
Mantenha a Content Security Policy atualizada no `index.html` e no servidor de borda (Vercel/Nginx).
- Bloqueie `frame-ancestors 'none'` para evitar Clickjacking.
- Forçe `upgrade-insecure-requests`.

---

## 🧪 Checklist de Verificação

### Antes de cada Deploy:
- [ ] Rodar `npm audit` para verificar vulnerabilidades em dependências.
- [ ] Confirmar que o `.env` não está no stage do git.
- [ ] Verificar se as políticas de RLS estão ativas no Supabase.
- [ ] Validar o build de produção localmente (`npm run build`).

### Testes Manuais de Penetração:
1. **XSS**: Tentar adicionar um link com `javascript:alert(1)`. Deve ser rejeitado.
2. **Isolamento**: Tentar acessar IDs de links de outro usuário via API/Console. O Supabase deve retornar vazio ou erro.
3. **CSP**: Tentar injetar um script externo no console. O navegador deve bloquear.

---

## 📅 Histórico de Auditorias

### Auditoria de Fevereiro 2026
- **Problema**: Credenciais expostas no histórico do Git.
- **Solução**: Histórico limpo com BFG Repo-Cleaner, chaves rotacionadas e `.gitignore` corrigido.
- **Problema**: RLS estava em modo permissivo.
- **Solução**: Migração aplicada para restringir acesso por `user_id`.

---
*Este documento é atualizado trimestralmente ou após mudanças significativas na arquitetura de segurança.*
