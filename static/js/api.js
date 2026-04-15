/**
 * api.js — Wrapper para todos os endpoints da API Python Web Link Scraper
 */

const API = {
  base: '/api',

  async _fetch(path, options = {}) {
    const res = await fetch(`${this.base}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Erro ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  // ── Links ────────────────────────────────────────────────────────────────
  getLinks(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== null && v !== '' && v !== undefined && q.set(k, v));
    return this._fetch(`/links?${q}`);
  },
  getLink(id)         { return this._fetch(`/links/${id}`); },
  createLink(data)    { return this._fetch('/links', { method: 'POST', body: JSON.stringify(data) }); },
  updateLink(id, data){ return this._fetch(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  deleteLink(id)      { return this._fetch(`/links/${id}`, { method: 'DELETE' }); },
  permanentDelete(id) { return this._fetch(`/links/${id}/permanent`, { method: 'DELETE' }); },
  toggleFavorite(id)  { return this._fetch(`/links/${id}/favorite`, { method: 'PATCH' }); },
  getTrash()          { return this._fetch('/links/trash'); },
  restoreLink(id)     { return this._fetch(`/links/${id}/restore`, { method: 'POST' }); },

  // ── Scraper ──────────────────────────────────────────────────────────────
  scrape(url, save = false, category = '', tags = []) {
    return this._fetch('/scrape', {
      method: 'POST',
      body: JSON.stringify({ url, save, category, tags }),
    });
  },

  // ── Categories ───────────────────────────────────────────────────────────
  getCategories()       { return this._fetch('/categories'); },
  createCategory(data)  { return this._fetch('/categories', { method: 'POST', body: JSON.stringify(data) }); },
  updateCategory(id, d) { return this._fetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(d) }); },
  deleteCategory(id)    { return this._fetch(`/categories/${id}`, { method: 'DELETE' }); },

  // ── Stats & Export ───────────────────────────────────────────────────────
  getStats() { return this._fetch('/stats'); },
  exportCSV() { window.open(`${this.base}/export/csv`, '_blank'); },
  exportJSON() { window.open(`${this.base}/export/json`, '_blank'); },
  exportHTML() { window.open(`${this.base}/export/html`, '_blank'); },
};
