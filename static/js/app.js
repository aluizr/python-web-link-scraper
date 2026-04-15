/**
 * app.js — Python Web Link Scraper Frontend
 * Vanilla JS SPA that consumes the FastAPI backend
 */

// ── State ─────────────────────────────────────────────────────────────────
const state = {
  section: 'links',
  links: [],
  categories: [],
  stats: {},
  filters: { q: '', category: '', status: '', is_favorite: null },
  editingLink: null,
  scrapeResult: null,
  loading: false,
};

// ── Utils ─────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function toast(msg, type = 'info', duration = 3000) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function faviconFallback(img) {
  img.onerror = null;
  img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23475569'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E";
}

function statusLabel(s) {
  return { backlog: 'Backlog', in_progress: 'Em andamento', done: 'Concluído' }[s] || s;
}
function priorityLabel(p) {
  return { low: '↓ Baixa', medium: '→ Média', high: '↑ Alta' }[p] || p;
}

// ── Navigation ────────────────────────────────────────────────────────────
function navigate(section) {
  state.section = section;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  // Show/hide sections
  ['links', 'scraper', 'categories', 'stats', 'trash'].forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) el.style.display = s === section ? 'block' : 'none';
  });

  // Show/hide search + filter bars
  const showSearch = section === 'links';
  document.getElementById('search-area').style.display = showSearch ? 'flex' : 'none';
  const filterBar = document.getElementById('filter-bar');
  if (filterBar) filterBar.style.display = showSearch ? 'flex' : 'none';

  // Lazy load
  if (section === 'links')      renderLinks();
  if (section === 'stats')      renderStats();
  if (section === 'categories') renderCategories();
  if (section === 'trash')      renderTrash();
}

// ── Render: Links ─────────────────────────────────────────────────────────
async function loadLinks() {
  state.loading = true;
  try {
    const params = { ...state.filters };
    if (params.is_favorite === null) delete params.is_favorite;
    state.links = await API.getLinks(params);
  } catch(e) {
    toast('Erro ao carregar links: ' + e.message, 'error');
  }
  state.loading = false;
}

async function renderLinks() {
  const container = document.getElementById('links-container');
  if (!container) return;

  // Skeleton
  container.innerHTML = `<div class="links-grid">${Array(6).fill(0).map(() =>
    `<div class="link-card"><div class="skeleton" style="height:140px"></div>
     <div class="card-body" style="gap:10px">
       <div class="skeleton" style="height:14px;width:60%"></div>
       <div class="skeleton" style="height:12px;width:90%"></div>
       <div class="skeleton" style="height:12px;width:70%"></div>
     </div></div>`
  ).join('')}</div>`;

  await loadLinks();
  const links = state.links;

  // Update badge
  const badge = document.getElementById('links-badge');
  if (badge) badge.textContent = links.length;

  if (!links.length) {
    container.innerHTML = `<div class="empty">
      <div class="empty-icon">🔗</div>
      <div class="empty-title">Nenhum link encontrado</div>
      <div class="empty-sub">Adicione links manualmente ou use o Scraper para capturar metadados de URLs.</div>
    </div>`;
    return;
  }

  container.innerHTML = `<div class="links-grid">${links.map((l, i) => renderLinkCard(l, i)).join('')}</div>`;
  bindCardEvents();
}

