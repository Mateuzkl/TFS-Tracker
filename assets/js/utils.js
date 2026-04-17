/**
 * TFS Tracker - Funções Utilitárias
 */

// Debounce para search
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Format SHA
export function formatSHA(sha, length = 7) {
  return sha?.substring(0, length) || 'N/A';
}

// Filter array by search term
export function filterBySearch(items, searchTerm, keys = []) {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    keys.some(key => 
      String(item[key] || '').toLowerCase().includes(term)
    )
  );
}

// Export data as JSON
export function exportToJSON(data, filename = 'tfs-export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Status badge class
export function getStatusClass(status) {
  const map = {
    'done': 'status-done',
    'concluído': 'status-done',
    'progress': 'status-progress',
    'em progresso': 'status-progress',
    'pending': 'status-pending',
    'pendente': 'status-pending'
  };
  return map[status?.toLowerCase()] || '';
}