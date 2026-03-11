---
name: "Sprint Dia 4 - Observabilidade"
about: "Execucao do Dia 4: eventos de diagnostico e runbook"
title: "[Sprint D4] Observabilidade e diagnostico"
labels: ["sprint", "p1", "observability"]
assignees: []
---

## Objetivo
Padronizar eventos e facilitar troubleshooting em fluxos criticos.

## Escopo
- [x] Definir eventos minimos (erro, warning, operacionais)
- [x] Instrumentar fluxos criticos (links/categorias/auth)
- [x] Validar visibilidade dos eventos
- [x] Criar runbook de diagnostico

## Status
- Estado atual: `done`
- Progresso (%): `100`
- Ultima atualizacao: `2026-03-11`

## Blockers
- [ ] Sem blockers
- Detalhes:

## Evidencias
- Lista de eventos implementados:
	- auth.session.bootstrap, auth.state.changed, auth.signup.*, auth.signin.*, auth.signout.*
	- links.bootstrap.loaded, link.created, link.updated, link.trashed, link.restored
	- link.deleted_permanently, link.favorite_toggled, link.reordered, link.reordered_by_status
	- category.created, category.deleted, category.renamed, category.reordered
	- category.color_updated, category.icon_updated, trash.emptied, ops.rate_limited
- Exemplo de logs:
	- logger.info("link.updated", { linkId, changedFields })
	- logger.warn("auth.signin.rate_limited", e, { emailDomain })
	- logger.error("Erro ao renomear categoria", error, { categoryId, name })
- Link para runbook:
	- docs/OBSERVABILITY_RUNBOOK.md

## Criterios de Aceite
- [x] Eventos criticos rastreaveis
- [x] Runbook utilizavel por outro dev
- [x] Sem impacto negativo perceptivel na UX

## Definicao de Pronto
- [x] Documentacao publicada
- [x] Equipe revisou e aprovou
- [x] Checklist de incidentes atualizado