function renderLinkCard(l, i = 0) {
  const delay = Math.min(i * 40, 400);
  const hasImage = l.og_image;
  const imgSection = hasImage
    ? `<img class="card-image" src="${esc(l.og_image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-image-placeholder>🔗</div>'">`
    : `<div class="card-image-placeholder">🔗</div>`;

  return `
  <div class="link-card" style="animation-delay:${delay}ms" data-id="${esc(l.id)}">
    ${imgSection}
    <div class="card-body">
      <div class="card-top">
        <img class="card-favicon" src="${esc(l.favicon)}" alt="" onerror="faviconFallback(this)">
        ${l.category ? `<span class="card-category">${esc(l.category)}</span>` : ''}
        <span class="card-status ${l.status}">${statusLabel(l.status)}</span>
      </div>
      <div class="card-title">${esc(l.title || l.url)}</div>
      <div class="card-url"><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url)}</a></div>
      ${l.description ? `<div class="card-desc">${esc(l.description)}</div>` : ''}
      ${l.tags?.length ? `<div class="card-tags">${l.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="card-footer">
        <span class="card-priority ${l.priority}">${priorityLabel(l.priority)}</span>
        <button class="btn-fav ${l.is_favorite ? 'active' : ''}" data-action="fav" title="Favorito">
          ${l.is_favorite ? '★' : '☆'}
        </button>
        <button class="btn-card-action" data-action="edit" title="Editar">✏️</button>
        <button class="btn-card-action del" data-action="del" title="Excluir">🗑️</button>
      </div>
    </div>
  </div>`;
}

function bindCardEvents() {
  document.querySelectorAll('.link-card').forEach(card => {
    const id = card.dataset.id;
    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'fav') {
          await API.toggleFavorite(id);
          renderLinks();
        } else if (action === 'edit') {
          const link = state.links.find(l => l.id === id);
          openLinkModal(link);
        } else if (action === 'del') {
          if (confirm(`Mover "${card.querySelector('.card-title')?.textContent}" para a lixeira?`)) {
            await API.deleteLink(id);
            toast('Link movido para a lixeira', 'info');
            renderLinks();
          }
        }
      };
    });
  });
}

// ── Render: Stats ─────────────────────────────────────────────────────────
async function renderStats() {
  const c = document.getElementById('stats-container');
  if (!c) return;
  try {
    const s = await API.getStats();
    const max = Math.max(...Object.values(s.by_category || {}), 1);

    c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔗</div>
        <div class="stat-label">Total de Links</div>
        <div class="stat-value">${s.total_links}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-label">Favoritos</div>
        <div class="stat-value">${s.favorites}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🗑️</div>
        <div class="stat-label">Na Lixeira</div>
        <div class="stat-value">${s.trash}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-label">Categorias</div>
        <div class="stat-value">${Object.keys(s.by_category || {}).length}</div>
      </div>
    </div>

    <div class="field-row" style="gap:24px;margin-bottom:24px">
      <div class="bar-section">
        <h3>Por Categoria</h3>
        ${Object.entries(s.by_category || {}).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([cat,n]) => `
          <div class="bar-item">
            <span class="bar-label">${esc(cat)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(n/max*100).toFixed(1)}%"></div></div>
            <span class="bar-count">${n}</span>
          </div>`).join('')}
      </div>
      <div class="bar-section">
        <h3>Por Status</h3>
        ${Object.entries(s.by_status || {}).map(([st,n]) => `
          <div class="bar-item">
            <span class="bar-label">${statusLabel(st)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(n/Math.max(...Object.values(s.by_status))*100).toFixed(1)}%"></div></div>
            <span class="bar-count">${n}</span>
          </div>`).join('')}
      </div>
    </div>

    ${Object.keys(s.top_tags || {}).length ? `
    <div class="bar-section">
      <h3>Tags mais usadas</h3>
      <div class="card-tags" style="flex-wrap:wrap">
        ${Object.entries(s.top_tags).map(([t,n]) =>
          `<span class="tag" style="font-size:12px">${esc(t)} <strong>${n}</strong></span>`
        ).join('')}
      </div>
    </div>` : ''}`;
  } catch(e) {
    c.innerHTML = `<div class="empty"><div class="empty-icon">📊</div><div class="empty-title">Erro ao carregar estatísticas</div></div>`;
  }
}

// ── Render: Categories ────────────────────────────────────────────────────
async function renderCategories() {
  const c = document.getElementById('categories-container');
  if (!c) return;
  try {
    const cats = await API.getCategories();
    state.categories = cats;
    updateCategorySelects();

    c.innerHTML = `
    <div class="categories-list">
      ${cats.map(cat => `
        <div class="cat-item">
          <div class="cat-color" style="background:${esc(cat.color || '#7c3aed')}"></div>
          <span class="cat-icon">${cat.icon || '📁'}</span>
          <span class="cat-name">${esc(cat.name)}</span>
          <button class="btn btn-ghost btn-sm" onclick="deleteCategoryAction('${cat.id}','${esc(cat.name)}')">🗑️</button>
        </div>`).join('')}
      <div class="cat-add">
        <input id="newCatInput" placeholder="Nova categoria..." onkeydown="if(event.key==='Enter')addCategoryAction()">
        <input id="newCatColor" type="color" value="#7c3aed" style="width:32px;height:28px;border:none;background:none;cursor:pointer;padding:0">
        <button class="btn btn-primary btn-sm" onclick="addCategoryAction()">+ Adicionar</button>
      </div>
    </div>`;
  } catch(e) {
    c.innerHTML = `<div class="empty"><div class="empty-icon">📁</div><div class="empty-title">Erro ao carregar categorias</div></div>`;
  }
}

