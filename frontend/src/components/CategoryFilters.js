/**
 * CategoryFilters Component
 */

export const CATEGORIES = [
  'ALL',
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Education',
  'Other'
];

/**
 * Renders category filter chip buttons
 * @param {HTMLElement} container 
 * @param {string} activeCategory 
 * @param {Function} onSelectCategory 
 */
export function renderCategoryFilters(container, activeCategory = 'ALL', onSelectCategory = null) {
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button class="filter-chip ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  if (onSelectCategory) {
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        onSelectCategory(chip.dataset.cat);
      });
    });
  }
}
