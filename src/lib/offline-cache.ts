import type { LinkItem, Category } from "@/types/link";

const CACHE_KEYS = {
  links: "webnest-offline-links",
  categories: "webnest-offline-categories",
  lastSync: "webnest-offline-last-sync",
  pendingActions: "webnest-offline-pending",
} as const;

export interface PendingAction {
  id: string;
  type: "add" | "update" | "delete" | "toggleFavorite" | "reorder";
  timestamp: number;
  data: any;
}

/**
 * Salva links no cache local para acesso offline.
 */
export function cacheLinks(links: LinkItem[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.links, JSON.stringify(links));
    localStorage.setItem(CACHE_KEYS.lastSync, new Date().toISOString());
  } catch (e) {
    console.warn("Falha ao salvar cache de links:", e);
  }
}

/**
 * Salva categorias no cache local para acesso offline.
 */
export function cacheCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.categories, JSON.stringify(categories));
  } catch (e) {
    console.warn("Falha ao salvar cache de categorias:", e);
  }
}

/**
 * Recupera links do cache local.
 */
export function getCachedLinks(): LinkItem[] | null {
  try {
    const data = localStorage.getItem(CACHE_KEYS.links);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Recupera categorias do cache local.
 */
export function getCachedCategories(): Category[] | null {
  try {
    const data = localStorage.getItem(CACHE_KEYS.categories);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Retorna o timestamp da última sincronização.
 */
export function getLastSyncTime(): string | null {
  return localStorage.getItem(CACHE_KEYS.lastSync);
}

/**
 * Adiciona uma ação pendente para sincronizar quando voltar online.
 */
export function addPendingAction(action: Omit<PendingAction, "id" | "timestamp">): void {
  try {
    const pending = getPendingActions();
    const newAction: PendingAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    pending.push(newAction);
    localStorage.setItem(CACHE_KEYS.pendingActions, JSON.stringify(pending));
  } catch (e) {
    console.warn("Falha ao salvar ação pendente:", e);
  }
}

/**
 * Recupera todas as ações pendentes.
 */
export function getPendingActions(): PendingAction[] {
  try {
    const data = localStorage.getItem(CACHE_KEYS.pendingActions);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Remove uma ação pendente após sincronização.
 */
export function removePendingAction(id: string): void {
  try {
    const pending = getPendingActions().filter((a) => a.id !== id);
    localStorage.setItem(CACHE_KEYS.pendingActions, JSON.stringify(pending));
  } catch (e) {
    console.warn("Falha ao remover ação pendente:", e);
  }
}

/**
 * Limpa todas as ações pendentes.
 */
export function clearPendingActions(): void {
  localStorage.removeItem(CACHE_KEYS.pendingActions);
}

/**
 * Retorna o número de ações pendentes.
 */
export function getPendingCount(): number {
  return getPendingActions().length;
}
