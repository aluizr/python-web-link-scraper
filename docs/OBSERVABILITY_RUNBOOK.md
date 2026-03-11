# Observability Runbook

## Purpose
This runbook standardizes how to inspect, triage, and troubleshoot critical runtime flows in WebNest.

## Event Naming Convention
Use dot-separated names by domain and action:

- auth.*
- link.*
- category.*
- trash.*
- ops.*

Examples:

- auth.signin.succeeded
- link.updated
- category.reordered
- ops.rate_limited

## Minimum Event Set

### Error Events
- Erro ao buscar links
- Erro ao buscar categorias
- Erro ao adicionar link
- Erro ao atualizar link
- Erro ao mover link para lixeira
- Erro ao restaurar link
- Erro ao deletar link permanentemente
- Erro ao reordenar links
- Erro ao reordenar links por status
- Erro ao criar categoria
- Erro ao deletar categoria
- Erro ao renomear categoria
- Erro ao atualizar cor da categoria
- Erro ao atualizar ícone da categoria
- auth.signup.failed
- auth.signin.failed
- auth.signout.failed

### Warning Events
- ops.rate_limited
- auth.signup.rate_limited
- auth.signin.rate_limited
- Full-text search RPC indisponivel

### Operational Events
- links.bootstrap.loaded
- link.created
- link.updated
- link.trashed
- link.restored
- link.deleted_permanently
- link.favorite_toggled
- link.reordered
- link.reordered_by_status
- trash.emptied
- category.created
- category.deleted
- category.renamed
- category.reordered
- category.color_updated
- category.icon_updated
- auth.session.bootstrap
- auth.state.changed
- auth.signup.succeeded
- auth.signin.succeeded
- auth.signout.succeeded

## How To Inspect Logs

1. Open browser devtools.
2. Run in console:

```js
localStorage.getItem("webnest-error-log")
```

3. Parse if needed:

```js
JSON.parse(localStorage.getItem("webnest-error-log") || "[]")
```

4. Filter by event message:

```js
JSON.parse(localStorage.getItem("webnest-error-log") || "[]").filter((e) => e.message.includes("link."))
```

## Triage Flow

1. Confirm timeframe and user flow impacted.
2. Filter logs by affected domain (auth/link/category).
3. Check latest error and its context payload.
4. Correlate preceding operational event(s).
5. Reproduce with the same payload shape.
6. Validate if rate limiting or schema fallback occurred.

## Playbooks

### Login Failure
1. Search for auth.signin.failed.
2. Inspect reason in context.
3. Check for auth.signin.rate_limited around same timestamp.
4. Validate Supabase auth status and credentials policy.

### Link Update Failure
1. Search for Erro ao atualizar link.
2. Inspect linkId and changedFields from nearest link.updated or request source.
3. Verify schema compatibility fallback indicators in links.bootstrap.loaded.

### Category Cascade Deletion Issues
1. Search for category.deleted event.
2. Validate deletedCategoriesCount and cascade flag.
3. Confirm category references cleanup in related links.

## UX Safety Checks

- Logging must not block user interactions.
- Event context must avoid sensitive data.
- Auth logs should use safe metadata (for example, email domain only).

## Escalation

Escalate when one of these occurs:

- Repeated fatal/unhandled events in same flow.
- Persistent auth failures without rate limiting.
- Data mutation mismatch between UI state and database state.