async function addCategoryAction() {
  const input = document.getElementById('newCatInput');
  const color = document.getElementById('newCatColor');
  const name = input?.value.trim();
  if (!name) return;
  try {
    await API.createCategory({ name, color: color?.value || '#7c3aed' });
    toast('Categoria criada!', 'success');
    renderCategories();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
}

async function deleteCategoryAction(id, name) {
  if (!confirm(`Excluir categoria "${name}"?`)) return;
  try {
    await API.deleteCategory(id);
    toast('Categoria excluída', 'info');
    renderCategories();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
}

function updateCategorySelects() {
  const cats = state.categories;
  const opts = `<option value="">Sem categoria</option>` +
    cats.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
  document.querySelectorAll('.cat-select').forEach(s => {
    const val = s.value;
    s.innerHTML = opts;
    s.value = val;
  });
}

// ── Render: Trash ─────────────────────────────────────────────────────────
async function renderTrash() {
  const c = document.getElementById('trash-container');
  if (!c) return;
  try {
    const items = await API.getTrash();
    if (!items.length) {
      c.innerHTML = `<div class="empty"><div class="empty-icon">🗑️</div><div class="empty-title">Lixeira vazia</div></div>`;
      return;
    }
    c.innerHTML = items.map(l => `
      <div class="trash-card">
        <div>
          <div class="trash-title">${esc(l.title || l.url)}</div>
          <div class="trash-url">${esc(l.url)}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="restoreAction('${l.id}')">↩ Restaurar</button>
        <button class="btn btn-danger btn-sm" onclick="permanentDeleteAction('${l.id}', '${esc(l.title || l.url)}')">🗑️ Excluir</button>
      </div>`).join('');
  } catch(e) {
    c.innerHTML = `<div class="empty"><div class="empty-icon">🗑️</div><div class="empty-title">Erro ao carregar lixeira</div></div>`;
  }
}

async function restoreAction(id) {
  try { await API.restoreLink(id); toast('Link restaurado!', 'success'); renderTrash(); }
  catch(e) { toast('Erro: ' + e.message, 'error'); }
}

async function permanentDeleteAction(id, name) {
  if (!confirm(`Excluir permanentemente "${name}"? Essa ação é irreversível.`)) return;
  try { await API.permanentDelete(id); toast('Link excluído permanentemente', 'info'); renderTrash(); }
  catch(e) { toast('Erro: ' + e.message, 'error'); }
}

// ── Scraper ───────────────────────────────────────────────────────────────
async function scrapeAction() {
  const urlInput = document.getElementById('scrapeUrl');
  const url = urlInput?.value.trim();
  if (!url) { toast('Digite uma URL', 'error'); return; }

  const btn = document.getElementById('scrapeBtn');
  btn.disabled = true; btn.textContent = '⏳ Extraindo...';

  try {
    const result = await API.scrape(url);
    state.scrapeResult = result;
    renderScrapePreview(result);
  } catch(e) {
    toast('Erro ao extrair: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '🔍 Extrair Metadados';
  }
}

function renderScrapePreview(r) {
  const c = document.getElementById('scrape-preview-container');
  if (!c) return;

  c.innerHTML = `
  <div class="scrape-preview">
    ${r.og_image ? `<img class="preview-img" src="${esc(r.og_image)}" alt="" onerror="this.style.display='none'">` : ''}
    <div class="preview-body">
      ${r.favicon ? `<div class="preview-favicon"><img src="${esc(r.favicon)}" onerror="faviconFallback(this)"> ${esc(new URL(r.url).hostname)}</div>` : ''}
      <div class="preview-title">${esc(r.title || '(sem título)')}</div>
      <div class="preview-url">${esc(r.url)}</div>
      ${r.description ? `<div class="preview-desc">${esc(r.description)}</div>` : ''}

      <div class="save-form">
        <div class="field-row">
          <div class="field">
            <label>Categoria</label>
            <select id="scrape-cat" class="cat-select">
              <option value="">Sem categoria</option>
              ${state.categories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Status</label>
            <select id="scrape-status">
              <option value="backlog">Backlog</option>
              <option value="in_progress">Em andamento</option>
              <option value="done">Concluído</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label>Tags (separadas por vírgula)</label>
          <input type="text" id="scrape-tags" placeholder="python, fastapi, api...">
        </div>
        <div class="field">
          <label>Notas</label>
          <textarea id="scrape-notes" rows="2" placeholder="Anotações sobre este link..."></textarea>
        </div>
        <button class="btn btn-primary" onclick="saveScrapeResult()">💾 Salvar Link</button>
      </div>
    </div>
  </div>`;
}

async function saveScrapeResult() {
  if (!state.scrapeResult) return;
  const r = state.scrapeResult;
  const tagsRaw = document.getElementById('scrape-tags')?.value || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const data = {
    url: r.url, title: r.title || '', description: r.description || '',
    og_image: r.og_image || '', favicon: r.favicon || '',
    category: document.getElementById('scrape-cat')?.value || '',
    status: document.getElementById('scrape-status')?.value || 'backlog',
    notes: document.getElementById('scrape-notes')?.value || '',
    tags,
  };
  try {
    await API.createLink(data);
    toast('Link salvo com sucesso!', 'success');
    document.getElementById('scrape-preview-container').innerHTML = '';
    document.getElementById('scrapeUrl').value = '';
    state.scrapeResult = null;
  } catch(e) { toast('Erro ao salvar: ' + e.message, 'error'); }
}

// ── Link Modal ────────────────────────────────────────────────────────────
function openLinkModal(link = null) {
  state.editingLink = link;
  const isEdit = !!link;
  const l = link || {};

  document.getElementById('modal-title').textContent = isEdit ? 'Editar Link' : 'Adicionar Link';
  document.getElementById('modal-url').value = l.url || '';
  document.getElementById('modal-title-input').value = l.title || '';
  document.getElementById('modal-desc').value = l.description || '';
  document.getElementById('modal-category').value = l.category || '';
  document.getElementById('modal-tags').value = (l.tags || []).join(', ');
  document.getElementById('modal-status').value = l.status || 'backlog';
  document.getElementById('modal-priority').value = l.priority || 'medium';
  document.getElementById('modal-notes').value = l.notes || '';
  document.getElementById('modal-due').value = l.due_date || '';
  document.getElementById('modal-fav').checked = l.is_favorite || false;

  // Update category select options
  const catSelect = document.getElementById('modal-category');
  catSelect.innerHTML = `<option value="">Sem categoria</option>` +
    state.categories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
  catSelect.value = l.category || '';

  document.getElementById('modal-overlay').classList.add('open');
}

function closeLinkModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  state.editingLink = null;
}

async function saveLinkModal() {
  const tagsRaw = document.getElementById('modal-tags').value;
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const data = {
    url:      document.getElementById('modal-url').value.trim(),
    title:    document.getElementById('modal-title-input').value.trim(),
    description: document.getElementById('modal-desc').value.trim(),
    category: document.getElementById('modal-category').value,
    tags,
    status:   document.getElementById('modal-status').value,
    priority: document.getElementById('modal-priority').value,
    notes:    document.getElementById('modal-notes').value.trim(),
    due_date: document.getElementById('modal-due').value || null,
    is_favorite: document.getElementById('modal-fav').checked,
  };
  if (!data.url) { toast('URL é obrigatória', 'error'); return; }
  try {
    if (state.editingLink) {
      await API.updateLink(state.editingLink.id, data);
      toast('Link atualizado!', 'success');
    } else {
      await API.createLink(data);
      toast('Link criado!', 'success');
    }
    closeLinkModal();
    if (state.section === 'links') renderLinks();
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
}

// ── Filters ───────────────────────────────────────────────────────────────
function applyStatusFilter(status) {
  state.filters.status = state.filters.status === status ? '' : status;
  document.querySelectorAll('.filter-chip[data-status]').forEach(el => {
    el.classList.toggle('active', el.dataset.status === state.filters.status);
  });
  renderLinks();
}

function applyFavFilter() {
  state.filters.is_favorite = state.filters.is_favorite ? null : true;
  document.querySelector('.filter-chip[data-fav]').classList.toggle('active', !!state.filters.is_favorite);
  renderLinks();
}

// ── Init ──────────────────────────────────────────────────────────────────
async function init() {
  // Load categories for selects
  try { state.categories = await API.getCategories(); } catch(e) {}

  // Search
  document.getElementById('searchInput').addEventListener('input', debounce(e => {
    state.filters.q = e.target.value;
    renderLinks();
  }, 350));

  // Category filter
  document.getElementById('categoryFilter').addEventListener('change', e => {
    state.filters.category = e.target.value;
    renderLinks();
  });

  // Populate category filter
  const catSelect = document.getElementById('categoryFilter');
  catSelect.innerHTML = `<option value="">Todas as categorias</option>` +
    state.categories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');

  // Nav clicks
  document.querySelectorAll('.nav-item[data-section]').forEach(el => {
    el.onclick = () => navigate(el.dataset.section);
  });

  // Modal
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeLinkModal();
  });
  document.getElementById('btn-add-link').onclick = () => openLinkModal();
  document.getElementById('btn-add-header').onclick = () => openLinkModal();

  // Scraper
  document.getElementById('scrapeBtn').onclick = scrapeAction;
  document.getElementById('scrapeUrl').addEventListener('keydown', e => {
    if (e.key === 'Enter') scrapeAction();
  });

  // Export buttons
  document.getElementById('btn-export-csv').onclick  = () => API.exportCSV();
  document.getElementById('btn-export-json').onclick = () => API.exportJSON();
  document.getElementById('btn-export-html').onclick = () => API.exportHTML();

  // Navigate to links
  navigate('links');
}

document.addEventListener('DOMContentLoaded', init);
