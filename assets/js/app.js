/**
 * TFS Tracker - Aplicação Principal
 */

import { debounce, filterBySearch, exportToJSON, getStatusClass, formatSHA } from './utils.js';

// Estado da aplicação
const state = {
  cards: [],
  filteredCards: [],
  search: '',
  filter: 'all'
};

// DOM Elements
const elements = {
  searchInput: null,
  filterBtns: null,
  exportBtn: null,
  cardsContainer: null,
  stats: {}
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  bindEvents();
  loadCards();
  updateStats();
});

function cacheElements() {
  elements.searchInput = document.getElementById('search-input');
  elements.filterBtns = document.querySelectorAll('.filter-btn');
  elements.exportBtn = document.getElementById('export-btn');
  elements.cardsContainer = document.getElementById('cards-container');
  elements.stats = {
    total: document.getElementById('total-count'),
    done: document.getElementById('done-count'),
    progress: document.getElementById('progress-count'),
    pending: document.getElementById('pending-count')
  };
}

function bindEvents() {
  // Search com debounce
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', 
      debounce((e) => {
        state.search = e.target.value;
        applyFilters();
      }, 300)
    );
  }
  
  // Filter buttons
  elements.filterBtns?.forEach(btn => {
    btn.addEventListener('click', (e) => {
      elements.filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.filter = e.currentTarget.dataset.filter;
      applyFilters();
    });
  });
  
  // Export button
  elements.exportBtn?.addEventListener('click', () => {
    exportToJSON(state.filteredCards, 'tfs-tracker-export.json');
  });
}

// Carregar cards (simulado - substitua por fetch real)
function loadCards() {
  // Dados de exemplo - substitua por API/fetch
  state.cards = [
    {
      id: 1,
      title: 'Implementar shared_ptr em Creature',
      description: 'Refatoração do sistema de creatures para usar smart pointers...',
      category: 'TFS',
      status: 'done',
      sha: 'e7d5dc7',
      code: `class Creature : public std::enable_shared_from_this<Creature> {\n  // ...\n};`,
      checklist: [
        { text: 'Testes unitários', done: true },
        { text: 'Documentação', done: true },
        { text: 'Code review', done: false }
      ]
    }
    // Adicione mais cards aqui...
  ];
  
  state.filteredCards = [...state.cards];
  renderCards();
}

// Aplicar filtros de busca e categoria
function applyFilters() {
  let result = [...state.cards];
  
  // Filtro por categoria
  if (state.filter !== 'all') {
    result = result.filter(card => card.category === state.filter);
  }
  
  // Filtro por busca
  if (state.search) {
    result = filterBySearch(result, state.search, ['title', 'description', 'category']);
  }
  
  state.filteredCards = result;
  renderCards();
  updateStats();
}

// Renderizar cards no DOM
function renderCards() {
  if (!elements.cardsContainer) return;
  
  if (state.filteredCards.length === 0) {
    elements.cardsContainer.innerHTML = '<p class="empty-state">Nenhum card encontrado.</p>';
    return;
  }
  
  elements.cardsContainer.innerHTML = state.filteredCards.map(card => createCardHTML(card)).join('');
  
  // Re-bind events dos cards
  bindCardEvents();
}

// Criar HTML do card
function createCardHTML(card) {
  const statusClass = getStatusClass(card.status);
  const checklistHTML = card.checklist?.map(item => `
    <label>
      <input type="checkbox" ${item.done ? 'checked' : ''} disabled />
      ${item.text}
    </label>
  `).join('') || '';
  
  return `
    <article class="card" data-status="${card.status}" data-category="${card.category}">
      <div class="card-header">
        <span class="card-category">${card.category}</span>
        <span class="card-status ${statusClass}">${card.status}</span>
      </div>
      <h3 class="card-title">${card.title}</h3>
      <p class="card-description">${card.description}</p>
      
      ${card.code ? `
      <details class="card-details">
        <summary>💻 Código Relacionado</summary>
        <pre><code>${escapeHTML(card.code)}</code></pre>
      </details>` : ''}

      ${checklistHTML ? `
      <div class="card-checklist">
        ${checklistHTML}
      </div>` : ''}

      <div class="card-footer">
        <span class="card-sha">SHA: ${formatSHA(card.sha)}</span>
        <button class="card-toggle" aria-label="Expandir">⚙️</button>
      </div>
    </article>
  `;
}

// Escapar HTML para segurança
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Bind events específicos dos cards
function bindCardEvents() {
  document.querySelectorAll('.card-toggle')?.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.card');
      card?.classList.toggle('expanded');
    });
  });
}

// Atualizar estatísticas
function updateStats() {
  const { cards } = state;
  
  if (elements.stats.total) {
    elements.stats.total.textContent = cards.length;
  }
  if (elements.stats.done) {
    elements.stats.done.textContent = cards.filter(c => c.status === 'done').length;
  }
  if (elements.stats.progress) {
    elements.stats.progress.textContent = cards.filter(c => c.status === 'progress').length;
  }
  if (elements.stats.pending) {
    elements.stats.pending.textContent = cards.filter(c => c.status === 'pending').length;
  }
}